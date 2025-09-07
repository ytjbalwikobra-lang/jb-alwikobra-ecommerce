import React, { useRef, useState } from 'react';
import { adminService } from '../services/adminService';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  max?: number;
  accept?: string;
  className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  images, 
  onChange, 
  max = 15,
  accept = "image/*",
  className = ""
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dragIndex = useRef<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{done: number, total: number}>({done: 0, total: 0});
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const filesToUpload = Array.from(files).slice(0, Math.max(0, max - images.length));
    if (filesToUpload.length === 0) return;

    setUploading(true);
    setProgress({done: 0, total: filesToUpload.length});

    try {
      const uploadedUrls: string[] = [];
      
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}-${file.name}`;
        
        const { data, error } = await adminService.uploadImage(file, fileName);
        
        if (error) {
          console.error('Upload failed for file:', file.name, error);
          continue;
        }
        
        if (data?.publicUrl) {
          uploadedUrls.push(data.publicUrl);
        }
        
        setProgress({done: i + 1, total: filesToUpload.length});
      }

      if (uploadedUrls.length > 0) {
        onChange([...images, ...uploadedUrls]);
      }
    } catch (error) {
      console.error('Upload process failed:', error);
    } finally {
      setUploading(false);
      setProgress({done: 0, total: 0});
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onChange(newImages);
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    await handleFiles(e.dataTransfer.files);
  };

  const onDragStart = (idx: number) => (e: React.DragEvent) => {
    dragIndex.current = idx;
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOver(false);
    }
  };

  const onDropReorder = (targetIdx: number) => (e: React.DragEvent) => {
    e.preventDefault();
    const fromIdx = dragIndex.current;
    if (fromIdx === null || fromIdx === targetIdx) return;
    moveImage(fromIdx, targetIdx);
    dragIndex.current = null;
  };

  const triggerFileInput = () => {
    inputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200
          ${dragOver 
            ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20' 
            : 'border-gray-600 hover:border-orange-500 bg-gray-800/50'
          }
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onClick={triggerFileInput}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        
        {uploading ? (
          <div className="space-y-3">
            <div className="flex justify-center">
              <svg className="animate-spin h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-gray-300">
              Uploading {progress.done} of {progress.total} images...
            </p>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(progress.done / progress.total) * 100}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-center">
              <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div className="text-gray-300">
              <p className="text-lg font-medium">Click to upload or drag and drop</p>
              <p className="text-sm text-gray-400">PNG, JPG, GIF up to 10MB each</p>
              <p className="text-xs text-gray-500 mt-1">
                {images.length} of {max} images uploaded
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="relative group bg-gray-800 rounded-lg overflow-hidden border border-gray-700"
              draggable
              onDragStart={onDragStart(index)}
              onDragOver={onDragOver}
              onDrop={onDropReorder(index)}
            >
              <div className="aspect-square">
                <img
                  src={url}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                  className="opacity-0 group-hover:opacity-100 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              
              {/* Index Badge */}
              <div className="absolute top-2 left-2 bg-orange-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                {index + 1}
              </div>
              
              {/* Drag Handle */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-gray-800 text-gray-300 p-1 rounded cursor-move">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Helper Text */}
      {images.length > 0 && (
        <p className="text-sm text-gray-400 text-center">
          Drag images to reorder • Click the trash icon to remove
        </p>
      )}
    </div>
  );
};

export default ImageUploader;
