import React, { useEffect, useState } from 'react';
import { QueueItem } from '@/types';
import { formatBytes } from '@/lib/compressPdf';
import JSZip from 'jszip';
import { CheckCircle2, AlertTriangle, XCircle, FileText, Image as ImageIcon, ArrowRight, Download, RotateCcw, Archive, Loader2 } from 'lucide-react';

interface CompleteStateProps {
  queue: QueueItem[];
  onReset: () => void;
}

export const CompleteState: React.FC<CompleteStateProps> = ({ queue, onReset }) => {
  const [displaySaved, setDisplaySaved] = useState<number>(0);
  const [displayTotal, setDisplayTotal] = useState<number>(0);
  const [isZipping, setIsZipping] = useState(false);
  
  // Calculate totals safely
  const totalOriginal = queue.reduce((acc, i) => acc + (typeof i.originalSize === 'number' ? i.originalSize : 0), 0);
  
  const totalCompressed = queue.reduce((acc, i) => {
    const size = typeof i.compressedSize === 'number' ? i.compressedSize : (i.originalSize || 0);
    return acc + size;
  }, 0);
  
  const rawSaved = totalOriginal - totalCompressed;
  const totalSaved = Math.max(0, rawSaved);
  
  const totalPercent = totalOriginal > 0 ? Math.round((totalSaved / totalOriginal) * 100) : 0;

  useEffect(() => {
    if (totalSaved <= 0 && totalCompressed <= 0) {
        setDisplaySaved(0);
        setDisplayTotal(0);
        return;
    }

    let frameId: number;
    const duration = 1500;
    const startTime = performance.now();
    
    const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3); 
        
        const currentSaved = Math.floor(ease * totalSaved);
        const currentTotal = Math.floor(ease * totalCompressed);
        
        setDisplaySaved(Number.isNaN(currentSaved) ? 0 : currentSaved);
        setDisplayTotal(Number.isNaN(currentTotal) ? 0 : currentTotal);
        
        if (progress < 1) {
            frameId = requestAnimationFrame(tick);
        }
    };
    
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [totalSaved, totalCompressed]);

  const handleDownload = (item: QueueItem) => {
    const blobToDownload = item.data || item.file;
    const url = URL.createObjectURL(blobToDownload);
    const a = document.createElement('a');
    a.href = url;
    
    const originalName = item.file.name;
    const lastDotIndex = originalName.lastIndexOf('.');
    const baseName = lastDotIndex !== -1 ? originalName.substring(0, lastDotIndex) : originalName;
    const ext = lastDotIndex !== -1 ? originalName.substring(lastDotIndex) : '';
    
    a.download = `${baseName}-min${ext}`;
    a.click();
    
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const handleZipDownload = async () => {
    if (isZipping) return;
    setIsZipping(true);
    
    try {
        const zip = new JSZip();
        let count = 0;

        queue.forEach((item) => {
            // Only add successfully processed or warning items
            if (item.status === 'done' || item.status === 'warning') {
                const blob = item.data || item.file;
                
                // Name Formatting
                const originalName = item.file.name;
                const lastDotIndex = originalName.lastIndexOf('.');
                const baseName = lastDotIndex !== -1 ? originalName.substring(0, lastDotIndex) : originalName;
                const ext = lastDotIndex !== -1 ? originalName.substring(lastDotIndex) : '';
                const filename = `${baseName}-min${ext}`;
                
                zip.file(filename, blob);
                count++;
            }
        });

        if (count === 0) {
            alert("No compressed files available to zip.");
            setIsZipping(false);
            return;
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `compressed_files_${Date.now()}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 100);

    } catch (err) {
        console.error("Zip failed", err);
        alert("Failed to create ZIP file.");
    } finally {
        setIsZipping(false);
    }
  };

  const hasUnreadableFiles = queue.some(item => item.isUnreadable === true);

  return (
    <div className="flex flex-col w-full h-full animate-[fadeIn_0.5s_ease-out]">
        {/* Unreadable Files Warning */}
        {hasUnreadableFiles && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <h3 className="font-semibold text-red-400 mb-1">Warning: Unreadable Files Detected</h3>
                    <p className="text-sm text-slate-400">
                        Some compressed files may be corrupted or unreadable due to extreme compression. Please review and consider using a less aggressive size target.
                    </p>
                </div>
            </div>
        )}

        {/* Summary Card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 border border-white/10 mb-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            
            <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center gap-8">
                    <div>
                        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Total Saved</p>
                        <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-baseline gap-2">
                            <span>{formatBytes(displaySaved)}</span>
                            {totalSaved > 0 && (
                                <span className="text-sm font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">-{totalPercent}%</span>
                            )}
                        </h2>
                    </div>
                    
                    {/* Divider for larger screens */}
                    <div className="hidden sm:block w-px h-10 bg-white/10"></div>

                    <div className="hidden sm:block">
                         <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">New Total Size</p>
                         <h2 className="text-2xl sm:text-3xl font-bold text-white">{formatBytes(displayTotal)}</h2>
                    </div>
                </div>

                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-6 h-6" />
                </div>
            </div>

            {/* Mobile Only: New Total Size row */}
             <div className="sm:hidden mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                 <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">New Total Size</p>
                 <h2 className="text-xl font-bold text-white">{formatBytes(displayTotal)}</h2>
            </div>
        </div>

        {/* Result List */}
        <div className="flex-grow overflow-y-auto max-h-[300px] space-y-3 mb-6 pr-2 custom-scrollbar">
            {queue.map(item => {
                const isSuccess = item.status === 'done';
                const isWarning = item.status === 'warning';
                const isUnreadable = item.isUnreadable === true;
                
                const currentOriginal = item.originalSize || 0;
                const currentCompressed = typeof item.compressedSize === 'number' ? item.compressedSize : currentOriginal;
                const savedBytes = currentOriginal - currentCompressed;
                const savedPercent = currentOriginal > 0 ? Math.round((savedBytes / currentOriginal) * 100) : 0;
                const displayPercent = Math.max(0, savedPercent);
                
                return (
                <div key={item.id} className={`bg-slate-800/40 border rounded-xl p-3 flex items-center gap-3 group relative overflow-hidden ${
                    isUnreadable ? 'border-red-500/40' : (isWarning ? 'border-amber-500/30' : (isSuccess ? 'border-emerald-500/20' : 'border-red-500/30'))
                }`}>
                    {/* Progress Bar Background */}
                    {(isSuccess || isWarning) && displayPercent > 0 && (
                        <div 
                            className="absolute bottom-0 left-0 h-0.5 bg-emerald-500/50 transition-all duration-1000" 
                            style={{ width: `${displayPercent}%` }}
                        ></div>
                    )}
                    
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isUnreadable ? 'bg-red-500/20 text-red-400' : (isWarning ? 'bg-amber-500/10 text-amber-500' : (isSuccess ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'))
                    }`}>
                        {isUnreadable ? <AlertTriangle className="w-5 h-5" /> : (isWarning ? <AlertTriangle className="w-5 h-5" /> : (isSuccess ? (item.file.type.includes('pdf') ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />) : <XCircle className="w-5 h-5" />))}
                    </div>
                    
                    <div className="flex-grow min-w-0 z-10">
                        <div className="flex justify-between items-center mb-0.5">
                            <p className="font-medium text-slate-200 truncate text-sm max-w-[140px]">{item.file.name}</p>
                            {(isSuccess || isWarning) ? (
                                <span className={`text-xs font-bold ${isWarning ? 'text-amber-400' : 'text-emerald-400'}`}>
                                    {formatBytes(currentCompressed)}
                                </span>
                            ) : (
                                <span className="text-xs text-red-400">Failed</span>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                            <span className="line-through opacity-70">{formatBytes(currentOriginal)}</span>
                            {(isSuccess || isWarning) ? (
                                <>
                                    <ArrowRight className="w-3 h-3 text-slate-600" />
                                    <span className={savedBytes > 0 ? "text-emerald-500" : "text-slate-400"}>
                                        {savedBytes > 0 ? `-${displayPercent}%` : '0%'}
                                    </span>
                                    {isUnreadable && <span className="text-red-400 ml-1 font-semibold">⚠️ Unreadable</span>}
                                    {isWarning && !isUnreadable && <span className="text-amber-500 ml-1">(Limit Reached)</span>}
                                </>
                            ) : (
                                <span>{item.errorMsg || 'Error'}</span>
                            )}
                        </div>
                    </div>
                    
                    {(isSuccess || isWarning) && (
                        <button 
                            onClick={() => handleDownload(item)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all shadow-lg z-10 ${
                                isUnreadable 
                                    ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/30' 
                                    : 'bg-slate-700 hover:bg-primary-600 text-slate-300 hover:text-white'
                            }`}
                            title={isUnreadable ? "Download (File may be unreadable)" : "Download"}
                        >
                            <Download className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )})}
        </div>

        <div className="grid grid-cols-2 gap-3 mt-auto">
             <button 
                onClick={onReset}
                className="flex justify-center items-center gap-2 bg-slate-800 border border-slate-700 text-slate-300 font-medium py-3 px-4 rounded-xl hover:bg-slate-700 transition-colors"
            >
                <RotateCcw className="w-4 h-4" /> Start Over
            </button>
            <button 
                onClick={handleZipDownload}
                disabled={isZipping || queue.filter(i => i.status === 'done' || i.status === 'warning').length === 0}
                className={`flex justify-center items-center gap-2 font-medium py-3 px-4 rounded-xl border transition-all ${
                    isZipping 
                    ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-wait' 
                    : 'bg-primary-600 border-primary-500 text-white hover:bg-primary-500 shadow-lg shadow-primary-900/30 active:scale-[0.98]'
                }`}
            >
                 {isZipping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />} 
                 {isZipping ? 'Zipping...' : 'Download ZIP'}
            </button>
        </div>
    </div>
  );
};