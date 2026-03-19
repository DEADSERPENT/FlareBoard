import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Heading2,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon
} from 'lucide-react'
import { useCallback } from 'react'

interface RichTextEditorProps {
  content?: string // HTML content
  onChange: (html: string, json: any) => void
  placeholder?: string
  readOnly?: boolean
  minHeight?: string
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Write something...',
  readOnly = false,
  minHeight = '200px'
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary-600 underline hover:text-primary-700',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML(), editor.getJSON())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none',
      },
    },
  })

  const setLink = useCallback(() => {
    if (!editor) return

    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('Enter URL:', previousUrl)

    // Cancelled
    if (url === null) return

    // Empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    // Update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const addImage = useCallback(() => {
    if (!editor) return

    const url = window.prompt('Enter image URL:')

    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  if (!editor) return null

  return (
    <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white">
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-neutral-200 bg-neutral-50">
          {/* Text formatting */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-neutral-200 transition-colors ${
              editor.isActive('bold') ? 'bg-neutral-300 text-primary-600' : 'text-neutral-700'
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-neutral-200 transition-colors ${
              editor.isActive('italic') ? 'bg-neutral-300 text-primary-600' : 'text-neutral-700'
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 rounded hover:bg-neutral-200 transition-colors ${
              editor.isActive('strike') ? 'bg-neutral-300 text-primary-600' : 'text-neutral-700'
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-2 rounded hover:bg-neutral-200 transition-colors ${
              editor.isActive('code') ? 'bg-neutral-300 text-primary-600' : 'text-neutral-700'
            }`}
            title="Inline Code"
          >
            <Code className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-neutral-300 mx-1" />

          {/* Heading */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded hover:bg-neutral-200 transition-colors ${
              editor.isActive('heading', { level: 2 }) ? 'bg-neutral-300 text-primary-600' : 'text-neutral-700'
            }`}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-neutral-300 mx-1" />

          {/* Lists */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-neutral-200 transition-colors ${
              editor.isActive('bulletList') ? 'bg-neutral-300 text-primary-600' : 'text-neutral-700'
            }`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-neutral-200 transition-colors ${
              editor.isActive('orderedList') ? 'bg-neutral-300 text-primary-600' : 'text-neutral-700'
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-neutral-300 mx-1" />

          {/* Quote */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded hover:bg-neutral-200 transition-colors ${
              editor.isActive('blockquote') ? 'bg-neutral-300 text-primary-600' : 'text-neutral-700'
            }`}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-neutral-300 mx-1" />

          {/* Link & Image */}
          <button
            type="button"
            onClick={setLink}
            className={`p-2 rounded hover:bg-neutral-200 transition-colors ${
              editor.isActive('link') ? 'bg-neutral-300 text-primary-600' : 'text-neutral-700'
            }`}
            title="Add Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={addImage}
            className="p-2 rounded hover:bg-neutral-200 transition-colors text-neutral-700"
            title="Add Image"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      <EditorContent
        editor={editor}
        className="p-4"
        style={{ minHeight }}
      />
    </div>
  )
}
