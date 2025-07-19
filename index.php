<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Advanced Email Sender</title>
    <style>
        * {
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            line-height: 1.6;
        }
        
        .container {
            background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        h1 {
            color: #2c3e50;
            text-align: center;
            margin-bottom: 40px;
            font-size: 2.5em;
            font-weight: 300;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }
        
        .form-group {
            margin-bottom: 25px;
        }
        
        .form-group.full-width {
            grid-column: 1 / -1;
        }
        
        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #34495e;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        input[type="text"], 
        input[type="email"], 
        input[type="number"],
        select,
        textarea {
            width: 100%;
            padding: 15px;
            border: 2px solid transparent;
            border-radius: 12px;
            font-size: 16px;
            background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
            box-shadow: 0 4px 15px rgba(79, 172, 254, 0.1);
            transition: all 0.3s ease;
            outline: none;
        }
        
        input[type="text"]:focus, 
        input[type="email"]:focus, 
        input[type="number"]:focus,
        select:focus,
        textarea:focus {
            border-color: #4facfe;
            box-shadow: 0 8px 25px rgba(79, 172, 254, 0.25);
            transform: translateY(-2px);
        }
        
        textarea {
            height: 120px;
            resize: vertical;
        }
        
        /* Feature Cards */
        .feature-card {
            background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
            border: 2px solid transparent;
            border-radius: 16px;
            padding: 25px;
            margin-bottom: 25px;
            box-shadow: 0 8px 25px rgba(79, 172, 254, 0.1);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .feature-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .feature-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(79, 172, 254, 0.2);
            border-color: rgba(79, 172, 254, 0.3);
        }
        
        .feature-card:hover::before {
            opacity: 1;
        }
        
        .feature-card h3 {
            margin: 0 0 20px 0;
            color: #2c3e50;
            font-size: 18px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .feature-card .icon {
            font-size: 24px;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            border-radius: 50%;
            color: white;
            box-shadow: 0 4px 15px rgba(79, 172, 254, 0.3);
        }
        
        .radio-group {
            margin-bottom: 15px;
            padding: 12px;
            border-radius: 8px;
            transition: all 0.3s ease;
        }
        
        .radio-group:hover {
            background: rgba(79, 172, 254, 0.05);
        }
        
        .radio-group input[type="radio"] {
            margin-right: 12px;
            transform: scale(1.2);
        }
        
        .radio-group label {
            display: inline;
            font-weight: 500;
            margin-bottom: 0;
            cursor: pointer;
            text-transform: none;
            letter-spacing: normal;
        }
        
        .feature-description {
            font-size: 13px;
            color: #7f8c8d;
            margin-left: 32px;
            margin-top: 8px;
            line-height: 1.5;
        }
        
        .checkbox-group {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
            padding: 12px;
            border-radius: 8px;
            transition: all 0.3s ease;
        }
        
        .checkbox-group:hover {
            background: rgba(79, 172, 254, 0.05);
        }
        
        .checkbox-group input[type="checkbox"] {
            margin-right: 12px;
            transform: scale(1.2);
        }
        
        .send-button {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            padding: 18px 40px;
            border: none;
            border-radius: 15px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            margin-top: 30px;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 1px;
            box-shadow: 0 8px 25px rgba(79, 172, 254, 0.3);
        }
        
        .send-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 35px rgba(79, 172, 254, 0.4);
        }
        
        .send-button:active {
            transform: translateY(-1px);
        }
        
        .send-button:disabled {
            background: linear-gradient(135deg, #bdc3c7 0%, #95a5a6 100%);
            cursor: not-allowed;
            transform: none;
            box-shadow: 0 4px 15px rgba(149, 165, 166, 0.2);
        }
        
        .status-message {
            margin-top: 25px;
            padding: 20px;
            border-radius: 15px;
            display: none;
            font-weight: 500;
            animation: slideIn 0.3s ease;
        }
        
        .status-success {
            background: linear-gradient(135deg, #d5f4e6 0%, #ffffff 100%);
            color: #27ae60;
            border: 2px solid #2ecc71;
            box-shadow: 0 8px 25px rgba(46, 204, 113, 0.2);
        }
        
        .status-error {
            background: linear-gradient(135deg, #fdeaea 0%, #ffffff 100%);
            color: #e74c3c;
            border: 2px solid #e74c3c;
            box-shadow: 0 8px 25px rgba(231, 76, 60, 0.2);
        }
        
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @media (max-width: 768px) {
            .form-grid {
                grid-template-columns: 1fr;
                gap: 20px;
            }
            
            .container {
                padding: 25px;
                border-radius: 15px;
            }
            
            h1 {
                font-size: 2em;
            }
            
            .feature-card {
                padding: 20px;
            }
        }
        
        .toggle-switch {
            position: relative;
            display: inline-block;
            width: 60px;
            height: 34px;
        }
        
        .toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, #bdc3c7 0%, #95a5a6 100%);
            transition: 0.4s;
            border-radius: 34px;
        }
        
        .slider:before {
            position: absolute;
            content: "";
            height: 26px;
            width: 26px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            transition: 0.4s;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
        
        input:checked + .slider {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }
        
        input:checked + .slider:before {
            transform: translateX(26px);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>✉️ Advanced Email Sender</h1>
        
        <form id="emailForm">
            <div class="form-grid">
                <div class="form-group">
                    <label for="fromEmail">From Email:</label>
                    <input type="email" id="fromEmail" name="fromEmail" required>
                </div>
                
                <div class="form-group">
                    <label for="fromName">From Name:</label>
                    <input type="text" id="fromName" name="fromName" required>
                </div>
                
                <div class="form-group">
                    <label for="toEmail">To Email:</label>
                    <input type="email" id="toEmail" name="toEmail" required>
                </div>
                
                <div class="form-group">
                    <label for="toName">To Name:</label>
                    <input type="text" id="toName" name="toName" required>
                </div>
                
                <div class="form-group full-width">
                    <label for="subject">Subject:</label>
                    <input type="text" id="subject" name="subject" required>
                </div>
                
                <div class="form-group full-width">
                    <label for="message">Message:</label>
                    <textarea id="message" name="message" required></textarea>
                </div>
            </div>

            <!-- SMTP Account Selection -->
            <div class="feature-card">
                <h3>
                    <span class="icon">📬</span>
                    SMTP Account Selection
                </h3>
                <div class="form-group">
                    <label for="smtpAccount">Select SMTP Account:</label>
                    <select id="smtpAccount" name="smtpAccount">
                        <option value="default">Default SMTP Server</option>
                        <option value="gmail">Gmail SMTP</option>
                        <option value="outlook">Outlook SMTP</option>
                        <option value="yahoo">Yahoo SMTP</option>
                        <option value="custom">Custom SMTP Server</option>
                    </select>
                </div>
            </div>

            <!-- Email Content Type -->
            <div class="feature-card">
                <h3>
                    <span class="icon">📄</span>
                    Email Content Type
                </h3>
                <div class="radio-group">
                    <input type="radio" id="contentHtml" name="contentType" value="html" checked>
                    <label for="contentHtml">HTML Content</label>
                    <div class="feature-description">
                        Rich text with formatting, images, and styling support
                    </div>
                </div>
                
                <div class="radio-group">
                    <input type="radio" id="contentPlain" name="contentType" value="plain">
                    <label for="contentPlain">Plain Text</label>
                    <div class="feature-description">
                        Simple text without formatting - better compatibility
                    </div>
                </div>
                
                <div class="radio-group">
                    <input type="radio" id="contentMixed" name="contentType" value="mixed">
                    <label for="contentMixed">Mixed (HTML + Plain)</label>
                    <div class="feature-description">
                        Both HTML and plain text versions for maximum compatibility
                    </div>
                </div>
            </div>

            <!-- Email Format Style -->
            <div class="feature-card">
                <h3>
                    <span class="icon">📧</span>
                    Email Format Style
                </h3>
                
                <div class="radio-group">
                    <input type="radio" id="advancedFormat" name="emailFormat" value="advanced" checked>
                    <label for="advancedFormat">Advanced Format (multipart/alternative - Yahoo style)</label>
                    <div class="feature-description">
                        Recommended: Provides better deliverability and professional headers. Uses multipart/alternative format similar to Yahoo Mail.
                    </div>
                </div>
                
                <div class="radio-group">
                    <input type="radio" id="simpleFormat" name="emailFormat" value="simple">
                    <label for="simpleFormat">Simple Format</label>
                    <div class="feature-description">
                        Basic email format. Use only if compatibility issues occur with advanced format.
                    </div>
                </div>
            </div>

            <!-- Obfuscation Settings -->
            <div class="feature-card">
                <h3>
                    <span class="icon">🔒</span>
                    Text Obfuscation Settings
                </h3>
                
                <div class="checkbox-group">
                    <input type="checkbox" id="obfuscateHeaders" name="obfuscateHeaders">
                    <label for="obfuscateHeaders">Obfuscate Email Headers</label>
                </div>
                <div class="feature-description">
                    Hide sender information in email headers for privacy
                </div>
                
                <div class="checkbox-group">
                    <input type="checkbox" id="encodeContent" name="encodeContent">
                    <label for="encodeContent">Encode Message Content</label>
                </div>
                <div class="feature-description">
                    Apply Base64 encoding to message content
                </div>
                
                <div class="checkbox-group">
                    <input type="checkbox" id="randomizeHeaders" name="randomizeHeaders">
                    <label for="randomizeHeaders">Randomize Header Order</label>
                </div>
                <div class="feature-description">
                    Randomize the order of email headers for better privacy
                </div>
            </div>

            <!-- Link Replacement System -->
            <div class="feature-card">
                <h3>
                    <span class="icon">🔗</span>
                    Link Replacement System
                </h3>
                
                <div class="checkbox-group">
                    <input type="checkbox" id="enableLinkReplacement" name="enableLinkReplacement">
                    <label for="enableLinkReplacement">Enable Link Replacement</label>
                </div>
                <div class="feature-description">
                    Replace links in email content with tracking or redirect URLs
                </div>
                
                <div class="form-group">
                    <label for="redirectDomain">Redirect Domain:</label>
                    <input type="text" id="redirectDomain" name="redirectDomain" placeholder="https://example.com/redirect">
                </div>
                
                <div class="checkbox-group">
                    <input type="checkbox" id="trackClicks" name="trackClicks">
                    <label for="trackClicks">Track Link Clicks</label>
                </div>
                <div class="feature-description">
                    Track when recipients click on links in the email
                </div>
            </div>

            <!-- Delay Control & Timing -->
            <div class="feature-card">
                <h3>
                    <span class="icon">⏱️</span>
                    Delay Control & Timing
                </h3>
                
                <div class="form-group">
                    <label for="sendDelay">Send Delay (seconds):</label>
                    <input type="number" id="sendDelay" name="sendDelay" min="0" max="3600" value="0">
                </div>
                <div class="feature-description">
                    Delay before sending the email (0-3600 seconds)
                </div>
                
                <div class="checkbox-group">
                    <input type="checkbox" id="randomDelay" name="randomDelay">
                    <label for="randomDelay">Add Random Delay</label>
                </div>
                <div class="feature-description">
                    Add a random delay (1-30 seconds) to make sending appear more natural
                </div>
                
                <div class="form-group">
                    <label for="scheduleTime">Schedule Send Time:</label>
                    <input type="datetime-local" id="scheduleTime" name="scheduleTime">
                </div>
                <div class="feature-description">
                    Schedule the email to be sent at a specific time (optional)
                </div>
            </div>
            
            <button type="submit" class="send-button" id="sendButton">
                🚀 Send Email
            </button>
        </form>
        
        <div id="statusMessage" class="status-message"></div>
    </div>
    
    <script src="script.js"></script>
</body>
</html>