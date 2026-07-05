import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useShizuku } from '@/context/ShizukuContext';

const { width } = Dimensions.get('window');

export default function ShizukuPermissionScreen() {
  const { grantPermission } = useShizuku();
  const insets = useSafeAreaInsets();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [granted, setGranted] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const dialogAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();

    // Pulse the icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const showDialog = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDialogVisible(true);
    Animated.spring(dialogAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 8 }).start();
  };

  const handleAllow = async () => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setGranted(true);
    setTimeout(() => {
      grantPermission();
    }, 600);
  };

  const handleDeny = () => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Animated.timing(dialogAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setDialogVisible(false);
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Background grid */}
      <View style={styles.gridOverlay} pointerEvents="none">
        {Array.from({ length: 20 }).map((_, i) => (
          <View key={i} style={[styles.gridLine, { top: i * 40 }]} />
        ))}
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Logo area */}
        <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.logoRing}>
            <View style={styles.logoInner}>
              <Text style={styles.logoText}>{'</>'}</Text>
            </View>
          </View>
        </Animated.View>

        <Text style={styles.appName}>iCOBRA</Text>
        <Text style={styles.appSubtitle}>by NexBytes</Text>

        {/* Permission card */}
        <View style={styles.permissionCard}>
          <View style={styles.cardHeader}>
            <View style={styles.shizukuBadge}>
              <Feather name="shield" size={14} color="#00D4AA" />
              <Text style={styles.shizukuBadgeText}>Shizuku</Text>
            </View>
            <Text style={styles.cardTitle}>Permission Required</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.permissionRow}>
            <View style={[styles.permIcon, { backgroundColor: '#007ACC22' }]}>
              <Feather name="terminal" size={16} color="#007ACC" />
            </View>
            <View style={styles.permText}>
              <Text style={styles.permTitle}>Shell Access</Text>
              <Text style={styles.permDesc}>Execute elevated shell commands</Text>
            </View>
            <Feather name="check-circle" size={18} color="#6A9955" />
          </View>

          <View style={styles.permissionRow}>
            <View style={[styles.permIcon, { backgroundColor: '#C586C022' }]}>
              <Feather name="package" size={16} color="#C586C0" />
            </View>
            <View style={styles.permText}>
              <Text style={styles.permTitle}>Package Manager</Text>
              <Text style={styles.permDesc}>Install and manage APKs</Text>
            </View>
            <Feather name="check-circle" size={18} color="#6A9955" />
          </View>

          <View style={styles.permissionRow}>
            <View style={[styles.permIcon, { backgroundColor: '#DCDCAA22' }]}>
              <Feather name="cpu" size={16} color="#DCDCAA" />
            </View>
            <View style={styles.permText}>
              <Text style={styles.permTitle}>System Properties</Text>
              <Text style={styles.permDesc}>Read device configuration</Text>
            </View>
            <Feather name="check-circle" size={18} color="#6A9955" />
          </View>

          <Text style={styles.infoText}>
            iCOBRA uses Shizuku to provide elevated development features without requiring full root access.
          </Text>
        </View>

        {/* Grant button */}
        {!granted ? (
          <Pressable
            style={({ pressed }) => [styles.grantButton, pressed && styles.grantButtonPressed]}
            onPress={showDialog}
          >
            <Feather name="shield" size={18} color="#fff" />
            <Text style={styles.grantButtonText}>Grant Shizuku Permission</Text>
          </Pressable>
        ) : (
          <View style={styles.successBadge}>
            <Feather name="check-circle" size={20} color="#6A9955" />
            <Text style={styles.successText}>Permission Granted</Text>
          </View>
        )}

        <Text style={styles.helpText}>
          Make sure Shizuku is installed and running
        </Text>
      </Animated.View>

      {/* Shizuku Dialog */}
      {dialogVisible && (
        <View style={styles.dialogOverlay}>
          <Animated.View style={[styles.dialog, {
            opacity: dialogAnim,
            transform: [{ scale: dialogAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }],
          }]}>
            <View style={styles.dialogHeader}>
              <View style={styles.dialogAppIcon}>
                <Text style={styles.dialogAppIconText}>{'</>'}</Text>
              </View>
              <View>
                <Text style={styles.dialogTitle}>Permission Request</Text>
                <Text style={styles.dialogPackage}>com.nexbytes.icobra</Text>
              </View>
            </View>

            <View style={styles.dialogDivider} />

            <Text style={styles.dialogMessage}>
              Allow <Text style={{ color: '#007ACC' }}>iCOBRA</Text> to use Shizuku?
            </Text>
            <Text style={styles.dialogDetail}>
              This app will be able to execute shell commands via the Shizuku IPC bridge with system-level privileges.
            </Text>

            <View style={styles.dialogDivider} />

            <View style={styles.dialogButtons}>
              <Pressable
                style={({ pressed }) => [styles.dialogBtn, styles.denyBtn, pressed && { opacity: 0.7 }]}
                onPress={handleDeny}
              >
                <Text style={styles.denyBtnText}>Deny</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.dialogBtn, styles.allowBtn, pressed && { opacity: 0.7 }]}
                onPress={handleAllow}
              >
                <Text style={styles.allowBtnText}>Allow</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.06,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#007ACC',
  },
  content: {
    width: width - 40,
    alignItems: 'center',
    gap: 14,
  },
  logoContainer: {
    marginBottom: 4,
  },
  logoRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: '#007ACC44',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007ACC11',
  },
  logoInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#007ACC22',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#007ACC66',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#007ACC',
    letterSpacing: 1,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 6,
  },
  appSubtitle: {
    fontSize: 13,
    color: '#858585',
    letterSpacing: 3,
    marginTop: -6,
  },
  permissionCard: {
    width: '100%',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3C3C3C',
    marginTop: 8,
    gap: 12,
  },
  cardHeader: {
    gap: 6,
  },
  shizukuBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: '#00D4AA11',
    borderWidth: 1,
    borderColor: '#00D4AA33',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  shizukuBadgeText: {
    fontSize: 11,
    color: '#00D4AA',
    fontWeight: '600' as const,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#CCCCCC',
  },
  divider: {
    height: 1,
    backgroundColor: '#3C3C3C',
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  permIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permText: {
    flex: 1,
    gap: 2,
  },
  permTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#CCCCCC',
  },
  permDesc: {
    fontSize: 11,
    color: '#858585',
  },
  infoText: {
    fontSize: 11,
    color: '#5A5A5A',
    lineHeight: 16,
    marginTop: 4,
  },
  grantButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#007ACC',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 8,
    width: '100%',
    justifyContent: 'center',
    marginTop: 4,
  },
  grantButtonPressed: {
    backgroundColor: '#0066AA',
  },
  grantButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600' as const,
    letterSpacing: 0.3,
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#6A995522',
    borderWidth: 1,
    borderColor: '#6A995544',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    justifyContent: 'center',
  },
  successText: {
    color: '#6A9955',
    fontSize: 15,
    fontWeight: '600' as const,
  },
  helpText: {
    fontSize: 12,
    color: '#5A5A5A',
    textAlign: 'center',
  },
  dialogOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#00000088',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  dialog: {
    width: width - 60,
    backgroundColor: '#252526',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#3C3C3C',
    gap: 14,
  },
  dialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dialogAppIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#007ACC22',
    borderWidth: 1,
    borderColor: '#007ACC44',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogAppIconText: {
    fontSize: 16,
    color: '#007ACC',
    fontWeight: '700' as const,
  },
  dialogTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#CCCCCC',
  },
  dialogPackage: {
    fontSize: 11,
    color: '#858585',
    marginTop: 1,
  },
  dialogDivider: {
    height: 1,
    backgroundColor: '#3C3C3C',
  },
  dialogMessage: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#CCCCCC',
  },
  dialogDetail: {
    fontSize: 12,
    color: '#858585',
    lineHeight: 18,
    marginTop: -6,
  },
  dialogButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  dialogBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  denyBtn: {
    backgroundColor: '#3C3C3C',
  },
  allowBtn: {
    backgroundColor: '#007ACC',
  },
  denyBtnText: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  allowBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600' as const,
  },
});
