// Enhanced Email Management System - Main JavaScript
class EmailSystem {
    constructor() {
        this.accounts = this.loadFromStorage('emailAccounts') || [];
        this.emailLists = this.loadFromStorage('emailLists') || [];
        this.settings = this.loadFromStorage('emailSettings') || this.getDefaultSettings();
        this.currentSendingProcess = null;
        this.sendingStats = {
            sent: 0,
            failed: 0,
            remaining: 0,
            total: 0
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.initializeTabs();
        this.renderAccounts();
        this.renderEmailLists();
        this.updateBulkSendOptions();
        this.loadSettings();
        this.setupAutoSave();
        this.showWelcomeMessage();
    }
    
    getDefaultSettings() {
        return {
            obfuscationEnabled: false,
            obfuscationRate: 10,
            linkReplacementEnabled: false,
            redirectDomain: '',
            autoSave: true,
            showAnimations: true,
            highContrast: false
        };
    }
    
    // Local Storage Management
    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            this.showToast('error', 'Storage Error', 'Failed to save data to local storage');
        }
    }
    
    loadFromStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            this.showToast('error', 'Storage Error', 'Failed to load data from local storage');
            return null;
        }
    }
    
    // Event Listeners Setup
    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
        
        // SMTP Account Management
        document.getElementById('add-account-btn').addEventListener('click', () => this.showAccountForm());
        document.getElementById('account-form').addEventListener('submit', (e) => this.saveAccount(e));
        document.getElementById('cancel-account-btn').addEventListener('click', () => this.hideAccountForm());
        document.getElementById('test-connection-btn').addEventListener('click', () => this.testConnection());
        
        // Email List Management
        document.getElementById('add-email-list-btn').addEventListener('click', () => this.showEmailListForm());
        document.getElementById('email-list-form').addEventListener('submit', (e) => this.saveEmailList(e));
        document.getElementById('cancel-email-list-btn').addEventListener('click', () => this.hideEmailListForm());
        document.getElementById('import-csv-btn').addEventListener('click', () => this.importCSV());
        document.getElementById('csv-file-input').addEventListener('change', (e) => this.handleCSVImport(e));
        document.getElementById('email-textarea').addEventListener('input', (e) => this.updateEmailCount(e));
        
        // Email Composition
        document.getElementById('preview-email-btn').addEventListener('click', () => this.previewEmail());
        document.getElementById('save-draft-btn').addEventListener('click', () => this.saveDraft());
        document.querySelectorAll('.format-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchEmailFormat(e.target.dataset.format));
        });
        
        // Bulk Sending
        document.getElementById('start-bulk-send-btn').addEventListener('click', () => this.startBulkSend());
        document.getElementById('pause-bulk-send-btn').addEventListener('click', () => this.pauseBulkSend());
        document.getElementById('stop-bulk-send-btn').addEventListener('click', () => this.stopBulkSend());
        document.getElementById('clear-log-btn').addEventListener('click', () => this.clearSendingLog());
        document.getElementById('select-email-list').addEventListener('change', () => this.updateBulkSendUI());
        
        // Settings
        document.getElementById('enable-obfuscation').addEventListener('change', (e) => this.updateSetting('obfuscationEnabled', e.target.checked));
        document.getElementById('obfuscation-rate').addEventListener('input', (e) => this.updateObfuscationRate(e));
        document.getElementById('enable-link-replacement').addEventListener('change', (e) => this.updateSetting('linkReplacementEnabled', e.target.checked));
        document.getElementById('redirect-domain').addEventListener('input', (e) => this.updateSetting('redirectDomain', e.target.value));
        document.getElementById('auto-save').addEventListener('change', (e) => this.updateSetting('autoSave', e.target.checked));
        document.getElementById('show-animations').addEventListener('change', (e) => this.updateAnimationSetting(e.target.checked));
        document.getElementById('high-contrast').addEventListener('change', (e) => this.updateContrastSetting(e.target.checked));
        
        // Data Management
        document.getElementById('export-data-btn').addEventListener('click', () => this.exportData());
        document.getElementById('import-data-btn').addEventListener('click', () => this.importData());
        document.getElementById('clear-data-btn').addEventListener('click', () => this.clearAllData());
        document.getElementById('import-file-input').addEventListener('change', (e) => this.handleDataImport(e));
        
        // Help and Modals
        document.getElementById('help-btn').addEventListener('click', () => this.showHelp());
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => this.closeModal(e.target.closest('.modal')));
        });
        
        // Form validation
        this.setupFormValidation();
        
        // Close modals on background click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target);
            }
        });
    }
    
    // Keyboard Shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault();
                        this.switchTab('accounts');
                        break;
                    case '2':
                        e.preventDefault();
                        this.switchTab('emails');
                        break;
                    case '3':
                        e.preventDefault();
                        this.switchTab('compose');
                        break;
                    case '4':
                        e.preventDefault();
                        this.switchTab('bulk');
                        break;
                    case '5':
                        e.preventDefault();
                        this.switchTab('settings');
                        break;
                    case 't':
                        e.preventDefault();
                        this.handleTestShortcut();
                        break;
                    case 's':
                        e.preventDefault();
                        this.handleSaveShortcut();
                        break;
                    case 'p':
                        e.preventDefault();
                        this.handlePreviewShortcut();
                        break;
                }
            }
            
            if (e.key === 'Escape') {
                this.closeTopModal();
            }
        });
    }
    
    handleTestShortcut() {
        const activeTab = document.querySelector('.tab-panel.active').id;
        if (activeTab === 'accounts-panel') {
            this.testConnection();
        }
    }
    
    handleSaveShortcut() {
        const activeTab = document.querySelector('.tab-panel.active').id;
        if (activeTab === 'compose-panel') {
            this.saveDraft();
        } else if (activeTab === 'bulk-panel') {
            this.startBulkSend();
        }
    }
    
    handlePreviewShortcut() {
        const activeTab = document.querySelector('.tab-panel.active').id;
        if (activeTab === 'compose-panel') {
            this.previewEmail();
        }
    }
    
    closeTopModal() {
        const visibleModals = document.querySelectorAll('.modal:not(.hidden)');
        if (visibleModals.length > 0) {
            this.closeModal(visibleModals[visibleModals.length - 1]);
        }
    }
    
    // Tab Management
    initializeTabs() {
        this.switchTab('accounts');
    }
    
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
        });
        
        const activeTabBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTabBtn) {
            activeTabBtn.classList.add('active');
            activeTabBtn.setAttribute('aria-selected', 'true');
        }
        
        // Update tab panels
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        
        const activePanel = document.getElementById(`${tabName}-panel`);
        if (activePanel) {
            activePanel.classList.add('active');
        }
        
        // Focus management
        if (activePanel) {
            const firstFocusable = activePanel.querySelector('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                firstFocusable.focus();
            }
        }
    }
    
    // Toast Notifications
    showToast(type, title, message, duration = 5000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const iconMap = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="${iconMap[type]}"></i>
            </div>
            <div class="toast-content">
                <h4 class="toast-title">${title}</h4>
                <p class="toast-message">${message}</p>
            </div>
            <button class="toast-close" aria-label="Close notification">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.removeToast(toast);
        });
        
        document.getElementById('toast-container').appendChild(toast);
        
        if (duration > 0) {
            setTimeout(() => this.removeToast(toast), duration);
        }
        
        return toast;
    }
    
    removeToast(toast) {
        toast.style.animation = 'toastSlideOut 200ms ease-in-out forwards';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 200);
    }
    
    // Loading States
    showLoading(message = 'Processing...') {
        const overlay = document.getElementById('loading-overlay');
        overlay.querySelector('span').textContent = message;
        overlay.classList.remove('hidden');
    }
    
    hideLoading() {
        document.getElementById('loading-overlay').classList.add('hidden');
    }
    
    // Modal Management
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            const firstInput = modal.querySelector('input, textarea, select');
            if (firstInput) {
                firstInput.focus();
            }
        }
    }
    
    closeModal(modal) {
        if (modal) {
            modal.classList.add('hidden');
        }
    }
    
    // SMTP Account Management
    showAccountForm(account = null) {
        const modal = document.getElementById('account-form-modal');
        const form = document.getElementById('account-form');
        const title = document.getElementById('account-form-title');
        
        if (account) {
            title.textContent = 'Edit SMTP Account';
            form.dataset.accountId = account.id;
            document.getElementById('account-name').value = account.name;
            document.getElementById('smtp-host').value = account.host;
            document.getElementById('smtp-port').value = account.port;
            document.getElementById('smtp-secure').value = account.secure;
            document.getElementById('smtp-user').value = account.user;
            document.getElementById('smtp-pass').value = account.pass;
        } else {
            title.textContent = 'Add SMTP Account';
            form.removeAttribute('data-account-id');
            form.reset();
        }
        
        this.showModal('account-form-modal');
    }
    
    hideAccountForm() {
        this.closeModal(document.getElementById('account-form-modal'));
        document.getElementById('account-form').reset();
        this.clearFormErrors();
    }
    
    async saveAccount(e) {
        e.preventDefault();
        
        if (!this.validateAccountForm()) {
            return;
        }
        
        const form = e.target;
        const accountData = {
            id: form.dataset.accountId || this.generateId(),
            name: document.getElementById('account-name').value.trim(),
            host: document.getElementById('smtp-host').value.trim(),
            port: parseInt(document.getElementById('smtp-port').value),
            secure: document.getElementById('smtp-secure').value,
            user: document.getElementById('smtp-user').value.trim(),
            pass: document.getElementById('smtp-pass').value,
            createdAt: form.dataset.accountId ? undefined : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        if (form.dataset.accountId) {
            const index = this.accounts.findIndex(acc => acc.id === form.dataset.accountId);
            if (index !== -1) {
                this.accounts[index] = { ...this.accounts[index], ...accountData };
                this.showToast('success', 'Account Updated', 'SMTP account has been updated successfully');
            }
        } else {
            this.accounts.push(accountData);
            this.showToast('success', 'Account Added', 'SMTP account has been added successfully');
        }
        
        this.saveToStorage('emailAccounts', this.accounts);
        this.renderAccounts();
        this.updateBulkSendOptions();
        this.hideAccountForm();
    }
    
    validateAccountForm() {
        const fields = [
            { id: 'account-name', message: 'Account name is required' },
            { id: 'smtp-host', message: 'SMTP host is required' },
            { id: 'smtp-port', message: 'SMTP port is required' },
            { id: 'smtp-user', message: 'Username is required' },
            { id: 'smtp-pass', message: 'Password is required' }
        ];
        
        let isValid = true;
        this.clearFormErrors();
        
        fields.forEach(field => {
            const input = document.getElementById(field.id);
            const value = input.value.trim();
            
            if (!value) {
                this.showFieldError(field.id, field.message);
                isValid = false;
            } else if (field.id === 'smtp-user' && !this.isValidEmail(value)) {
                this.showFieldError(field.id, 'Please enter a valid email address');
                isValid = false;
            } else if (field.id === 'smtp-port' && (isNaN(value) || value < 1 || value > 65535)) {
                this.showFieldError(field.id, 'Please enter a valid port number (1-65535)');
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    async testConnection() {
        const form = document.getElementById('account-form');
        const formData = new FormData(form);
        
        if (!this.validateAccountForm()) {
            return;
        }
        
        this.showLoading('Testing SMTP connection...');
        
        // Simulate connection test
        try {
            await this.simulateAsyncOperation(2000);
            this.hideLoading();
            this.showToast('success', 'Connection Successful', 'SMTP server connection established successfully');
        } catch (error) {
            this.hideLoading();
            this.showToast('error', 'Connection Failed', 'Failed to connect to SMTP server. Please check your settings.');
        }
    }
    
    deleteAccount(accountId) {
        if (confirm('Are you sure you want to delete this SMTP account?')) {
            this.accounts = this.accounts.filter(acc => acc.id !== accountId);
            this.saveToStorage('emailAccounts', this.accounts);
            this.renderAccounts();
            this.updateBulkSendOptions();
            this.showToast('success', 'Account Deleted', 'SMTP account has been deleted successfully');
        }
    }
    
    renderAccounts() {
        const container = document.getElementById('accounts-grid');
        
        if (this.accounts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-server fa-3x" style="color: var(--gray-400); margin-bottom: var(--space-4);"></i>
                    <h3>No SMTP Accounts</h3>
                    <p>Add your first SMTP account to start sending emails.</p>
                    <button class="btn btn-primary" onclick="emailSystem.showAccountForm()">
                        <i class="fas fa-plus"></i>
                        Add Account
                    </button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.accounts.map(account => `
            <div class="card">
                <div class="card-header">
                    <div>
                        <h3 class="card-title">${this.escapeHtml(account.name)}</h3>
                        <p class="card-subtitle">${this.escapeHtml(account.user)}</p>
                    </div>
                    <div class="card-actions">
                        <button class="btn btn-sm btn-outline" onclick="emailSystem.testAccountConnection('${account.id}')" title="Test Connection">
                            <i class="fas fa-plug"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="emailSystem.showAccountForm(emailSystem.getAccount('${account.id}'))" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="emailSystem.deleteAccount('${account.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="account-details">
                    <div class="detail-row">
                        <span class="detail-label">Host:</span>
                        <span class="detail-value">${this.escapeHtml(account.host)}:${account.port}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Security:</span>
                        <span class="detail-value">${account.secure.toUpperCase()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Status:</span>
                        <span class="detail-value status-active">
                            <i class="fas fa-circle"></i>
                            Active
                        </span>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    getAccount(accountId) {
        return this.accounts.find(acc => acc.id === accountId);
    }
    
    async testAccountConnection(accountId) {
        const account = this.getAccount(accountId);
        if (!account) return;
        
        this.showLoading('Testing connection...');
        try {
            await this.simulateAsyncOperation(1500);
            this.hideLoading();
            this.showToast('success', 'Connection Test', `Successfully connected to ${account.name}`);
        } catch (error) {
            this.hideLoading();
            this.showToast('error', 'Connection Test', `Failed to connect to ${account.name}`);
        }
    }
    
    // Email List Management
    showEmailListForm(emailList = null) {
        const modal = document.getElementById('email-list-modal');
        const form = document.getElementById('email-list-form');
        const title = document.getElementById('email-list-title');
        
        if (emailList) {
            title.textContent = 'Edit Email List';
            form.dataset.listId = emailList.id;
            document.getElementById('list-name').value = emailList.name;
            document.getElementById('email-textarea').value = emailList.emails.join('\n');
        } else {
            title.textContent = 'Add Email List';
            form.removeAttribute('data-list-id');
            form.reset();
        }
        
        this.updateEmailCount({ target: document.getElementById('email-textarea') });
        this.showModal('email-list-modal');
    }
    
    hideEmailListForm() {
        this.closeModal(document.getElementById('email-list-modal'));
        document.getElementById('email-list-form').reset();
        this.clearFormErrors();
    }
    
    async saveEmailList(e) {
        e.preventDefault();
        
        if (!this.validateEmailListForm()) {
            return;
        }
        
        const form = e.target;
        const emails = this.parseEmailList(document.getElementById('email-textarea').value);
        
        const listData = {
            id: form.dataset.listId || this.generateId(),
            name: document.getElementById('list-name').value.trim(),
            emails: emails,
            createdAt: form.dataset.listId ? undefined : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        if (form.dataset.listId) {
            const index = this.emailLists.findIndex(list => list.id === form.dataset.listId);
            if (index !== -1) {
                this.emailLists[index] = { ...this.emailLists[index], ...listData };
                this.showToast('success', 'List Updated', 'Email list has been updated successfully');
            }
        } else {
            this.emailLists.push(listData);
            this.showToast('success', 'List Added', 'Email list has been added successfully');
        }
        
        this.saveToStorage('emailLists', this.emailLists);
        this.renderEmailLists();
        this.updateBulkSendOptions();
        this.hideEmailListForm();
    }
    
    validateEmailListForm() {
        let isValid = true;
        this.clearFormErrors();
        
        const name = document.getElementById('list-name').value.trim();
        const emailText = document.getElementById('email-textarea').value.trim();
        
        if (!name) {
            this.showFieldError('list-name', 'List name is required');
            isValid = false;
        }
        
        if (!emailText) {
            this.showFieldError('email-textarea', 'At least one email address is required');
            isValid = false;
        } else {
            const emails = this.parseEmailList(emailText);
            if (emails.length === 0) {
                this.showFieldError('email-textarea', 'Please enter valid email addresses');
                isValid = false;
            }
        }
        
        return isValid;
    }
    
    parseEmailList(text) {
        if (!text) return [];
        
        const emails = text.split('\n')
            .map(email => email.trim())
            .filter(email => email && this.isValidEmail(email));
        
        return [...new Set(emails)]; // Remove duplicates
    }
    
    updateEmailCount(e) {
        const emails = this.parseEmailList(e.target.value);
        const count = emails.length;
        const counter = document.querySelector('.email-count');
        if (counter) {
            counter.textContent = `${count} email${count !== 1 ? 's' : ''}`;
        }
    }
    
    importCSV() {
        document.getElementById('csv-file-input').click();
    }
    
    handleCSVImport(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const csv = event.target.result;
                const emails = this.parseCSVEmails(csv);
                
                if (emails.length > 0) {
                    const textarea = document.getElementById('email-textarea');
                    const currentEmails = this.parseEmailList(textarea.value);
                    const allEmails = [...new Set([...currentEmails, ...emails])];
                    
                    textarea.value = allEmails.join('\n');
                    this.updateEmailCount({ target: textarea });
                    this.showToast('success', 'CSV Imported', `Successfully imported ${emails.length} email addresses`);
                } else {
                    this.showToast('warning', 'No Emails Found', 'No valid email addresses found in the CSV file');
                }
            } catch (error) {
                this.showToast('error', 'Import Error', 'Failed to parse CSV file');
            }
        };
        
        reader.readAsText(file);
        e.target.value = ''; // Reset file input
    }
    
    parseCSVEmails(csv) {
        const emails = [];
        const lines = csv.split('\n');
        
        lines.forEach(line => {
            const fields = line.split(',');
            fields.forEach(field => {
                const email = field.trim().replace(/['"]/g, '');
                if (this.isValidEmail(email)) {
                    emails.push(email);
                }
            });
        });
        
        return [...new Set(emails)]; // Remove duplicates
    }
    
    deleteEmailList(listId) {
        if (confirm('Are you sure you want to delete this email list?')) {
            this.emailLists = this.emailLists.filter(list => list.id !== listId);
            this.saveToStorage('emailLists', this.emailLists);
            this.renderEmailLists();
            this.updateBulkSendOptions();
            this.showToast('success', 'List Deleted', 'Email list has been deleted successfully');
        }
    }
    
    renderEmailLists() {
        const container = document.getElementById('email-lists-grid');
        
        if (this.emailLists.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-list fa-3x" style="color: var(--gray-400); margin-bottom: var(--space-4);"></i>
                    <h3>No Email Lists</h3>
                    <p>Create your first email list to start sending bulk emails.</p>
                    <button class="btn btn-primary" onclick="emailSystem.showEmailListForm()">
                        <i class="fas fa-plus"></i>
                        Add Email List
                    </button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.emailLists.map(list => `
            <div class="card">
                <div class="card-header">
                    <div>
                        <h3 class="card-title">${this.escapeHtml(list.name)}</h3>
                        <p class="card-subtitle">${list.emails.length} email${list.emails.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div class="card-actions">
                        <button class="btn btn-sm btn-outline" onclick="emailSystem.previewEmailList('${list.id}')" title="Preview">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="emailSystem.showEmailListForm(emailSystem.getEmailList('${list.id}'))" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="emailSystem.deleteEmailList('${list.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="list-stats">
                    <div class="stat-item">
                        <span class="stat-label">Created:</span>
                        <span class="stat-value">${this.formatDate(list.createdAt)}</span>
                    </div>
                    ${list.updatedAt !== list.createdAt ? `
                        <div class="stat-item">
                            <span class="stat-label">Updated:</span>
                            <span class="stat-value">${this.formatDate(list.updatedAt)}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }
    
    getEmailList(listId) {
        return this.emailLists.find(list => list.id === listId);
    }
    
    previewEmailList(listId) {
        const list = this.getEmailList(listId);
        if (!list) return;
        
        const preview = list.emails.slice(0, 10).join('\n');
        const more = list.emails.length > 10 ? `\n... and ${list.emails.length - 10} more` : '';
        
        alert(`${list.name}\n\nFirst 10 emails:\n${preview}${more}`);
    }
    
    // Utility Functions
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    async simulateAsyncOperation(delay) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate 90% success rate
                if (Math.random() > 0.1) {
                    resolve();
                } else {
                    reject(new Error('Simulated error'));
                }
            }, delay);
        });
    }
    
    // Form Validation Helpers
    setupFormValidation() {
        // Real-time validation for all form inputs
        document.addEventListener('input', (e) => {
            if (e.target.matches('input, textarea, select')) {
                this.validateField(e.target);
            }
        });
    }
    
    validateField(field) {
        const value = field.value.trim();
        const isRequired = field.hasAttribute('required');
        
        this.clearFieldError(field.id);
        
        if (isRequired && !value) {
            this.showFieldError(field.id, 'This field is required');
            return false;
        }
        
        if (field.type === 'email' && value && !this.isValidEmail(value)) {
            this.showFieldError(field.id, 'Please enter a valid email address');
            return false;
        }
        
        if (field.type === 'number' && value) {
            const num = parseFloat(value);
            const min = parseFloat(field.min);
            const max = parseFloat(field.max);
            
            if (isNaN(num)) {
                this.showFieldError(field.id, 'Please enter a valid number');
                return false;
            }
            
            if (!isNaN(min) && num < min) {
                this.showFieldError(field.id, `Value must be at least ${min}`);
                return false;
            }
            
            if (!isNaN(max) && num > max) {
                this.showFieldError(field.id, `Value must be no more than ${max}`);
                return false;
            }
        }
        
        return true;
    }
    
    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorElement = field.parentNode.querySelector('.form-error');
        
        if (field && errorElement) {
            field.classList.add('error');
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    }
    
    clearFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        const errorElement = field?.parentNode.querySelector('.form-error');
        
        if (field && errorElement) {
            field.classList.remove('error');
            errorElement.classList.remove('show');
        }
    }
    
    clearFormErrors() {
        document.querySelectorAll('.form-error.show').forEach(error => {
            error.classList.remove('show');
        });
        document.querySelectorAll('input.error, textarea.error, select.error').forEach(field => {
            field.classList.remove('error');
        });
    }
    
    // Welcome Message
    showWelcomeMessage() {
        if (!localStorage.getItem('emailSystemWelcomeShown')) {
            setTimeout(() => {
                this.showToast('info', 'Welcome!', 'Welcome to the Enhanced Email Management System. Press Ctrl+? for keyboard shortcuts.', 8000);
                localStorage.setItem('emailSystemWelcomeShown', 'true');
            }, 1000);
        }
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.emailSystem = new EmailSystem();
});

// Add some CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes toastSlideOut {
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
    
    .empty-state {
        text-align: center;
        padding: var(--space-8);
        color: var(--gray-500);
        grid-column: 1 / -1;
    }
    
    .empty-state h3 {
        color: var(--gray-600);
        margin-bottom: var(--space-2);
    }
    
    .empty-state p {
        margin-bottom: var(--space-6);
    }
    
    .detail-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--space-2) 0;
        border-bottom: 1px solid var(--gray-100);
    }
    
    .detail-row:last-child {
        border-bottom: none;
    }
    
    .detail-label {
        font-weight: 500;
        color: var(--gray-600);
        font-size: var(--font-size-sm);
    }
    
    .detail-value {
        color: var(--gray-800);
        font-size: var(--font-size-sm);
    }
    
    .status-active {
        color: var(--success-color);
        display: flex;
        align-items: center;
        gap: var(--space-1);
    }
    
    .status-active i {
        font-size: var(--font-size-xs);
    }
    
    .list-stats {
        margin-top: var(--space-4);
        padding-top: var(--space-4);
        border-top: 1px solid var(--gray-200);
    }
    
    .stat-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--space-1) 0;
        font-size: var(--font-size-sm);
    }
    
    .stat-label {
        color: var(--gray-500);
    }
    
    .stat-value {
        color: var(--gray-700);
        font-weight: 500;
    }
`;
document.head.appendChild(style);