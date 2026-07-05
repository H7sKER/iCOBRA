export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  language?: string;
  children?: FileNode[];
  content?: string;
}

export const sampleProject: FileNode[] = [
  {
    id: 'root',
    name: 'iCOBRA-Project',
    type: 'folder',
    children: [
      {
        id: 'app-folder',
        name: 'app',
        type: 'folder',
        children: [
          {
            id: 'src-folder',
            name: 'src',
            type: 'folder',
            children: [
              {
                id: 'main-folder',
                name: 'main',
                type: 'folder',
                children: [
                  {
                    id: 'java-folder',
                    name: 'java',
                    type: 'folder',
                    children: [
                      {
                        id: 'com-folder',
                        name: 'com',
                        type: 'folder',
                        children: [
                          {
                            id: 'nexbytes-folder',
                            name: 'nexbytes',
                            type: 'folder',
                            children: [
                              {
                                id: 'icobra-folder',
                                name: 'icobra',
                                type: 'folder',
                                children: [
                                  {
                                    id: 'main-activity',
                                    name: 'MainActivity.kt',
                                    type: 'file',
                                    language: 'kotlin',
                                    content: `package com.nexbytes.icobra

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import rikka.shizuku.Shizuku

class MainActivity : AppCompatActivity() {

    private val REQUEST_CODE_SHIZUKU = 1001

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        // Initialize Shizuku permission check
        checkShizukuPermission()
    }

    private fun checkShizukuPermission() {
        if (Shizuku.isPreV11()) {
            // Handle pre-v11 Shizuku
            return
        }
        if (Shizuku.checkSelfPermission() == android.content.pm.PackageManager.PERMISSION_GRANTED) {
            onPermissionGranted()
        } else if (Shizuku.shouldShowRequestPermissionRationale()) {
            showPermissionRationale()
        } else {
            Shizuku.requestPermission(REQUEST_CODE_SHIZUKU)
        }
    }

    private fun onPermissionGranted() {
        // Permission granted - proceed to main functionality
        initializeApp()
    }

    private fun initializeApp() {
        // Main app initialization logic here
        ShizukuService.initialize()
    }

    private fun showPermissionRationale() {
        // Show UI explaining why Shizuku permission is needed
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == REQUEST_CODE_SHIZUKU) {
            if (grantResults.isNotEmpty() && 
                grantResults[0] == android.content.pm.PackageManager.PERMISSION_GRANTED) {
                onPermissionGranted()
            }
        }
    }
}`
                                  },
                                  {
                                    id: 'shizuku-service',
                                    name: 'ShizukuService.kt',
                                    type: 'file',
                                    language: 'kotlin',
                                    content: `package com.nexbytes.icobra

import rikka.shizuku.Shizuku
import rikka.shizuku.ShizukuRemoteProcess

/**
 * ShizukuService - Handles elevated shell command execution
 * via the Shizuku IPC bridge.
 */
object ShizukuService {

    private var isInitialized = false

    fun initialize() {
        if (isInitialized) return
        
        Shizuku.addBinderReceivedListenerSticky(binderReceivedListener)
        Shizuku.addBinderDeadListener(binderDeadListener)
        isInitialized = true
    }

    private val binderReceivedListener = Shizuku.OnBinderReceivedListener {
        if (Shizuku.isPreV11()) {
            // Handle pre-v11
        }
    }

    private val binderDeadListener = Shizuku.OnBinderDeadListener {
        isInitialized = false
    }

    /**
     * Execute a shell command with elevated permissions
     */
    fun executeCommand(command: String): String {
        return try {
            val process: ShizukuRemoteProcess = 
                Shizuku.newProcess(arrayOf("sh", "-c", command), null, null)
            val output = process.inputStream.bufferedReader().readText()
            process.waitFor()
            output
        } catch (e: Exception) {
            "Error: \${e.message}"
        }
    }

    /**
     * Check if a package is installed
     */
    fun isPackageInstalled(packageName: String): Boolean {
        val result = executeCommand("pm list packages $packageName")
        return result.contains(packageName)
    }

    /**
     * Get device properties
     */
    fun getDeviceProperties(): Map<String, String> {
        val props = mutableMapOf<String, String>()
        val output = executeCommand("getprop")
        output.lines().forEach { line ->
            val match = Regex("\\[(.+?)\\]: \\[(.+?)\\]").find(line)
            match?.let {
                props[it.groupValues[1]] = it.groupValues[2]
            }
        }
        return props
    }
}`
                                  },
                                  {
                                    id: 'utils-kt',
                                    name: 'Utils.kt',
                                    type: 'file',
                                    language: 'kotlin',
                                    content: `package com.nexbytes.icobra

import android.content.Context
import android.content.pm.PackageManager
import android.os.Build

object Utils {

    /**
     * Check if device is rooted
     */
    fun isDeviceRooted(): Boolean {
        return checkForSu() || checkForBusyBox()
    }

    private fun checkForSu(): Boolean {
        return try {
            Runtime.getRuntime().exec("su")
            true
        } catch (e: Exception) {
            false
        }
    }

    private fun checkForBusyBox(): Boolean {
        return try {
            Runtime.getRuntime().exec("busybox")
            true
        } catch (e: Exception) {
            false
        }
    }

    /**
     * Get Android version name
     */
    fun getAndroidVersion(): String {
        return "Android \${Build.VERSION.RELEASE} (API \${Build.VERSION.SDK_INT})"
    }

    /**
     * Format file size to human readable
     */
    fun formatFileSize(bytes: Long): String {
        return when {
            bytes < 1024 -> "\$bytes B"
            bytes < 1024 * 1024 -> "\${bytes / 1024} KB"
            bytes < 1024 * 1024 * 1024 -> "\${bytes / (1024 * 1024)} MB"
            else -> "\${bytes / (1024 * 1024 * 1024)} GB"
        }
    }

    /**
     * Check app permission
     */
    fun hasPermission(context: Context, permission: String): Boolean {
        return context.checkSelfPermission(permission) == 
               PackageManager.PERMISSION_GRANTED
    }
}`
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    id: 'manifest',
                    name: 'AndroidManifest.xml',
                    type: 'file',
                    language: 'xml',
                    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.nexbytes.icobra">

    <!-- Shizuku permissions -->
    <uses-permission android:name="rikka.shizuku.permission.API_V23" />
    
    <!-- Storage permissions -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"
        android:maxSdkVersion="28" />
    <uses-permission android:name="android.permission.MANAGE_EXTERNAL_STORAGE"
        tools:ignore="ScopedStorage" />

    <!-- Internet permission -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.iCOBRA"
        android:requestLegacyExternalStorage="true">

        <!-- Shizuku ContentProvider -->
        <provider
            android:name="rikka.shizuku.ShizukuProvider"
            android:authorities="\${applicationId}.shizuku"
            android:multiprocess="false"
            android:enabled="true"
            android:exported="true"
            android:permission="android.permission.INTERACT_ACROSS_USERS_FULL" />

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`
                  },
                ],
              },
            ],
          },
          {
            id: 'build-gradle-app',
            name: 'build.gradle',
            type: 'file',
            language: 'groovy',
            content: `plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
}

android {
    namespace 'com.nexbytes.icobra'
    compileSdk 34

    defaultConfig {
        applicationId "com.nexbytes.icobra"
        minSdk 26
        targetSdk 34
        versionCode 1
        versionName "1.0.0"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 
                          'proguard-rules.pro'
            signingConfig signingConfigs.release
        }
        debug {
            applicationIdSuffix ".debug"
            debuggable true
        }
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = '17'
    }
}

dependencies {
    // Shizuku
    implementation 'dev.rikka.shizuku:api:13.1.5'
    implementation 'dev.rikka.shizuku:provider:13.1.5'

    // AndroidX
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'

    // Coroutines
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3'

    // Testing
    testImplementation 'junit:junit:4.13.2'
    androidTestImplementation 'androidx.test.ext:junit:1.1.5'
}`
          },
        ],
      },
      {
        id: 'build-gradle-root',
        name: 'build.gradle',
        type: 'file',
        language: 'groovy',
        content: `// Top-level build file where you can add configuration
// options common to all sub-projects/modules.
plugins {
    id 'com.android.application' version '8.2.0' apply false
    id 'com.android.library' version '8.2.0' apply false
    id 'org.jetbrains.kotlin.android' version '1.9.22' apply false
}

buildscript {
    repositories {
        google()
        mavenCentral()
        maven { url 'https://jitpack.io' }
    }
}`
      },
      {
        id: 'readme',
        name: 'README.md',
        type: 'file',
        language: 'markdown',
        content: `# iCOBRA

**iCOBRA** is an advanced Android IDE built by NexBytes.

## Features

- Full Android development environment
- Shizuku integration for elevated permissions
- Real-time syntax highlighting
- Integrated terminal
- Git version control
- Debugger with breakpoints
- Extensions marketplace
- IntelliSense auto-completion

## Requirements

- Android 8.0+ (API 26+)
- Shizuku app installed and running
- 2GB+ RAM recommended

## Setup

1. Install [Shizuku](https://shizuku.rikka.app/) from Play Store
2. Start Shizuku service (via ADB or root)
3. Open iCOBRA and grant Shizuku permission
4. Start coding!

## Build

\`\`\`bash
./gradlew assembleDebug
\`\`\`

## Package

\`com.nexbytes.icobra\`

## Version

1.0.0

---

© 2024 NexBytes. All rights reserved.`
      },
    ],
  },
];

export function findFileById(nodes: FileNode[], id: string): FileNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findFileById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

export function getAllFiles(nodes: FileNode[]): FileNode[] {
  const files: FileNode[] = [];
  for (const node of nodes) {
    if (node.type === 'file') {
      files.push(node);
    } else if (node.children) {
      files.push(...getAllFiles(node.children));
    }
  }
  return files;
}

export const getLanguageColor = (language?: string): string => {
  const map: Record<string, string> = {
    kotlin: '#A97BFF',
    java: '#B07219',
    xml: '#E44D26',
    groovy: '#4298B8',
    markdown: '#083fa1',
    json: '#CBB069',
    typescript: '#3178C6',
    javascript: '#F7DF1E',
    python: '#3572A5',
    cpp: '#F34B7D',
    'c#': '#239120',
    html: '#E44D26',
    css: '#563D7C',
  };
  return map[language?.toLowerCase() ?? ''] ?? '#858585';
};

export const getFileIcon = (name: string, language?: string): string => {
  if (name.endsWith('.kt')) return 'K';
  if (name.endsWith('.java')) return 'J';
  if (name.endsWith('.xml')) return 'X';
  if (name.endsWith('.gradle')) return 'G';
  if (name.endsWith('.md')) return 'M';
  if (name.endsWith('.json')) return '{}';
  if (name.endsWith('.ts') || name.endsWith('.tsx')) return 'TS';
  if (name.endsWith('.js') || name.endsWith('.jsx')) return 'JS';
  if (name.endsWith('.py')) return 'PY';
  if (name.endsWith('.html')) return 'H';
  if (name.endsWith('.css')) return 'C';
  return '•';
};
