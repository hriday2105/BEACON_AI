import { useRef, useState } from 'react';
import { Upload, X, Film, Image } from 'lucide-react';

interface UploadZoneProps {
  value: string;
  onChange: (dataUrl: string) => void;
  accept?: string;
  mediaType?: 'image' | 'video';
  label?: string;
}

export default function UploadZone({
  value,
  onChange,
  accept = 'image/*',
  mediaType = 'image',
  label = 'Drop file here or click to browse',
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      onChange(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div
      className={`upload-zone rounded relative cursor-pointer select-none min-h-48 flex flex-col items-center justify-center transition-all duration-200 ${isDragging ? 'drag-active' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      data-testid="upload-zone"
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
        data-testid="file-input"
      />

      {value ? (
        <div className="relative w-full h-full flex items-center justify-center p-3">
          {mediaType === 'video' && value ? (
            <video
              src={value}
              className="max-h-48 max-w-full rounded object-contain"
              controls={false}
            />
          ) : (
            <img
              src={value}
              alt="Preview"
              className="max-h-48 max-w-full rounded object-contain"
              data-testid="preview-image"
            />
          )}
          <button
            onClick={clear}
            className="absolute top-2 right-2 p-1 rounded-full flex items-center gap-1 text-xs font-mono-data"
            style={{
              background: 'rgba(10,15,30,0.9)',
              border: '1px solid rgba(0,229,255,0.3)',
              color: '#00e5ff',
            }}
            data-testid="button-change-file"
          >
            <X className="w-3 h-3" />
            CHANGE
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 p-6">
          <div className="relative">
            {mediaType === 'video' ? (
              <Film className="w-10 h-10" style={{ color: 'rgba(0,229,255,0.4)' }} />
            ) : (
              <Image className="w-10 h-10" style={{ color: 'rgba(0,229,255,0.4)' }} />
            )}
            <Upload
              className="w-4 h-4 absolute -bottom-1 -right-1"
              style={{ color: 'rgba(0,229,255,0.6)' }}
            />
          </div>
          <div className="text-center">
            <p className="text-xs font-mono-data text-muted-foreground tracking-wider">{label}</p>
            <p className="text-xs text-muted-foreground/50 mt-1 font-mono-data">
              {mediaType === 'video' ? 'MP4, MOV, WebM supported' : 'PNG, JPG, WebP supported'}
            </p>
          </div>
          {isDragging && (
            <div
              className="text-xs font-mono-data tracking-widest"
              style={{ color: '#00e5ff' }}
            >
              RELEASE TO UPLOAD
            </div>
          )}
        </div>
      )}
    </div>
  );
}
