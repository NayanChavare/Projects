export type Language = 'html' | 'css' | 'javascript';

export interface EditorState {
  html: string;
  css: string;
  js: string;
}

export interface Project {
  id: string;
  name: string;
  code: EditorState;
  updatedAt: number;
}
