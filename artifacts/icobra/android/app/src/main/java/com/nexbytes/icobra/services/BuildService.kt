package com.nexbytes.icobra.services

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import com.nexbytes.icobra.R
import com.nexbytes.icobra.ShizukuService
import kotlinx.coroutines.*
import java.io.File

class BuildService : Service() {
    private val TAG = "BuildService"
    private val serviceScope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private val NOTIFICATION_ID = 1001
    private val CHANNEL_ID = "build_channel"

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        Log.d(TAG, "BuildService created")
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.action ?: return START_NOT_STICKY
        Log.i(TAG, "BuildService received action: $action")
        when (action) {
            ACTION_BUILD_DEBUG -> startBuild("debug")
            ACTION_BUILD_RELEASE -> startBuild("release")
            ACTION_CLEAN -> startClean()
            ACTION_STOP -> stopBuild()
        }
        return START_NOT_STICKY
    }

    private fun startBuild(variant: String) {
        startForeground(NOTIFICATION_ID, createBuildNotification("Building $variant…"))
        serviceScope.launch {
            try {
                val projectDir = intent?.getStringExtra(EXTRA_PROJECT_DIR) ?: "/sdcard/iCOBRA-Project"
                Log.i(TAG, "Starting $variant build in $projectDir")

                val steps = listOf(
                    "Checking Gradle wrapper…" to "ls gradlew",
                    "Cleaning previous build…" to "./gradlew clean",
                    "Compiling Kotlin…" to "./gradlew compile${variant.capitalize()}Kotlin",
                    "Processing resources…" to "./gradlew process${variant.capitalize()}Resources",
                    "Assembling APK…" to "./gradlew assemble${variant.capitalize()}",
                )

                for ((message, command) in steps) {
                    withContext(Dispatchers.Main) {
                        updateNotification(message)
                    }
                    val result = ShizukuService.executeCommand("cd $projectDir && $command")
                    Log.d(TAG, "$command result: ${result.take(200)}")
                }

                withContext(Dispatchers.Main) {
                    updateNotification("Build successful! ✓")
                    sendBroadcast(Intent(ACTION_BUILD_COMPLETE).apply {
                        putExtra(EXTRA_SUCCESS, true)
                        putExtra(EXTRA_APK_PATH, "$projectDir/app/build/outputs/apk/$variant/app-$variant.apk")
                    })
                }
                Log.i(TAG, "$variant build completed successfully")
            } catch (e: Exception) {
                Log.e(TAG, "Build failed: ${e.message}", e)
                withContext(Dispatchers.Main) {
                    updateNotification("Build failed: ${e.message?.take(50)}")
                    sendBroadcast(Intent(ACTION_BUILD_COMPLETE).apply {
                        putExtra(EXTRA_SUCCESS, false)
                        putExtra(EXTRA_ERROR, e.message)
                    })
                }
            } finally {
                delay(3000)
                stopSelf()
            }
        }
    }

    private fun startClean() {
        startForeground(NOTIFICATION_ID, createBuildNotification("Cleaning project…"))
        serviceScope.launch {
            try {
                val projectDir = "/sdcard/iCOBRA-Project"
                ShizukuService.executeCommand("cd $projectDir && ./gradlew clean")
                withContext(Dispatchers.Main) {
                    updateNotification("Clean completed ✓")
                }
                Log.i(TAG, "Project cleaned successfully")
            } catch (e: Exception) {
                Log.e(TAG, "Clean failed: ${e.message}", e)
            } finally {
                delay(2000)
                stopSelf()
            }
        }
    }

    private fun stopBuild() {
        serviceScope.cancel()
        stopForeground(true)
        stopSelf()
    }

    private fun createBuildNotification(message: String): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("iCOBRA Build")
            .setContentText(message)
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setOngoing(true)
            .setProgress(0, 0, true)
            .build()
    }

    private fun updateNotification(message: String) {
        val manager = getSystemService(NotificationManager::class.java)
        manager.notify(NOTIFICATION_ID, createBuildNotification(message))
    }

    private fun createNotificationChannel() {
        val channel = NotificationChannel(
            CHANNEL_ID,
            "Build Status",
            NotificationManager.IMPORTANCE_LOW
        ).apply {
            description = "iCOBRA build status notifications"
        }
        val manager = getSystemService(NotificationManager::class.java)
        manager.createNotificationChannel(channel)
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        super.onDestroy()
        serviceScope.cancel()
        Log.d(TAG, "BuildService destroyed")
    }

    companion object {
        const val ACTION_BUILD_DEBUG = "com.nexbytes.icobra.BUILD_DEBUG"
        const val ACTION_BUILD_RELEASE = "com.nexbytes.icobra.BUILD_RELEASE"
        const val ACTION_CLEAN = "com.nexbytes.icobra.CLEAN"
        const val ACTION_STOP = "com.nexbytes.icobra.STOP_BUILD"
        const val ACTION_BUILD_COMPLETE = "com.nexbytes.icobra.BUILD_COMPLETE"
        const val EXTRA_PROJECT_DIR = "project_dir"
        const val EXTRA_SUCCESS = "success"
        const val EXTRA_APK_PATH = "apk_path"
        const val EXTRA_ERROR = "error"
    }
}
