export interface Extension {
  id: string;
  name: string;
  publisher: string;
  description: string;
  version: string;
  rating: number;
  downloads: string;
  category: string;
  tags: string[];
  installed: boolean;
  icon: string;
  enabled?: boolean;
  verified?: boolean;
}

export const extensions: Extension[] = [
  { id: 'kotlin-language', name: 'Kotlin Language Support', publisher: 'JetBrains', description: 'Kotlin language support including syntax highlighting, code completion, refactoring, navigation, and inspections', version: '1.9.22', rating: 4.9, downloads: '50M+', category: 'Programming Languages', tags: ['kotlin', 'android'], installed: true, enabled: true, icon: 'K', verified: true },
  { id: 'android-toolkit', name: 'Android Toolkit', publisher: 'NexBytes', description: 'Android development tools, device management, ADB commands, APK analysis, layout inspector and profiling', version: '3.2.1', rating: 4.8, downloads: '20M+', category: 'Android', tags: ['android', 'adb', 'apk'], installed: true, enabled: true, icon: 'A', verified: true },
  { id: 'shizuku-tools', name: 'Shizuku Tools', publisher: 'rikka', description: 'Shizuku integration, elevated permission management, shell command executor and service monitor', version: '2.1.0', rating: 4.7, downloads: '5M+', category: 'Android', tags: ['shizuku', 'permissions', 'root'], installed: true, enabled: true, icon: 'S', verified: true },
  { id: 'gradle-support', name: 'Gradle Support', publisher: 'Gradle Inc', description: 'Full Gradle build system support with task runner, dependency resolution, and build variant management', version: '8.5.0', rating: 4.6, downloads: '30M+', category: 'Build Tools', tags: ['gradle', 'build', 'android'], installed: true, enabled: true, icon: 'G', verified: true },
  { id: 'git-graph', name: 'Git Graph', publisher: 'mhutchie', description: 'View a Git Graph of your repository, and perform Git actions from the graph. Supports git log, blame, diff, cherry pick, stash, branches', version: '1.30.0', rating: 4.9, downloads: '15M+', category: 'SCM Providers', tags: ['git', 'graph', 'history'], installed: true, enabled: true, icon: 'G', verified: false },
  { id: 'prettier', name: 'Prettier - Code Formatter', publisher: 'Prettier', description: 'Code formatter using Prettier. Supports Kotlin, XML, JSON, JavaScript, TypeScript, CSS, HTML', version: '11.0.0', rating: 4.7, downloads: '45M+', category: 'Formatters', tags: ['formatter', 'prettier'], installed: true, enabled: true, icon: 'P', verified: true },
  { id: 'material-icons', name: 'Material Icon Theme', publisher: 'PKief', description: 'Material Design Icons for file explorer with 1000+ distinct icons for files and folders', version: '5.0.0', rating: 4.8, downloads: '25M+', category: 'Themes', tags: ['icons', 'material', 'theme'], installed: true, enabled: true, icon: 'M', verified: true },
  { id: 'github-copilot', name: 'GitHub Copilot', publisher: 'GitHub', description: 'AI-powered code completion, chat, and pair programming for Kotlin, Java, and more', version: '1.230.0', rating: 4.5, downloads: '10M+', category: 'AI', tags: ['ai', 'copilot', 'autocomplete'], installed: false, icon: 'C', verified: true },
  { id: 'sonarlint', name: 'SonarLint', publisher: 'SonarSource', description: 'SonarLint is a free IDE extension that lets you fix coding issues before they exist. Like a spell checker, it highlights bugs and security vulnerabilities as you write code', version: '4.7.0', rating: 4.6, downloads: '8M+', category: 'Linters', tags: ['sonar', 'quality', 'security'], installed: false, icon: 'S', verified: true },
  { id: 'detekt', name: 'Detekt', publisher: 'Detekt', description: 'Static code analysis for Kotlin with hundreds of built-in rules, custom rules support, and automatic code formatting', version: '1.23.4', rating: 4.5, downloads: '3M+', category: 'Linters', tags: ['detekt', 'kotlin', 'static-analysis'], installed: false, icon: 'D', verified: false },
  { id: 'live-share', name: 'Live Share', publisher: 'Microsoft', description: 'Real-time collaborative development from the comfort of your favorite tools. Share your Kotlin project with teammates', version: '1.0.5902', rating: 4.8, downloads: '12M+', category: 'Other', tags: ['collaboration', 'live-share'], installed: false, icon: 'L', verified: true },
  { id: 'error-lens', name: 'Error Lens', publisher: 'usernamehw', description: 'Improve highlighting of errors, warnings and other language diagnostics inline in the source code', version: '3.19.0', rating: 4.8, downloads: '7M+', category: 'Other', tags: ['errors', 'warnings', 'diagnostics'], installed: false, icon: 'E', verified: false },
  { id: 'todo-tree', name: 'Todo Tree', publisher: 'Gruntfuggly', description: 'Show TODO, FIXME, HACK, etc. comment tags in a tree view and highlights in the editor. Perfect for tracking code tasks', version: '0.0.226', rating: 4.7, downloads: '6M+', category: 'Other', tags: ['todo', 'fixme', 'comments'], installed: false, icon: 'T', verified: false },
  { id: 'bracket-colorizer', name: 'Bracket Colorizer 2', publisher: 'CoenraadS', description: 'Allows matching brackets to be identified with colours. The user can define which tokens to match, and which colours to use', version: '0.3.4', rating: 4.6, downloads: '9M+', category: 'Other', tags: ['brackets', 'colors'], installed: false, icon: 'B', verified: false },
  { id: 'xml-toolkit', name: 'XML Toolkit', publisher: 'DotJoshJohnson', description: 'XML Tools, XML formatting, XML validation, XML namespace support, and XPath evaluation for Android layout files', version: '2.8.0', rating: 4.3, downloads: '4M+', category: 'Programming Languages', tags: ['xml', 'android-layout'], installed: false, icon: 'X', verified: false },
  { id: 'codestream', name: 'CodeStream', publisher: 'CodeStream', description: 'GitHub PR and Issues, Code Review, and CodeStream\'s all-in-one developer collaboration platform', version: '14.21.0', rating: 4.4, downloads: '2M+', category: 'SCM Providers', tags: ['review', 'pr', 'github'], installed: false, icon: 'C', verified: true },
  { id: 'memory-profiler', name: 'Memory Profiler', publisher: 'NexBytes', description: 'Real-time memory usage monitoring, heap analysis, GC activity tracking, and memory leak detection for Android apps', version: '1.5.0', rating: 4.6, downloads: '1M+', category: 'Debuggers', tags: ['memory', 'profiler', 'android'], installed: false, icon: 'M', verified: true },
  { id: 'adb-control', name: 'ADB Control', publisher: 'NexBytes', description: 'Full ADB device management: install/uninstall APKs, capture screenshots, control device input, and monitor logcat', version: '2.3.0', rating: 4.7, downloads: '2M+', category: 'Android', tags: ['adb', 'device', 'android'], installed: false, icon: 'A', verified: true },
  { id: 'dark-one-theme', name: 'One Dark Pro', publisher: 'binaryify', description: 'Atom\'s iconic One Dark theme, and one of the most installed themes for VS Code and iCOBRA', version: '3.17.0', rating: 4.8, downloads: '11M+', category: 'Themes', tags: ['theme', 'dark', 'one-dark'], installed: false, icon: 'O', verified: false },
  { id: 'dracula-theme', name: 'Dracula Official', publisher: 'dracula-theme', description: 'Official Dracula Theme. A dark theme for many editors, shells, and more.', version: '3.0.0', rating: 4.7, downloads: '5M+', category: 'Themes', tags: ['theme', 'dracula', 'dark'], installed: false, icon: 'D', verified: true },
];

export const extensionCategories = [
  'All',
  'AI',
  'Android',
  'Build Tools',
  'Debuggers',
  'Formatters',
  'Linters',
  'Programming Languages',
  'SCM Providers',
  'Themes',
  'Other',
];

export function searchExtensions(extensions: Extension[], query: string, category: string): Extension[] {
  let filtered = extensions;
  if (category !== 'All') {
    filtered = filtered.filter(e => e.category === category);
  }
  if (query.trim()) {
    const q = query.toLowerCase();
    filtered = filtered.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.publisher.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.tags.some(t => t.includes(q))
    );
  }
  return filtered;
}
