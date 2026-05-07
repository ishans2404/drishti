'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface FileUploadProps {
  onUpload: (url: string) => void
  accept?: string
  folder?: string
}

export function FileUpload({ onUpload, accept = 'image/*', folder = 'uploads' }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      setFileName(file.name)

      const timestamp = Date.now()
      const path = `${folder}/${timestamp}-${file.name}`

      const { data, error } = await supabase.storage.from('uploads').upload(path, file)

      if (error) throw error

      const {
        data: { publicUrl },
      } = supabase.storage.from('uploads').getPublicUrl(path)

      onUpload(publicUrl)
      setFileName(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (error) {
      console.error('Upload failed:', error)
      setFileName(null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        disabled={uploading}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        <Upload className="w-4 h-4 mr-2" />
        {uploading ? 'Uploading...' : 'Upload'}
      </Button>
      {fileName && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{fileName}</span>
          <button
            onClick={() => {
              setFileName(null)
              if (fileInputRef.current) fileInputRef.current.value = ''
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
