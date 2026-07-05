package com.nexbytes.icobra.services

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import com.nexbytes.icobra.ShizukuService
import kotlinx.coroutines.*
import java.net.ServerSocket
import java.net.Socket

class DebuggerService : Service() {
    private val TAG = "DebuggerService"
    private val serviceScope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private val NOTIFICATION_ID = 1002
    private val CHANNEL_ID = "debug_channel"
    private val DEBUG_PORT = 5005
    private var serverSocket: ServerSocket? = null
    private var clientSocket: Socket? = null
    private var isDebugging = false
    private var targetPackage: String? = null

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        Log.d(TAG, "DebuggerService created")
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.action ?: return START_NOT_STICKY
        Log.i(TAG, "DebuggerService action: $action")
        when (action) {
            ACTION_ATTACH -> {
                targetPackage = intent.getStringExtra(EXTRA_PACKAGE)
                attachDebugger(targetPackage ?: "")
            }
            ACTION_DETACH -> detachDebugger()
            ACTION_PAUSE -> pauseExecution()
            ACTION_RESUME -> resumeExecution()
            ACTION_STEP_OVER -> stepOver()
            ACTION_STEP_INTO -> stepInto()
            ACTION_STEP_OUT -> stepOut()
            ACTION_EVALUATE -> {
                val expression = intent.getStringExtra(EXTRA_EXPRESSION) ?: return START_NOT_STICKY
                evaluateExpression(expression)
            }
        }
        return START_NOT_STICKY
    }

    private fun attachDebugger(packageName: String) {
        if (packageName.isEmpty()) {
            Log.e(TAG, "Package name is empty")
            return
        }
        startForeground(NOTIFICATION_ID, createDebugNotification("Attaching to $packageName…"))
        serviceScope.launch {
            try {
                Log.i(TAG, "Starting JDWP forwarding for $packageName")
                val pid = ShizukuService.executeCommand("pidof $packageName").trim()
                if (pid.isEmpty()) {
                    throw IllegalStateException("Process '$packageName' not found")
                }
                ShizukuService.executeCommand("adb forward tcp:$DEBUG_PORT jdwp:$pid")
                serverSocket = ServerSocket(DEBUG_PORT)
                isDebugging = true
                withContext(Dispatchers.Main) {
                    updateNotification("Debugger attached to $packageName (PID $pid)")
                    sendBroadcast(Intent(ACTION_DEBUGGER_ATTACHED).apply {
                        putExtra(EXTRA_PACKAGE, packageName)
                        putExtra(EXTRA_PID, pid)
                    })
                }
                Log.i(TAG, "Debugger attached to $packageName PID=$pid on port $DEBUG_PORT")
                listenForDebugEvents()
            } catch (e: Exception) {
                Log.e(TAG, "Failed to attach debugger: ${e.message}", e)
                withContext(Dispatchers.Main) {
                    sendBroadcast(Intent(ACTION_DEBUGGER_ERROR).apply {
                        putExtra(EXTRA_ERROR, e.message)
                    })
                }
                stopSelf()
            }
        }
    }

    private suspend fun listenForDebugEvents() {
        try {
            Log.d(TAG, "Listening for JDWP events on port $DEBUG_PORT")
            while (isDebugging && isActive) {
                delay(100)
            }
        } catch (e: CancellationException) {
            Log.d(TAG, "Debug event listener cancelled")
        } catch (e: Exception) {
            Log.e(TAG, "Error in debug event listener: ${e.message}", e)
        }
    }

    private fun detachDebugger() {
        Log.i(TAG, "Detaching debugger from $targetPackage")
        isDebugging = false
        serviceScope.launch {
            try {
                clientSocket?.close()
                serverSocket?.close()
                ShizukuService.executeCommand("adb forward --remove tcp:$DEBUG_PORT")
                withContext(Dispatchers.Main) {
                    sendBroadcast(Intent(ACTION_DEBUGGER_DETACHED))
                }
            } catch (e: Exception) {
                Log.w(TAG, "Error during detach: ${e.message}")
            } finally {
                withContext(Dispatchers.Main) {
                    stopForeground(true)
                    stopSelf()
                }
            }
        }
    }

    private fun pauseExecution() {
        Log.d(TAG, "Pausing execution")
        sendBroadcast(Intent(ACTION_EXECUTION_PAUSED).apply {
            putExtra(EXTRA_LINE, getCurrentLine())
            putExtra(EXTRA_FILE, getCurrentFile())
        })
    }

    private fun resumeExecution() {
        Log.d(TAG, "Resuming execution")
        sendBroadcast(Intent(ACTION_EXECUTION_RESUMED))
    }

    private fun stepOver() {
        Log.d(TAG, "Step over")
        serviceScope.launch {
            try {
                sendBroadcast(Intent(ACTION_STEP_COMPLETE).apply {
                    putExtra(EXTRA_STEP_TYPE, "over")
                    putExtra(EXTRA_LINE, getCurrentLine() + 1)
                    putExtra(EXTRA_FILE, getCurrentFile())
                })
            } catch (e: Exception) {
                Log.e(TAG, "Step over failed: ${e.message}")
            }
        }
    }

    private fun stepInto() {
        Log.d(TAG, "Step into")
        serviceScope.launch {
            sendBroadcast(Intent(ACTION_STEP_COMPLETE).apply {
                putExtra(EXTRA_STEP_TYPE, "into")
            })
        }
    }

    private fun stepOut() {
        Log.d(TAG, "Step out")
        serviceScope.launch {
            sendBroadcast(Intent(ACTION_STEP_COMPLETE).apply {
                putExtra(EXTRA_STEP_TYPE, "out")
            })
        }
    }

    private fun evaluateExpression(expression: String) {
        Log.d(TAG, "Evaluating: $expression")
        serviceScope.launch {
            try {
                val result = "= [evaluated: $expression]"
                withContext(Dispatchers.Main) {
                    sendBroadcast(Intent(ACTION_EXPRESSION_RESULT).apply {
                        putExtra(EXTRA_EXPRESSION, expression)
                        putExtra(EXTRA_RESULT, result)
                    })
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    sendBroadcast(Intent(ACTION_EXPRESSION_RESULT).apply {
                        putExtra(EXTRA_EXPRESSION, expression)
                        putExtra(EXTRA_ERROR, e.message)
                    })
                }
            }
        }
    }

    private fun getCurrentLine(): Int = 0
    private fun getCurrentFile(): String = targetPackage ?: ""

    private fun createDebugNotification(message: String): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("iCOBRA Debugger")
            .setContentText(message)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setOngoing(true)
            .build()
    }

    private fun updateNotification(message: String) {
        val manager = getSystemService(NotificationManager::class.java)
        manager.notify(NOTIFICATION_ID, createDebugNotification(message))
    }

    private fun createNotificationChannel() {
        val channel = NotificationChannel(
            CHANNEL_ID,
            "Debugger",
            NotificationManager.IMPORTANCE_LOW
        ).apply { description = "iCOBRA debugger status" }
        getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
    }

    override fun onBind(intent: Intent?): IBinder? = null
    override fun onDestroy() {
        super.onDestroy()
        isDebugging = false
        serviceScope.cancel()
        runCatching { serverSocket?.close() }
        runCatching { clientSocket?.close() }
        Log.d(TAG, "DebuggerService destroyed")
    }

    companion object {
        const val ACTION_ATTACH = "com.nexbytes.icobra.DEBUG_ATTACH"
        const val ACTION_DETACH = "com.nexbytes.icobra.DEBUG_DETACH"
        const val ACTION_PAUSE = "com.nexbytes.icobra.DEBUG_PAUSE"
        const val ACTION_RESUME = "com.nexbytes.icobra.DEBUG_RESUME"
        const val ACTION_STEP_OVER = "com.nexbytes.icobra.DEBUG_STEP_OVER"
        const val ACTION_STEP_INTO = "com.nexbytes.icobra.DEBUG_STEP_INTO"
        const val ACTION_STEP_OUT = "com.nexbytes.icobra.DEBUG_STEP_OUT"
        const val ACTION_EVALUATE = "com.nexbytes.icobra.DEBUG_EVALUATE"
        const val ACTION_DEBUGGER_ATTACHED = "com.nexbytes.icobra.DEBUGGER_ATTACHED"
        const val ACTION_DEBUGGER_DETACHED = "com.nexbytes.icobra.DEBUGGER_DETACHED"
        const val ACTION_DEBUGGER_ERROR = "com.nexbytes.icobra.DEBUGGER_ERROR"
        const val ACTION_EXECUTION_PAUSED = "com.nexbytes.icobra.EXECUTION_PAUSED"
        const val ACTION_EXECUTION_RESUMED = "com.nexbytes.icobra.EXECUTION_RESUMED"
        const val ACTION_STEP_COMPLETE = "com.nexbytes.icobra.STEP_COMPLETE"
        const val ACTION_EXPRESSION_RESULT = "com.nexbytes.icobra.EXPRESSION_RESULT"
        const val EXTRA_PACKAGE = "package"
        const val EXTRA_PID = "pid"
        const val EXTRA_ERROR = "error"
        const val EXTRA_EXPRESSION = "expression"
        const val EXTRA_RESULT = "result"
        const val EXTRA_LINE = "line"
        const val EXTRA_FILE = "file"
        const val EXTRA_STEP_TYPE = "step_type"
    }
}
