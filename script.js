/**
 * Advanced Email Sender JavaScript
 * Defaults to advanced format (multipart/alternative) for better deliverability
 */

// Default configuration - Advanced format is default
const emailConfig = {
    use_simple_format: false, // Default to false for advanced format
    defaultFormat: 'advanced'
};

// DOM elements
let emailForm;
let sendButton;
let statusMessage;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    emailForm = document.getElementById('emailForm');
    sendButton = document.getElementById('sendButton');
    statusMessage = document.getElementById('statusMessage');
    
    // Set up form submission handler
    emailForm.addEventListener('submit', handleEmailSubmission);
    
    // Set up format change handlers
    const formatRadios = document.querySelectorAll('input[name="emailFormat"]');
    formatRadios.forEach(radio => {
        radio.addEventListener('change', handleFormatChange);
    });
    
    console.log('Email sender initialized with advanced format as default');
});

/**
 * Handle email form submission
 * @param {Event} event - Form submission event
 */
function handleEmailSubmission(event) {
    event.preventDefault();
    
    // Get form data
    const formData = getFormData();
    
    // Validate form data
    if (!validateFormData(formData)) {
        return;
    }
    
    // Determine format (defaults to advanced)
    const useAdvancedFormat = !emailConfig.use_simple_format;
    
    // Send email
    sendEmail(formData, useAdvancedFormat);
}

/**
 * Get form data from the form
 * @returns {Object} Form data object
 */
function getFormData() {
    return {
        fromEmail: document.getElementById('fromEmail').value.trim(),
        fromName: document.getElementById('fromName').value.trim(),
        toEmail: document.getElementById('toEmail').value.trim(),
        toName: document.getElementById('toName').value.trim(),
        subject: document.getElementById('subject').value.trim(),
        message: document.getElementById('message').value.trim(),
        format: document.querySelector('input[name="emailFormat"]:checked').value
    };
}

/**
 * Validate form data
 * @param {Object} data - Form data to validate
 * @returns {boolean} True if valid, false otherwise
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
    
    return true;
}

/**
 * Validate email address format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Handle format change event
 * @param {Event} event - Radio button change event
 */
function handleFormatChange(event) {
    const selectedFormat = event.target.value;
    
    // Update configuration based on selection
    emailConfig.use_simple_format = (selectedFormat === 'simple');
    
    console.log(`Email format changed to: ${selectedFormat} (use_simple_format: ${emailConfig.use_simple_format})`);
}

/**
 * Send email using AJAX
 * @param {Object} data - Email data
 * @param {boolean} useAdvancedFormat - Whether to use advanced format
 */
function sendEmail(data, useAdvancedFormat) {
    // Disable send button during sending
    sendButton.disabled = true;
    sendButton.textContent = 'Sending...';
    
    // Prepare request data
    const requestData = {
        ...data,
        useAdvancedFormat: useAdvancedFormat,
        use_simple_format: !useAdvancedFormat // For backward compatibility
    };
    
    console.log('Sending email with advanced format:', useAdvancedFormat);
    
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
        // Re-enable send button
        sendButton.disabled = false;
        sendButton.textContent = 'Send Email';
    });
}

/**
 * Handle email sending response
 * @param {Object} result - Response from server
 */
function handleEmailResponse(result) {
    if (result.success) {
        showStatus(
            `Email sent successfully using ${result.format} format! ` +
            `Delivery method: ${result.method || 'Standard SMTP'}`,
            'success'
        );
        
        // Reset form on successful send
        emailForm.reset();
        
        // Reset to default advanced format
        document.getElementById('advancedFormat').checked = true;
        emailConfig.use_simple_format = false;
        
    } else {
        showStatus(
            `Failed to send email: ${result.message || 'Unknown error'}`,
            'error'
        );
    }
}

/**
 * Show status message to user
 * @param {string} message - Message to display
 * @param {string} type - Type of message ('success' or 'error')
 */
function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message status-${type}`;
    statusMessage.style.display = 'block';
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, 5000);
    }
}

/**
 * Get current email configuration
 * @returns {Object} Current configuration
 */
function getEmailConfig() {
    return { ...emailConfig };
}

/**
 * Set email configuration
 * @param {Object} config - New configuration
 */
function setEmailConfig(config) {
    Object.assign(emailConfig, config);
}