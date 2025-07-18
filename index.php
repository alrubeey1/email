<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Advanced Email Sender</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 30px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #555;
        }
        input[type="text"], input[type="email"], textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            box-sizing: border-box;
        }
        textarea {
            height: 120px;
            resize: vertical;
        }
        .format-options {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 4px;
            border: 1px solid #e0e0e0;
        }
        .format-options h3 {
            margin-top: 0;
            margin-bottom: 15px;
            color: #333;
        }
        .radio-group {
            margin-bottom: 10px;
        }
        .radio-group input[type="radio"] {
            margin-right: 8px;
        }
        .radio-group label {
            display: inline;
            font-weight: normal;
            margin-bottom: 0;
        }
        .format-description {
            font-size: 12px;
            color: #666;
            margin-left: 20px;
            margin-top: 5px;
        }
        .send-button {
            background-color: #007cba;
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 4px;
            font-size: 16px;
            cursor: pointer;
            width: 100%;
            margin-top: 20px;
        }
        .send-button:hover {
            background-color: #005a87;
        }
        .send-button:disabled {
            background-color: #ccc;
            cursor: not-allowed;
        }
        .status-message {
            margin-top: 20px;
            padding: 10px;
            border-radius: 4px;
            display: none;
        }
        .status-success {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .status-error {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Advanced Email Sender</h1>
        
        <form id="emailForm">
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
            
            <div class="form-group">
                <label for="subject">Subject:</label>
                <input type="text" id="subject" name="subject" required>
            </div>
            
            <div class="form-group">
                <label for="message">Message:</label>
                <textarea id="message" name="message" required></textarea>
            </div>
            
            <div class="form-group">
                <div class="format-options">
                    <h3>Email Format Options</h3>
                    
                    <div class="radio-group">
                        <input type="radio" id="advancedFormat" name="emailFormat" value="advanced" checked>
                        <label for="advancedFormat">Advanced Format (multipart/alternative - Yahoo style)</label>
                        <div class="format-description">
                            Recommended: Provides better deliverability and professional headers. Uses multipart/alternative format similar to Yahoo Mail.
                        </div>
                    </div>
                    
                    <div class="radio-group">
                        <input type="radio" id="simpleFormat" name="emailFormat" value="simple">
                        <label for="simpleFormat">Simple Format</label>
                        <div class="format-description">
                            Basic email format. Use only if compatibility issues occur with advanced format.
                        </div>
                    </div>
                </div>
            </div>
            
            <button type="submit" class="send-button" id="sendButton">Send Email</button>
        </form>
        
        <div id="statusMessage" class="status-message"></div>
    </div>
    
    <script src="script.js"></script>
</body>
</html>