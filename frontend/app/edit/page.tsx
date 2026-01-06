'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  ChevronDown, 
  Lightbulb, 
  PenLine, 
  Plus, 
  Minus, 
  RotateCcw, 
  Upload, 
  Download 
} from 'lucide-react';
import Navbar from '../components/Header';
import Footer from '../components/Footer';

export default function EditPage() {
  const [scale, setScale] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // Fungsi Zoom
  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.1, 0.5));

  // Opsi Background Color
  const colors = [
    { id: 'transparent', value: null, label: 'Transparan' },
    { id: 'red', value: '#ff0000', label: 'Merah' },
    { id: 'blue', value: '#0000ff', label: 'Biru' },
    { id: 'green', value: '#00ff00', label: 'Hijau' },
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
                      ${color.id === 'transparent' ? 'bg-white' : ''}
                    `}
                    style={{ backgroundColor: color.value || 'white' }}
                    aria-label={color.label}
                  >
                    {/* Icon silang untuk transparan jika needed, atau biarkan kosong */}
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
              <button className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full hover:bg-blue-100 transition">
                <a href="/edit/custom-edit" className="hidden sm:inline">Custom Edit</a>
                <PenLine size={16} />
              </button>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="relative w-full h-[500px] bg-gray-100 overflow-hidden flex items-center justify-center">
            {/* Checkerboard Pattern Background (CSS Pattern) */}
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
              className="relative transition-transform duration-200 ease-out z-10"
              style={{ transform: `scale(${scale})` }}
            >
              {/* Layer Warna (jika dipilih) */}
              {selectedColor && (
                <div 
                  className="absolute inset-0 z-0 transition-colors duration-300"
                  style={{ backgroundColor: selectedColor }}
                />
              )}
              
              {/* Gambar Utama (Ganti src dengan gambar Anda) */}
              <div className="relative z-10">
                 {/* Placeholder Image - Ganti dengan <Image /> Next.js yang asli */}
                 <img 
                   src="https://images.unsplash.com/photo-1529139574466-a302c2d3e8a4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                   alt="Edited Result" 
                   className="h-[400px] w-auto object-contain drop-shadow-lg"
                 />
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
          <button className="flex items-center gap-2 px-6 py-3 rounded-full border border-blue-500 text-blue-600 font-semibold hover:bg-blue-50 transition">
            <RotateCcw size={18} />
            Retake Photo
          </button>
          <button className="flex items-center gap-2 px-6 py-3 rounded-full border border-blue-500 text-blue-600 font-semibold hover:bg-blue-50 transition">
            <Upload size={18} />
            Upload New
          </button>
          <div className="relative group">
            <button className="flex items-center gap-2 px-8 py-3 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-md shadow-blue-200 transition">
              Download
              <ChevronDown size={18} />
            </button>
          </div>
        </div>
      </main>

      {/* --- FOOTER --- */}
      <Footer />
    </div>
  );
}