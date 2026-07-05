# iCOBRA IDE — User Guide

## Welcome to iCOBRA

iCOBRA is a professional-grade Android IDE that runs directly on your Android tablet or phone. It provides a full Visual Studio Code-like development experience with IntelliSense, syntax highlighting, debugging, source control, and more — all on your Android device.

## Requirements

- **Android 8.0** (API 26) or higher
- **Shizuku** app installed and running
- **4GB+ RAM** recommended for best performance
- Large tablet (10"+) or landscape mode for best experience

## Getting Started

### Step 1: Install Shizuku

1. Install Shizuku from the Play Store: `moe.shizuku.privileged.api`
2. Open Shizuku and follow the setup guide
3. Start Shizuku using Wireless ADB (Android 11+) or ADB command

### Step 2: Launch iCOBRA

When iCOBRA launches, it will ask for Shizuku permission. Tap "Grant Permission" and approve the dialog.

Once granted, the main IDE interface will appear.

## IDE Interface

### Activity Bar (Left Edge)

The activity bar shows icons for all available panels:

| Icon | Panel | Shortcut |
|------|-------|----------|
| Files | Explorer | Ctrl+Shift+E |
| Search | Global Search | Ctrl+Shift+F |
| Branch | Source Control | Ctrl+Shift+G |
| Play | Run & Debug | Ctrl+Shift+D |
| Grid | Extensions | Ctrl+Shift+X |
| Check | Test Explorer | — |
| Activity | Profiler | — |
| Box | Object Browser | — |
| Share | Live Share | — |

Tap any icon to open/close that panel. The active panel has a white indicator bar on the left.

### Menu Bar (Top)

The menu bar provides access to all IDE commands:

- **File**: New file, open, save, recent files, auto-save
- **Edit**: Undo, redo, cut, copy, paste, find, replace, format
- **Selection**: Multi-cursor, select all occurrences, expand/shrink
- **View**: Toggle panels, zoom, word wrap, minimap
- **Go**: Navigate to file, symbol, definition, line
- **Run**: Debug controls, breakpoints, step controls
- **Terminal**: New terminal, run tasks
- **Help**: Documentation, keyboard shortcuts, about

### Editor Area (Center)

The main code editor with:
- **Syntax highlighting** for Kotlin, Java, XML, Gradle, JSON, and more
- **Line numbers** with clickable breakpoint gutter
- **Minimap** (right side) for quick navigation
- **Breadcrumbs** for file path navigation
- **IntelliSense** popup for code completion (starts automatically)
- **Find & Replace** panel (Ctrl+F / Ctrl+H)

### Tabs (Below Menu Bar)

Open files appear as tabs. Tap to switch, tap × to close. Modified files show a dot indicator.

### Bottom Panel

| Tab | Description |
|-----|-------------|
| TERMINAL | Integrated shell via Shizuku |
| PROBLEMS | Compilation errors and warnings |
| OUTPUT | Build and tool output |
| DEBUG CONSOLE | Debugger output and expression evaluation |
| TASK LIST | TODO/FIXME/BUG items from code |
| TEST RESULTS | Test run results |

### Status Bar (Bottom)

Shows: branch name, errors, warnings, cursor position, encoding, language, line ending.

## Code Editing

### Basic Operations

- **Tap** to place cursor
- **Double-tap** to select word
- **Long press + drag** to select text
- **Tap Edit button** (top right of editor) to enter edit mode
- **Tap Done** to save and exit edit mode

### Keyboard Shortcuts (with Bluetooth keyboard)

| Action | Shortcut |
|--------|----------|
| Save | Ctrl+S |
| Save All | Ctrl+K S |
| Undo | Ctrl+Z |
| Redo | Ctrl+Y |
| Find | Ctrl+F |
| Replace | Ctrl+H |
| Format | Shift+Alt+F |
| Command Palette | Ctrl+Shift+P |
| Go to File | Ctrl+P |
| Go to Line | Ctrl+G |
| Toggle Comment | Ctrl+/ |
| Select All | Ctrl+A |
| Start Debug | F5 |
| Toggle Breakpoint | F9 |
| Step Over | F10 |
| Step Into | F11 |
| Step Out | Shift+F11 |

### IntelliSense

Code completion appears automatically as you type. Use ↑/↓ to navigate items, Enter to accept.

- **Functions** show with parameter hints
- **Classes** show with documentation
- **Snippets** insert common code patterns
- **Keywords** are highlighted in blue

### Syntax Highlighting

iCOBRA supports syntax highlighting for:
- **Kotlin** (.kt) — full highlighting with coroutines support
- **Java** (.java)
- **XML** (.xml) — Android layouts and resources
- **Gradle** (.gradle, .kts)
- **JSON** (.json)
- **Markdown** (.md)
- **TypeScript/JavaScript** (.ts, .tsx, .js, .jsx)
- **Python** (.py)
- **C/C++** (.c, .cpp, .h)
- **C#** (.cs)

## Debugging

### Starting a Debug Session

1. Open the Run & Debug panel (Ctrl+Shift+D)
2. Select a debug configuration from the dropdown
3. Tap the green Play button or press F5

### Debug Panels

- **Variables**: Shows local variables with their current values
- **Watch**: Evaluate custom expressions during pause
- **Call Stack**: Shows the current execution call stack
- **Breakpoints**: Manage all breakpoints in the project
- **Immediate**: Evaluate expressions interactively

### Breakpoints

Tap the line number gutter in the editor to add/remove a breakpoint. Breakpoints appear as red dots.

Types of breakpoints:
- **Line breakpoint**: Pauses at that line
- **Conditional breakpoint**: Pauses when condition is true
- **Function breakpoint**: Pauses when function is called
- **Exception breakpoint**: Pauses on exceptions

### Step Controls

| Button | Action |
|--------|--------|
| Play | Continue execution |
| Pause | Pause running app |
| Stop | Stop debug session |
| Restart | Restart debug session |
| Step Over (F10) | Execute current line |
| Step Into (F11) | Enter called function |
| Step Out (Shift+F11) | Return from function |

## Source Control (Git)

The Git panel shows:
- **Changes**: Modified, added, deleted files
- **Staged Changes**: Files ready to commit
- **Commit**: Enter message and commit

### Git Operations

- **Stage file**: Tap the + icon next to a change
- **Stage all**: Tap Stage All Changes
- **Unstage**: Tap the − icon on staged file
- **Commit**: Enter message, tap Commit button
- **Push**: After commit, tap Push in toolbar
- **Pull**: Tap Pull to fetch and merge

## Testing

The Test Explorer shows all test suites and test cases:

- **Green check**: Passing test
- **Red X**: Failing test
- **Yellow skip**: Skipped test

### Running Tests

- **Run All**: Tap the Run All button in the toolbar
- **Run Suite**: Tap ▶ next to a test suite
- **Run Single**: Long press a test case, tap Run

### Code Coverage

The coverage bar at the bottom shows what percentage of code is covered by tests.

## Extensions

Browse and install extensions from the Marketplace tab:

1. Open Extensions panel (Ctrl+Shift+X)
2. Search for extensions by name, publisher, or tag
3. Tap Install to install
4. Tap Uninstall to remove

Popular extensions:
- **Kotlin Language Support** by JetBrains
- **Android Toolkit** by NexBytes
- **Shizuku Tools** by rikka
- **GitHub Copilot** by GitHub
- **SonarLint** by SonarSource
- **Prettier** by Prettier

## Performance Profiler

Monitor app performance in real-time:

1. Open Profiler panel from the activity bar
2. Tap Start to begin recording
3. View CPU, Memory, and Hot Methods
4. Tap Stop to end recording
5. Analyze the captured data

## Object Browser

Browse all classes, interfaces, and members in your project:

1. Open Object Browser from the activity bar
2. Navigate the assembly tree
3. Expand namespaces and classes
4. View method signatures and return types

## Live Share

Collaborate with team members in real-time:

1. Open Live Share panel from the activity bar
2. Tap Start to begin a session
3. Share the invite link with collaborators
4. See collaborators' cursors in the editor
5. Use the Chat tab to communicate
6. Share terminal sessions with the team

## Task List

Track TODO, FIXME, BUG, and other annotations in your code:

1. Open the Task List from the bottom panel
2. Filter by type (TODO, FIXME, BUG, etc.)
3. Tap a task to navigate to it in the editor
4. Sort by file or type

## Terminal

The integrated terminal uses Shizuku to provide shell access:

- **New Terminal**: Tap + or use Ctrl+`
- **Split Terminal**: Run multiple sessions
- **Clear**: Long press and tap Clear

Available shell features:
- ADB commands
- Gradle build commands (`./gradlew assembleDebug`)
- File system operations
- Package management (pm install, pm list packages)
- System commands (getprop, dumpsys)

## Settings

Access settings via the gear icon at the bottom of the activity bar or via File > Preferences > Settings.

Key settings:
- **Theme**: Dark, Light, High Contrast
- **Font Size**: Editor font size (default 13px)
- **Word Wrap**: Toggle line wrapping
- **Auto Save**: Save automatically on focus change
- **Format on Save**: Run formatter when saving
- **IntelliSense**: Enable/disable code completion
- **Minimap**: Show/hide the minimap

## Keyboard (Bluetooth)

iCOBRA works best with a Bluetooth keyboard. All standard VS Code shortcuts are supported. See the full keyboard shortcuts reference in Help > Keyboard Shortcuts Reference.

## Tips & Tricks

1. **Double-tap the activity bar icon** to close the side panel
2. **Swipe the bottom panel** to resize it
3. **Long-press editor** to open context menu
4. **Use Command Palette** (Ctrl+Shift+P) to access any feature
5. **Pinch to zoom** the editor for accessibility
6. **Rotate to landscape** for the best IDE experience

## Troubleshooting

### "Shizuku Not Running" Error
1. Open Shizuku app
2. Ensure it shows "Running" status
3. Re-launch iCOBRA

### App is Slow
1. Close unused side panels
2. Close large files
3. Disable the minimap in settings
4. Free up device memory

### IntelliSense Not Working
1. Make sure the file has a recognized extension (.kt, .java, etc.)
2. Check the language indicator in the status bar
3. Toggle IntelliSense off/on in Settings

### Build Fails
1. Check the OUTPUT panel for error details
2. Ensure Gradle wrapper is in the project
3. Check internet connection for dependency downloads
4. Review proguard-rules.pro if release build fails

## Support

- **GitHub**: https://github.com/nexbytes/icobra
- **Issues**: https://github.com/nexbytes/icobra/issues
- **Discussions**: https://github.com/nexbytes/icobra/discussions
- **Email**: support@nexbytes.com
