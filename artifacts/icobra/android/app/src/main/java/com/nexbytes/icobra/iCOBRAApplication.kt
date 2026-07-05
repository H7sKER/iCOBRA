package com.nexbytes.icobra

import android.app.Application
import android.util.Log
import timber.log.Timber

class iCOBRAApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        if (BuildConfig.DEBUG) {
            Timber.plant(Timber.DebugTree())
        } else {
            Timber.plant(ReleaseTree())
        }
        Timber.i("iCOBRA Application started — v${BuildConfig.VERSION_NAME} (${BuildConfig.VERSION_CODE})")
        Timber.d("Device: ${Utils.getDeviceModel()} Android ${Utils.getAndroidVersion()} (SDK ${Utils.getSdkInt()})")
        Timber.d("Shizuku installed: ${Utils.isShizukuInstalled(this)}")
    }

    private class ReleaseTree : Timber.Tree() {
        override fun log(priority: Int, tag: String?, message: String, t: Throwable?) {
            if (priority < Log.WARN) return
            Log.println(priority, tag ?: "iCOBRA", message)
            t?.let { Log.println(priority, tag ?: "iCOBRA", it.stackTraceToString()) }
        }
    }
}
