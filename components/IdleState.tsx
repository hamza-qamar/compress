import React, { useRef } from 'react';
import { UploadCloud } from 'lucide-react';

interface IdleStateProps {
  onFilesSelected: (files: FileList) => void;
}

export const IdleState: React.FC<IdleStateProps> = ({ onFilesSelected }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  return (
    <div 
      className="flex flex-col items-center justify-center flex-grow text-center h-full animate-[fadeIn_0.5s_ease-out]"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
        <input 
          type="file" 
          ref={inputRef}
          className="hidden" 
          accept=".pdf,.jpg,.jpeg,.png,.webp" 
          multiple 
          onChange={(e) => e.target.files && onFilesSelected(e.target.files)}
        />
        
        <div 
          className="group cursor-pointer relative mb-8" 
          onClick={() => inputRef.current?.click()}
        >
            <div className="absolute -inset-4 bg-gradient-to-r from-primary-600 to-accent-purple rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative w-28 h-28 bg-slate-800 rounded-3xl flex items-center justify-center border border-slate-700 group-hover:border-primary-500/50 group-hover:scale-105 transition-all duration-300 shadow-2xl">
                <UploadCloud className="w-12 h-12 text-primary-400 group-hover:text-white transition-colors" />
            </div>
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-3">Drop Files Here</h3>
        <p className="text-slate-400 text-sm mb-8 max-w-xs mx-auto leading-relaxed">
            Support for PDF, JPG, PNG & WebP.<br/>
            <span className="text-primary-400/80">Batch processing enabled</span>
        </p>
        
        <button 
          onClick={() => inputRef.current?.click()}
          className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-semibold py-4 px-10 rounded-xl shadow-lg shadow-primary-900/50 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
            Select Files
        </button>
    </div>
  );
};