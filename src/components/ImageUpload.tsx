import { useState, useRef } from 'react';
import { uploadImage } from '../lib/supabase';

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}

export function ImageUpload({ label, value, onChange, placeholder }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    try {
      setIsUploading(true);
      const url = await uploadImage(file);
      onChange(url);
    } catch (error) {
      console.error(error);
      alert('Failed to upload image. Make sure your Supabase Storage is configured correctly.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-mono text-secondary uppercase font-semibold">
        {label}
      </label>
      
      <div 
        className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 transition-colors ${
          isDragging 
            ? 'border-primary-container bg-primary-container/10' 
            : 'border-border/60 hover:border-border bg-surface-container-low'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          accept="image/*"
          onChange={handleFileChange}
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center gap-2 py-4">
            <span className="material-symbols-outlined animate-spin text-primary-container text-3xl">
              progress_activity
            </span>
            <span className="text-sm font-mono text-secondary">Uploading...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 cursor-pointer text-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/50">
              cloud_upload
            </span>
            <p className="text-sm font-mono text-secondary">
              <span className="text-primary-container font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-on-surface-variant/50">SVG, PNG, JPG or GIF</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-on-surface-variant/50 font-mono uppercase font-bold">OR URL:</span>
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || 'https://...'}
          className="flex-1 bg-surface text-on-surface px-3 py-2 rounded-xl border border-border text-xs font-mono focus:outline-none focus:border-primary-container"
        />
      </div>
    </div>
  );
}
