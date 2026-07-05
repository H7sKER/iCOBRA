package com.nexbytes.icobra

import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.os.StatFs
import android.util.Log
import java.io.BufferedReader
import java.io.File
import java.io.InputStreamReader

object Utils {
    private val TAG = "Utils"

    fun isDeviceRooted(): Boolean {
        val buildTags = Build.TAGS
        if (buildTags != null && buildTags.contains("test-keys")) return true
        val suPaths = arrayOf(
            "/system/app/Superuser.apk", "/sbin/su", "/system/bin/su",
            "/system/xbin/su", "/data/local/xbin/su", "/data/local/bin/su",
            "/system/sd/xbin/su", "/system/bin/failsafe/su", "/data/local/su"
        )
        for (path in suPaths) {
            if (File(path).exists()) return true
        }
        return false
    }

    fun getAndroidVersion(): String = Build.VERSION.RELEASE

    fun getSdkInt(): Int = Build.VERSION.SDK_INT

    fun getDeviceModel(): String = "${Build.MANUFACTURER} ${Build.MODEL}".trim()

    fun getDeviceBrand(): String = Build.BRAND

    fun getBuildId(): String = Build.ID

    fun getKernelVersion(): String {
        return try {
            val process = Runtime.getRuntime().exec("uname -r")
            BufferedReader(InputStreamReader(process.inputStream)).readLine() ?: "Unknown"
        } catch (e: Exception) {
            "Unknown"
        }
    }

    fun formatFileSize(bytes: Long): String = when {
        bytes < 0 -> "N/A"
        bytes < 1024L -> "$bytes B"
        bytes < 1024L * 1024L -> "${(bytes / 1024f).formatOneDecimal()} KB"
        bytes < 1024L * 1024L * 1024L -> "${(bytes / (1024f * 1024f)).formatOneDecimal()} MB"
        else -> "${(bytes / (1024f * 1024f * 1024f)).formatTwoDecimal()} GB"
    }

    private fun Float.formatOneDecimal() = "%.1f".format(this)
    private fun Float.formatTwoDecimal() = "%.2f".format(this)

    fun hasPermission(context: Context, permission: String): Boolean {
        return context.checkSelfPermission(permission) == PackageManager.PERMISSION_GRANTED
    }

    fun getAvailableStorage(path: File = File("/data")): Long {
        return try {
            val stat = StatFs(path.path)
            stat.availableBlocksLong * stat.blockSizeLong
        } catch (e: Exception) {
            Log.w(TAG, "getAvailableStorage failed: ${e.message}")
            -1L
        }
    }

    fun getTotalStorage(path: File = File("/data")): Long {
        return try {
            val stat = StatFs(path.path)
            stat.blockCountLong * stat.blockSizeLong
        } catch (e: Exception) {
            Log.w(TAG, "getTotalStorage failed: ${e.message}")
            -1L
        }
    }

    fun getTotalRam(): Long {
        return try {
            val reader = BufferedReader(InputStreamReader(
                Runtime.getRuntime().exec("cat /proc/meminfo").inputStream
            ))
            val line = reader.readLine()
            val match = Regex("MemTotal:\\s*(\\d+)").find(line ?: "") ?: return -1L
            match.groupValues[1].toLong() * 1024L
        } catch (e: Exception) {
            -1L
        }
    }

    fun getAvailableRam(): Long {
        return try {
            val reader = BufferedReader(InputStreamReader(
                Runtime.getRuntime().exec("cat /proc/meminfo").inputStream
            ))
            var line: String?
            while (reader.readLine().also { line = it } != null) {
                val match = Regex("MemAvailable:\\s*(\\d+)").find(line ?: "") ?: continue
                return match.groupValues[1].toLong() * 1024L
            }
            -1L
        } catch (e: Exception) {
            -1L
        }
    }

    fun getInstalledAppVersion(context: Context, packageName: String): String? {
        return try {
            val info = context.packageManager.getPackageInfo(packageName, 0)
            info.versionName
        } catch (e: PackageManager.NameNotFoundException) {
            null
        }
    }

    fun isAppInstalled(context: Context, packageName: String): Boolean {
        return try {
            context.packageManager.getPackageInfo(packageName, 0)
            true
        } catch (e: PackageManager.NameNotFoundException) {
            false
        }
    }

    fun isShizukuInstalled(context: Context): Boolean = isAppInstalled(context, "moe.shizuku.privileged.api")

    fun getShizukuVersion(context: Context): String? = getInstalledAppVersion(context, "moe.shizuku.privileged.api")

    fun getCpuInfo(): String {
        return try {
            val reader = BufferedReader(InputStreamReader(
                Runtime.getRuntime().exec("cat /proc/cpuinfo").inputStream
            ))
            var line: String?
            while (reader.readLine().also { line = it } != null) {
                if (line?.startsWith("Hardware") == true || line?.startsWith("model name") == true) {
                    return line?.substringAfter(":").orEmpty().trim()
                }
            }
            Build.HARDWARE
        } catch (e: Exception) {
            Build.HARDWARE
        }
    }

    fun getCpuArchitecture(): String = Build.SUPPORTED_ABIS.firstOrNull() ?: "unknown"

    fun formatDuration(ms: Long): String = when {
        ms < 1000L -> "${ms}ms"
        ms < 60_000L -> "${"%.1f".format(ms / 1000f)}s"
        ms < 3_600_000L -> "${ms / 60_000}m ${(ms % 60_000) / 1000}s"
        else -> "${ms / 3_600_000}h ${(ms % 3_600_000) / 60_000}m"
    }

    fun sanitizeFilename(name: String): String =
        name.replace(Regex("[\\\\/:*?\"<>|]"), "_").trim()

    fun isValidKotlinIdentifier(name: String): Boolean =
        name.matches(Regex("[a-zA-Z_][a-zA-Z0-9_]*")) && !KOTLIN_KEYWORDS.contains(name)

    fun isValidPackageName(name: String): Boolean =
        name.matches(Regex("[a-z][a-z0-9]*(\\.[a-z][a-z0-9]*)*"))

    val KOTLIN_KEYWORDS = setOf(
        "as", "break", "class", "continue", "do", "else", "false", "for",
        "fun", "if", "in", "interface", "is", "null", "object", "package",
        "return", "super", "this", "throw", "true", "try", "typealias",
        "typeof", "val", "var", "when", "while", "by", "catch", "constructor",
        "delegate", "dynamic", "field", "file", "finally", "get", "import",
        "init", "param", "property", "receiver", "set", "setparam", "value",
        "where", "actual", "abstract", "annotation", "companion", "crossinline",
        "data", "enum", "expect", "external", "final", "infix", "inline",
        "inner", "internal", "lateinit", "noinline", "open", "operator",
        "out", "override", "private", "protected", "public", "reified",
        "sealed", "suspend", "tailrec", "vararg"
    )
}
