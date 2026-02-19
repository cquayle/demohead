import { useRef, useEffect, useCallback } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';

const ADAPTIVE_CARDS_SCHEMA_URI = 'https://adaptivecards.io/schemas/adaptive-card.json';

export interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  /** When true, validate against Adaptive Cards JSON schema. */
  adaptiveCardSchema?: boolean;
  /** Minimum height in pixels. */
  height?: number;
  /** Callback when validation state changes (e.g. for showing save button state). */
  onValidationChange?: (hasErrors: boolean) => void;
}

export default function JsonEditor({
  value,
  onChange,
  adaptiveCardSchema = true,
  height = 400,
  onValidationChange,
}: JsonEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof import('monaco-editor') | null>(null);

  const handleEditorMount: OnMount = useCallback(
    (editorInstance, monaco) => {
      editorRef.current = editorInstance;
      monacoRef.current = monaco;
      const model = editorInstance.getModel();
      if (model && adaptiveCardSchema) {
        monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
          validate: true,
          allowComments: false,
          enableSchemaRequest: true,
          schemas: [
            {
              uri: ADAPTIVE_CARDS_SCHEMA_URI,
              fileMatch: [model.uri.toString()],
            },
          ],
        });
      }
    },
    [adaptiveCardSchema]
  );

  // Sync value from parent when it changes externally (e.g. reset to default)
  useEffect(() => {
    const ed = editorRef.current;
    if (ed) {
      const model = ed.getModel();
      if (model && value !== model.getValue()) {
        model.setValue(value);
      }
    }
  }, [value]);

  // Report validation (syntax + schema) via diagnostics
  useEffect(() => {
    if (!onValidationChange || !monacoRef.current || !editorRef.current) return;
    const monaco = monacoRef.current;
    const model = editorRef.current.getModel();
    if (!model) return;
    const check = () => {
      const markers = monaco.editor.getModelMarkers({ resource: model.uri });
      onValidationChange(markers.length > 0);
    };
    const disposable = monaco.editor.onDidChangeMarkers(() => check());
    check();
    return () => disposable.dispose();
  }, [onValidationChange]);

  return (
    <Editor
      height={height}
      defaultLanguage="json"
      value={value}
      onChange={(v) => onChange(v ?? '')}
      onMount={handleEditorMount}
      options={{
        minimap: { enabled: false },
        fontSize: 13,
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        formatOnPaste: true,
        formatOnType: true,
        tabSize: 2,
        automaticLayout: true,
      }}
    />
  );
}
