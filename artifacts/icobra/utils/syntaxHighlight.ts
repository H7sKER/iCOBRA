import vsColors from '@/constants/vsColors';

export interface Token {
  text: string;
  color: string;
}

const KOTLIN_KEYWORDS = new Set([
  'package', 'import', 'class', 'object', 'interface', 'fun', 'val', 'var',
  'if', 'else', 'when', 'for', 'while', 'do', 'return', 'break', 'continue',
  'try', 'catch', 'finally', 'throw', 'override', 'private', 'public',
  'protected', 'internal', 'open', 'abstract', 'final', 'companion', 'data',
  'sealed', 'enum', 'annotation', 'typealias', 'this', 'super', 'null',
  'true', 'false', 'is', 'as', 'in', 'out', 'by', 'it', 'get', 'set',
  'suspend', 'inline', 'reified', 'lateinit', 'const', 'init', 'constructor',
  'operator', 'infix', 'crossinline', 'noinline', 'vararg',
]);

const JS_KEYWORDS = new Set([
  'import', 'export', 'default', 'from', 'const', 'let', 'var', 'function',
  'class', 'extends', 'return', 'if', 'else', 'for', 'while', 'do',
  'switch', 'case', 'break', 'continue', 'throw', 'try', 'catch', 'finally',
  'new', 'delete', 'typeof', 'instanceof', 'in', 'of', 'void', 'null',
  'undefined', 'true', 'false', 'this', 'super', 'static', 'async', 'await',
  'yield', 'get', 'set', 'type', 'interface', 'enum', 'namespace', 'declare',
  'abstract', 'implements', 'readonly', 'private', 'public', 'protected',
]);

const PYTHON_KEYWORDS = new Set([
  'import', 'from', 'as', 'def', 'class', 'return', 'if', 'elif', 'else',
  'for', 'while', 'break', 'continue', 'pass', 'raise', 'try', 'except',
  'finally', 'with', 'lambda', 'and', 'or', 'not', 'in', 'is', 'None',
  'True', 'False', 'async', 'await', 'yield', 'global', 'nonlocal',
  'del', 'assert', 'print',
]);

function getKeywords(language: string): Set<string> {
  switch (language) {
    case 'kotlin': return KOTLIN_KEYWORDS;
    case 'javascript':
    case 'typescript': return JS_KEYWORDS;
    case 'python': return PYTHON_KEYWORDS;
    default: return JS_KEYWORDS;
  }
}

export function tokenizeLine(line: string, language: string): Token[] {
  const tokens: Token[] = [];
  const keywords = getKeywords(language);
  let i = 0;

  while (i < line.length) {
    // Single-line comment
    if (line[i] === '/' && line[i + 1] === '/') {
      tokens.push({ text: line.slice(i), color: vsColors.comment });
      break;
    }
    if (language === 'python' && line[i] === '#') {
      tokens.push({ text: line.slice(i), color: vsColors.comment });
      break;
    }

    // String (double quote)
    if (line[i] === '"') {
      let j = i + 1;
      while (j < line.length && !(line[j] === '"' && line[j - 1] !== '\\')) j++;
      tokens.push({ text: line.slice(i, j + 1), color: vsColors.string });
      i = j + 1;
      continue;
    }

    // String (single quote)
    if (line[i] === "'") {
      let j = i + 1;
      while (j < line.length && !(line[j] === "'" && line[j - 1] !== '\\')) j++;
      tokens.push({ text: line.slice(i, j + 1), color: vsColors.string });
      i = j + 1;
      continue;
    }

    // Template literal
    if (line[i] === '`') {
      let j = i + 1;
      while (j < line.length && !(line[j] === '`' && line[j - 1] !== '\\')) j++;
      tokens.push({ text: line.slice(i, j + 1), color: vsColors.string });
      i = j + 1;
      continue;
    }

    // Number
    if (/[0-9]/.test(line[i]) && (i === 0 || /[^a-zA-Z_]/.test(line[i - 1]))) {
      let j = i;
      while (j < line.length && /[0-9.xXa-fA-FbBoOuUlL_]/.test(line[j])) j++;
      tokens.push({ text: line.slice(i, j), color: vsColors.number });
      i = j;
      continue;
    }

    // Identifier or keyword
    if (/[a-zA-Z_$]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[a-zA-Z0-9_$]/.test(line[j])) j++;
      const word = line.slice(i, j);

      // Check what follows the word
      let k = j;
      while (k < line.length && line[k] === ' ') k++;

      if (keywords.has(word)) {
        tokens.push({ text: word, color: vsColors.keyword });
      } else if (line[k] === '(') {
        // Function call
        tokens.push({ text: word, color: vsColors.functionColor });
      } else if (/^[A-Z]/.test(word)) {
        // Type/class name
        tokens.push({ text: word, color: vsColors.typeColor });
      } else if (word === word.toUpperCase() && word.length > 1) {
        // Constant
        tokens.push({ text: word, color: vsColors.variable });
      } else {
        tokens.push({ text: word, color: vsColors.text });
      }
      i = j;
      continue;
    }

    // Operator / punctuation
    if (/[+\-*/%=<>!&|^~?:@]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[+\-*/%=<>!&|^~?:@]/.test(line[j])) j++;
      tokens.push({ text: line.slice(i, j), color: vsColors.operator });
      i = j;
      continue;
    }

    // Everything else (brackets, whitespace, etc.)
    tokens.push({ text: line[i], color: vsColors.text });
    i++;
  }

  return tokens;
}

export function getLineTokens(code: string, language: string): Token[][] {
  const lines = code.split('\n');
  return lines.map(line => tokenizeLine(line, language));
}
