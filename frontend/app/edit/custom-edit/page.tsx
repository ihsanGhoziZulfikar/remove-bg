"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Cropper from "react-easy-crop";
// Pastikan createImage diimport (tambahkan export di file utils/cropImage.ts jika belum)
import getCroppedImg, { createImage } from "../../utils/cropImage";

import {
  Undo,
  Redo,
  RotateCw,
  Lightbulb,
  ChevronDown,
  CloudUpload,
  Plus,
  Minus,
  Check,
  X,
  Crop,
  FlipHorizontal,
  FlipVertical,
  Download,
  Loader2, // Import Loader2
} from "lucide-react";

import Navbar from "../../components/Header";
import Footer from "../../components/Footer";

type Area = { x: number; y: number; width: number; height: number };

export default function CustomEditPage() {
  const [activeTab, setActiveTab] = useState<"background" | "adjust">(
    "background"
  );

  // --- State Utama ---
  const [imageSrc, setImageSrc] = useState<string>(
    "https://images.unsplash.com/photo-1529139574466-a302c2d3e8a4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
  );
  const [isDownloading, setIsDownloading] = useState(false); // State baru untuk loading download

  useEffect(() => {
    const savedImage = localStorage.getItem("editImage");
    if (savedImage) {
      setImageSrc(savedImage);
    }
  }, []);

  // --- State Background ---
  const [bgType, setBgType] = useState<
    "transparent" | "color" | "scene" | "custom"
  >("transparent");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedScene, setSelectedScene] = useState<string | null>(null);
  const [customBg, setCustomBg] = useState<string | null>(null);
  const [customBgName, setCustomBgName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- State Transform & Adjust ---
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [selectedRatioLabel, setSelectedRatioLabel] =
    useState<string>("Custom");
  const [transform, setTransform] = useState({
    rotate: 0,
    flipHorizontal: false,
    flipVertical: false,
  });

  // --- Helper: Draw Image Cover (Simulasi object-fit: cover di Canvas) ---
  const drawImageCover = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number,
    y: number,
    w: number,
    h: number
  ) => {
    const imgRatio = img.width / img.height;
    const canvasRatio = w / h;
    let renderW, renderH, renderX, renderY;

    if (imgRatio > canvasRatio) {
      renderH = h;
      renderW = h * imgRatio;
      renderX = x + (w - renderW) / 2;
      renderY = y;
    } else {
      renderW = w;
      renderH = w / imgRatio;
      renderX = x;
      renderY = y + (h - renderH) / 2;
    }
    ctx.drawImage(img, renderX, renderY, renderW, renderH);
  };

  // --- FUNGSI DOWNLOAD (FITUR UTAMA) ---
  const handleDownload = async () => {
    if (!imageSrc) return;
    setIsDownloading(true);

    try {
      // 1. Load Gambar Utama
      const mainImg = await createImage(imageSrc);

      // 2. Siapkan Canvas
      // Ukuran canvas mengikuti ukuran asli gambar utama agar kualitas tetap terjaga
      const canvas = document.createElement("canvas");
      canvas.width = mainImg.naturalWidth;
      canvas.height = mainImg.naturalHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("Context not defined");

      // 3. Gambar Background (Jika ada)
      if (bgType === "color" && selectedColor) {
        ctx.fillStyle = selectedColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (
        (bgType === "scene" && selectedScene) ||
        (bgType === "custom" && customBg)
      ) {
        const bgUrl = bgType === "scene" ? selectedScene : customBg;
        if (bgUrl) {
          const bgImg = await createImage(bgUrl);
          // Gambar background dengan mode "Cover" (mengisi penuh canvas)
          drawImageCover(ctx, bgImg, 0, 0, canvas.width, canvas.height);
        }
      }

      // 4. Gambar Subjek Utama + Transformasi (Rotate/Flip)
      ctx.save();
      // Pindahkan titik pusat ke tengah canvas untuk rotasi yang benar
      ctx.translate(canvas.width / 2, canvas.height / 2);

      // Terapkan Rotasi
      ctx.rotate((transform.rotate * Math.PI) / 180);

      // Terapkan Flip (Scale negatif)
      ctx.scale(
        transform.flipHorizontal ? -1 : 1,
        transform.flipVertical ? -1 : 1
      );

      // Gambar image di tengah (offset setengah width/height karena titik pusat sudah dipindah)
      ctx.drawImage(
        mainImg,
        -mainImg.naturalWidth / 2,
        -mainImg.naturalHeight / 2
      );
      ctx.restore();

      // 5. Trigger Download
      const dataUrl = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.download = `edited-image-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Gagal mendownload gambar:", error);
      alert("Terjadi kesalahan saat memproses download.");
    } finally {
      setIsDownloading(false);
    }
  };

  // --- Handlers Lainnya (Sama seperti sebelumnya) ---
  const handleRotate = () =>
    setTransform((p) => ({ ...p, rotate: p.rotate + 90 }));
  const handleFlipHorizontal = () =>
    setTransform((p) => ({ ...p, flipHorizontal: !p.flipHorizontal }));
  const handleFlipVertical = () =>
    setTransform((p) => ({ ...p, flipVertical: !p.flipVertical }));

  const getImageStyle = () => {
    const { rotate, flipHorizontal, flipVertical } = transform;
    return {
      transform: `rotate(${rotate}deg) scale(${flipHorizontal ? -1 : 1}, ${
        flipVertical ? -1 : 1
      })`,
      transition: "transform 0.3s ease",
      maxHeight: "100%",
      maxWidth: "100%",
      objectFit: "contain" as const,
    };
  };

  const handleFileClick = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomBg(url);
      setCustomBgName(file.name);
      setBgType("custom");
    }
  };

  const handleRemoveCustomBg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomBg(null);
    setBgType("transparent");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleColorSelect = (c: string) => {
    setSelectedColor(c);
    setBgType("color");
  };
  const handleSceneSelect = (s: string) => {
    setSelectedScene(s);
    setBgType("scene");
  };

  const getCanvasStyle = () => {
    if (bgType === "color" && selectedColor)
      return { backgroundColor: selectedColor };
    if (bgType === "scene" && selectedScene)
      return {
        backgroundImage: `url(${selectedScene})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    if (bgType === "custom" && customBg)
      return {
        backgroundImage: `url(${customBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    return {};
  };

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const startCropping = (val: string | number | undefined, lbl: string) => {
    setAspect(val as number | undefined);
    setSelectedRatioLabel(lbl);
    setIsCropping(true);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  };

  const applyCrop = async () => {
    if (!croppedAreaPixels) return;
    try {
      const croppedImage = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        transform.rotate,
        {
          horizontal: transform.flipHorizontal,
          vertical: transform.flipVertical,
        }
      );
      if (croppedImage) {
        setImageSrc(croppedImage);
        setIsCropping(false);
        setActiveTab("adjust");
        setTransform({ rotate: 0, flipHorizontal: false, flipVertical: false });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUploadNewMain = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      setTransform({ rotate: 0, flipHorizontal: false, flipVertical: false });
    }
  };

  // Data Mockup
  const solidColors = [
    { id: "white", value: "#ffffff" },
    { id: "red", value: "#ff0000" },
    { id: "blue", value: "#1d4ed8" },
    { id: "green", value: "#22c55e" },
    { id: "yellow", value: "#eab308" },
    { id: "purple", value: "#a855f7" },
    { id: "cyan", value: "#06b6d4" },
  ];
  const scenes = [
    "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1448375240586-dfd8d395ea6c?auto=format&fit=crop&w=150&q=80",
  ];
  const ratios = [
    { label: "Custom", value: undefined, icon: <Crop size={18} /> },
    {
      label: "1:1",
      value: 1 / 1,
      icon: <div className="w-4 h-4 bg-current opacity-50"></div>,
    },
    {
      label: "4:3",
      value: 4 / 3,
      icon: <div className="w-4 h-3 bg-current opacity-50"></div>,
    },
    {
      label: "9:16",
      value: 9 / 16,
      icon: <div className="w-3 h-5 bg-current opacity-50"></div>,
    },
    {
      label: "16:9",
      value: 16 / 9,
      icon: <div className="w-5 h-3 bg-current opacity-50"></div>,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-slate-800 flex flex-col relative">
      <Navbar />

      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8 w-full max-w-[1400px] mx-auto relative z-10">
        <div className="w-full bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden mb-8 relative">
          {/* Top Controls Toolbar */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4 text-blue-500">
              <button className="p-2 hover:bg-blue-50 rounded-full transition">
                <Undo size={20} />
              </button>
              <button className="p-2 hover:bg-blue-50 rounded-full transition">
                <Redo size={20} />
              </button>
              <button
                onClick={() =>
                  setTransform({
                    rotate: 0,
                    flipHorizontal: false,
                    flipVertical: false,
                  })
                }
                className="p-2 hover:bg-blue-50 rounded-full transition"
                title="Reset Transform"
              >
                <RotateCw
                  size={20}
                  className={transform.rotate !== 0 ? "text-blue-600" : ""}
                />
              </button>
            </div>
            <div className="flex items-center gap-3 md:gap-4">
              <button className="flex items-center gap-2 text-slate-500 text-sm hover:text-slate-800 font-medium mr-2">
                <span className="hidden sm:inline">Compare with Original</span>
                <Lightbulb size={18} />
              </button>
              <a
                href="/edit"
                className="px-6 py-2.5 rounded-full bg-blue-50 text-blue-600 font-semibold text-sm hover:bg-blue-100 transition"
              >
                Cancel
              </a>
              {/* Tombol Apply Changes sekarang memanggil Download juga atau logika save lainnya */}
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#007CFF] text-white font-semibold text-sm hover:bg-blue-600 shadow-md shadow-blue-200 transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isDownloading ? (
                  <>
                    Processing <Loader2 size={18} className="animate-spin" />
                  </>
                ) : (
                  <>
                    Apply & Download <Check size={18} />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Editor Layout */}
          <div className="flex flex-col lg:flex-row h-auto lg:h-[600px]">
            {/* CANVAS AREA (LEFT) */}
            <div className="flex-grow bg-slate-50 relative flex items-center justify-center p-8 overflow-hidden">
              <div
                className="absolute inset-0 z-0"
                style={{
                  backgroundImage: `linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)`,
                  backgroundSize: "24px 24px",
                  backgroundPosition: "0 0, 0 12px, 12px -12px, -12px 0px",
                  backgroundColor: "white",
                }}
              ></div>
              <div
                className="absolute inset-0 z-1 transition-all duration-300 ease-in-out"
                style={getCanvasStyle()}
              ></div>

              <div className="relative z-20 w-full h-full flex items-center justify-center">
                <img src={imageSrc} alt="Subject" style={getImageStyle()} />
              </div>

              <div className="absolute bottom-6 right-6 flex flex-col bg-white rounded-lg shadow-lg border border-slate-100 z-30">
                <button className="p-2.5 hover:bg-slate-50 text-slate-600 border-b border-slate-100 transition">
                  <Plus size={20} />
                </button>
                <button className="p-2.5 hover:bg-slate-50 text-slate-600 transition">
                  <Minus size={20} />
                </button>
              </div>
            </div>

            {/* SIDEBAR TOOLS (RIGHT) */}
            <div className="w-full lg:w-[400px] bg-white border-l border-slate-100 flex flex-col">
              <div className="flex border-b border-slate-200 px-6">
                <button
                  onClick={() => setActiveTab("background")}
                  className={`py-4 px-4 font-semibold text-sm transition-all relative ${
                    activeTab === "background"
                      ? "text-[#007CFF]"
                      : "text-slate-500"
                  }`}
                >
                  Background{" "}
                  {activeTab === "background" && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#007CFF]"></span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("adjust")}
                  className={`py-4 px-4 font-semibold text-sm transition-all relative ${
                    activeTab === "adjust" ? "text-[#007CFF]" : "text-slate-500"
                  }`}
                >
                  Adjust{" "}
                  {activeTab === "adjust" && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#007CFF]"></span>
                  )}
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar flex-grow space-y-8">
                {/* --- KONTEN TAB BACKGROUND --- */}
                {activeTab === "background" && (
                  <>
                    {/* Custom Upload Section */}
                    <div className="space-y-3 animate-fadeIn">
                      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Custom Background
                      </h3>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/png, image/jpeg"
                        className="hidden"
                      />

                      {!customBg ? (
                        <div
                          onClick={handleFileClick}
                          className="border-2 border-dashed border-sky-300 bg-sky-50 rounded-xl p-8 flex flex-col items-center justify-center text-center gap-3 transition hover:bg-sky-100 cursor-pointer group"
                        >
                          <p className="text-slate-600 text-sm">
                            Drag and drop your background image here <br /> or
                          </p>
                          <button className="flex items-center gap-2 bg-[#dbebfa] text-[#007CFF] px-4 py-2 rounded-full text-xs font-bold group-hover:bg-blue-200 transition">
                            <div className="bg-[#007CFF] text-white rounded-full p-0.5">
                              <CloudUpload size={12} />
                            </div>{" "}
                            Browse Image
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-start gap-4 animate-fadeIn">
                          <div
                            className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 cursor-pointer ${
                              bgType === "custom"
                                ? "border-[#007CFF] ring-2 ring-blue-100"
                                : "border-slate-200"
                            }`}
                            onClick={() => setBgType("custom")}
                          >
                            <img
                              src={customBg}
                              alt="Custom upload"
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={handleRemoveCustomBg}
                              className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white rounded-full p-0.5 transition"
                            >
                              <X size={12} />
                            </button>
                          </div>
                          <div className="flex-1 pt-1">
                            <p className="text-sm font-semibold text-slate-700 truncate">
                              {customBgName}
                            </p>
                            <p className="text-xs text-slate-400">
                              Custom background applied
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Color Section */}
                    <div className="space-y-3 animate-fadeIn">
                      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Color
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => {
                            setSelectedColor(null);
                            setBgType("transparent");
                          }}
                          className={`w-10 h-10 rounded-full border border-slate-200 bg-white hover:scale-105 transition flex items-center justify-center ${
                            bgType === "transparent"
                              ? "ring-2 ring-blue-500 ring-offset-2"
                              : ""
                          }`}
                        >
                          <span className="text-red-500 transform -rotate-45 text-xl">
                            /
                          </span>
                        </button>
                        {solidColors.map((color) => (
                          <button
                            key={color.id}
                            onClick={() => handleColorSelect(color.value)}
                            style={{ backgroundColor: color.value }}
                            className={`w-10 h-10 rounded-full shadow-sm hover:scale-105 transition border border-black/5 ${
                              bgType === "color" &&
                              selectedColor === color.value
                                ? "ring-2 ring-blue-500 ring-offset-2"
                                : ""
                            }`}
                          >
                            {bgType === "color" &&
                              selectedColor === color.value && (
                                <Check
                                  size={16}
                                  className="text-white mx-auto drop-shadow-md"
                                />
                              )}
                          </button>
                        ))}
                        <button className="w-10 h-10 rounded-full shadow-sm hover:scale-105 transition border border-slate-200 relative overflow-hidden">
                          <div
                            className="absolute inset-0"
                            style={{
                              background:
                                "conic-gradient(from 180deg at 50% 50%, #FF0000 0deg, #FFFF00 60deg, #00FF00 120deg, #00FFFF 180deg, #0000FF 240deg, #FF00FF 300deg, #FF0000 360deg)",
                            }}
                          ></div>
                        </button>
                      </div>
                    </div>

                    {/* Scene Section */}
                    <div className="space-y-3 animate-fadeIn">
                      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Pattern and Scenes
                      </h3>
                      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {scenes.map((src, i) => (
                          <button
                            key={i}
                            onClick={() => handleSceneSelect(src)}
                            className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border transition relative ${
                              bgType === "scene" && selectedScene === src
                                ? "ring-2 ring-blue-500 border-transparent"
                                : "border-slate-200 hover:ring-2 ring-blue-200"
                            }`}
                          >
                            <img
                              src={src}
                              alt="scene"
                              className="w-full h-full object-cover"
                            />
                            {bgType === "scene" && selectedScene === src && (
                              <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                <div className="bg-white rounded-full p-0.5 text-blue-600">
                                  <Check size={14} />
                                </div>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* --- KONTEN TAB ADJUST --- */}
                {activeTab === "adjust" && (
                  <>
                    <div className="space-y-3 animate-fadeIn">
                      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Aspect Ratio
                      </h3>
                      <div className="grid grid-cols-3 gap-3">
                        {ratios.map((ratio) => (
                          <button
                            key={ratio.label}
                            onClick={() =>
                              startCropping(ratio.value, ratio.label)
                            }
                            className="flex flex-col items-center justify-center gap-2 py-4 border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition"
                          >
                            {ratio.icon}
                            <span className="text-xs font-medium">
                              {ratio.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3 animate-fadeIn">
                      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Transform
                      </h3>
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          onClick={handleRotate}
                          className={`flex flex-col items-center justify-center gap-2 py-4 border rounded-xl transition ${
                            transform.rotate !== 0
                              ? "border-blue-500 bg-blue-50 text-blue-600"
                              : "border-slate-200 text-slate-600 hover:border-blue-500 hover:bg-blue-50"
                          }`}
                        >
                          <RotateCw size={18} />{" "}
                          <span className="text-xs font-medium">Rotate</span>
                        </button>
                        <button
                          onClick={handleFlipVertical}
                          className={`flex flex-col items-center justify-center gap-2 py-4 border rounded-xl transition ${
                            transform.flipVertical
                              ? "border-blue-500 bg-blue-50 text-blue-600"
                              : "border-slate-200 text-slate-600 hover:border-blue-500 hover:bg-blue-50"
                          }`}
                        >
                          <FlipHorizontal size={18} className="rotate-90" />{" "}
                          <span className="text-xs font-medium">Flip V</span>
                        </button>
                        <button
                          onClick={handleFlipHorizontal}
                          className={`flex flex-col items-center justify-center gap-2 py-4 border rounded-xl transition ${
                            transform.flipHorizontal
                              ? "border-blue-500 bg-blue-50 text-blue-600"
                              : "border-slate-200 text-slate-600 hover:border-blue-500 hover:bg-blue-50"
                          }`}
                        >
                          <FlipHorizontal size={18} />{" "}
                          <span className="text-xs font-medium">Flip H</span>
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
          <a href="/" className="flex items-center gap-2 px-6 py-3 rounded-full border border-slate-300 text-slate-600 font-semibold hover:bg-slate-50 transition bg-white">
            <RotateCw size={18} /> Retake Photo
          </a>
          <label className="flex items-center gap-2 px-6 py-3 rounded-full border border-slate-300 text-slate-600 font-semibold hover:bg-slate-50 transition bg-white cursor-pointer">
            <CloudUpload size={18} /> Upload New
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleUploadNewMain}
            />
          </label>

          <div className="relative">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-3 px-8 py-3 rounded-full bg-[#8B93A6] text-white font-semibold hover:bg-slate-600 shadow-md transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isDownloading ? "Downloading..." : "Download"}
              {!isDownloading && (
                <div className="border-l border-white/30 pl-3">
                  <ChevronDown size={18} />
                </div>
              )}
            </button>
          </div>
        </div>
      </main>

      <Footer />

      {/* --- CROPPING MODAL OVERLAY --- */}
      {isCropping && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center animate-fadeIn">
          <div className="relative w-full max-w-4xl h-[60vh] bg-black flex items-center justify-center overflow-hidden rounded-lg">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              rotation={transform.rotate}
              mediaProps={{
                style: {
                  transform: `scale(${transform.flipHorizontal ? -1 : 1}, ${
                    transform.flipVertical ? -1 : 1
                  })`,
                },
              }}
              style={{
                containerStyle: {
                  background: bgType === "transparent" ? "transparent" : "#000",
                },
              }}
            />
          </div>
          {/* Control Bar Crop (Simplified) */}
          <div className="mt-6 w-full max-w-2xl px-4 flex flex-col gap-4">
            <div className="flex items-center gap-4 text-white">
              <span className="text-xs uppercase font-bold text-gray-400">
                Zoom
              </span>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-grow h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            <div className="flex justify-center">
              <button
                onClick={applyCrop}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#007CFF] text-white font-semibold text-sm hover:bg-blue-600 shadow-md shadow-blue-500/30 transition"
              >
                Apply Crop <Check size={18} />
              </button>
            </div>
          </div>
          <button
            onClick={() => setIsCropping(false)}
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition z-50"
          >
            <X size={24} />
          </button>
        </div>
      )}
    </div>
  );
}
