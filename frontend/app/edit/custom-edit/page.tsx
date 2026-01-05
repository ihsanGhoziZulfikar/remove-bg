'use client';

import React, { useState, useRef } from 'react';
import { 
  Undo, Redo, RotateCw, Lightbulb, ChevronDown, 
  CloudUpload, Plus, Minus, Check, X, 
  Crop, FlipHorizontal, FlipVertical // Icon baru diimport
} from 'lucide-react';

import Navbar from '../../components/Header';
import Footer from '../../components/Footer';

export default function CustomEditPage() {
  const [activeTab, setActiveTab] = useState<'background' | 'adjust'>('background');
  
  // --- State Logic Background ---
  const [bgType, setBgType] = useState<'transparent' | 'color' | 'scene' | 'custom'>('transparent');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedScene, setSelectedScene] = useState<string | null>(null);
  
  // --- State Custom Upload ---
  const [customBg, setCustomBg] = useState<string | null>(null);
  const [customBgName, setCustomBgName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- State Logic Adjust / Cropping (BARU) ---
  const [isCropping, setIsCropping] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState<string | null>(null);

  // --- Handlers Background ---
  const handleFileClick = () => fileInputRef.current?.click();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setCustomBg(imageUrl);
      setCustomBgName(file.name);
      setBgType('custom');
    }
  };

  const handleRemoveCustomBg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomBg(null);
    setBgType('transparent');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setBgType('color');
  };

  const handleSceneSelect = (sceneUrl: string) => {
    setSelectedScene(sceneUrl);
    setBgType('scene');
  };

  const getCanvasStyle = () => {
    if (bgType === 'color' && selectedColor) return { backgroundColor: selectedColor };
    if (bgType === 'scene' && selectedScene) return { backgroundImage: `url(${selectedScene})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    if (bgType === 'custom' && customBg) return { backgroundImage: `url(${customBg})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    return {};
  };

  // --- Handlers Adjust (BARU) ---
  const startCropping = (ratio: string) => {
    setSelectedRatio(ratio);
    setIsCropping(true);
  };

  const applyCrop = () => {
    // Disini logika pemotongan gambar yang sebenarnya akan dijalankan.
    // Untuk tampilan UI, kita hanya menutup modal.
    setIsCropping(false);
    setActiveTab('adjust'); // Kembali ke tab adjust
  };

  // Data Mockup
  const solidColors = [
    { id: 'white', value: '#ffffff' }, { id: 'red', value: '#ff0000' }, 
    { id: 'blue', value: '#1d4ed8' }, { id: 'green', value: '#22c55e' }, 
    { id: 'yellow', value: '#eab308' }, { id: 'purple', value: '#a855f7' }, 
    { id: 'cyan', value: '#06b6d4' }
  ];

  const scenes = [
    'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1448375240586-dfd8d395ea6c?auto=format&fit=crop&w=150&q=80',
  ];
  
  // Data Mockup Rasio (BARU)
  const ratios = [
      { label: 'Custom', value: 'custom', icon: <Crop size={18} /> },
      { label: '1:1', value: '1:1', icon: <div className="w-4 h-4 bg-current opacity-50"></div> },
      { label: '4:3', value: '4:3', icon: <div className="w-4 h-3 bg-current opacity-50"></div> },
      { label: '9:16', value: '9:16', icon: <div className="w-3 h-5 bg-current opacity-50"></div> },
      { label: '16:9', value: '16:9', icon: <div className="w-5 h-3 bg-current opacity-50"></div> },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-slate-800 flex flex-col relative">
      
      <Navbar />
      
      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8 w-full max-w-[1400px] mx-auto relative z-10">
        <div className="w-full bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden mb-8 relative">
          
          {/* Top Controls Toolbar */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4 text-blue-500">
              <button className="p-2 hover:bg-blue-50 rounded-full transition"><Undo size={20} /></button>
              <button className="p-2 hover:bg-blue-50 rounded-full transition"><Redo size={20} /></button>
              <button className="p-2 hover:bg-blue-50 rounded-full transition"><RotateCw size={20} /></button>
            </div>
            <div className="flex items-center gap-3 md:gap-4">
              <button className="flex items-center gap-2 text-slate-500 text-sm hover:text-slate-800 font-medium mr-2">
                <span className="hidden sm:inline">Compare with Original</span>
                <Lightbulb size={18} />
              </button>
              <a href='/edit' className="px-6 py-2.5 rounded-full bg-blue-50 text-blue-600 font-semibold text-sm hover:bg-blue-100 transition">Cancel</a>
              <button className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#007CFF] text-white font-semibold text-sm hover:bg-blue-600 shadow-md shadow-blue-200 transition">
                Apply Changes <Check size={18} />
              </button>
            </div>
          </div>

          {/* Editor Layout */}
          <div className="flex flex-col lg:flex-row h-auto lg:h-[600px]">
            
            {/* CANVAS AREA (LEFT) */}
            <div className="flex-grow bg-slate-50 relative flex items-center justify-center p-8 overflow-hidden">
               {/* Pattern */}
              <div className="absolute inset-0 z-0" style={{ backgroundImage: `linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)`, backgroundSize: '24px 24px', backgroundPosition: '0 0, 0 12px, 12px -12px, -12px 0px', backgroundColor: 'white' }}></div>
              {/* Dynamic Background Layer */}
              <div className="absolute inset-0 z-1 transition-all duration-300 ease-in-out" style={getCanvasStyle()}></div>
              {/* Image Subject */}
              <div className="relative z-20 w-full h-full flex items-center justify-center">
                 <img src="https://images.unsplash.com/photo-1529139574466-a302c2d3e8a4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Subject" className="max-h-full max-w-full object-contain drop-shadow-xl" />
              </div>
              {/* Floating Zoom */}
              <div className="absolute bottom-6 right-6 flex flex-col bg-white rounded-lg shadow-lg border border-slate-100 z-30">
                <button className="p-2.5 hover:bg-slate-50 text-slate-600 border-b border-slate-100 transition"><Plus size={20} /></button>
                <button className="p-2.5 hover:bg-slate-50 text-slate-600 transition"><Minus size={20} /></button>
              </div>
            </div>

            {/* SIDEBAR TOOLS (RIGHT) */}
            <div className="w-full lg:w-[400px] bg-white border-l border-slate-100 flex flex-col">
              <div className="flex border-b border-slate-200 px-6">
                <button onClick={() => setActiveTab('background')} className={`py-4 px-4 font-semibold text-sm transition-all relative ${activeTab === 'background' ? 'text-[#007CFF]' : 'text-slate-500'}`}>
                  Background {activeTab === 'background' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#007CFF]"></span>}
                </button>
                <button onClick={() => setActiveTab('adjust')} className={`py-4 px-4 font-semibold text-sm transition-all relative ${activeTab === 'adjust' ? 'text-[#007CFF]' : 'text-slate-500'}`}>
                    Adjust {activeTab === 'adjust' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#007CFF]"></span>}
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar flex-grow space-y-8">
                
                {/* --- KONTEN TAB BACKGROUND --- */}
                {activeTab === 'background' && (
                    <>
                        {/* Custom Upload Section */}
                        <div className="space-y-3 animate-fadeIn">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Custom Background</h3>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg" className="hidden" />
                        
                        {!customBg ? (
                            <div onClick={handleFileClick} className="border-2 border-dashed border-sky-300 bg-sky-50 rounded-xl p-8 flex flex-col items-center justify-center text-center gap-3 transition hover:bg-sky-100 cursor-pointer group">
                            <p className="text-slate-600 text-sm">Drag and drop your background image here <br/> or</p>
                            <button className="flex items-center gap-2 bg-[#dbebfa] text-[#007CFF] px-4 py-2 rounded-full text-xs font-bold group-hover:bg-blue-200 transition">
                                <div className="bg-[#007CFF] text-white rounded-full p-0.5"><CloudUpload size={12} /></div> Browse Image
                            </button>
                            </div>
                        ) : (
                            <div className="flex items-start gap-4 animate-fadeIn">
                            <div className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 cursor-pointer ${bgType === 'custom' ? 'border-[#007CFF] ring-2 ring-blue-100' : 'border-slate-200'}`} onClick={() => setBgType('custom')}>
                                <img src={customBg} alt="Custom upload" className="w-full h-full object-cover" />
                                <button onClick={handleRemoveCustomBg} className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white rounded-full p-0.5 transition"><X size={12} /></button>
                            </div>
                            <div className="flex-1 pt-1">
                                <p className="text-sm font-semibold text-slate-700 truncate">{customBgName}</p>
                                <p className="text-xs text-slate-400">Custom background applied</p>
                            </div>
                            </div>
                        )}
                        </div>

                        {/* Color Section */}
                        <div className="space-y-3 animate-fadeIn">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Color</h3>
                        <div className="flex flex-wrap gap-3">
                            <button onClick={() => { setSelectedColor(null); setBgType('transparent'); }} className={`w-10 h-10 rounded-full border border-slate-200 bg-white hover:scale-105 transition flex items-center justify-center ${bgType === 'transparent' ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}>
                            <span className="text-red-500 transform -rotate-45 text-xl">/</span>
                            </button>
                            {solidColors.map((color) => (
                            <button key={color.id} onClick={() => handleColorSelect(color.value)} style={{ backgroundColor: color.value }} className={`w-10 h-10 rounded-full shadow-sm hover:scale-105 transition border border-black/5 ${bgType === 'color' && selectedColor === color.value ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}>
                                {bgType === 'color' && selectedColor === color.value && <Check size={16} className="text-white mx-auto drop-shadow-md" />}
                            </button>
                            ))}
                            <button className="w-10 h-10 rounded-full shadow-sm hover:scale-105 transition border border-slate-200 relative overflow-hidden">
                            <div className="absolute inset-0" style={{ background: 'conic-gradient(from 180deg at 50% 50%, #FF0000 0deg, #FFFF00 60deg, #00FF00 120deg, #00FFFF 180deg, #0000FF 240deg, #FF00FF 300deg, #FF0000 360deg)' }}></div>
                            </button>
                        </div>
                        </div>
                        
                        {/* Scene Section */}
                        <div className="space-y-3 animate-fadeIn">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pattern and Scenes</h3>
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {scenes.map((src, i) => (
                                <button key={i} onClick={() => handleSceneSelect(src)} className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border transition relative ${bgType === 'scene' && selectedScene === src ? 'ring-2 ring-blue-500 border-transparent' : 'border-slate-200 hover:ring-2 ring-blue-200'}`}>
                                <img src={src} alt="scene" className="w-full h-full object-cover" />
                                {bgType === 'scene' && selectedScene === src && <div className="absolute inset-0 bg-black/10 flex items-center justify-center"><div className="bg-white rounded-full p-0.5 text-blue-600"><Check size={14} /></div></div>}
                                </button>
                            ))}
                        </div>
                        </div>
                    </>
                )}

                {/* --- KONTEN TAB ADJUST (BARU) --- */}
                {activeTab === 'adjust' && (
                    <>
                        {/* Aspect Ratio Section */}
                        <div className="space-y-3 animate-fadeIn">
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Aspect Ratio</h3>
                            <div className="grid grid-cols-3 gap-3">
                                {ratios.map((ratio) => (
                                    <button 
                                        key={ratio.value}
                                        onClick={() => startCropping(ratio.value)}
                                        className="flex flex-col items-center justify-center gap-2 py-4 border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition"
                                    >
                                        {ratio.icon}
                                        <span className="text-xs font-medium">{ratio.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                         {/* Transform Section */}
                         <div className="space-y-3 animate-fadeIn">
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Transform</h3>
                            <div className="grid grid-cols-3 gap-3">
                                <button className="flex flex-col items-center justify-center gap-2 py-4 border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition">
                                    <RotateCw size={18} />
                                    <span className="text-xs font-medium">Rotate</span>
                                </button>
                                <button className="flex flex-col items-center justify-center gap-2 py-4 border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition">
                                    <FlipHorizontal size={18} />
                                    <span className="text-xs font-medium">Flip Vertical</span>
                                </button>
                                <button className="flex flex-col items-center justify-center gap-2 py-4 border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition">
                                    <FlipVertical size={18} />
                                    <span className="text-xs font-medium">Flip Horiz.</span>
                                </button>
                            </div>
                        </div>
                    </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Actions */}
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 w-full">
           <button className="flex items-center gap-2 px-6 py-3 rounded-full border border-slate-300 text-slate-600 font-semibold hover:bg-slate-50 transition bg-white"><RotateCw size={18} /> Retake Photo</button>
           <button className="flex items-center gap-2 px-6 py-3 rounded-full border border-slate-300 text-slate-600 font-semibold hover:bg-slate-50 transition bg-white"><CloudUpload size={18} /> Upload New</button>
           <div className="relative"><button className="flex items-center gap-3 px-8 py-3 rounded-full bg-[#8B93A6] text-white font-semibold hover:bg-slate-600 shadow-md transition">Download <div className="border-l border-white/30 pl-3"><ChevronDown size={18} /></div></button></div>
        </div>
      </main>

      <Footer />

      {/* --- CROPPING MODAL OVERLAY (BARU) --- */}
      {isCropping && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center animate-fadeIn">
            
            {/* Area Canvas Cropping (Simulasi) */}
            <div className="relative w-full max-w-3xl h-[60vh] bg-transparent flex items-center justify-center p-8">
                {/* Gambar Utama di dalam Modal */}
                <img 
                    src="https://images.unsplash.com/photo-1529139574466-a302c2d3e8a4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                    alt="Crop Subject" 
                    className="max-h-full max-w-full object-contain"
                    // Dalam implementasi nyata, background yang dipilih user harus ikut tampil di sini
                    style={bgType !== 'transparent' ? getCanvasStyle() as React.CSSProperties : {}} 
                />

                {/* Kotak Crop Simulasi (Grid Overlay) */}
                <div className="absolute inset-0 m-auto w-[80%] h-[80%] border-2 border-[#007CFF] pointer-events-none">
                    {/* Garis Grid Horizontal */}
                    <div className="absolute top-1/3 left-0 w-full h-px bg-white/50"></div>
                    <div className="absolute top-2/3 left-0 w-full h-px bg-white/50"></div>
                    {/* Garis Grid Vertikal */}
                    <div className="absolute left-1/3 top-0 h-full w-px bg-white/50"></div>
                    <div className="absolute left-2/3 top-0 h-full w-px bg-white/50"></div>
                    {/* Sudut Handle */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-[#007CFF] -mt-1 -ml-1"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-[#007CFF] -mt-1 -mr-1"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-[#007CFF] -mb-1 -ml-1"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-[#007CFF] -mb-1 -mr-1"></div>
                </div>
                
                {/* Label Rasio di tengah bawah crop box */}
                <div className="absolute bottom-[10%] bg-black/75 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {selectedRatio || 'Custom'}
                </div>
            </div>

            {/* Floating Action Bar (Bawah) */}
            <div className="mt-4 bg-[#2C313F] p-3 rounded-2xl flex items-center gap-2 shadow-2xl border border-white/10">
                <button onClick={() => startCropping('custom')} className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-xs font-medium transition ${selectedRatio === 'custom' ? 'bg-[#007CFF] text-white' : 'text-slate-300 hover:bg-white/10'}`}>
                    <Crop size={18} /> Custom
                </button>
                <div className="w-px h-8 bg-white/20 mx-1"></div>
                <button onClick={() => startCropping('1:1')} className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-xs font-medium transition ${selectedRatio === '1:1' ? 'bg-[#007CFF] text-white' : 'text-slate-300 hover:bg-white/10'}`}>
                    <div className="w-4 h-4 bg-current opacity-80 mb-0.5"></div> 1:1
                </button>
                 <button onClick={() => startCropping('4:3')} className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-xs font-medium transition ${selectedRatio === '4:3' ? 'bg-[#007CFF] text-white' : 'text-slate-300 hover:bg-white/10'}`}>
                    <div className="w-4 h-3 bg-current opacity-80 mb-0.5"></div> 4:3
                </button>
                 <button onClick={() => startCropping('9:16')} className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-xs font-medium transition ${selectedRatio === '9:16' ? 'bg-[#007CFF] text-white' : 'text-slate-300 hover:bg-white/10'}`}>
                    <div className="w-3 h-5 bg-current opacity-80 mb-0.5"></div> 9:16
                </button>
                 <button onClick={() => startCropping('16:9')} className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-xs font-medium transition ${selectedRatio === '16:9' ? 'bg-[#007CFF] text-white' : 'text-slate-300 hover:bg-white/10'}`}>
                    <div className="w-5 h-3 bg-current opacity-80 mb-0.5"></div> 16:9
                </button>
                
                <div className="w-px h-8 bg-white/20 mx-1"></div>
                
                {/* Tombol Apply */}
                <button onClick={applyCrop} className="flex items-center gap-2 px-6 py-2.5ml-2 rounded-full bg-[#007CFF] text-white font-semibold text-sm hover:bg-blue-600 shadow-md shadow-blue-500/30 transition">
                    Apply <Check size={18} />
                </button>
            </div>

            {/* Tombol Close/Cancel di pojok kanan atas */}
            <button onClick={() => setIsCropping(false)} className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition">
                <X size={24} />
            </button>
        </div>
      )}

    </div>
  );
}