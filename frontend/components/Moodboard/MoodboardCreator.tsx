
import React, { useState, useRef } from 'react';
import { X, Upload, Save, ChevronLeft, Plus, Trash2, Loader2 } from 'lucide-react';
import { Moodboard } from '../../types';

interface MoodboardCreatorProps {
  onSave: (moodboard: Moodboard) => void;
  onCancel: () => void;
}

const MoodboardCreator: React.FC<MoodboardCreatorProps> = ({ onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        // Compress to 60% quality JPEG to save significant space
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsProcessing(true);
    const newImages: string[] = [];

    for (const file of Array.from(files)) {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const compressed = await compressImage(base64);
      newImages.push(compressed);
    }

    setImages(prev => [...prev, ...newImages]);
    setIsProcessing(false);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!name.trim() || images.length === 0) return;
    
    const newMoodboard: Moodboard = {
      id: Date.now().toString(),
      name: name.trim(),
      images: images,
      timestamp: Date.now()
    };
    
    onSave(newMoodboard);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <button onClick={onCancel} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" /> Cancel
        </button>
        <button 
          onClick={handleSave}
          disabled={!name.trim() || images.length === 0 || isProcessing}
          className="flex items-center gap-2 px-6 py-2 bg-rose-500 disabled:opacity-50 text-white font-black rounded-xl shadow-lg shadow-rose-900/20 transition-all"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
      </div>

      <div className="glass rounded-[2.5rem] p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Moodboard Name</label>
          <input 
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Summer Vibes, Calm Space..."
            className="w-full bg-slate-900/50 border border-white/5 rounded-2xl p-4 text-white focus:ring-2 focus:ring-rose-500 outline-none transition-all"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Images ({images.length})</label>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="flex items-center gap-2 text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add Photos
            </button>
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            multiple 
            accept="image/*" 
            className="hidden" 
          />

          {images.length === 0 ? (
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="w-full aspect-video bg-slate-900/50 border-2 border-dashed border-white/5 rounded-[2rem] flex flex-col items-center justify-center gap-3 text-slate-600 hover:text-slate-400 hover:border-white/10 transition-all"
            >
              {isProcessing ? <Loader2 className="w-8 h-8 animate-spin" /> : <Upload className="w-8 h-8" />}
              <span className="text-xs font-bold uppercase tracking-widest">
                {isProcessing ? 'Processing...' : 'Upload Images'}
              </span>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 p-1.5 bg-slate-950/80 text-rose-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {!isProcessing && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square bg-slate-900/50 border-2 border-dashed border-white/5 rounded-2xl flex items-center justify-center text-slate-600 hover:text-slate-400 transition-all"
                >
                  <Plus className="w-6 h-6" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoodboardCreator;
