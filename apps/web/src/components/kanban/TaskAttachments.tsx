import { useState, useEffect, useRef } from 'react'
import { Paperclip, Upload, File, Image, FileText, X, Download, Loader2 } from 'lucide-react'
import { Button } from '../ui/Button'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { formatDistanceToNow } from 'date-fns'

interface Attachment {
  id: string
  taskId: string
  fileName: string
  fileUrl: string
  fileSize: number
  fileType: string
  uploadedBy: string
  createdAt: Date | string
  uploader?: {
    id: string
    fullName: string
  }
}

interface TaskAttachmentsProps {
  taskId: string
}

export function TaskAttachments({ taskId }: TaskAttachmentsProps) {
  const { token } = useAuth()
  const toast = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    if (taskId) {
      fetchAttachments()
    }
  }, [taskId])

  const fetchAttachments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:3000/api/attachments/task/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setAttachments(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch attachments:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="w-5 h-5 text-blue-500" />
    }
    if (fileType.includes('pdf') || fileType.includes('document')) {
      return <FileText className="w-5 h-5 text-red-500" />
    }
    return <File className="w-5 h-5 text-neutral-500" />
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      toast.error('Validation Error', 'File size must be less than 10MB')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      // Simulate upload progress for demo (in production, use actual upload progress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      // For demo purposes, we'll create a mock file URL
      // In production, you'd upload to a file storage service (S3, Cloudinary, etc.)
      const mockFileUrl = `https://example.com/uploads/${Date.now()}-${file.name}`

      const response = await fetch('http://localhost:3000/api/attachments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          taskId,
          fileName: file.name,
          fileUrl: mockFileUrl,
          fileSize: file.size,
          fileType: file.type || 'application/octet-stream',
        }),
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const data = await response.json()
      if (data.success) {
        setAttachments([data.data, ...attachments])
        toast.success('Success', 'File uploaded successfully')
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } else {
        toast.error('Error', data.error?.message || 'Failed to upload file')
      }
    } catch (error) {
      toast.error('Error', 'Failed to upload file')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDelete = async (attachmentId: string) => {
    if (!confirm('Are you sure you want to delete this attachment?')) {
      return
    }

    try {
      const response = await fetch(`http://localhost:3000/api/attachments/${attachmentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await response.json()
      if (data.success) {
        setAttachments(attachments.filter((a) => a.id !== attachmentId))
        toast.success('Success', 'Attachment deleted')
      } else {
        toast.error('Error', data.error?.message || 'Failed to delete attachment')
      }
    } catch (error) {
      toast.error('Error', 'Failed to delete attachment')
    }
  }

  const handleDownload = (attachment: Attachment) => {
    // In production, this would trigger actual file download
    toast.info('Download', `Downloading ${attachment.fileName}...`)
    window.open(attachment.fileUrl, '_blank')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-neutral-900 font-medium">
          <Paperclip className="w-5 h-5" />
          <span>Attachments</span>
          <span className="text-sm text-neutral-500">({attachments.length})</span>
        </div>
        <Button variant="outline" size="sm" onClick={handleFileSelect} disabled={uploading}>
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading... {uploadProgress}%
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Upload File
            </>
          )}
        </Button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept="*/*"
      />

      {/* Upload Progress */}
      {uploading && (
        <div className="bg-neutral-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-700">Uploading...</span>
            <span className="text-sm font-medium text-primary-600">{uploadProgress}%</span>
          </div>
          <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Attachments List */}
      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
          </div>
        ) : attachments.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 bg-neutral-50 rounded-lg border-2 border-dashed border-neutral-200">
            <Paperclip className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No attachments yet</p>
            <p className="text-xs mt-1">Upload files to share with your team</p>
          </div>
        ) : (
          attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="bg-white border border-neutral-200 rounded-lg p-3 hover:border-neutral-300 transition-colors group"
            >
              <div className="flex items-center gap-3">
                {/* File Icon */}
                <div className="w-10 h-10 rounded-lg bg-neutral-50 flex items-center justify-center flex-shrink-0">
                  {getFileIcon(attachment.fileType)}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-neutral-900 text-sm truncate">
                      {attachment.fileName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-neutral-500">
                      {formatFileSize(attachment.fileSize)}
                    </span>
                    <span className="text-xs text-neutral-400">•</span>
                    <span className="text-xs text-neutral-500">
                      {attachment.uploader?.fullName || 'Unknown'}
                    </span>
                    <span className="text-xs text-neutral-400">•</span>
                    <span className="text-xs text-neutral-500">
                      {formatDistanceToNow(new Date(attachment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDownload(attachment)}
                    className="p-1.5 hover:bg-neutral-100 rounded text-neutral-600 hover:text-primary-600 transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(attachment.id)}
                    className="p-1.5 hover:bg-red-50 rounded text-neutral-600 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* File Upload Tips */}
      {!uploading && attachments.length === 0 && (
        <div className="text-xs text-neutral-500 bg-blue-50 border border-blue-100 rounded-lg p-3">
          <p className="font-medium text-blue-900 mb-1">💡 File Upload Tips:</p>
          <ul className="space-y-0.5 text-blue-700">
            <li>• Maximum file size: 10MB</li>
            <li>• Supported formats: Images, PDFs, Documents, and more</li>
            <li>• Files are stored securely and accessible to team members</li>
          </ul>
        </div>
      )}
    </div>
  )
}
