import type { AppSettings } from "./types";

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "system",
  mermaidTheme: "default",
  mermaidLook: "classic",
  editorFontSize: 14,
  editorTabSize: 2,
  editorWordWrap: true,
  editorLineNumbers: true,
  editorMinimap: false,
  autoSaveEnabled: true,
  autoSaveDelay: 1000,
  defaultExportFormat: "svg",
  showFileExtensions: false,
};

export const THEME_OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
] as const;

export const MERMAID_THEME_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "dark", label: "Dark" },
  { value: "forest", label: "Forest" },
  { value: "neutral", label: "Neutral" },
] as const;

export const MERMAID_LOOK_OPTIONS = [
  { value: "classic", label: "Classic" },
  { value: "handDrawn", label: "Hand-drawn" },
] as const;

export const TAB_SIZE_OPTIONS = [
  { value: 2, label: "2 spaces" },
  { value: 4, label: "4 spaces" },
] as const;

export const AUTO_SAVE_DELAY_OPTIONS = [
  { value: 500, label: "0.5s" },
  { value: 1000, label: "1s" },
  { value: 2000, label: "2s" },
  { value: 5000, label: "5s" },
] as const;

export const EXPORT_FORMAT_OPTIONS = [
  { value: "mmd", label: ".mmd" },
  { value: "svg", label: "SVG" },
  { value: "png", label: "PNG" },
] as const;
