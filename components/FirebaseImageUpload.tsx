"use client";

import { useState, useRef } from "react";
import { FaUpload, FaSpinner, FaImage, FaTrash } from "react-icons/fa";

interface FirebaseImageUploadProps {
  label: string;
  currentImage?: string;
  onUpload: (firebaseUrl: string) => void;
  folder?: string;
  required?: boolean;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

export default function FirebaseImageUpload({
  label,
  currentImage,
  onUpload,
  folder = "marketing",
  required = false,
  accept = "image/jpeg,image/jpg,image/png,image/webp",
  maxSize = 5,
  className = ""
}: FirebaseImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Validate file type
    if (!accept.split(',').some(type => file.type.includes(type.replace('image/', '')))) {
      setError(`Please upload a valid image file (${accept})`);
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);

      // Upload to Firebase via backend
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/file`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const data = await response.json();
      
      // Call parent component with Firebase URL
      onUpload(data.url || data.downloadURL || data.fileUrl);
      
    } catch (error: any) {
      console.error('Upload error:', error);
      setError(error.message || 'Failed to upload image');
      setPreview(currentImage || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {preview ? (
        <div className="relative group">
          <img
            src={preview}
            alt={label}
            className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <FaUpload /> Change
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <FaTrash /> Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`
            border-2 border-dashed border-gray-300 dark:border-gray-600 
            rounded-lg p-8 text-center cursor-pointer
            hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20
            transition-all
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <FaSpinner className="text-4xl text-blue-600 animate-spin" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Uploading to Firebase...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <FaImage className="text-4xl text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {accept.replace(/image\//g, '').toUpperCase()} up to {maxSize}MB
              </p>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
          <span>⚠️</span> {error}
        </p>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400">
        💡 Images are automatically uploaded to Firebase Storage
      </p>
    </div>
  );
}
