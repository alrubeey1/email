/**
 * Advanced Email Sender JavaScript
 * Enhanced with modern UI interactions and new features
 */

// Enhanced configuration with new features
const emailConfig = {
    use_simple_format: false,
    defaultFormat: 'advanced',
    obfuscation: {
        headers: false,
        content: false,
        randomizeHeaders: false
    },
    linkReplacement: {
        enabled: false,
        domain: '',
        trackClicks: false
    },
    timing: {
        delay: 0,
        randomDelay: false,
        scheduledTime: null
    },
    smtp: {
        account: 'default'
    },
    content: {
        type: 'html'
    }
};

// DOM elements
let emailForm;
let sendButton;
let statusMessage;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    setupInteractiveEffects();
    
    console.log('Enhanced Email Sender initialized with modern UI');
});

/**
 * Initialize the application
 */
function initializeApp() {
    emailForm = document.getElementById('emailForm');
    sendButton = document.getElementById('sendButton');
    statusMessage = document.getElementById('statusMessage');
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
    // Form submission
    emailForm.addEventListener('submit', handleEmailSubmission);
    
    // Format change handlers
    const formatRadios = document.querySelectorAll('input[name="emailFormat"]');
    formatRadios.forEach(radio => {
        radio.addEventListener('change', handleFormatChange);
    });
    
    // Content type change handlers
    const contentRadios = document.querySelectorAll('input[name="contentType"]');
    contentRadios.forEach(radio => {
        radio.addEventListener('change', handleContentTypeChange);
    });
    
    // SMTP account change
    const smtpSelect = document.getElementById('smtpAccount');
    smtpSelect.addEventListener('change', handleSmtpAccountChange);
    
    // Obfuscation settings
    setupObfuscationListeners();
    
    // Link replacement settings
    setupLinkReplacementListeners();
    
    // Timing settings
    setupTimingListeners();
}

/**
 * Set up interactive visual effects
 */
function setupInteractiveEffects() {
    // Add hover effects for feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
    
    // Add focus effects for inputs
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', (e) => {
            e.target.parentElement.style.transform = 'scale(1.02)';
        });
        
        input.addEventListener('blur', (e) => {
            e.target.parentElement.style.transform = 'scale(1)';
        });
    });
}

/**
 * Set up obfuscation event listeners
 */
function setupObfuscationListeners() {
    const obfuscateHeaders = document.getElementById('obfuscateHeaders');
    const encodeContent = document.getElementById('encodeContent');
    const randomizeHeaders = document.getElementById('randomizeHeaders');
    
    obfuscateHeaders.addEventListener('change', (e) => {
        emailConfig.obfuscation.headers = e.target.checked;
        console.log('Header obfuscation:', e.target.checked);
    });
    
    encodeContent.addEventListener('change', (e) => {
        emailConfig.obfuscation.content = e.target.checked;
        console.log('Content encoding:', e.target.checked);
    });
    
    randomizeHeaders.addEventListener('change', (e) => {
        emailConfig.obfuscation.randomizeHeaders = e.target.checked;
        console.log('Header randomization:', e.target.checked);
    });
}

/**
 * Set up link replacement event listeners
 */
function setupLinkReplacementListeners() {
    const enableLinkReplacement = document.getElementById('enableLinkReplacement');
    const redirectDomain = document.getElementById('redirectDomain');
    const trackClicks = document.getElementById('trackClicks');
    
    enableLinkReplacement.addEventListener('change', (e) => {
        emailConfig.linkReplacement.enabled = e.target.checked;
        toggleLinkReplacementFields(e.target.checked);
        console.log('Link replacement:', e.target.checked);
    });
    
    redirectDomain.addEventListener('input', (e) => {
        emailConfig.linkReplacement.domain = e.target.value;
    });
    
    trackClicks.addEventListener('change', (e) => {
        emailConfig.linkReplacement.trackClicks = e.target.checked;
        console.log('Click tracking:', e.target.checked);
    });
}

/**
 * Set up timing event listeners
 */
function setupTimingListeners() {
    const sendDelay = document.getElementById('sendDelay');
    const randomDelay = document.getElementById('randomDelay');
    const scheduleTime = document.getElementById('scheduleTime');
    
    sendDelay.addEventListener('input', (e) => {
        emailConfig.timing.delay = parseInt(e.target.value) || 0;
        console.log('Send delay:', emailConfig.timing.delay);
    });
    
    randomDelay.addEventListener('change', (e) => {
        emailConfig.timing.randomDelay = e.target.checked;
        console.log('Random delay:', e.target.checked);
    });
    
    scheduleTime.addEventListener('change', (e) => {
        emailConfig.timing.scheduledTime = e.target.value;
        console.log('Scheduled time:', e.target.value);
    });
}

/**
 * Toggle link replacement fields based on enable state
 */
function toggleLinkReplacementFields(enabled) {
    const redirectDomain = document.getElementById('redirectDomain');
    const trackClicks = document.getElementById('trackClicks');
    
    redirectDomain.disabled = !enabled;
    trackClicks.disabled = !enabled;
    
    if (!enabled) {
        redirectDomain.style.opacity = '0.5';
        trackClicks.parentElement.style.opacity = '0.5';
    } else {
        redirectDomain.style.opacity = '1';
        trackClicks.parentElement.style.opacity = '1';
    }
}

/**
 * Handle email form submission
 */
function handleEmailSubmission(event) {
    event.preventDefault();
    
    // Get form data
    const formData = getFormData();
    
    // Validate form data
    if (!validateFormData(formData)) {
        return;
    }
    
    // Check if scheduled
    if (emailConfig.timing.scheduledTime) {
        handleScheduledEmail(formData);
        return;
    }
    
    // Apply delay if configured
    const delay = calculateDelay();
    if (delay > 0) {
        showStatus(`Email will be sent in ${delay} seconds...`, 'success');
        setTimeout(() => {
            sendEmail(formData);
        }, delay * 1000);
    } else {
        sendEmail(formData);
    }
}

/**
 * Calculate total delay including random delay
 */
function calculateDelay() {
    let delay = emailConfig.timing.delay;
    
    if (emailConfig.timing.randomDelay) {
        delay += Math.floor(Math.random() * 30) + 1; // 1-30 seconds random
    }
    
    return delay;
}

/**
 * Handle scheduled email
 */
function handleScheduledEmail(formData) {
    const scheduledTime = new Date(emailConfig.timing.scheduledTime);
    const now = new Date();
    
    if (scheduledTime <= now) {
        showStatus('Scheduled time must be in the future', 'error');
        return;
    }
    
    const timeToWait = scheduledTime.getTime() - now.getTime();
    
    showStatus(`Email scheduled to send at ${scheduledTime.toLocaleString()}`, 'success');
    
    setTimeout(() => {
        sendEmail(formData);
    }, timeToWait);
}

/**
 * Get enhanced form data
 */
function getFormData() {
    return {
        fromEmail: document.getElementById('fromEmail').value.trim(),
        fromName: document.getElementById('fromName').value.trim(),
        toEmail: document.getElementById('toEmail').value.trim(),
        toName: document.getElementById('toName').value.trim(),
        subject: document.getElementById('subject').value.trim(),
        message: document.getElementById('message').value.trim(),
        format: document.querySelector('input[name="emailFormat"]:checked').value,
        contentType: document.querySelector('input[name="contentType"]:checked').value,
        smtpAccount: document.getElementById('smtpAccount').value,
        obfuscation: emailConfig.obfuscation,
        linkReplacement: emailConfig.linkReplacement,
        timing: emailConfig.timing
    };
}

/**
 * Enhanced validation
 */
function validateFormData(data) {
    const requiredFields = ['fromEmail', 'fromName', 'toEmail', 'toName', 'subject', 'message'];
    
    for (const field of requiredFields) {
        if (!data[field]) {
            showStatus(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`, 'error');
            return false;
        }
    }
    
    // Validate email formats
    if (!isValidEmail(data.fromEmail)) {
        showStatus('Please enter a valid "From" email address.', 'error');
        return false;
    }
    
    if (!isValidEmail(data.toEmail)) {
        showStatus('Please enter a valid "To" email address.', 'error');
        return false;
    }
    
    // Validate link replacement settings
    if (data.linkReplacement.enabled && !data.linkReplacement.domain) {
        showStatus('Please enter a redirect domain when link replacement is enabled.', 'error');
        return false;
    }
    
    return true;
}

/**
 * Handle format change
 */
function handleFormatChange(event) {
    const selectedFormat = event.target.value;
    emailConfig.use_simple_format = (selectedFormat === 'simple');
    console.log(`Email format changed to: ${selectedFormat}`);
}

/**
 * Handle content type change
 */
function handleContentTypeChange(event) {
    const selectedType = event.target.value;
    emailConfig.content.type = selectedType;
    console.log(`Content type changed to: ${selectedType}`);
}

/**
 * Handle SMTP account change
 */
function handleSmtpAccountChange(event) {
    const selectedAccount = event.target.value;
    emailConfig.smtp.account = selectedAccount;
    console.log(`SMTP account changed to: ${selectedAccount}`);
}

/**
 * Enhanced email sending with new features
 */
function sendEmail(data) {
    // Disable send button with animation
    sendButton.disabled = true;
    sendButton.innerHTML = '⏳ Sending...';
    sendButton.style.transform = 'scale(0.95)';
    
    // Prepare enhanced request data
    const requestData = {
        ...data,
        useAdvancedFormat: !emailConfig.use_simple_format,
        use_simple_format: emailConfig.use_simple_format
    };
    
    console.log('Sending enhanced email:', requestData);
    
    // Send AJAX request
    fetch('mailer.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(result => {
        handleEmailResponse(result);
    })
    .catch(error => {
        console.error('Email sending error:', error);
        showStatus('An error occurred while sending the email. Please try again.', 'error');
    })
    .finally(() => {
        // Re-enable send button with animation
        sendButton.disabled = false;
        sendButton.innerHTML = '🚀 Send Email';
        sendButton.style.transform = 'scale(1)';
    });
}

/**
 * Enhanced response handling
 */
function handleEmailResponse(result) {
    if (result.success) {
        showStatus(
            `✅ Email sent successfully using ${result.format} format! ` +
            `Method: ${result.method || 'Standard SMTP'}`,
            'success'
        );
        
        // Reset form with animation
        resetFormWithAnimation();
        
    } else {
        showStatus(
            `❌ Failed to send email: ${result.message || 'Unknown error'}`,
            'error'
        );
    }
}

/**
 * Reset form with smooth animation
 */
function resetFormWithAnimation() {
    emailForm.style.opacity = '0.7';
    
    setTimeout(() => {
        emailForm.reset();
        
        // Reset to defaults
        document.getElementById('advancedFormat').checked = true;
        document.getElementById('contentHtml').checked = true;
        emailConfig.use_simple_format = false;
        emailConfig.content.type = 'html';
        
        emailForm.style.opacity = '1';
    }, 300);
}

/**
 * Enhanced status message display
 */
function showStatus(message, type) {
    statusMessage.innerHTML = message;
    statusMessage.className = `status-message status-${type}`;
    statusMessage.style.display = 'block';
    statusMessage.style.animation = 'slideIn 0.3s ease';
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            statusMessage.style.opacity = '0';
            setTimeout(() => {
                statusMessage.style.display = 'none';
                statusMessage.style.opacity = '1';
            }, 300);
        }, 5000);
    }
}

/**
 * Validate email address format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Get current enhanced email configuration
 */
function getEmailConfig() {
    return { ...emailConfig };
}

/**
 * Set enhanced email configuration
 */
function setEmailConfig(config) {
    Object.assign(emailConfig, config);
}