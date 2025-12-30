import React from 'react';
import { QueueItem, FileStatus } from '@/types';
import { formatBytes } from '@/lib/compressPdf';
import { Cpu, Loader2, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface ProcessingStateProps {
  queue: QueueItem[];
  targetSizeKB: number;
}

export const ProcessingState: React.FC<ProcessingStateProps> = ({ queue, targetSizeKB }) => {
  return (
    <div className="flex flex-col w-full h-full items-center">
         <div className="flex flex-col items-center justify-center py-8">
            <div className="relative w-16 h-16 mb-6">
                <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Cpu className="w-6 h-6 text-primary-400 animate-pulse" />
                </div>
            </div>
            <h3 className="font-bold text-white text-lg mb-1">Crunching Data...</h3>
            <p className="text-sm text-slate-400">Optimizing for {targetSizeKB}KB target</p>
        </div>
        
        <div className="w-full flex-grow overflow-y-auto max-h-[350px] space-y-3 pr-2 custom-scrollbar">
             {queue.map(item => (
                <div key={item.id} className={`bg-slate-800/40 border rounded-xl p-3 flex items-center gap-3 transition-all ${
                    item.status === 'processing' ? 'border-primary-500/50 bg-primary-500/5' : 'border-white/5'
                }`}>
                    {getStatusIcon(item.status)}
                    <div className="flex-grow min-w-0">
                        <p className="font-medium text-slate-200 truncate text-sm">{item.file.name}</p>
                        <div className="flex items-center gap-2">
                             <span className="text-xs text-slate-500">{formatBytes(item.originalSize)}</span>
                             {item.status === 'processing' && <span className="text-xs text-primary-400 animate-pulse">Processing...</span>}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

const getStatusIcon = (status: FileStatus) => {
    switch(status) {
        case 'pending': return <div className="w-5 h-5 rounded-full border-2 border-slate-600"></div>;
        case 'processing': return <Loader2 className="w-5 h-5 text-primary-400 animate-spin" />;
        case 'done': return <CheckCircle className="w-5 h-5 text-emerald-400" />;
        case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-400" />;
        case 'error': return <XCircle className="w-5 h-5 text-red-400" />;
        default: return <div className="w-5 h-5" />;
    }
};