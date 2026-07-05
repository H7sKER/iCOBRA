# HackerStudio — Changes & New Features

## Bug Fix: Android 11+ File Visibility (MAIN FIX)

### Problem
On Android 12, 13, 14, 15+ — folders appeared completely empty.
Only photos/images were visible. Code files (.kt, .py, .js, .ts etc.) were invisible.

### Root Cause
Android 11 (API 30) introduced Scoped Storage.
`READ_EXTERNAL_STORAGE` only allows access to **media files** (photos/video/audio).
`File.listFiles()` returns **null** on /sdcard paths without MANAGE_EXTERNAL_STORAGE.
This made every folder appear empty on Android 11+ devices.

### Fix Applied (FileManagerModule.kt)
- `hasStoragePermission()` — checks `Environment.isExternalStorageManager()`
- `requestStoragePermission()` — opens system settings screen directly
- `listDirectory()` — guards with permission check before calling listFiles()
- `getStorageRoots()` — new method to list storage volumes
- `searchFiles()` — new method to search across files
- `writeTextFile()`, `readTextFile()`, `createDirectory()` — new helpers

AndroidManifest.xml already had `MANAGE_EXTERNAL_STORAGE` declared — only the
Kotlin native module was missing the runtime check.

---

## New Feature 1: Git Clone Button

**File:** `artifacts/code-editor/components/GitCloneDialog.tsx` (new)
**API:** `artifacts/api-server/src/routes/git.ts` (new)

In `GitPanel`, import and use:
```tsx
import GitCloneDialog from "./GitCloneDialog";

// In component state:
const [showClone, setShowClone] = useState(false);

// Button:
<TouchableOpacity onPress={() => setShowClone(true)}>
  <Text>🌿 Clone Repo</Text>
</TouchableOpacity>

// Dialog:
<GitCloneDialog
  visible={showClone}
  onClose={() => setShowClone(false)}
  onSuccess={(result) => {
    Alert.alert("Cloned!", result.name + " → " + result.path);
    // refresh file explorer
  }}
/>
```

**API Routes:**
- `POST /api/git/clone` — Clone any repo (GitHub, GitLab, Bitbucket, etc.)
- `POST /api/git/pull` — Pull latest changes for a cloned project
- `GET  /api/git/status` — Get git status, branch, recent commits

---

## New Feature 2: AI Agent (Google Gemini)

**File:** `artifacts/code-editor/components/AIAgentPanel.tsx` (new)
**API:** `artifacts/api-server/src/routes/ai.ts` (new)

**Setup:** Add `GEMINI_API_KEY=your_key` to environment.
Free key: https://aistudio.google.com/app/apikey

In any panel, import and use:
```tsx
import AIAgentPanel from "./AIAgentPanel";

<AIAgentPanel
  visible={showAI}
  onClose={() => setShowAI(false)}
  projectPath={currentProject?.path}
/>
```

Or use the existing `AIPanel.tsx` — update the API call to use:
```
POST /api/ai/analyze   { projectPath, question? }
POST /api/ai/chat      { message, projectPath?, history? }
POST /api/ai/explain   { code, language?, filePath? }
POST /api/ai/fix       { code, error?, language?, filePath? }
```

---

## Files Changed/Added

| File | Change |
|------|--------|
| `artifacts/code-editor/android/.../FileManagerModule.kt` | FIXED: Android 11+ permission + listDirectory + 4 new methods |
| `artifacts/api-server/src/routes/git.ts` | NEW: git clone/pull/status routes |
| `artifacts/api-server/src/routes/ai.ts` | NEW: Gemini AI routes (analyze/chat/explain/fix) |
| `artifacts/api-server/src/routes/index.ts` | UPDATED: imports git + ai routers |
| `artifacts/code-editor/components/GitCloneDialog.tsx` | NEW: git clone dialog component |
| `artifacts/code-editor/components/AIAgentPanel.tsx` | NEW: AI agent panel component |
| `CHANGES.md` | NEW: this file |
