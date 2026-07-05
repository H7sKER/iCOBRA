import { Feather } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import vsColors from '@/constants/vsColors';
import { useEditor } from '@/context/EditorContext';

interface TermLine {
  id: number;
  text: string;
  type: 'input' | 'output' | 'error' | 'success';
}

const INITIAL_LINES: TermLine[] = [
  { id: 1, type: 'output', text: 'iCOBRA Terminal  v1.0.0' },
  { id: 2, type: 'output', text: 'Android Development Shell — NexBytes' },
  { id: 3, type: 'output', text: '' },
  { id: 4, type: 'output', text: 'Type "help" for available commands.' },
  { id: 5, type: 'output', text: '' },
];

let idCounter = 10;

function handleCommand(cmd: string, cwd: string): { output: string; type: TermLine['type']; newCwd?: string } {
  const parts = cmd.trim().split(/\s+/);
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  switch (command) {
    case 'help':
      return {
        type: 'output',
        output: `Available commands:
  ls, dir           — List directory contents
  cd <dir>          — Change directory
  pwd               — Print working directory
  cat <file>        — Show file contents
  clear             — Clear terminal
  echo <text>       — Print text
  adb <args>        — Android Debug Bridge
  ./gradlew <task>  — Run Gradle task
  git <args>        — Git commands
  node <file>       — Run Node.js file
  kotlinc           — Kotlin compiler info
  java -version     — Java version info
  version           — iCOBRA version`,
      };
    case 'pwd':
      return { type: 'output', output: cwd };
    case 'ls':
    case 'dir':
      if (cwd.includes('icobra')) {
        return { type: 'output', output: 'app/  build.gradle  gradle/  gradlew  gradlew.bat  README.md  settings.gradle' };
      }
      return { type: 'output', output: 'MainActivity.kt  ShizukuService.kt  Utils.kt' };
    case 'cd':
      if (!args[0] || args[0] === '~') return { type: 'output', output: '', newCwd: '/home/dev/iCOBRA-Project' };
      if (args[0] === '..') {
        const parts2 = cwd.split('/');
        parts2.pop();
        return { type: 'output', output: '', newCwd: parts2.join('/') || '/' };
      }
      return { type: 'output', output: '', newCwd: `${cwd}/${args[0]}` };
    case 'echo':
      return { type: 'output', output: args.join(' ') };
    case 'clear':
      return { type: 'output', output: '__CLEAR__' };
    case 'adb':
      if (args[0] === 'devices') return { type: 'success', output: 'List of devices attached\nemulator-5554\tdevice (Pixel 7 API 34)\nR5CT100XXXXX\tdevice (Samsung Galaxy S23)' };
      if (args[0] === 'shell') return { type: 'output', output: args.slice(1).join(' ') + '\n$ ' };
      if (args[0] === 'install') return { type: 'success', output: `Performing Streamed Install\nSuccess (${args[1] ?? 'app-debug.apk'})` };
      if (args[0] === 'logcat') return { type: 'output', output: 'D/MainActivity: onCreate called\nI/Shizuku: Service connected\nD/ShizukuService: Initialized successfully' };
      return { type: 'output', output: `Android Debug Bridge v1.0.41\nUsage: adb <command> [args]` };
    case './gradlew':
    case 'gradlew':
      if (args[0] === 'assembleDebug') return { type: 'success', output: 'Starting Gradle Daemon...\n> Task :app:compileDebugKotlin\n> Task :app:compileDebugJava\n> Task :app:bundleDebugClasses\n> Task :app:assembleDebug\n\nBUILD SUCCESSFUL in 18s\n24 actionable tasks: 24 executed\n\nAPK saved to: app/build/outputs/apk/debug/app-debug.apk' };
      if (args[0] === 'assembleRelease') return { type: 'success', output: '> Task :app:assembleRelease\n\nBUILD SUCCESSFUL in 24s\n\nAPK saved to: app/build/outputs/apk/release/app-release.apk' };
      if (args[0] === 'clean') return { type: 'success', output: '> Task :app:clean\n\nBUILD SUCCESSFUL in 2s\n1 actionable task: 1 executed' };
      if (args[0] === 'test') return { type: 'success', output: '> Task :app:testDebugUnitTest\n\nBUILD SUCCESSFUL in 8s\nTests run: 12, Failures: 0, Errors: 0' };
      if (args[0] === 'dependencies') return { type: 'output', output: '+--- dev.rikka.shizuku:api:13.1.5\n+--- androidx.core:core-ktx:1.12.0\n+--- org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3\n\\--- com.google.android.material:material:1.11.0' };
      return { type: 'output', output: `Gradle tasks:\n  assembleDebug    Build debug APK\n  assembleRelease  Build release APK\n  clean            Clean build files\n  test             Run unit tests\n  dependencies     Show dependencies` };
    case 'git':
      if (args[0] === 'status') return { type: 'output', output: 'On branch main\nChanges to be committed:\n  modified:   app/src/main/java/com/nexbytes/icobra/MainActivity.kt\n  new file:   app/src/main/java/com/nexbytes/icobra/ShizukuService.kt\n\nChanges not staged:\n  modified:   app/src/main/java/com/nexbytes/icobra/Utils.kt' };
      if (args[0] === 'log') return { type: 'output', output: 'commit a8f3c21 (HEAD -> main)\nAuthor: dev <dev@nexbytes.com>\nDate:   Mon Jul 4 10:30:00 2025\n    Add Shizuku permission handling\n\ncommit 3b7e910\nAuthor: dev <dev@nexbytes.com>\nDate:   Sun Jul 3 15:12:00 2025\n    Initial commit' };
      if (args[0] === 'commit') return { type: 'success', output: `[main ${Date.now().toString(36)}] ${args.slice(2).join(' ')}\n 3 files changed, 124 insertions(+), 8 deletions(-)` };
      if (args[0] === 'push') return { type: 'success', output: 'Enumerating objects: 5, done.\nDelta compression using up to 8 threads\nTo github.com:nexbytes/icobra.git\n   3b7e910..a8f3c21  main -> main' };
      if (args[0] === 'branch') return { type: 'output', output: '* main\n  feature/shizuku-v2\n  release/1.0.0' };
      return { type: 'output', output: `usage: git <command> [args]\n  status    Show status\n  log       Show commits\n  commit    Commit changes\n  push      Push to remote\n  pull      Pull from remote\n  branch    List branches` };
    case 'node':
      return { type: 'output', output: `Executing ${args[0] ?? 'script'}...\nNode.js v20.11.0` };
    case 'kotlinc':
      return { type: 'output', output: 'kotlinc-jvm 1.9.22 (JRE 17.0.9+9)' };
    case 'java':
      return { type: 'output', output: 'openjdk version "17.0.9" 2023-10-17\nOpenJDK Runtime Environment (build 17.0.9+9)' };
    case 'version':
      return { type: 'success', output: 'iCOBRA v1.0.0\nPackage: com.nexbytes.icobra\nBuilt with: Expo SDK 53 / React Native 0.76' };
    case '':
      return { type: 'output', output: '' };
    default:
      return { type: 'error', output: `bash: ${command}: command not found` };
  }
}

export default function TerminalView() {
  const { activeFile } = useEditor();
  const [lines, setLines] = useState<TermLine[]>(INITIAL_LINES);
  const [input, setInput] = useState('');
  const [cwd, setCwd] = useState('/home/dev/iCOBRA-Project');
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const scrollRef = useRef<ScrollView>(null);

  const runCommand = () => {
    const cmd = input.trim();
    const newLines: TermLine[] = [...lines];

    newLines.push({
      id: idCounter++,
      type: 'input',
      text: `${cwd.split('/').pop()}$ ${cmd}`,
    });

    if (cmd) {
      setHistory(prev => [cmd, ...prev.slice(0, 49)]);
      setHistIdx(-1);
    }

    const { output, type, newCwd } = handleCommand(cmd, cwd);
    if (output === '__CLEAR__') {
      setLines([]);
    } else {
      if (output) {
        output.split('\n').forEach(line => {
          newLines.push({ id: idCounter++, type, text: line });
        });
      }
      setLines(newLines);
    }

    if (newCwd) setCwd(newCwd);
    setInput('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 50);
  };

  const prompt = `${cwd.split('/').slice(-2).join('/')}$ `;

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        style={styles.output}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {lines.map(line => (
          <Text
            key={line.id}
            style={[
              styles.line,
              line.type === 'input' && styles.inputLine,
              line.type === 'error' && styles.errorLine,
              line.type === 'success' && styles.successLine,
            ]}
          >
            {line.text}
          </Text>
        ))}
      </ScrollView>

      <View style={styles.inputRow}>
        <Text style={styles.prompt}>{prompt}</Text>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={runCommand}
          blurOnSubmit={false}
          autoCorrect={false}
          autoCapitalize="none"
          spellCheck={false}
          returnKeyType="done"
          placeholder="Type a command..."
          placeholderTextColor={vsColors.textDisabled}
        />
        <Pressable style={styles.runBtn} onPress={runCommand}>
          <Feather name="chevron-right" size={16} color={vsColors.success} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: vsColors.terminalBg },
  output: { flex: 1, padding: 8 },
  line: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: vsColors.text,
    lineHeight: 18,
  },
  inputLine: { color: vsColors.textBright, fontWeight: '600' as const },
  errorLine: { color: vsColors.error },
  successLine: { color: vsColors.success },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: vsColors.border,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: vsColors.terminalBg,
    gap: 4,
  },
  prompt: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: vsColors.success,
    fontWeight: '600' as const,
  },
  input: {
    flex: 1,
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: vsColors.text,
    padding: 0,
    height: 24,
  },
  runBtn: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
});
