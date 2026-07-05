import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { findFileById, FileNode, sampleProject } from '@/data/sampleProject';

export type SidePanel =
  | 'explorer' | 'search' | 'git' | 'debug' | 'extensions'
  | 'test' | 'profiler' | 'objectbrowser' | 'liveshare'
  | null;

export type BottomPanel = 'terminal' | 'problems' | 'output' | 'debug-console' | 'task-list' | 'test-results' | null;

export interface OpenFile {
  id: string;
  name: string;
  content: string;
  language: string;
  isDirty: boolean;
  path: string;
  cursorLine: number;
  cursorCol: number;
}

export interface Breakpoint {
  fileId: string;
  line: number;
}

export interface FindReplaceOptions {
  searchTerm: string;
  replaceTerm: string;
  caseSensitive: boolean;
  wholeWord: boolean;
  regex: boolean;
  visible: boolean;
}

interface EditorContextType {
  openFiles: OpenFile[];
  activeFileId: string | null;
  sidePanel: SidePanel;
  bottomPanel: BottomPanel;
  commandPaletteVisible: boolean;
  findReplaceVisible: boolean;
  findReplaceOptions: FindReplaceOptions;
  breakpoints: Breakpoint[];
  currentBranch: string;
  projectFiles: FileNode[];
  setSidePanel: (panel: SidePanel) => void;
  setBottomPanel: (panel: BottomPanel) => void;
  openFile: (file: FileNode) => void;
  closeFile: (id: string) => void;
  setActiveFile: (id: string) => void;
  updateFileContent: (id: string, content: string) => void;
  saveFile: (id: string) => void;
  toggleBreakpoint: (fileId: string, line: number) => void;
  setCommandPaletteVisible: (v: boolean) => void;
  setFindReplaceVisible: (v: boolean) => void;
  setFindReplaceOptions: (opts: Partial<FindReplaceOptions>) => void;
  setCursorPosition: (fileId: string, line: number, col: number) => void;
  activeFile: OpenFile | null;
}

const EditorContext = createContext<EditorContextType>({} as EditorContextType);

const LANGUAGE_MAP: Record<string, string> = {
  kt: 'kotlin',
  java: 'java',
  xml: 'xml',
  gradle: 'groovy',
  md: 'markdown',
  json: 'json',
  ts: 'typescript',
  tsx: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  py: 'python',
  html: 'html',
  css: 'css',
  cpp: 'cpp',
  c: 'c',
  h: 'c',
  cs: 'csharp',
};

function getLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return LANGUAGE_MAP[ext] ?? 'text';
}

function getFilePath(filename: string): string {
  return `iCOBRA-Project/${filename}`;
}

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [sidePanel, setSidePanelState] = useState<SidePanel>('explorer');
  const [bottomPanel, setBottomPanelState] = useState<BottomPanel>(null);
  const [commandPaletteVisible, setCommandPaletteVisible] = useState(false);
  const [findReplaceVisible, setFindReplaceVisibleState] = useState(false);
  const [findReplaceOptions, setFindReplaceOptionsState] = useState<FindReplaceOptions>({
    searchTerm: '',
    replaceTerm: '',
    caseSensitive: false,
    wholeWord: false,
    regex: false,
    visible: false,
  });
  const [breakpoints, setBreakpoints] = useState<Breakpoint[]>([]);
  const [currentBranch] = useState('main');

  const activeFile = openFiles.find(f => f.id === activeFileId) ?? null;

  const setSidePanel = useCallback((panel: SidePanel) => {
    setSidePanelState(prev => prev === panel ? null : panel);
  }, []);

  const setBottomPanel = useCallback((panel: BottomPanel) => {
    setBottomPanelState(prev => prev === panel ? null : panel);
  }, []);

  const openFile = useCallback((file: FileNode) => {
    if (file.type !== 'file') return;
    setOpenFiles(prev => {
      if (prev.find(f => f.id === file.id)) {
        setActiveFileId(file.id);
        return prev;
      }
      const newFile: OpenFile = {
        id: file.id,
        name: file.name,
        content: file.content ?? '',
        language: file.language ?? getLanguage(file.name),
        isDirty: false,
        path: getFilePath(file.name),
        cursorLine: 1,
        cursorCol: 1,
      };
      setActiveFileId(file.id);
      return [...prev, newFile];
    });
  }, []);

  const closeFile = useCallback((id: string) => {
    setOpenFiles(prev => {
      const idx = prev.findIndex(f => f.id === id);
      const next = prev.filter(f => f.id !== id);
      if (activeFileId === id && next.length > 0) {
        const newActive = next[Math.min(idx, next.length - 1)];
        setActiveFileId(newActive.id);
      } else if (next.length === 0) {
        setActiveFileId(null);
      }
      return next;
    });
  }, [activeFileId]);

  const setActiveFile = useCallback((id: string) => {
    setActiveFileId(id);
  }, []);

  const updateFileContent = useCallback((id: string, content: string) => {
    setOpenFiles(prev =>
      prev.map(f => f.id === id ? { ...f, content, isDirty: true } : f)
    );
  }, []);

  const saveFile = useCallback((id: string) => {
    setOpenFiles(prev =>
      prev.map(f => f.id === id ? { ...f, isDirty: false } : f)
    );
  }, []);

  const toggleBreakpoint = useCallback((fileId: string, line: number) => {
    setBreakpoints(prev => {
      const exists = prev.find(b => b.fileId === fileId && b.line === line);
      if (exists) {
        return prev.filter(b => !(b.fileId === fileId && b.line === line));
      }
      return [...prev, { fileId, line }];
    });
  }, []);

  const setCursorPosition = useCallback((fileId: string, line: number, col: number) => {
    setOpenFiles(prev =>
      prev.map(f => f.id === fileId ? { ...f, cursorLine: line, cursorCol: col } : f)
    );
  }, []);

  const setFindReplaceVisible = useCallback((v: boolean) => {
    setFindReplaceVisibleState(v);
    setFindReplaceOptionsState(prev => ({ ...prev, visible: v }));
  }, []);

  const setFindReplaceOptions = useCallback((opts: Partial<FindReplaceOptions>) => {
    setFindReplaceOptionsState(prev => ({ ...prev, ...opts }));
  }, []);

  // Open first file on mount
  useEffect(() => {
    const mainActivity = findFileById(sampleProject, 'main-activity');
    if (mainActivity) openFile(mainActivity);
  }, []);

  return (
    <EditorContext.Provider value={{
      openFiles,
      activeFileId,
      sidePanel,
      bottomPanel,
      commandPaletteVisible,
      findReplaceVisible,
      findReplaceOptions,
      breakpoints,
      currentBranch,
      projectFiles: sampleProject,
      setSidePanel,
      setBottomPanel,
      openFile,
      closeFile,
      setActiveFile,
      updateFileContent,
      saveFile,
      toggleBreakpoint,
      setCommandPaletteVisible,
      setFindReplaceVisible,
      setFindReplaceOptions,
      setCursorPosition,
      activeFile,
    }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  return useContext(EditorContext);
}
