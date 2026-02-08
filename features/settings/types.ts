export interface AppSettings {
  // Appearance
  theme: "light" | "dark" | "system";
  mermaidTheme: "default" | "dark" | "forest" | "neutral";
  mermaidLook: "classic" | "handDrawn";
  // Editor
  editorFontSize: number;
  editorTabSize: 2 | 4;
  editorWordWrap: boolean;
  editorLineNumbers: boolean;
  editorMinimap: boolean;
  // Auto-save
  autoSaveEnabled: boolean;
  autoSaveDelay: 500 | 1000 | 2000 | 5000;
  // Files & Export
  defaultExportFormat: "mmd" | "svg" | "png";
  showFileExtensions: boolean;
}
