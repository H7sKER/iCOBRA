package com.nexbytes.icobra

import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.runTest
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.kotlin.*
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@ExperimentalCoroutinesApi
@RunWith(RobolectricTestRunner::class)
@Config(sdk = [33])
class ShizukuServiceTest {

    @Before
    fun setUp() {
        // Reset service state before each test
    }

    @Test
    fun `isReady returns false before initialization`() {
        assertFalse("Service should not be ready before init", ShizukuService.isReady())
    }

    @Test
    fun `formatFileSize formats bytes correctly`() {
        assertEquals("0 B", Utils.formatFileSize(0L))
        assertEquals("1023 B", Utils.formatFileSize(1023L))
        assertEquals("1.0 KB", Utils.formatFileSize(1024L))
        assertEquals("1.5 KB", Utils.formatFileSize(1536L))
        assertEquals("1.0 MB", Utils.formatFileSize(1024L * 1024L))
        assertEquals("10.0 MB", Utils.formatFileSize(10L * 1024L * 1024L))
        assertEquals("1.00 GB", Utils.formatFileSize(1024L * 1024L * 1024L))
    }

    @Test
    fun `formatDuration formats milliseconds correctly`() {
        assertEquals("0ms", Utils.formatDuration(0L))
        assertEquals("999ms", Utils.formatDuration(999L))
        assertEquals("1.0s", Utils.formatDuration(1000L))
        assertEquals("1.5s", Utils.formatDuration(1500L))
        assertEquals("59.9s", Utils.formatDuration(59900L))
        assertEquals("1m 0s", Utils.formatDuration(60_000L))
        assertEquals("2m 30s", Utils.formatDuration(150_000L))
        assertEquals("1h 0m", Utils.formatDuration(3_600_000L))
    }

    @Test
    fun `isValidPackageName validates correctly`() {
        assertTrue(Utils.isValidPackageName("com.nexbytes.icobra"))
        assertTrue(Utils.isValidPackageName("com.example.app"))
        assertTrue(Utils.isValidPackageName("app"))
        assertFalse(Utils.isValidPackageName("com.Example.App"))
        assertFalse(Utils.isValidPackageName("1com.example"))
        assertFalse(Utils.isValidPackageName("com..example"))
        assertFalse(Utils.isValidPackageName(""))
    }

    @Test
    fun `isValidKotlinIdentifier validates correctly`() {
        assertTrue(Utils.isValidKotlinIdentifier("myVariable"))
        assertTrue(Utils.isValidKotlinIdentifier("_privateVar"))
        assertTrue(Utils.isValidKotlinIdentifier("MyClass123"))
        assertFalse(Utils.isValidKotlinIdentifier("1invalid"))
        assertFalse(Utils.isValidKotlinIdentifier("my-var"))
        assertFalse(Utils.isValidKotlinIdentifier("fun")) // keyword
        assertFalse(Utils.isValidKotlinIdentifier("class")) // keyword
        assertFalse(Utils.isValidKotlinIdentifier("val")) // keyword
        assertFalse(Utils.isValidKotlinIdentifier(""))
    }

    @Test
    fun `sanitizeFilename removes illegal characters`() {
        assertEquals("file_name_txt", Utils.sanitizeFilename("file/name:txt"))
        assertEquals("my_file.kt", Utils.sanitizeFilename("my_file.kt"))
        assertEquals("test__file", Utils.sanitizeFilename("test*?file"))
        assertEquals("normal", Utils.sanitizeFilename("normal"))
    }

    @Test
    fun `KOTLIN_KEYWORDS contains standard keywords`() {
        assertTrue(Utils.KOTLIN_KEYWORDS.contains("fun"))
        assertTrue(Utils.KOTLIN_KEYWORDS.contains("class"))
        assertTrue(Utils.KOTLIN_KEYWORDS.contains("val"))
        assertTrue(Utils.KOTLIN_KEYWORDS.contains("var"))
        assertTrue(Utils.KOTLIN_KEYWORDS.contains("object"))
        assertTrue(Utils.KOTLIN_KEYWORDS.contains("interface"))
        assertTrue(Utils.KOTLIN_KEYWORDS.contains("suspend"))
        assertTrue(Utils.KOTLIN_KEYWORDS.contains("override"))
        assertFalse(Utils.KOTLIN_KEYWORDS.contains("myFunction"))
        assertFalse(Utils.KOTLIN_KEYWORDS.contains("ShizukuService"))
    }

    @Test
    fun `getCpuArchitecture returns non-empty string`() {
        val arch = Utils.getCpuArchitecture()
        assertNotNull(arch)
        assertTrue(arch.isNotEmpty())
    }

    @Test
    fun `getAndroidVersion returns non-empty string`() {
        val version = Utils.getAndroidVersion()
        assertNotNull(version)
        assertTrue(version.isNotEmpty())
    }

    @Test
    fun `getSdkInt returns valid SDK int`() {
        val sdk = Utils.getSdkInt()
        assertTrue("SDK int should be positive", sdk > 0)
        assertTrue("SDK int should be reasonable", sdk < 100)
    }

    @Test
    fun `getDeviceModel returns non-empty string`() {
        val model = Utils.getDeviceModel()
        assertNotNull(model)
        assertTrue(model.isNotEmpty())
    }

    @Test
    fun `isDeviceRooted returns boolean`() {
        // Should not throw; result depends on test environment
        val result = Utils.isDeviceRooted()
        assertNotNull(result)
    }
}
