// Enhanced Email System - Part 2: Advanced Features
// This file contains email composition, bulk sending, and advanced functionality

// Extend the EmailSystem class with additional methods
Object.assign(EmailSystem.prototype, {
    
    // Email Composition Features
    switchEmailFormat(format) {
        const htmlEditor = document.getElementById('html-editor');
        const textArea = document.getElementById('email-content');
        const formatBtns = document.querySelectorAll('.format-btn');
        
        formatBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-format="${format}"]`).classList.add('active');
        
        if (format === 'html') {
            htmlEditor.classList.remove('hidden');
            textArea.classList.add('hidden');
            
            // Sync content from textarea to HTML editor
            const htmlContent = htmlEditor.querySelector('.editor-content');
            if (!htmlContent.innerHTML.trim()) {
                htmlContent.innerHTML = textArea.value.replace(/\n/g, '<br>');
            }
        } else {
            htmlEditor.classList.add('hidden');
            textArea.classList.remove('hidden');
            
            // Sync content from HTML editor to textarea
            const htmlContent = htmlEditor.querySelector('.editor-content');
            textArea.value = htmlContent.innerText || htmlContent.textContent || '';
        }
    },
    
    setupEmailEditor() {
        const editorContent = document.querySelector('.editor-content');
        if (!editorContent) return;
        
        // Setup HTML editor buttons
        document.querySelectorAll('.editor-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const action = btn.dataset.action;
                this.executeEditorCommand(action);
            });
        });
        
        // Auto-save content
        editorContent.addEventListener('input', this.debounce(() => {
            if (this.settings.autoSave) {
                this.saveDraft();
            }
        }, 2000));
        
        document.getElementById('email-content').addEventListener('input', this.debounce(() => {
            if (this.settings.autoSave) {
                this.saveDraft();
            }
        }, 2000));
    },
    
    executeEditorCommand(command) {
        const editorContent = document.querySelector('.editor-content');
        editorContent.focus();
        
        switch (command) {
            case 'bold':
                document.execCommand('bold');
                break;
            case 'italic':
                document.execCommand('italic');
                break;
            case 'underline':
                document.execCommand('underline');
                break;
            case 'link':
                const url = prompt('Enter URL:');
                if (url) {
                    document.execCommand('createLink', false, url);
                }
                break;
        }
    },
    
    previewEmail() {
        const subject = document.getElementById('email-subject').value.trim();
        const fromName = document.getElementById('from-name').value.trim();
        const fromEmail = document.getElementById('from-email').value.trim();
        const content = this.getEmailContent();
        
        if (!subject || !content) {
            this.showToast('warning', 'Incomplete Email', 'Please enter a subject and content before previewing');
            return;
        }
        
        // Update preview modal
        const fromDisplay = fromName ? `${fromName} <${fromEmail || 'your-email@domain.com'}>` : (fromEmail || 'your-email@domain.com');
        document.getElementById('preview-from').textContent = fromDisplay;
        document.getElementById('preview-subject').textContent = subject;
        document.getElementById('preview-body').innerHTML = content;
        
        this.showModal('email-preview-modal');
    },
    
    getEmailContent() {
        const activeFormat = document.querySelector('.format-btn.active').dataset.format;
        
        if (activeFormat === 'html') {
            const htmlContent = document.querySelector('.editor-content');
            return htmlContent.innerHTML;
        } else {
            return document.getElementById('email-content').value.replace(/\n/g, '<br>');
        }
    },
    
    saveDraft() {
        const draft = {
            subject: document.getElementById('email-subject').value,
            fromName: document.getElementById('from-name').value,
            fromEmail: document.getElementById('from-email').value,
            content: this.getEmailContent(),
            format: document.querySelector('.format-btn.active').dataset.format,
            savedAt: new Date().toISOString()
        };
        
        this.saveToStorage('emailDraft', draft);
        this.showToast('success', 'Draft Saved', 'Email draft has been saved automatically', 3000);
    },
    
    loadDraft() {
        const draft = this.loadFromStorage('emailDraft');
        if (draft) {
            document.getElementById('email-subject').value = draft.subject || '';
            document.getElementById('from-name').value = draft.fromName || '';
            document.getElementById('from-email').value = draft.fromEmail || '';
            
            if (draft.format) {
                this.switchEmailFormat(draft.format);
            }
            
            if (draft.format === 'html') {
                document.querySelector('.editor-content').innerHTML = draft.content || '';
            } else {
                document.getElementById('email-content').value = draft.content?.replace(/<br>/g, '\n') || '';
            }
            
            this.showToast('info', 'Draft Loaded', `Draft from ${this.formatDate(draft.savedAt)} has been loaded`, 3000);
        }
    },
    
    // Bulk Email Sending
    updateBulkSendOptions() {
        const emailListSelect = document.getElementById('select-email-list');
        const smtpAccountsContainer = document.getElementById('smtp-accounts-checkboxes');
        
        // Update email list options
        emailListSelect.innerHTML = '<option value="">Choose a list...</option>';
        this.emailLists.forEach(list => {
            const option = document.createElement('option');
            option.value = list.id;
            option.textContent = `${list.name} (${list.emails.length} emails)`;
            emailListSelect.appendChild(option);
        });
        
        // Update SMTP account checkboxes
        smtpAccountsContainer.innerHTML = '';
        this.accounts.forEach(account => {
            const checkboxWrapper = document.createElement('label');
            checkboxWrapper.className = 'checkbox-label';
            checkboxWrapper.innerHTML = `
                <input type="checkbox" value="${account.id}" name="smtp-accounts">
                <span class="checkbox-custom"></span>
                <span>${this.escapeHtml(account.name)} (${this.escapeHtml(account.user)})</span>
            `;
            smtpAccountsContainer.appendChild(checkboxWrapper);
        });
    },
    
    updateBulkSendUI() {
        const selectedListId = document.getElementById('select-email-list').value;
        const selectedList = this.getEmailList(selectedListId);
        
        if (selectedList) {
            this.sendingStats.total = selectedList.emails.length;
            this.sendingStats.remaining = selectedList.emails.length;
            this.sendingStats.sent = 0;
            this.sendingStats.failed = 0;
            
            this.updateProgressDisplay();
            document.getElementById('start-bulk-send-btn').disabled = false;
        } else {
            this.sendingStats = { sent: 0, failed: 0, remaining: 0, total: 0 };
            this.updateProgressDisplay();
            document.getElementById('start-bulk-send-btn').disabled = true;
        }
    },
    
    async startBulkSend() {
        if (!this.validateBulkSendSetup()) {
            return;
        }
        
        const selectedListId = document.getElementById('select-email-list').value;
        const selectedList = this.getEmailList(selectedListId);
        const selectedAccounts = Array.from(document.querySelectorAll('input[name="smtp-accounts"]:checked'))
            .map(cb => this.getAccount(cb.value));
        
        const emailContent = this.getEmailContent();
        const subject = document.getElementById('email-subject').value.trim();
        const delay = parseInt(document.getElementById('send-delay').value) * 1000;
        const batchSize = parseInt(document.getElementById('batch-size').value);
        
        if (!subject || !emailContent) {
            this.showToast('error', 'Incomplete Email', 'Please compose an email with subject and content first');
            return;
        }
        
        this.currentSendingProcess = {
            emailList: selectedList,
            accounts: selectedAccounts,
            subject: subject,
            content: emailContent,
            delay: delay,
            batchSize: batchSize,
            currentIndex: 0,
            isPaused: false,
            isStopped: false
        };
        
        // Reset stats
        this.sendingStats = {
            sent: 0,
            failed: 0,
            remaining: selectedList.emails.length,
            total: selectedList.emails.length
        };
        
        // Update UI
        document.getElementById('start-bulk-send-btn').disabled = true;
        document.getElementById('pause-bulk-send-btn').disabled = false;
        document.getElementById('stop-bulk-send-btn').disabled = false;
        
        this.updateProgressDisplay();
        this.addToSendingLog('info', 'Bulk sending started');
        
        await this.processBulkSending();
    },
    
    async processBulkSending() {
        const process = this.currentSendingProcess;
        if (!process || process.isStopped) return;
        
        while (process.currentIndex < process.emailList.emails.length && !process.isStopped) {
            if (process.isPaused) {
                this.updateCurrentStatus('Sending paused...');
                await this.waitForResume();
                continue;
            }
            
            const batch = process.emailList.emails.slice(
                process.currentIndex,
                process.currentIndex + process.batchSize
            );
            
            await this.sendBatch(batch, process);
            process.currentIndex += batch.length;
            
            if (process.currentIndex < process.emailList.emails.length && !process.isStopped) {
                this.updateCurrentStatus(`Waiting ${process.delay / 1000} seconds before next batch...`);
                await this.sleep(process.delay);
            }
        }
        
        if (!process.isStopped) {
            this.finishBulkSending();
        }
    },
    
    async sendBatch(emails, process) {
        for (const email of emails) {
            if (process.isStopped) break;
            
            const account = process.accounts[Math.floor(Math.random() * process.accounts.length)];
            this.updateCurrentStatus(`Sending to ${email} via ${account.name}...`);
            
            try {
                await this.sendEmail(email, process.subject, process.content, account);
                this.sendingStats.sent++;
                this.sendingStats.remaining--;
                this.addToSendingLog('success', `✓ Sent to ${email} via ${account.name}`);
            } catch (error) {
                this.sendingStats.failed++;
                this.sendingStats.remaining--;
                this.addToSendingLog('error', `✗ Failed to send to ${email}: ${error.message}`);
            }
            
            this.updateProgressDisplay();
            
            // Add celebration effect for milestones
            if (this.sendingStats.sent > 0 && this.sendingStats.sent % 10 === 0) {
                this.showCelebrationEffect();
            }
        }
    },
    
    async sendEmail(email, subject, content, account) {
        // Simulate email sending with some random delay and failure rate
        const delay = 500 + Math.random() * 1000;
        await this.sleep(delay);
        
        // Apply text obfuscation if enabled
        let processedContent = content;
        if (this.settings.obfuscationEnabled) {
            processedContent = this.obfuscateText(content);
        }
        
        // Apply link replacement if enabled
        if (this.settings.linkReplacementEnabled && this.settings.redirectDomain) {
            processedContent = this.replaceLinks(processedContent);
        }
        
        // Simulate 95% success rate
        if (Math.random() > 0.05) {
            return Promise.resolve();
        } else {
            throw new Error('SMTP connection timeout');
        }
    },
    
    obfuscateText(text) {
        if (!this.settings.obfuscationEnabled) return text;
        
        const rate = this.settings.obfuscationRate / 100;
        const chars = text.split('');
        
        return chars.map(char => {
            if (char.match(/[a-zA-Z]/) && Math.random() < rate) {
                // Replace with similar looking characters
                const replacements = {
                    'a': 'à', 'e': 'é', 'i': 'í', 'o': 'ó', 'u': 'ú',
                    'A': 'À', 'E': 'É', 'I': 'Í', 'O': 'Ó', 'U': 'Ú'
                };
                return replacements[char] || char;
            }
            return char;
        }).join('');
    },
    
    replaceLinks(text) {
        if (!this.settings.linkReplacementEnabled || !this.settings.redirectDomain) return text;
        
        const urlRegex = /(https?:\/\/[^\s<>"]+)/gi;
        return text.replace(urlRegex, (url) => {
            const encoded = encodeURIComponent(url);
            return `${this.settings.redirectDomain}?url=${encoded}`;
        });
    },
    
    pauseBulkSend() {
        if (this.currentSendingProcess) {
            this.currentSendingProcess.isPaused = true;
            document.getElementById('pause-bulk-send-btn').innerHTML = '<i class="fas fa-play"></i> Resume';
            document.getElementById('pause-bulk-send-btn').onclick = () => this.resumeBulkSend();
            this.addToSendingLog('info', 'Bulk sending paused');
        }
    },
    
    resumeBulkSend() {
        if (this.currentSendingProcess) {
            this.currentSendingProcess.isPaused = false;
            document.getElementById('pause-bulk-send-btn').innerHTML = '<i class="fas fa-pause"></i> Pause';
            document.getElementById('pause-bulk-send-btn').onclick = () => this.pauseBulkSend();
            this.addToSendingLog('info', 'Bulk sending resumed');
        }
    },
    
    stopBulkSend() {
        if (this.currentSendingProcess && confirm('Are you sure you want to stop sending? This cannot be undone.')) {
            this.currentSendingProcess.isStopped = true;
            this.finishBulkSending(true);
            this.addToSendingLog('info', 'Bulk sending stopped by user');
        }
    },
    
    finishBulkSending(stopped = false) {
        // Reset UI
        document.getElementById('start-bulk-send-btn').disabled = false;
        document.getElementById('pause-bulk-send-btn').disabled = true;
        document.getElementById('stop-bulk-send-btn').disabled = true;
        document.getElementById('pause-bulk-send-btn').innerHTML = '<i class="fas fa-pause"></i> Pause';
        document.getElementById('pause-bulk-send-btn').onclick = () => this.pauseBulkSend();
        
        const status = stopped ? 'Bulk sending stopped' : 'Bulk sending completed';
        this.updateCurrentStatus(status);
        this.addToSendingLog('info', status);
        
        // Show completion notification
        if (!stopped) {
            this.showToast('success', 'Sending Complete!', 
                `Successfully sent ${this.sendingStats.sent} emails. ${this.sendingStats.failed} failed.`, 7000);
            this.showCelebrationEffect();
        }
        
        this.currentSendingProcess = null;
    },
    
    async waitForResume() {
        return new Promise(resolve => {
            const checkResume = () => {
                if (!this.currentSendingProcess?.isPaused || this.currentSendingProcess?.isStopped) {
                    resolve();
                } else {
                    setTimeout(checkResume, 100);
                }
            };
            checkResume();
        });
    },
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    validateBulkSendSetup() {
        const selectedListId = document.getElementById('select-email-list').value;
        const selectedAccounts = document.querySelectorAll('input[name="smtp-accounts"]:checked');
        
        if (!selectedListId) {
            this.showToast('error', 'No Email List', 'Please select an email list to send to');
            return false;
        }
        
        if (selectedAccounts.length === 0) {
            this.showToast('error', 'No SMTP Accounts', 'Please select at least one SMTP account');
            return false;
        }
        
        return true;
    },
    
    updateProgressDisplay() {
        const { sent, failed, remaining, total } = this.sendingStats;
        
        document.getElementById('emails-sent').textContent = sent;
        document.getElementById('emails-failed').textContent = failed;
        document.getElementById('emails-remaining').textContent = remaining;
        document.getElementById('emails-total').textContent = total;
        
        const percentage = total > 0 ? Math.round(((sent + failed) / total) * 100) : 0;
        document.getElementById('progress-fill').style.width = `${percentage}%`;
        document.getElementById('progress-text').textContent = `${percentage}%`;
    },
    
    updateCurrentStatus(status) {
        document.getElementById('current-status').textContent = status;
    },
    
    addToSendingLog(type, message) {
        const logContainer = document.getElementById('sending-log');
        const timestamp = new Date().toLocaleTimeString();
        
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.innerHTML = `
            <span class="log-timestamp">[${timestamp}]</span> ${message}
        `;
        
        logContainer.appendChild(logEntry);
        logContainer.scrollTop = logContainer.scrollHeight;
    },
    
    clearSendingLog() {
        if (confirm('Are you sure you want to clear the sending log?')) {
            document.getElementById('sending-log').innerHTML = '';
        }
    },
    
    showCelebrationEffect() {
        if (!this.settings.showAnimations) return;
        
        const celebration = document.createElement('div');
        celebration.innerHTML = '🎉';
        celebration.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 3rem;
            z-index: 9999;
            pointer-events: none;
            animation: celebrationBounce 1s ease-out;
        `;
        
        document.body.appendChild(celebration);
        
        setTimeout(() => {
            if (celebration.parentNode) {
                celebration.parentNode.removeChild(celebration);
            }
        }, 1000);
    },
    
    // Settings Management
    loadSettings() {
        document.getElementById('enable-obfuscation').checked = this.settings.obfuscationEnabled;
        document.getElementById('obfuscation-rate').value = this.settings.obfuscationRate;
        document.getElementById('enable-link-replacement').checked = this.settings.linkReplacementEnabled;
        document.getElementById('redirect-domain').value = this.settings.redirectDomain;
        document.getElementById('auto-save').checked = this.settings.autoSave;
        document.getElementById('show-animations').checked = this.settings.showAnimations;
        document.getElementById('high-contrast').checked = this.settings.highContrast;
        
        this.updateObfuscationRateDisplay();
        this.applySettings();
    },
    
    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveToStorage('emailSettings', this.settings);
        this.applySettings();
    },
    
    updateObfuscationRate(e) {
        const value = e.target.value;
        this.updateSetting('obfuscationRate', parseInt(value));
        this.updateObfuscationRateDisplay();
    },
    
    updateObfuscationRateDisplay() {
        const rangeValue = document.querySelector('.range-value');
        if (rangeValue) {
            rangeValue.textContent = `${this.settings.obfuscationRate}%`;
        }
    },
    
    updateAnimationSetting(enabled) {
        this.updateSetting('showAnimations', enabled);
        document.body.classList.toggle('no-animations', !enabled);
    },
    
    updateContrastSetting(enabled) {
        this.updateSetting('highContrast', enabled);
        document.body.classList.toggle('high-contrast', enabled);
    },
    
    applySettings() {
        document.body.classList.toggle('no-animations', !this.settings.showAnimations);
        document.body.classList.toggle('high-contrast', this.settings.highContrast);
    },
    
    // Data Management
    exportData() {
        const data = {
            accounts: this.accounts,
            emailLists: this.emailLists,
            settings: this.settings,
            draft: this.loadFromStorage('emailDraft'),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `email-system-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('success', 'Data Exported', 'All data has been exported successfully');
    },
    
    importData() {
        document.getElementById('import-file-input').click();
    },
    
    handleDataImport(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                
                if (this.validateImportData(data)) {
                    if (confirm('This will replace all existing data. Are you sure you want to continue?')) {
                        this.accounts = data.accounts || [];
                        this.emailLists = data.emailLists || [];
                        this.settings = { ...this.getDefaultSettings(), ...data.settings };
                        
                        this.saveToStorage('emailAccounts', this.accounts);
                        this.saveToStorage('emailLists', this.emailLists);
                        this.saveToStorage('emailSettings', this.settings);
                        
                        if (data.draft) {
                            this.saveToStorage('emailDraft', data.draft);
                        }
                        
                        this.renderAccounts();
                        this.renderEmailLists();
                        this.updateBulkSendOptions();
                        this.loadSettings();
                        
                        this.showToast('success', 'Data Imported', 'All data has been imported successfully');
                    }
                } else {
                    this.showToast('error', 'Invalid File', 'The selected file is not a valid backup file');
                }
            } catch (error) {
                this.showToast('error', 'Import Error', 'Failed to parse the backup file');
            }
        };
        
        reader.readAsText(file);
        e.target.value = ''; // Reset file input
    },
    
    validateImportData(data) {
        return data && 
               Array.isArray(data.accounts) && 
               Array.isArray(data.emailLists) && 
               typeof data.settings === 'object';
    },
    
    clearAllData() {
        const confirmation = prompt('This will delete ALL data permanently. Type "DELETE" to confirm:');
        
        if (confirmation === 'DELETE') {
            localStorage.removeItem('emailAccounts');
            localStorage.removeItem('emailLists');
            localStorage.removeItem('emailSettings');
            localStorage.removeItem('emailDraft');
            
            this.accounts = [];
            this.emailLists = [];
            this.settings = this.getDefaultSettings();
            
            this.renderAccounts();
            this.renderEmailLists();
            this.updateBulkSendOptions();
            this.loadSettings();
            
            this.showToast('success', 'Data Cleared', 'All data has been cleared successfully');
        } else if (confirmation !== null) {
            this.showToast('error', 'Confirmation Failed', 'Data was not cleared');
        }
    },
    
    // Help System
    showHelp() {
        this.showModal('help-modal');
    },
    
    // Auto-save functionality
    setupAutoSave() {
        // Auto-save compose form
        ['email-subject', 'from-name', 'from-email', 'email-content'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', this.debounce(() => {
                    if (this.settings.autoSave) {
                        this.saveDraft();
                    }
                }, 3000));
            }
        });
        
        // Load draft on compose tab activation
        const composeTab = document.querySelector('[data-tab="compose"]');
        if (composeTab) {
            composeTab.addEventListener('click', () => {
                setTimeout(() => this.loadDraft(), 100);
            });
        }
        
        // Setup HTML editor auto-save
        setTimeout(() => this.setupEmailEditor(), 500);
    },
    
    // Utility function for debouncing
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
});

// Add additional CSS for new features
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    @keyframes celebrationBounce {
        0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
        50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
    }
    
    .no-animations * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
    
    .high-contrast {
        filter: contrast(150%) brightness(110%);
    }
    
    .high-contrast .card,
    .high-contrast .form,
    .high-contrast .modal-content {
        border-width: 2px;
        border-color: var(--gray-800) !important;
    }
    
    .editor-content {
        outline: none;
        line-height: 1.6;
    }
    
    .editor-content:empty:before {
        content: 'Start typing your email content...';
        color: var(--gray-400);
        font-style: italic;
    }
    
    .bulk-send-setup {
        background: var(--white);
        border: 1px solid var(--gray-200);
        border-radius: var(--radius-lg);
        padding: var(--space-6);
        margin-bottom: var(--space-6);
    }
    
    .compose-form {
        margin-bottom: var(--space-6);
    }
    
    .log-entry:hover {
        background-color: rgba(0, 0, 0, 0.02);
    }
    
    .progress-section {
        box-shadow: var(--shadow-md);
    }
    
    .progress-section.pulsing {
        animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
        0% { box-shadow: var(--shadow-md); }
        50% { box-shadow: var(--shadow-lg); }
        100% { box-shadow: var(--shadow-md); }
    }
    
    /* Mobile improvements */
    @media (max-width: 768px) {
        .form-actions {
            flex-direction: column;
            gap: var(--space-3);
        }
        
        .form-actions-right {
            width: 100%;
            justify-content: center;
        }
        
        .progress-stats {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: var(--space-3);
        }
        
        .editor-controls {
            flex-wrap: wrap;
        }
        
        .editor-btn {
            padding: var(--space-3);
        }
    }
    
    @media (max-width: 480px) {
        .progress-stats {
            grid-template-columns: 1fr;
            gap: var(--space-2);
        }
        
        .stat {
            flex-direction: row;
            justify-content: space-between;
        }
        
        .panel-actions {
            width: 100%;
            justify-content: center;
        }
        
        .btn {
            flex: 1;
            justify-content: center;
        }
    }
`;
document.head.appendChild(additionalStyles);

// Initialize additional features when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Add some initial sample data for demonstration
    setTimeout(() => {
        if (window.emailSystem && window.emailSystem.accounts.length === 0) {
            // Only add sample data if no accounts exist
            const sampleData = {
                accounts: [
                    {
                        id: 'sample-1',
                        name: 'Sample Gmail Account',
                        host: 'smtp.gmail.com',
                        port: 587,
                        secure: 'tls',
                        user: 'your-email@gmail.com',
                        pass: 'your-app-password',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                ],
                emailLists: [
                    {
                        id: 'sample-list-1',
                        name: 'Sample Email List',
                        emails: [
                            'example1@domain.com',
                            'example2@domain.com',
                            'example3@domain.com'
                        ],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                ]
            };
            
            // Uncomment the lines below to add sample data
            // window.emailSystem.accounts = sampleData.accounts;
            // window.emailSystem.emailLists = sampleData.emailLists;
            // window.emailSystem.renderAccounts();
            // window.emailSystem.renderEmailLists();
            // window.emailSystem.updateBulkSendOptions();
        }
    }, 1000);
});