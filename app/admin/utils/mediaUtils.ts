// Calculate story duration tier based on multi-image carousel count
export const getStoryTierDuration = (imageCount: number): number => {
  if (imageCount <= 3) {
    return 25;
  } else if (imageCount <= 6) {
    return 45;
  } else {
    return 60;
  }
};

// Canvas-based client-side image compression
export const compressImage = (
  file: File,
  maxWidth = 1080,
  maxHeight = 1920,
  quality = 0.75,
  forceJpeg = false
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        if (forceJpeg) {
          resolve(canvas.toDataURL('image/jpeg', quality));
          return;
        }

        let compressed = canvas.toDataURL('image/webp', quality);
        if (!compressed.startsWith('data:image/webp')) {
          compressed = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(compressed);
      };

      img.onerror = (err) => reject(err);
    };

    reader.onerror = (err) => reject(err);
  });
};

// Web Audio API trimmer and WAV encoder
export const trimAndCompressAudio = async (
  file: File,
  maxDurationSeconds: number
): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioCtx = new AudioContextClass();
  const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);

  const duration = Math.min(decodedBuffer.duration, maxDurationSeconds);
  const sampleRate = 22050;
  const numChannels = 1;
  const numFrames = Math.floor(duration * sampleRate);

  const offlineCtx = new OfflineAudioContext(numChannels, numFrames, sampleRate);
  const source = offlineCtx.createBufferSource();
  source.buffer = decodedBuffer;
  source.connect(offlineCtx.destination);
  source.start(0);

  const renderedBuffer = await offlineCtx.startRendering();

  const numOfChan = renderedBuffer.numberOfChannels;
  const length = renderedBuffer.length * numOfChan * 2 + 44;
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);
  let pos = 0;

  const setUint16 = (data: number) => {
    view.setUint16(pos, data, true);
    pos += 2;
  };
  const setUint32 = (data: number) => {
    view.setUint32(pos, data, true);
    pos += 4;
  };

  setUint32(0x46464952);
  setUint32(length - 8);
  setUint32(0x45564157);
  setUint32(0x20746d66);
  setUint32(16);
  setUint16(1);
  setUint16(numOfChan);
  setUint32(sampleRate);
  setUint32(sampleRate * 2 * numOfChan);
  setUint16(numOfChan * 2);
  setUint16(16);
  setUint32(0x61746164);
  setUint32(length - pos - 4);

  const channels: Float32Array[] = [];
  for (let i = 0; i < numOfChan; i++) {
    channels.push(renderedBuffer.getChannelData(i));
  }

  let offset = 0;
  while (pos < length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  const blob = new Blob([view.buffer], { type: 'audio/wav' });

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};