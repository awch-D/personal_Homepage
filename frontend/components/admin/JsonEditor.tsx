'use client'

import Editor from '@monaco-editor/react'

interface JsonEditorProps {
    value: string
    onChange: (value: string | undefined) => void
    readOnly?: boolean
}

export default function JsonEditor({ value, onChange, readOnly = false }: JsonEditorProps) {
    return (
        <div className="h-[600px] border border-gray-700 rounded-lg overflow-hidden">
            <Editor
                height="100%"
                defaultLanguage="json"
                value={value}
                onChange={onChange}
                theme="vs-dark"
                options={{
                    readOnly,
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                }}
            />
        </div>
    )
}
