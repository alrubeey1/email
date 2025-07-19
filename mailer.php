<?php
/**
 * Advanced Email Mailer PHP Backend
 * Defaults to advanced format (multipart/alternative) for better deliverability
 */

// Set content type for JSON responses
header('Content-Type: application/json');

// Handle CORS if needed
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

/**
 * SMTPMailer Class
 * Handles email sending with advanced format as default
 */
class SMTPMailer {
    
    private $useAdvancedFormat;
    private $fromEmail;
    private $fromName;
    private $toEmail;
    private $toName;
    private $subject;
    private $message;
    
    /**
     * Constructor
     * @param bool $useAdvancedFormat - Whether to use advanced format (default: true)
     */
    public function __construct($useAdvancedFormat = true) {
        $this->useAdvancedFormat = $useAdvancedFormat;
    }
    
    /**
     * Set email parameters
     * @param array $params - Email parameters
     */
    public function setEmailParams($params) {
        $this->fromEmail = $params['fromEmail'] ?? '';
        $this->fromName = $params['fromName'] ?? '';
        $this->toEmail = $params['toEmail'] ?? '';
        $this->toName = $params['toName'] ?? '';
        $this->subject = $params['subject'] ?? '';
        $this->message = $params['message'] ?? '';
        
        // Override format if specified in params (defaults to advanced)
        if (isset($params['useAdvancedFormat'])) {
            $this->useAdvancedFormat = $params['useAdvancedFormat'];
        } elseif (isset($params['use_simple_format'])) {
            $this->useAdvancedFormat = !$params['use_simple_format'];
        }
    }
    
    /**
     * Send email using the configured format
     * @return array - Result array with success status and details
     */
    public function sendEmail() {
        try {
            // Validate email parameters
            $validation = $this->validateParams();
            if (!$validation['valid']) {
                return [
                    'success' => false,
                    'message' => $validation['message'],
                    'format' => $this->useAdvancedFormat ? 'advanced' : 'simple'
                ];
            }
            
            if ($this->useAdvancedFormat) {
                return $this->sendAdvancedFormatEmail();
            } else {
                return $this->sendSimpleFormatEmail();
            }
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Email sending failed: ' . $e->getMessage(),
                'format' => $this->useAdvancedFormat ? 'advanced' : 'simple'
            ];
        }
    }
    
    /**
     * Validate email parameters
     * @return array - Validation result
     */
    private function validateParams() {
        $requiredFields = [
            'fromEmail' => 'From email',
            'fromName' => 'From name',
            'toEmail' => 'To email',
            'toName' => 'To name',
            'subject' => 'Subject',
            'message' => 'Message'
        ];
        
        foreach ($requiredFields as $field => $label) {
            if (empty($this->$field)) {
                return [
                    'valid' => false,
                    'message' => "$label is required"
                ];
            }
        }
        
        // Validate email formats
        if (!filter_var($this->fromEmail, FILTER_VALIDATE_EMAIL)) {
            return [
                'valid' => false,
                'message' => 'Invalid from email address'
            ];
        }
        
        if (!filter_var($this->toEmail, FILTER_VALIDATE_EMAIL)) {
            return [
                'valid' => false,
                'message' => 'Invalid to email address'
            ];
        }
        
        return ['valid' => true];
    }
    
    /**
     * Send email using advanced format (multipart/alternative - Yahoo style)
     * @return array - Result array
     */
    private function sendAdvancedFormatEmail() {
        // Create multipart/alternative content
        $boundary = uniqid('boundary_');
        
        // Prepare headers for advanced format
        $headers = $this->buildAdvancedHeaders($boundary);
        
        // Prepare message body with multipart/alternative
        $body = $this->buildAdvancedBody($boundary);
        
        // Send email
        $success = mail($this->toEmail, $this->subject, $body, $headers);
        
        return [
            'success' => $success,
            'message' => $success ? 'Email sent successfully using advanced format' : 'Failed to send email',
            'format' => 'advanced',
            'method' => 'multipart/alternative (Yahoo style)',
            'boundary' => $boundary
        ];
    }
    
    /**
     * Send email using simple format
     * @return array - Result array
     */
    private function sendSimpleFormatEmail() {
        // Simple headers
        $headers = $this->buildSimpleHeaders();
        
        // Send email
        $success = mail($this->toEmail, $this->subject, $this->message, $headers);
        
        return [
            'success' => $success,
            'message' => $success ? 'Email sent successfully using simple format' : 'Failed to send email',
            'format' => 'simple',
            'method' => 'text/html'
        ];
    }
    
    /**
     * Build advanced headers (Yahoo style)
     * @param string $boundary - MIME boundary
     * @return string - Headers string
     */
    private function buildAdvancedHeaders($boundary) {
        $headers = [];
        
        // From header with proper encoding
        $headers[] = "From: " . $this->encodeHeader($this->fromName) . " <{$this->fromEmail}>";
        
        // To header with proper encoding
        $headers[] = "To: " . $this->encodeHeader($this->toName) . " <{$this->toEmail}>";
        
        // Reply-To header
        $headers[] = "Reply-To: {$this->fromEmail}";
        
        // MIME version
        $headers[] = "MIME-Version: 1.0";
        
        // Content type for multipart/alternative
        $headers[] = "Content-Type: multipart/alternative; boundary=\"{$boundary}\"";
        
        // Additional headers for better deliverability (Yahoo style)
        $headers[] = "X-Mailer: Advanced Email Sender v1.0";
        $headers[] = "X-Priority: 3";
        $headers[] = "Message-ID: <" . uniqid() . "@" . $_SERVER['HTTP_HOST'] . ">";
        $headers[] = "Date: " . date('r');
        
        return implode("\r\n", $headers);
    }
    
    /**
     * Build simple headers
     * @return string - Headers string
     */
    private function buildSimpleHeaders() {
        $headers = [];
        
        $headers[] = "From: " . $this->encodeHeader($this->fromName) . " <{$this->fromEmail}>";
        $headers[] = "Reply-To: {$this->fromEmail}";
        $headers[] = "MIME-Version: 1.0";
        $headers[] = "Content-Type: text/html; charset=UTF-8";
        
        return implode("\r\n", $headers);
    }
    
    /**
     * Build advanced message body (multipart/alternative)
     * @param string $boundary - MIME boundary
     * @return string - Message body
     */
    private function buildAdvancedBody($boundary) {
        $body = [];
        
        // Message preamble
        $body[] = "This is a multi-part message in MIME format.";
        $body[] = "";
        
        // Text version
        $body[] = "--{$boundary}";
        $body[] = "Content-Type: text/plain; charset=UTF-8";
        $body[] = "Content-Transfer-Encoding: 8bit";
        $body[] = "";
        $body[] = strip_tags($this->message);
        $body[] = "";
        
        // HTML version
        $body[] = "--{$boundary}";
        $body[] = "Content-Type: text/html; charset=UTF-8";
        $body[] = "Content-Transfer-Encoding: 8bit";
        $body[] = "";
        $body[] = $this->formatHtmlMessage($this->message);
        $body[] = "";
        
        // End boundary
        $body[] = "--{$boundary}--";
        
        return implode("\r\n", $body);
    }
    
    /**
     * Format message as HTML
     * @param string $message - Plain message
     * @return string - HTML formatted message
     */
    private function formatHtmlMessage($message) {
        // Convert line breaks to HTML
        $html = nl2br(htmlspecialchars($message));
        
        // Wrap in basic HTML structure
        return "<!DOCTYPE html>\n<html>\n<head><meta charset=\"UTF-8\"></head>\n<body>\n{$html}\n</body>\n</html>";
    }
    
    /**
     * Encode header for international characters
     * @param string $text - Text to encode
     * @return string - Encoded text
     */
    private function encodeHeader($text) {
        return mb_encode_mimeheader($text, 'UTF-8');
    }
}

// Main execution
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Get JSON input
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        
        if (!$data) {
            throw new Exception('Invalid JSON data');
        }
        
        // Create mailer instance with advanced format as default
        $mailer = new SMTPMailer(true); // Default to advanced format
        
        // Set email parameters
        $mailer->setEmailParams($data);
        
        // Send email
        $result = $mailer->sendEmail();
        
        echo json_encode($result);
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Server error: ' . $e->getMessage(),
            'format' => 'unknown'
        ]);
    }
} else {
    // Handle non-POST requests
    echo json_encode([
        'success' => false,
        'message' => 'Only POST requests are allowed',
        'format' => 'unknown'
    ]);
}
?>