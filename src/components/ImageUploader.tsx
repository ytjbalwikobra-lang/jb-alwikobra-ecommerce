import React, { useRef } from 'react';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  onUpload: (files: File[], onProgress?: (done: number, total: number) => void) => Promise<string[]> | void;
  max?: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ images, onChange, onUpload, max = 15 }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dragIndex = useRef<number | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState<{done:number,total:number}>({done:0,total:0});

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const arr = Array.from(files).slice(0, Math.max(0, max - images.length));
    setUploading(true);
    setProgress({done:0,total:arr.length});
    const maybe = onUpload(arr, (done,total)=>setProgress({done,total}));
    let urls: string[] = [];
    if (maybe && typeof (maybe as any).then === 'function') {
      urls = await (maybe as Promise<string[]>);
    }
    if (urls.length) onChange([...images, ...urls]);
    setUploading(false);
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    await handleFiles(e.dataTransfer.files);
  };

  const onDragStart = (idx: number) => (e: React.DragEvent) => {
    dragIndex.current = idx;
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (idx: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDropReorder = (idx: number) => (e: React.DragEvent) => {
    e.preventDefault();
    const from = dragIndex.current;
    if (from === null || from === idx) return;
    const next = images.slice();
    const [m] = next.splice(from, 1);
    next.splice(idx, 0, m);
    dragIndex.current = null;
    onChange(next);
  };

  const removeAt = (idx: number) => {
    const next = images.slice();
    next.splice(idx, 1);
    onChange(next);
  };

  return (
    <div>
      <div
        className="border-2 border-dashed border-pink-500/40 rounded-xl p-6 text-center bg-black/40 hover:bg-black/30 transition-colors"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        <p className="text-gray-300 mb-3">Tarik & lepas gambar di sini atau</p>
        <button
          type="button"
          className="px-4 py-2 rounded-lg bg-pink-600 text-white hover:bg-pink-700"
          onClick={() => inputRef.current?.click()}
        >
          Pilih Gambar
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <p className="text-xs text-gray-500 mt-2">Maks {max} gambar</p>
        {uploading ? (
          <div className="mt-3 text-sm text-gray-300">Mengunggah {progress.done}/{progress.total}…</div>
        ) : null}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
          {images.map((src, idx) => (
            <div
              key={src + idx}
              className="relative aspect-square rounded-lg overflow-hidden bg-black border border-pink-500/30"
              draggable
              onDragStart={onDragStart(idx)}
              onDragOver={onDragOver(idx)}
              onDrop={onDropReorder(idx)}
              title="Drag untuk urutkan"
            >
              <img src={src} alt={`image-${idx}`} className="w-full h-full object-cover" />
              <button
                type="button"
                className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded"
                onClick={() => removeAt(idx)}
              >
                Hapus
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
