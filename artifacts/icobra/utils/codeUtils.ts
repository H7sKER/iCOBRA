export function getWordAtCursor(text: string, cursorPos: number): string {
  const before = text.slice(0, cursorPos);
  const match = before.match(/[\w.]+$/);
  return match ? match[0] : '';
}

export function countLines(text: string): number {
  return text.split('\n').length;
}

export function getLineAtPosition(text: string, pos: number): { line: number; col: number; lineText: string } {
  const lines = text.split('\n');
  let chars = 0;
  for (let i = 0; i < lines.length; i++) {
    if (chars + lines[i].length >= pos) {
      return { line: i + 1, col: pos - chars + 1, lineText: lines[i] };
    }
    chars += lines[i].length + 1;
  }
  return { line: lines.length, col: 1, lineText: lines[lines.length - 1] ?? '' };
}

export function indentText(text: string, spaces: number = 4): string {
  const indent = ' '.repeat(spaces);
  return text.split('\n').map(l => indent + l).join('\n');
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() ?? '';
}

export function isCodeFile(filename: string): boolean {
  const codeExts = ['kt', 'java', 'xml', 'gradle', 'md', 'json', 'ts', 'tsx', 'js', 'jsx', 'py', 'html', 'css', 'cpp', 'c', 'h', 'cs', 'rs', 'go', 'rb', 'php'];
  return codeExts.includes(getFileExtension(filename));
}

export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function findAllOccurrences(text: string, search: string, caseSensitive = false): Array<{ start: number; end: number; line: number }> {
  const results: Array<{ start: number; end: number; line: number }> = [];
  if (!search) return results;
  const flags = caseSensitive ? 'g' : 'gi';
  const regex = new RegExp(escapeRegExp(search), flags);
  const lines = text.split('\n');
  let offset = 0;
  lines.forEach((line, lineIdx) => {
    let match;
    const lineRegex = new RegExp(escapeRegExp(search), flags);
    while ((match = lineRegex.exec(line)) !== null) {
      results.push({ start: offset + match.index, end: offset + match.index + match[0].length, line: lineIdx + 1 });
    }
    offset += line.length + 1;
  });
  return results;
}

export function replaceAll(text: string, search: string, replacement: string, caseSensitive = false): string {
  const flags = caseSensitive ? 'g' : 'gi';
  const regex = new RegExp(escapeRegExp(search), flags);
  return text.replace(regex, replacement);
}

export function getSurroundingContext(text: string, lineNumber: number, contextLines = 3): string {
  const lines = text.split('\n');
  const start = Math.max(0, lineNumber - contextLines - 1);
  const end = Math.min(lines.length, lineNumber + contextLines);
  return lines.slice(start, end).join('\n');
}

export function getIndentLevel(line: string): number {
  const match = line.match(/^(\s+)/);
  if (!match) return 0;
  return match[1].replace(/\t/g, '    ').length;
}

export function autoIndent(prevLine: string, language: string): number {
  const trimmed = prevLine.trimEnd();
  if (language === 'kotlin' || language === 'java') {
    if (trimmed.endsWith('{') || trimmed.endsWith('(')) return getIndentLevel(prevLine) + 4;
    if (trimmed.endsWith('}') || trimmed.endsWith(')')) return Math.max(0, getIndentLevel(prevLine) - 4);
  }
  return getIndentLevel(prevLine);
}

export function extractSymbols(code: string, language: string): Array<{ name: string; type: 'class' | 'function' | 'property' | 'object'; line: number }> {
  const symbols: Array<{ name: string; type: 'class' | 'function' | 'property' | 'object'; line: number }> = [];
  const lines = code.split('\n');
  if (language === 'kotlin') {
    lines.forEach((line, i) => {
      const classMatch = line.match(/^\s*(?:data\s+|sealed\s+|abstract\s+|open\s+)?class\s+(\w+)/);
      if (classMatch) symbols.push({ name: classMatch[1], type: 'class', line: i + 1 });
      const funMatch = line.match(/^\s*(?:private\s+|public\s+|protected\s+|internal\s+)?(?:suspend\s+)?fun\s+(\w+)/);
      if (funMatch) symbols.push({ name: funMatch[1], type: 'function', line: i + 1 });
      const valMatch = line.match(/^\s*(?:private\s+|public\s+)?val\s+(\w+)/);
      if (valMatch) symbols.push({ name: valMatch[1], type: 'property', line: i + 1 });
      const objectMatch = line.match(/^\s*object\s+(\w+)/);
      if (objectMatch) symbols.push({ name: objectMatch[1], type: 'object', line: i + 1 });
    });
  }
  return symbols;
}

export function generateTodoList(code: string): Array<{ type: string; message: string; line: number }> {
  const todos: Array<{ type: string; message: string; line: number }> = [];
  const patterns = [
    { regex: /\/\/\s*TODO[:\s](.+)/, type: 'TODO' },
    { regex: /\/\/\s*FIXME[:\s](.+)/, type: 'FIXME' },
    { regex: /\/\/\s*HACK[:\s](.+)/, type: 'HACK' },
    { regex: /\/\/\s*BUG[:\s](.+)/, type: 'BUG' },
    { regex: /\/\/\s*NOTE[:\s](.+)/, type: 'NOTE' },
    { regex: /\/\/\s*XXX[:\s](.+)/, type: 'XXX' },
    { regex: /\/\/\s*REVIEW[:\s](.+)/, type: 'REVIEW' },
  ];
  code.split('\n').forEach((line, i) => {
    for (const { regex, type } of patterns) {
      const match = line.match(regex);
      if (match) todos.push({ type, message: match[1].trim(), line: i + 1 });
    }
  });
  return todos;
}

export const BRACE_PAIRS: Record<string, string> = {
  '{': '}',
  '(': ')',
  '[': ']',
  '"': '"',
  "'": "'",
  '`': '`',
};

export function findMatchingBrace(code: string, pos: number): number {
  const char = code[pos];
  const closingChars: Record<string, string> = { '}': '{', ')': '(', ']': '[' };
  if (Object.values(BRACE_PAIRS).includes(char) && char !== '"' && char !== "'" && char !== '`') {
    const open = closingChars[char];
    let depth = 0;
    for (let i = pos; i >= 0; i--) {
      if (code[i] === char) depth++;
      else if (code[i] === open) {
        depth--;
        if (depth === 0) return i;
      }
    }
  } else if (Object.keys(BRACE_PAIRS).includes(char) && char !== '"' && char !== "'" && char !== '`') {
    const close = BRACE_PAIRS[char];
    let depth = 0;
    for (let i = pos; i < code.length; i++) {
      if (code[i] === char) depth++;
      else if (code[i] === close) {
        depth--;
        if (depth === 0) return i;
      }
    }
  }
  return -1;
}
