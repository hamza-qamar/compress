import { PDFDocument } from 'pdf-lib';

export const formatBytes = (bytes: number, decimals = 1): string => {
  if (bytes === 0) return '0 B';
  if (typeof bytes !== 'number' || Number.isNaN(bytes) || !Number.isFinite(bytes)) {
    return '0 B';
  }

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  
  const absBytes = Math.abs(bytes);
  const i = Math.floor(Math.log(absBytes) / Math.log(k));

  if (i < 0) return (bytes < 0 ? '-' : '') + absBytes + ' B';
  if (i >= sizes.length) {
    const val = absBytes / Math.pow(k, sizes.length - 1);
    return (bytes < 0 ? '-' : '') + parseFloat(val.toFixed(dm)) + ' ' + sizes[sizes.length - 1];
  }

  const val = absBytes / Math.pow(k, i);
  return (bytes < 0 ? '-' : '') + parseFloat(val.toFixed(dm)) + ' ' + sizes[i];
};

export const compressImage = async (file: File, targetSizeKB: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const targetBytes = targetSizeKB * 1024;

        // **FAST COMPRESSION STRATEGY**
        // Instead of multiple retries which takes seconds, we estimate strictly once.
        
        let scale = 1;
        // If file is > 2x target, we MUST resize to save pixels. 
        // JPG encoding efficiency is roughly 10-20% of raw RGBA data, but heavily depends on content.
        // We use a square root approximation for scaling dimension.
        if (file.size > targetBytes) {
           // Target Ratio: e.g. 5MB file, 200KB target = 25x difference.
           // We need to reduce pixel count significantly.
           const ratio = targetBytes / file.size;
           // We'll be conservative and assume we can compress 2x better than the size ratio suggests via JPEG algo
           scale = Math.sqrt(ratio * 2.5); 
        }

        // Clamp scale to keep usable quality
        if (scale > 0.9) scale = 0.9; 
        if (scale < 0.2) scale = 0.2; // Don't go below 20% size

        width = Math.floor(width * scale);
        height = Math.floor(height * scale);

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(file);

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // First attempt: Standard Web Quality
        canvas.toBlob((blob1) => {
            if (!blob1) return resolve(file);

            if (blob1.size <= targetBytes) {
                resolve(blob1);
            } else {
                // Second & Final Attempt: Aggressive drop
                // Calculate exactly how much we missed by
                const missRatio = targetBytes / blob1.size;
                // Set quality based on miss ratio (e.g. if we need 50% size, try 0.4 quality)
                const nextQ = Math.max(0.1, missRatio * 0.9);
                
                canvas.toBlob((blob2) => {
                     // Return the smaller of the two, or the best we got
                     resolve(blob2 || blob1);
                }, 'image/jpeg', nextQ);
            }
        }, 'image/jpeg', 0.7);
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

export const compressPDF = async (file: File): Promise<Blob> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    
    // PDF-Lib optimization
    const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
    const newBlob = new Blob([pdfBytes], { type: 'application/pdf' });

    if (newBlob.size >= file.size) {
        return file;
    }

    return newBlob;
  } catch (e) {
    console.error('PDF Compression failed', e);
    return file;
  }
};