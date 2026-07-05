package com.nexbytes.icobra

import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import rikka.shizuku.Shizuku
import java.io.BufferedReader
import java.io.InputStreamReader

object ShizukuService {
    private val TAG = "ShizukuService"
    private var isInitialized = false

    suspend fun initialize() = withContext(Dispatchers.IO) {
        if (isInitialized) return@withContext
        try {
            val version = executeCommand("getprop ro.build.version.sdk")
            Log.i(TAG, "ShizukuService initialized — Android SDK $version")
            isInitialized = true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to initialize: ${e.message}", e)
            throw e
        }
    }

    suspend fun executeCommand(command: String): String = withContext(Dispatchers.IO) {
        try {
            val process = Shizuku.newProcess(arrayOf("sh", "-c", command), null, null)
            val reader = BufferedReader(InputStreamReader(process.inputStream))
            val output = StringBuilder()
            var line: String?
            while (reader.readLine().also { line = it } != null) {
                output.appendLine(line)
            }
            val errorReader = BufferedReader(InputStreamReader(process.errorStream))
            val error = StringBuilder()
            while (errorReader.readLine().also { line = it } != null) {
                error.appendLine(line)
            }
            process.waitFor()
            if (process.exitValue() != 0 && error.isNotEmpty()) {
                Log.w(TAG, "Command stderr: $error")
            }
            output.toString().trim()
        } catch (e: Exception) {
            Log.e(TAG, "executeCommand failed for '$command': ${e.message}", e)
            throw RuntimeException("Failed to execute command: $command", e)
        }
    }

    suspend fun isPackageInstalled(packageName: String): Boolean = withContext(Dispatchers.IO) {
        try {
            val result = executeCommand("pm list packages $packageName")
            result.contains("package:$packageName")
        } catch (e: Exception) {
            Log.e(TAG, "isPackageInstalled failed: ${e.message}")
            false
        }
    }

    suspend fun getInstalledPackages(): List<String> = withContext(Dispatchers.IO) {
        try {
            val result = executeCommand("pm list packages")
            result.lines()
                .filter { it.startsWith("package:") }
                .map { it.removePrefix("package:").trim() }
                .sorted()
        } catch (e: Exception) {
            Log.e(TAG, "getInstalledPackages failed: ${e.message}")
            emptyList()
        }
    }

    suspend fun getDeviceProperties(): Map<String, String> = withContext(Dispatchers.IO) {
        try {
            val props = mutableMapOf<String, String>()
            val result = executeCommand("getprop")
            result.lines().forEach { line ->
                val match = Regex("\\[(.+?)\\]: \\[(.*)\\]").find(line)
                if (match != null) {
                    props[match.groupValues[1]] = match.groupValues[2]
                }
            }
            props
        } catch (e: Exception) {
            Log.e(TAG, "getDeviceProperties failed: ${e.message}", e)
            emptyMap()
        }
    }

    suspend fun installApk(apkPath: String): Boolean = withContext(Dispatchers.IO) {
        try {
            val result = executeCommand("pm install -r \"$apkPath\"")
            result.contains("Success")
        } catch (e: Exception) {
            Log.e(TAG, "installApk failed: ${e.message}")
            false
        }
    }

    suspend fun uninstallPackage(packageName: String, keepData: Boolean = false): Boolean = withContext(Dispatchers.IO) {
        try {
            val keepFlag = if (keepData) "-k " else ""
            val result = executeCommand("pm uninstall $keepFlag$packageName")
            result.contains("Success")
        } catch (e: Exception) {
            Log.e(TAG, "uninstallPackage failed: ${e.message}")
            false
        }
    }

    suspend fun forceStop(packageName: String) = withContext(Dispatchers.IO) {
        executeCommand("am force-stop $packageName")
    }

    suspend fun clearAppData(packageName: String): Boolean = withContext(Dispatchers.IO) {
        try {
            val result = executeCommand("pm clear $packageName")
            result.contains("Success")
        } catch (e: Exception) {
            false
        }
    }

    suspend fun grantPermission(packageName: String, permission: String): Boolean = withContext(Dispatchers.IO) {
        try {
            val result = executeCommand("pm grant $packageName $permission")
            result.isEmpty() || !result.contains("Exception")
        } catch (e: Exception) {
            false
        }
    }

    suspend fun revokePermission(packageName: String, permission: String): Boolean = withContext(Dispatchers.IO) {
        try {
            val result = executeCommand("pm revoke $packageName $permission")
            result.isEmpty() || !result.contains("Exception")
        } catch (e: Exception) {
            false
        }
    }

    suspend fun getSystemInfo(): SystemInfo = withContext(Dispatchers.IO) {
        val androidVersion = executeCommand("getprop ro.build.version.release")
        val sdkInt = executeCommand("getprop ro.build.version.sdk")
        val model = executeCommand("getprop ro.product.model")
        val brand = executeCommand("getprop ro.product.brand")
        val manufacturer = executeCommand("getprop ro.product.manufacturer")
        val buildId = executeCommand("getprop ro.build.id")
        val kernelVersion = executeCommand("uname -r")
        val cpuAbi = executeCommand("getprop ro.product.cpu.abi")
        val totalRam = executeCommand("cat /proc/meminfo | grep MemTotal | awk '{print \$2}'")
        val storageInfo = executeCommand("df /data | tail -1")

        SystemInfo(
            androidVersion = androidVersion,
            sdkInt = sdkInt.toIntOrNull() ?: 0,
            model = model,
            brand = brand,
            manufacturer = manufacturer,
            buildId = buildId,
            kernelVersion = kernelVersion,
            cpuAbi = cpuAbi,
            totalRamKb = totalRam.toLongOrNull() ?: 0L,
            storageInfo = storageInfo
        )
    }

    fun isReady() = isInitialized
}

data class SystemInfo(
    val androidVersion: String,
    val sdkInt: Int,
    val model: String,
    val brand: String,
    val manufacturer: String,
    val buildId: String,
    val kernelVersion: String,
    val cpuAbi: String,
    val totalRamKb: Long,
    val storageInfo: String
)
