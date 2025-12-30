import React from 'react';
import { QueueItem, FileStatus } from '@/types';
import { formatBytes } from '@/lib/compressPdf';
import { PlusCircle, Info, FileText, Image as ImageIcon, X, Minimize2 } from 'lucide-react';

interface ReviewStateProps {
  queue: QueueItem[];
  targetSizeKB: number;
  setTargetSizeKB: (size: number) => void;
  onAddMore: (files: FileList) => void;
  onRemove: (id: string) => void;
  onProcess: () => void;
}

export const ReviewState: React.FC<ReviewStateProps> = ({ 
  queue, 
  targetSizeKB, 
  setTargetSizeKB, 
  onAddMore, 
  onRemove, 
  onProcess 
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col w-full h-full animate-[fadeIn_0.3s_ease-out]">
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          accept=".pdf,.jpg,.jpeg,.png,.webp" 
          multiple 
          onChange={(e) => e.target.files && onAddMore(e.target.files)}
        />

        {/* Header */}
        <div className="flex justify-between items-end mb-6 pb-4 border-b border-white/5">
            <div>
                <h3 className="font-bold text-xl text-white">Review Queue</h3>
                <p className="text-sm text-slate-500">{queue.length} file(s) selected</p>
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-primary-400 hover:text-white font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
                <PlusCircle className="w-4 h-4" /> Add More
            </button>
        </div>

        {/* Target Controls */}
        <div className="bg-slate-800/50 p-5 rounded-2xl border border-white/5 mb-6 backdrop-blur-sm">
            <label className="block text-sm font-medium text-slate-300 mb-3 flex justify-between">
                <span>Target File Size</span>
                <span className="text-accent-cyan font-bold">{targetSizeKB} KB</span>
            </label>
            
            <div className="grid grid-cols-4 gap-2 mb-4">
                {[100, 200, 500].map(size => (
                  <button 
                    key={size}
                    onClick={() => setTargetSizeKB(size)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                      targetSizeKB === size 
                      ? 'bg-primary-600 text-white border-primary-500 shadow-md shadow-primary-900/20' 
                      : 'border-white/10 text-slate-400 bg-slate-900 hover:border-primary-500/50 hover:bg-primary-500/10'
                    }`}
                  >
                    {size}KB
                  </button>
                ))}
                <div className="relative">
                    <input 
                      type="number" 
                      placeholder="Custom" 
                      className={`w-full px-3 py-2 rounded-lg bg-slate-900 border text-xs text-white focus:outline-none focus:border-primary-500 text-center ${
                        ![100, 200, 500].includes(targetSizeKB) ? 'border-primary-500 text-primary-400' : 'border-white/10'
                      }`}
                      value={![100, 200, 500].includes(targetSizeKB) ? targetSizeKB : ''}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (val > 0) setTargetSizeKB(val);
                      }}
                      min="10" 
                      max="5000"
                    />
                </div>
            </div>
            
            <p className="text-[10px] text-slate-500 flex items-center gap-1.5">
                <Info className="w-3 h-3" />
                <span>Lower size = lower quality. We'll try our best to hit this target.</span>
            </p>
        </div>

        {/* File List */}
        <div className="flex-grow overflow-y-auto max-h-[300px] space-y-3 mb-6 pr-2 custom-scrollbar">
            {queue.map(item => (
                <div key={item.id} className="bg-slate-800/40 border border-white/5 rounded-xl p-3 flex items-center gap-3 group hover:border-primary-500/30 transition-colors">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-inner ${item.file.type.includes('pdf') ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                        {item.file.type.includes('pdf') ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                    </div>
                    <div className="flex-grow min-w-0">
                        <p className="font-medium text-slate-200 truncate text-sm">{item.file.name}</p>
                        <p className="text-xs text-slate-500">{formatBytes(item.originalSize)}</p>
                    </div>
                    <button 
                      onClick={() => onRemove(item.id)}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>

        <button 
          onClick={onProcess}
          className="w-full group relative overflow-hidden bg-primary-600 hover:bg-primary-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-primary-900/50 transition-all active:scale-[0.98]"
        >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            <div className="flex items-center justify-center gap-2">
                <Minimize2 className="w-5 h-5" />
                <span>Compress Files</span>
            </div>
        </button>
    </div>
  );
};