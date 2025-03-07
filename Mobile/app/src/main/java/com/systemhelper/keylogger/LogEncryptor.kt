package com.systemhelper.keylogger

import android.util.Base64
import android.util.Log
import java.security.MessageDigest
import javax.crypto.Cipher
import javax.crypto.spec.IvParameterSpec
import javax.crypto.spec.SecretKeySpec

object LogEncryptor {
    private const val TAG = "LogEncryptor"
    private const val ENCRYPTION_ALGORITHM = "AES/CBC/PKCS5Padding"
    private const val SECRET_KEY_ALGORITHM = "AES"
    private const val KEY_LENGTH = 32 // 256-bit key

    fun encrypt(data: String, secretKey: String): String {
        return try {
            // Generate a random IV
            val iv = ByteArray(16)
            java.security.SecureRandom().nextBytes(iv)
            val ivSpec = IvParameterSpec(iv)

            // Hash the secret key
            val digest = MessageDigest.getInstance("SHA-256")
            val keyBytes = digest.digest(secretKey.toByteArray())
            val secretKeySpec = SecretKeySpec(keyBytes, SECRET_KEY_ALGORITHM)

            // Encrypt
            val cipher = Cipher.getInstance(ENCRYPTION_ALGORITHM)
            cipher.init(Cipher.ENCRYPT_MODE, secretKeySpec, ivSpec)
            val encryptedBytes = cipher.doFinal(data.toByteArray())

            // Combine IV and encrypted data
            val combinedBytes = ByteArray(iv.size + encryptedBytes.size)
            System.arraycopy(iv, 0, combinedBytes, 0, iv.size)
            System.arraycopy(encryptedBytes, 0, combinedBytes, iv.size, encryptedBytes.size)

            // Base64 encode
            Base64.encodeToString(combinedBytes, Base64.DEFAULT)
        } catch (e: Exception) {
            Log.e(TAG, "Encryption error", e)
            data // Fallback to original data
        }
    }

    fun decrypt(encryptedData: String, secretKey: String): String {
        return try {
            // Base64 decode
            val combinedBytes = Base64.decode(encryptedData, Base64.DEFAULT)

            // Extract IV
            val iv = ByteArray(16)
            System.arraycopy(combinedBytes, 0, iv, 0, iv.size)
            val ivSpec = IvParameterSpec(iv)

            // Hash the secret key
            val digest = MessageDigest.getInstance("SHA-256")
            val keyBytes = digest.digest(secretKey.toByteArray())
            val secretKeySpec = SecretKeySpec(keyBytes, SECRET_KEY_ALGORITHM)

            // Decrypt
            val cipher = Cipher.getInstance(ENCRYPTION_ALGORITHM)
            cipher.init(Cipher.DECRYPT_MODE, secretKeySpec, ivSpec)

            // Extract encrypted data
            val encryptedBytes = ByteArray(combinedBytes.size - iv.size)
            System.arraycopy(combinedBytes, iv.size, encryptedBytes, 0, encryptedBytes.size)

            val decryptedBytes = cipher.doFinal(encryptedBytes)
            String(decryptedBytes)
        } catch (e: Exception) {
            Log.e(TAG, "Decryption error", e)
            encryptedData // Fallback to original data
        }
    }
} 