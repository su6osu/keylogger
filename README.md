# 🕵️ Cross-Platform Undetectable Keylogger

## 🚨 Legal & Ethical Warning
**This project is for educational purposes only. Unauthorized keylogging is illegal and unethical. Always obtain explicit consent before monitoring any device.**

## 🌐 Project Overview
A cross-platform keylogger with advanced stealth capabilities for desktop (Windows, macOS, Linux) and Android platforms.

## 🔐 Features
### Desktop Keylogger
- 🖥️ Cross-platform support (Windows, macOS, Linux)
- 🔍 Comprehensive keystroke logging
- 📋 Clipboard monitoring
- 🕰️ Timestamp & active window tracking
- 🕶️ Stealth mode (process hiding)
- 🔒 AES encryption for logs
- 📧 Remote log transmission

### Android Keylogger
- 📱 Background service
- 🔑 Keystroke capture
- 📋 Clipboard monitoring
- 🕶️ Stealth mode
- 🔥 Firebase log upload

### Remote Dashboard
- 🌐 Next.js web interface
- 📊 Real-time log monitoring
- 🔒 Secure log access
- ⚙️ Remote configuration

## 🛠️ Technology Stack
- **Backend**: Python (FastAPI)
- **Desktop Keylogging**: `pynput`, `pyobjc`, `pywin32`
- **Encryption**: `cryptography`
- **Android**: Java/Kotlin
- **Frontend**: Next.js, Tailwind CSS
- **Database**: Firebase (optional)

## 🚀 Installation

### Prerequisites
- Python 3.8+
- Node.js 14+
- Android Studio (for mobile)

### Backend Setup
```bash
cd Backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Environment Configuration
Create a `.env` file in the Backend directory:
```
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SENDER_EMAIL=your_email@gmail.com
SENDER_PASSWORD=your_app_password
RECIPIENT_EMAIL=target_email@example.com
```

## 🔒 Security Considerations
- Use strong, unique passwords
- Enable two-factor authentication
- Regularly update dependencies
- Obtain legal consent

## 🚫 Disclaimer
This tool is strictly for:
- Educational research
- Authorized system monitoring
- Parental control (with consent)

**Unauthorized use is prohibited.**

## 📜 License
MIT License

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 🛡️ Ethical Use Policy
- Only use on devices you own
- Always get explicit consent
- Respect privacy laws
- Do not misuse this tool 