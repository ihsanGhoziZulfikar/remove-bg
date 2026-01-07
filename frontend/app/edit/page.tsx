'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  Lightbulb, 
  PenLine, 
  Plus, 
  Minus, 
  RotateCcw, 
  Upload, 
  Download,
  Loader2 // Import icon loader untuk indikator download
} from 'lucide-react';
import Navbar from '../components/Header';
import Footer from '../components/Footer';

export default function EditPage() {
  const [scale, setScale] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false); // State untuk loading download

  // --- EFEK UNTUK LOAD GAMBAR DARI HALAMAN SEBELUMNYA ---
  useEffect(() => {
    const savedImage = localStorage.getItem("editImage");
    if (savedImage) {
      setImageSrc(savedImage);
    } else {
      setImageSrc("https://images.unsplash.com/photo-1529139574466-a302c2d3e8a4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80");
    }
  }, []);

  // Fungsi Zoom
  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.1, 0.5));

  // Fungsi Upload Baru
  const handleUploadNew = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (file) {
        const url = URL.createObjectURL(file);
        setImageSrc(url);
        localStorage.removeItem("editImage"); 
     }
  }

  // --- LOGIKA DOWNLOAD (CANVAS) ---
  const handleDownload = async () => {
    if (!imageSrc) return;
    setIsDownloading(true);

    try {
        // 1. Buat Image Object baru untuk dimuat ke Canvas
        const img = new Image();
        img.crossOrigin = "anonymous"; // Penting untuk menghindari CORS error jika gambar dari external
        img.src = imageSrc;

        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
        });

        // 2. Siapkan Canvas sesuai ukuran asli gambar
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) throw new Error("Gagal membuat context canvas");

        // 3. Gambar Background Color (Jika user memilih warna)
        if (selectedColor) {
            ctx.fillStyle = selectedColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // 4. Gambar Image Utama di atas background
        ctx.drawImage(img, 0, 0);

        // 5. Convert ke URL dan Download
        const dataUrl = canvas.toDataURL('image/png');
        
        // Buat elemen link sementara untuk trigger download
        const link = document.createElement('a');
        link.download = `edited-image-${Date.now()}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    } catch (error) {
        console.error("Gagal mendownload gambar:", error);
        alert("Terjadi kesalahan saat mendownload gambar. Pastikan gambar valid.");
    } finally {
        setIsDownloading(false);
    }
  };

  // Opsi Background Color
  const colors = [
    { id: 'transparent', value: null, label: 'Transparan' },
    { id: 'red', value: '#ff0000', label: 'Merah' },
    { id: 'blue', value: '#0000ff', label: 'Biru' },
    { id: 'green', value: '#00ff00', label: 'Hijau' },
    { id: 'white', value: '#ffffff', label: 'Putih' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col">
      
        <Navbar />

      {/* --- MAIN CONTENT --- */}
      <main className="flex-grow flex flex-col items-center justify-center p-6 w-full max-w-7xl mx-auto">
        
        {/* Editor Card */}
        <div className="w-full bg-white rounded-[2rem] shadow-sm border border-gray-200 overflow-hidden mb-8">
          
          {/* Top Bar Controls */}
          <div className="px-8 py-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Color Selector */}
            <div className="flex items-center gap-4">
              <span className="text-gray-500 font-medium text-sm">Background</span>
              <div className="flex gap-2">
                {colors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColor(color.value)}
                    className={`w-8 h-8 rounded-full border border-gray-200 shadow-sm transition-all hover:scale-110 focus:ring-2 ring-offset-1 ring-blue-500
                      ${selectedColor === color.value ? 'ring-2 ring-blue-500 scale-110' : ''}
                      ${color.id === 'transparent' ? 'bg-gray-100 bg-[url("/asset/transparent-grid.png")]' : ''}
                    `}
                    style={{ backgroundColor: color.value || 'transparent' }}
                    aria-label={color.label}
                  >
                  </button>
                ))}
              </div>
            </div>

            {/* Edit Tools */}
            <div className="flex items-center gap-4 text-sm font-medium">
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <Lightbulb size={18} />
                <span className="hidden sm:inline">Compare with Original</span>
              </button>
              <a href='/edit/custom-edit' className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full hover:bg-blue-100 transition">
                <span className="hidden sm:inline">Custom Edit</span>
                <PenLine size={16} />
              </a>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="relative w-full h-[500px] bg-gray-100 overflow-hidden flex items-center justify-center">
            {/* Checkerboard Pattern Background */}
            <div className="absolute inset-0 opacity-40 pointer-events-none" 
                 style={{
                   backgroundImage: `linear-gradient(45deg, #ccc 25%, transparent 25%), 
                   linear-gradient(-45deg, #ccc 25%, transparent 25%), 
                   linear-gradient(45deg, transparent 75%, #ccc 75%), 
                   linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
                   backgroundSize: '20px 20px',
                   backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                 }}>
            </div>

            {/* Main Image Container */}
            <div 
              className="relative transition-transform duration-200 ease-out z-10 w-full h-full flex items-center justify-center"
              style={{ transform: `scale(${scale})` }}
            >
              {/* Layer Warna (jika dipilih) */}
              {selectedColor && (
                <div 
                  className="absolute inset-0 z-0 transition-colors duration-300 w-full h-full"
                  style={{ backgroundColor: selectedColor }}
                />
              )}
              
              {/* Gambar Utama */}
              <div className="relative z-10 max-w-[90%] max-h-[90%]">
                 {imageSrc ? (
                    <img 
                      src={imageSrc} 
                      alt="Edited Result" 
                      className="max-h-[400px] w-auto object-contain drop-shadow-lg mx-auto"
                    />
                 ) : (
                    <div className="text-gray-400">Loading image...</div>
                 )}
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="absolute bottom-6 right-6 flex flex-col gap-2 bg-white rounded-full shadow-lg p-1 z-20">
              <button onClick={handleZoomIn} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition">
                <Plus size={20} />
              </button>
              <button onClick={handleZoomOut} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition">
                <Minus size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="flex flex-wrap gap-4 justify-center md:justify-end w-full">
          <button 
            onClick={() => setImageSrc(null)} 
            className="flex items-center gap-2 px-6 py-3 rounded-full border border-blue-500 text-blue-600 font-semibold hover:bg-blue-50 transition"
          >
            <RotateCcw size={18} />
            Retake / Clear
          </button>
          
          <label className="flex items-center gap-2 px-6 py-3 rounded-full border border-blue-500 text-blue-600 font-semibold hover:bg-blue-50 transition cursor-pointer">
            <Upload size={18} />
            Upload New
            <input type="file" className="hidden" accept="image/*" onChange={handleUploadNew} />
          </label>

          <div className="relative group">
            <button 
                onClick={handleDownload}
                disabled={isDownloading}
                className={`flex items-center gap-2 px-8 py-3 rounded-full bg-blue-600 text-white font-semibold shadow-md shadow-blue-200 transition
                    ${isDownloading ? 'opacity-70 cursor-wait' : 'hover:bg-blue-700'}
                `}
            >
              {isDownloading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Processing...
                  </>
              ) : (
                  <>
                    Download
                    <ChevronDown size={18} />
                  </>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* --- FOOTER --- */}
      <Footer />
    </div>
  );
}