# iCOBRA Architecture Documentation

## Overview

iCOBRA is a professional Android mobile IDE built with Expo (React Native) that provides a full VS Code-like development experience on Android devices. It leverages Shizuku for elevated system permissions, enabling features that require ADB or root-level access.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         iCOBRA IDE                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   Expo / React Native                    │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │   │
│  │  │  Editor  │  │ Debugger │  │   Git    │  │ Tests  │  │   │
│  │  │  Engine  │  │  Bridge  │  │ Support  │  │Explorer│  │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └────────┘  │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │   │
│  │  │IntelliSense│ │Extensions│  │ Profiler │  │LiveShare│ │   │
│  │  │  Engine  │  │  Manager │  │  Panel   │  │Session │  │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Context Layer (EditorContext)                │   │
│  │  - State management for all IDE panels                   │   │
│  │  - File system abstraction                               │   │
│  │  - Breakpoint management                                 │   │
│  │  - Find/Replace engine                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                Shizuku Bridge Layer                      │   │
│  │  ┌────────────────┐      ┌─────────────────────────┐   │   │
│  │  │ ShizukuContext │ ───► │    ShizukuService.kt     │   │   │
│  │  │  (React/TS)    │      │    (Android/Kotlin)      │   │   │
│  │  └────────────────┘      └─────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Android System Layer                        │   │
│  │  Shizuku IPC → ADB Shell → System Services              │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
artifacts/icobra/
├── app/                    # Expo Router entry points
│   ├── index.tsx           # Main IDE layout
│   ├── _layout.tsx         # Root layout with providers
│   └── (tabs)/             # Tab navigation (redirects to index)
│       └── index.tsx
├── components/             # UI Components
│   ├── ActivityBar.tsx     # VS Code activity bar (left icons)
│   ├── MenuBar.tsx         # Top menu bar with all menus
│   ├── EditorTabs.tsx      # Open file tabs
│   ├── StatusBarView.tsx   # Bottom status bar
│   ├── CodeEditorView.tsx  # Main code editor with syntax highlighting
│   ├── FileExplorer.tsx    # Explorer side panel
│   ├── SearchPanel.tsx     # Global search panel
│   ├── GitPanel.tsx        # Source control panel
│   ├── DebugPanel.tsx      # Run & Debug panel
│   ├── ExtensionsPanel.tsx # Extensions marketplace
│   ├── TestExplorer.tsx    # Test explorer panel
│   ├── ProfilerPanel.tsx   # Performance profiler
│   ├── ObjectBrowser.tsx   # Assembly/object browser
│   ├── LiveSharePanel.tsx  # Live collaboration panel
│   ├── TaskListPanel.tsx   # TODO/FIXME task list
│   ├── BottomPanel.tsx     # Terminal/Problems/Output/etc.
│   ├── TerminalView.tsx    # Integrated terminal
│   ├── ProblemsView.tsx    # Errors & warnings
│   ├── CommandPalette.tsx  # Ctrl+Shift+P command palette
│   ├── FindReplacePanel.tsx # Find & Replace overlay
│   ├── IntelliSenseDropdown.tsx # Code completion popup
│   ├── WatchPanel.tsx      # Debug watch expressions
│   ├── LocalsPanel.tsx     # Debug local variables
│   ├── ImmediateWindow.tsx # Debug immediate/evaluate
│   ├── CallStackPanel.tsx  # Debug call stack
│   └── BreakpointsPanel.tsx # Breakpoints management
├── context/                # React contexts
│   ├── EditorContext.tsx   # Global IDE state
│   └── ShizukuContext.tsx  # Shizuku permission state
├── constants/              # Design tokens
│   └── vsColors.ts         # VS Dark+ theme colors
├── data/                   # Static data
│   ├── sampleProject.ts    # Sample Kotlin project files
│   ├── intelliSenseData.ts # Code completion data
│   ├── snippetsData.ts     # Code snippets
│   ├── extensionsData.ts   # Extensions marketplace data
│   └── testData.ts         # Test suite data
├── utils/                  # Utility functions
│   ├── syntaxHighlight.ts  # Tokenizer for syntax highlighting
│   └── codeUtils.ts        # Code manipulation utilities
├── android/                # Native Android project
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── java/com/nexbytes/icobra/
│   │   │   │   ├── MainActivity.kt
│   │   │   │   ├── ShizukuService.kt
│   │   │   │   └── iCOBRAApplication.kt
│   │   │   ├── res/
│   │   │   │   ├── layout/activity_main.xml
│   │   │   │   ├── values/strings.xml
│   │   │   │   ├── values/colors.xml
│   │   │   │   └── values/dimens.xml
│   │   │   └── AndroidManifest.xml
│   │   ├── build.gradle
│   │   └── proguard-rules.pro
│   └── build.gradle (project-level)
├── .github/workflows/      # CI/CD
│   └── build-apk.yml       # GitHub Actions APK build
├── eas.json               # Expo EAS build config
├── app.json               # Expo app config
└── package.json           # Node dependencies
```

## Key Architectural Decisions

### 1. Shizuku-First Architecture
iCOBRA requires Shizuku from the first screen. This is intentional — without elevated permissions, many IDE features (ADB shell, package management, profiling) would be unavailable. The permission gate ensures users understand this requirement upfront.

### 2. EditorContext as Single Source of Truth
All IDE state (open files, active panel, breakpoints, find/replace state, etc.) lives in `EditorContext`. This avoids prop drilling and makes it easy to add new panels that need access to IDE state.

### 3. Syntax Highlighting Without Language Server
The syntax highlighter in `utils/syntaxHighlight.ts` uses regex-based tokenization. While not as accurate as a proper Language Server Protocol (LSP) implementation, it provides good-enough highlighting for mobile use cases without the overhead of a full language server.

### 4. Panel Architecture
The IDE uses a panel-based architecture:
- **Activity Bar**: Icons on the far left for selecting side panels
- **Side Panel**: 250dp wide, shows one panel at a time (Explorer/Search/Git/Debug/etc.)
- **Editor Area**: Main content area with code editor
- **Bottom Panel**: Terminal/Problems/Output, toggled independently

### 5. IntelliSense
Code completion uses pre-defined completion items (not real-time analysis). Items are filtered based on the current word at the cursor. This approach works well for mobile where full LSP analysis would be too resource-intensive.

## Shizuku Integration

### Permission Flow
1. App launches → `ShizukuContext` initializes
2. Check if Shizuku binder is available
3. If available: request permission via `Shizuku.requestPermission()`
4. If not available: show "Shizuku not running" dialog
5. On permission granted: show main IDE layout

### Service Communication
```
React Native JS ←→ Native Module Bridge ←→ ShizukuService.kt ←→ Shizuku IPC ←→ ADB Shell
```

## Build System

### Development
```bash
pnpm --filter @workspace/icobra run dev
```
Starts the Expo development server. The app loads at `/icobra` on the preview proxy.

### Production APK
```bash
eas build --platform android --profile production
```
Uses EAS Build to create a signed APK/AAB. Configuration in `eas.json`.

### GitHub Actions
The `.github/workflows/build-apk.yml` workflow automatically builds the APK on push to main and tags. It uses EAS Build CLI with secrets for keystore and API keys.

## Performance Considerations

1. **Large File Handling**: Files >500 lines use virtual rendering (only visible lines are rendered)
2. **Syntax Highlighting**: Runs on the JS thread but is debounced to 150ms after typing stops
3. **IntelliSense**: Filtered in-memory, no network calls in the mobile version
4. **Terminal**: Uses a simulated terminal in JS; real shell commands go via Shizuku

## Security Model

1. **Shizuku Permission**: Required for elevated access. Shizuku itself is a well-audited open-source tool.
2. **No Root Required**: Shizuku can run via ADB without root (wireless ADB on Android 11+)
3. **Local Processing**: All code is processed locally; no telemetry without opt-in
4. **Keystore**: Release builds use a properly secured keystore; keys never logged

## Testing Strategy

- **Unit Tests**: Kotlin unit tests for `ShizukuService` and `Utils`
- **Integration Tests**: Espresso tests for permission flow
- **UI Tests**: React Native Testing Library for component testing
- **Manual Testing**: Device testing on Android 8.0-14

## Contributing

See `CONTRIBUTING.md` for development setup and contribution guidelines.

## License

MIT License — See `LICENSE` for details.
