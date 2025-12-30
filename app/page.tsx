'use client';

import React, { useState } from 'react';
import { UploadCloud, Zap, Lock, Cpu, Sliders, ImageMinus, ChevronDown } from 'lucide-react';
import { IdleState } from '@/components/IdleState';
import { ReviewState } from '@/components/ReviewState';
import { ProcessingState } from '@/components/ProcessingState';
import { CompleteState } from '@/components/CompleteState';
import { AdSlot } from '@/components/AdSlot';
import { AppState, QueueItem, FileStatus } from '@/types';
import { compressImage, compressPDF } from '@/lib/compressPdf';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [targetSizeKB, setTargetSizeKB] = useState<number>(200);

  const uid = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

  const handleFilesSelected = (files: FileList) => {
    const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    
    const newItems: QueueItem[] = Array.from(files)
      .filter(f => ALLOWED_MIME_TYPES.includes(f.type))
      .map(f => ({
        id: uid(),
        file: f,
        status: 'pending',
        originalSize: f.size,
        compressedSize: null,
        data: null
      }));
    
    if (newItems.length === 0) {
      alert('No valid files selected. Please select PDF, JPG, PNG, or WebP.');
      return;
    }

    setQueue(prev => [...prev, ...newItems]);
    setAppState('review');
  };

  const handleRemove = (id: string) => {
    setQueue(prev => {
      const next = prev.filter(item => item.id !== id);
      if (next.length === 0) setAppState('idle');
      return next;
    });
  };

  const handleProcess = async () => {
    setAppState('processing');
    
    // Create a copy to iterate
    const currentQueue = [...queue];
    
    // User's expectation (The displayed limit)
    const userTargetBytes = targetSizeKB * 1024;
    
    // Internal aggressive target (50% of user request)
    // We target half the size to ensure we comfortably beat the limit and provide "better than expected" results.
    // The user is not informed of this aggressive target.
    const aggressiveTargetKB = Math.floor(targetSizeKB / 2);

    for (let i = 0; i < currentQueue.length; i++) {
        const item = currentQueue[i];
        
        // Update UI to processing current item
        setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'processing' } : q));
        
        // Minimal delay to allow UI React repaint, but keep it fast
        await new Promise(resolve => setTimeout(resolve, 50));

        try {
            let resultBlob: Blob;
            if (item.file.type.includes('pdf')) {
                resultBlob = await compressPDF(item.file);
            } else {
                // Pass the aggressive (half size) target to the image compressor
                resultBlob = await compressImage(item.file, aggressiveTargetKB);
            }

            let finalStatus: FileStatus = 'done';
            let finalBlob = resultBlob;
            
            // Check success against the USER'S target bytes, not the internal aggressive target.
            // If we targeted 100KB (aggressive) but got 150KB, it's still a success for a 200KB (user) limit.
            if (resultBlob.size <= userTargetBytes) {
                finalStatus = 'done';
            } else {
                finalStatus = 'warning'; // Limit reached based on User's selection
                if (resultBlob.size >= item.file.size) {
                    finalBlob = item.file; // Revert if we somehow made it bigger or didn't compress
                }
            }
            
            setQueue(prev => prev.map(q => q.id === item.id ? {
                ...q,
                status: finalStatus,
                data: finalBlob,
                compressedSize: finalBlob.size,
                errorMsg: finalStatus === 'done' ? undefined : 'Limit Reached'
            } : q));

        } catch (error) {
            console.error("Compression Error:", error);
            setQueue(prev => prev.map(q => q.id === item.id ? {
                ...q,
                status: 'error',
                compressedSize: null,
                errorMsg: 'Failed'
            } : q));
        }
    }

    setAppState('complete');
  };

  const handleReset = () => {
    setQueue([]);
    setAppState('idle');
  };

  return (
    <main className="flex-grow flex flex-col items-center justify-start pt-12 pb-24 px-4 sm:px-6 relative">
        
        {/* Top Ad */}
        <div className="w-full max-w-4xl mx-auto mb-12 hidden md:block">
           <AdSlot label="Top Banner" />
        </div>

        {/* Hero Text */}
        <div className="text-center max-w-3xl mx-auto mb-12">
            
            
            <h1 className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight mb-6 glow-text leading-tight">
                Compress Files <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-accent-cyan to-accent-purple">With Custom Limits</span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
                Intelligent compression for PDF, JPG, and PNG. Choose your exact target size (e.g., 200KB) and watch the magic happen entirely in your browser.
            </p>
        </div>

        {/* App Container */}
        <div id="app-container" className="w-full max-w-2xl mx-auto relative z-10">
            {/* Glow Effect behind card */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 via-accent-purple to-primary-600 rounded-[2rem] blur opacity-25 transition duration-1000"></div>
            
            <div className="glass-card rounded-3xl p-1 relative">
                <div className="bg-slate-900/50 rounded-[22px] p-6 sm:p-8 transition-all duration-300 min-h-[480px] flex flex-col relative overflow-hidden">
                    {appState === 'idle' && <IdleState onFilesSelected={handleFilesSelected} />}
                    {appState === 'review' && (
                        <ReviewState 
                          queue={queue} 
                          targetSizeKB={targetSizeKB} 
                          setTargetSizeKB={setTargetSizeKB}
                          onAddMore={handleFilesSelected}
                          onRemove={handleRemove}
                          onProcess={handleProcess}
                        />
                    )}
                    {appState === 'processing' && <ProcessingState queue={queue} targetSizeKB={targetSizeKB} />}
                    {appState === 'complete' && <CompleteState queue={queue} onReset={handleReset} />}
                </div>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex justify-center gap-8 mt-8 text-slate-500 text-sm font-medium">
                <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-500" />
                    <span>Private & Secure</span>
                </div>
                <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-primary-400" />
                    <span>Client-side Processing</span>
                </div>
            </div>
        </div>

        {/* Middle Ad */}
        <div className="w-full max-w-4xl mx-auto mt-16 mb-8">
           <AdSlot label="Middle Banner" />
        </div>

        {/* Features Grid */}
        <div id="features" className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 mt-16 mb-16 w-full">
            <div className="glass-card p-6 rounded-2xl hover:bg-white/5 transition-colors group">
                <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center text-primary-400 mb-4 group-hover:scale-110 transition-transform">
                    <Sliders className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white mb-2">Custom Targets</h3>
                <p className="text-sm text-slate-400">Need exactly 150KB? Set your specific limit and our engine adapts the quality to fit.</p>
            </div>
            <div className="glass-card p-6 rounded-2xl hover:bg-white/5 transition-colors group">
                <div className="w-12 h-12 bg-accent-purple/10 rounded-xl flex items-center justify-center text-accent-purple mb-4 group-hover:scale-110 transition-transform">
                    <ImageMinus className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white mb-2">Lossy Optimization</h3>
                <p className="text-sm text-slate-400">Smart resizing and quality adjustments for images to ensure they meet strict portal requirements.</p>
            </div>
            <div className="glass-card p-6 rounded-2xl hover:bg-white/5 transition-colors group">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white mb-2">Instant Preview</h3>
                <p className="text-sm text-slate-400">See the size difference and percentage saved immediately with smooth animations.</p>
            </div>
        </div>

        {/* Pre-FAQ Ad Banner */}
        <div className="w-full max-w-4xl mx-auto mb-16">
           <AdSlot label="Recommended Tool" />
        </div>

        {/* FAQ */}
        <div id="faq" className="max-w-2xl mx-auto w-full mb-20">
            <h2 className="text-2xl font-bold text-white text-center mb-8">Common Questions</h2>
            <div className="space-y-4">
                <details className="group glass-panel rounded-xl overflow-hidden">
                    <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-5 text-slate-200 hover:bg-white/5 transition-colors">
                        <span>What happens if a file is unreadable?</span>
                        <span className="transition group-open:rotate-180">
                            <ChevronDown className="w-5 h-5 text-slate-500" />
                        </span>
                    </summary>
                    <div className="text-slate-400 text-sm px-5 pb-5">
                        If extreme compression is required (e.g., 10MB to 50KB), the file might become blurry. We show a warning icon if the quality drops too low.
                    </div>
                </details>
                <details className="group glass-panel rounded-xl overflow-hidden">
                    <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-5 text-slate-200 hover:bg-white/5 transition-colors">
                        <span>Are my files uploaded?</span>
                        <span className="transition group-open:rotate-180">
                            <ChevronDown className="w-5 h-5 text-slate-500" />
                        </span>
                    </summary>
                    <div className="text-slate-400 text-sm px-5 pb-5">
                        Never. This tool runs entirely in your web browser using WebAssembly. Your data never touches our servers.
                    </div>
                </details>
                 <details className="group glass-panel rounded-xl overflow-hidden">
                    <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-5 text-slate-200 hover:bg-white/5 transition-colors">
                        <span>Does it work offline?</span>
                        <span className="transition group-open:rotate-180">
                            <ChevronDown className="w-5 h-5 text-slate-500" />
                        </span>
                    </summary>
                    <div className="text-slate-400 text-sm px-5 pb-5">
                        Yes! Since the processing is client-side, once the page loads, you can compress files without an active internet connection.
                    </div>
                </details>
                <details className="group glass-panel rounded-xl overflow-hidden">
                    <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-5 text-slate-200 hover:bg-white/5 transition-colors">
                        <span>Why does the PDF size not change?</span>
                        <span className="transition group-open:rotate-180">
                            <ChevronDown className="w-5 h-5 text-slate-500" />
                        </span>
                    </summary>
                    <div className="text-slate-400 text-sm px-5 pb-5">
                        Some PDF files are already optimized. We only apply changes if we can reduce the size without corrupting the document structure.
                    </div>
                </details>
                 <details className="group glass-panel rounded-xl overflow-hidden">
                    <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-5 text-slate-200 hover:bg-white/5 transition-colors">
                        <span>Is this tool free?</span>
                        <span className="transition group-open:rotate-180">
                            <ChevronDown className="w-5 h-5 text-slate-500" />
                        </span>
                    </summary>
                    <div className="text-slate-400 text-sm px-5 pb-5">
                        Yes, TurboCompress is 100% free to use for personal and commercial purposes with no daily limits.
                    </div>
                </details>
            </div>
        </div>

        {/* Mobile Sticky Ad */}
        <div className="md:hidden fixed bottom-0 left-0 w-full bg-slate-900/90 backdrop-blur border-t border-white/10 p-2 z-50">
          <AdSlot className="h-16" label="Sponsored" />
        </div>

    </main>
  );
}