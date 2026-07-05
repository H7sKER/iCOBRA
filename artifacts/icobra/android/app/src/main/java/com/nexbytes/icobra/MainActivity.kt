package com.nexbytes.icobra

import android.Manifest
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.os.IBinder
import android.util.Log
import android.view.View
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import rikka.shizuku.Shizuku
import rikka.shizuku.ShizukuProvider

class MainActivity : AppCompatActivity() {

    private val TAG = "MainActivity"
    private val REQUEST_CODE_SHIZUKU = 1001

    private val shizukuPermissionResultListener = Shizuku.OnRequestPermissionResultListener { requestCode, grantResult ->
        if (requestCode == REQUEST_CODE_SHIZUKU) {
            if (grantResult == PackageManager.PERMISSION_GRANTED) {
                Log.i(TAG, "Shizuku permission granted")
                onPermissionGranted()
            } else {
                Log.w(TAG, "Shizuku permission denied")
                onPermissionDenied()
            }
        }
    }

    private val binderReceivedListener = Shizuku.OnBinderReceivedListener {
        Log.d(TAG, "Shizuku binder received")
        runOnUiThread { checkShizukuPermission() }
    }

    private val binderDeadListener = Shizuku.OnBinderDeadListener {
        Log.w(TAG, "Shizuku binder died")
        runOnUiThread { showShizukuNotRunningDialog() }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        Log.d(TAG, "onCreate called, SDK: ${Build.VERSION.SDK_INT}")
        setupShizuku()
    }

    private fun setupShizuku() {
        Shizuku.addBinderReceivedListenerSticky(binderReceivedListener)
        Shizuku.addBinderDeadListener(binderDeadListener)
        Shizuku.addRequestPermissionResultListener(shizukuPermissionResultListener)
    }

    private fun checkShizukuPermission() {
        try {
            if (Shizuku.isPreV11()) {
                Log.w(TAG, "Shizuku pre-v11 is not supported")
                showError("Shizuku version is too old. Please update to v11+")
                return
            }
            when {
                Shizuku.checkSelfPermission() == PackageManager.PERMISSION_GRANTED -> {
                    Log.i(TAG, "Shizuku permission already granted")
                    onPermissionGranted()
                }
                Shizuku.shouldShowRequestPermissionRationale() -> {
                    showPermissionRationaleDialog()
                }
                else -> {
                    Log.d(TAG, "Requesting Shizuku permission")
                    Shizuku.requestPermission(REQUEST_CODE_SHIZUKU)
                }
            }
        } catch (e: IllegalStateException) {
            Log.e(TAG, "Shizuku not running: ${e.message}")
            showShizukuNotRunningDialog()
        }
    }

    private fun onPermissionGranted() {
        Log.i(TAG, "Permission granted — initializing iCOBRA IDE")
        lifecycleScope.launch {
            try {
                ShizukuService.initialize()
                initializeApp()
            } catch (e: Exception) {
                Log.e(TAG, "Failed to initialize: ${e.message}", e)
                withContext(Dispatchers.Main) {
                    showError("Failed to initialize: ${e.message}")
                }
            }
        }
    }

    private fun onPermissionDenied() {
        showError("Shizuku permission is required to run iCOBRA. Please grant permission and restart.")
    }

    private fun initializeApp() {
        Log.i(TAG, "App initialized successfully")
        runOnUiThread {
            // TODO: Hide permission screen, show IDE
            Toast.makeText(this, "iCOBRA initialized successfully", Toast.LENGTH_SHORT).show()
        }
    }

    private fun showPermissionRationaleDialog() {
        AlertDialog.Builder(this)
            .setTitle("Shizuku Permission Required")
            .setMessage("iCOBRA IDE requires Shizuku permission to provide elevated Android development capabilities including ADB shell access, package management, and system-level debugging.\n\nPlease grant the permission to continue.")
            .setPositiveButton("Grant Permission") { _, _ ->
                Shizuku.requestPermission(REQUEST_CODE_SHIZUKU)
            }
            .setNegativeButton("Exit") { _, _ ->
                finish()
            }
            .setCancelable(false)
            .show()
    }

    private fun showShizukuNotRunningDialog() {
        AlertDialog.Builder(this)
            .setTitle("Shizuku Not Running")
            .setMessage("Shizuku service is not running. Please:\n\n1. Install Shizuku from Play Store\n2. Start Shizuku with ADB or root\n3. Relaunch iCOBRA\n\nShizuku provides the elevated permissions iCOBRA needs.")
            .setPositiveButton("Open Shizuku") { _, _ ->
                try {
                    val intent = packageManager.getLaunchIntentForPackage("moe.shizuku.privileged.api")
                    if (intent != null) startActivity(intent)
                    else openPlayStore("moe.shizuku.privileged.api")
                } catch (e: Exception) {
                    openPlayStore("moe.shizuku.privileged.api")
                }
            }
            .setNegativeButton("Exit") { _, _ -> finish() }
            .setCancelable(false)
            .show()
    }

    private fun openPlayStore(packageName: String) {
        try {
            startActivity(Intent(Intent.ACTION_VIEW,
                android.net.Uri.parse("market://details?id=$packageName")))
        } catch (e: Exception) {
            startActivity(Intent(Intent.ACTION_VIEW,
                android.net.Uri.parse("https://play.google.com/store/apps/details?id=$packageName")))
        }
    }

    private fun showError(message: String) {
        AlertDialog.Builder(this)
            .setTitle("Error")
            .setMessage(message)
            .setPositiveButton("OK", null)
            .show()
    }

    override fun onDestroy() {
        super.onDestroy()
        Shizuku.removeBinderReceivedListener(binderReceivedListener)
        Shizuku.removeBinderDeadListener(binderDeadListener)
        Shizuku.removeRequestPermissionResultListener(shizukuPermissionResultListener)
    }
}
