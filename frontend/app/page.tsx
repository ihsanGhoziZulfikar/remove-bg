"use client";

import React, { useState, useRef, useEffect } from "react";
import Navbar from "./components/Header";
import Footer from "./components/Footer";

export default function RemoveBGApp() {
  // --- STATE ---
  const [selectedMode, setSelectedMode] = useState("standard");
  const [dragActive, setDragActive] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraQuality, setCameraQuality] = useState("hd");
  const [showGrid, setShowGrid] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<File | null>(null);
  const [isCaptured, setIsCaptured] = useState(false);

  // --- STATE LOGIC ---
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- API FUNCTION (INTEGRATED) ---
  const processImage = async (file: File) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setProcessedImage(null);

    const formData = new FormData();
    // 'image_file' ini kunci yang ditunggu oleh backend route.ts
    formData.append("image_file", file);
    // Mengirim mode (backend bisa menggunakannya atau mengabaikannya)
    formData.append("mode", selectedMode);

    try {
      const response = await fetch("/api/remove-bg", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        // Mencoba mengambil pesan error spesifik dari JSON backend
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Gagal memproses gambar di server.");
      }

      // Mengubah response blob menjadi URL gambar untuk ditampilkan
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setProcessedImage(url);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Terjadi kesalahan saat menghapus background.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- HANDLERS ---
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const error = validateFile(file);
      if (error) {
        setErrorMessage(error);
      } else {
        setUploadedFile(file);
      }
    }
  };

  const handleExampleImageClick = async (imageIndex: number) => {
    setErrorMessage(null);
    setProcessedImage(null);
    try {
      const response = await fetch(`/asset/${imageIndex}.png`);
      const blob = await response.blob();
      const file = new File([blob], `${imageIndex}.png`, { type: "image/png" });
      setUploadedFile(file);
    } catch (err) {
      console.error("Error loading example image:", err);
      setErrorMessage("Failed to load example image.");
    }
  };

  const validateFile = (file: File): string | null => {
    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
    const maxSize = 12 * 1024 * 1024; // Update limit ke 12MB (limit umum API remove.bg)
    if (!allowedTypes.includes(file.type))
      return "Unsupported file format. Try again with a PNG, JPG, or WebP file.";
    if (file.size > maxSize)
      return "File too large. Try again with maximum size 12 MB.";
    return null;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setErrorMessage(null);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      const error = validateFile(file);
      if (error) {
        setErrorMessage(error);
      } else {
        setUploadedFile(file);
      }
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "upload") {
      stopCamera();
    } else {
      setUploadedFile(null);
      setProcessedImage(null);
      startCamera();
    }
  };

  const captureImage = () => {
    if (countdown !== null) return;
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev !== null && prev === 1) {
          clearInterval(interval);
          if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              ctx.translate(canvas.width, 0);
              ctx.scale(-1, 1);
              ctx.drawImage(video, 0, 0);
              canvas.toBlob((blob) => {
                if (blob) {
                  const file = new File([blob], `captured-${Date.now()}.png`, {
                    type: "image/png",
                  });
                  setCapturedImage(file);
                  setIsCaptured(true);
                }
              }, "image/png");
            }
          }
          return null;
        }
        return prev !== null ? prev - 1 : null;
      });
    }, 1000);
  };

  const handleRetake = () => {
    setIsCaptured(false);
    setCapturedImage(null);
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  };

  const handlePaste = async (e: ClipboardEvent) => {
    if (activeTab !== "upload") return;
    e.preventDefault();
    setErrorMessage(null);
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf("image") !== -1) {
        const file = item.getAsFile();
        if (file) setUploadedFile(file);
        break;
      }
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (activeTab === "upload") {
      document.addEventListener("paste", handlePaste);
    } else {
      document.removeEventListener("paste", handlePaste);
    }
    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-start">
          {/* Left Column - Preview */}
          <div className="lg:col-span-2 order-1">
            <div className="rounded-2xl p-4 sm:p-6 lg:p-8 relative">
              <div className="relative">
                <img
                  src="/asset/image 8.png"
                  alt="Background"
                  className="w-full rounded-xl object-cover"
                />
              </div>
            </div>
            <div className="mt-4 sm:mt-6 lg:mt-8">
              <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 text-center">
                <span className="block sm:hidden">
                  Remove Image Backgrounds in
                  <br />
                  Seconds for Free
                </span>
                <span className="hidden sm:block text-left">
                  Remove Image
                  <br />
                  Backgrounds in
                  <br />
                  Seconds for Free
                </span>
              </h1>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                The fastest way to get a transparent background. Drag in
                existing files for a quick fix, or jump on a live camera to
                create something new on the spot.
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-3 lg:col-start-3 order-2 space-y-4">
            {/* Tab Buttons */}
            <div className="flex justify-center">
              {/* Tab Buttons */}
              <div className="flex justify-center">
                {/* Container utama diubah menjadi rounded-full dan bg-gray-200 agar seperti track */}
                <div className="inline-flex bg-gray-200 rounded-full relative">
                  {/* Tombol Upload */}
                  <button
                    onClick={() => handleTabChange("upload")}
                    className={`rounded-full px-6 py-2.5 text-sm font-medium flex items-center gap-2 transition-all duration-200 ease-in-out ${
                      activeTab === "upload"
                        ? "bg-[#0076D2] text-white shadow-md" // Style saat aktif
                        : "bg-transparent text-gray-600 hover:text-gray-900" // Style saat tidak aktif
                    }`}
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <span>Upload Image</span>
                  </button>

                  {/* Tombol Camera */}
                  <button
                    onClick={() => handleTabChange("camera")}
                    className={`rounded-full px-6 py-2.5 text-sm font-medium flex items-center gap-2 transition-all duration-200 ease-in-out ${
                      activeTab === "camera"
                        ? "bg-[#0076D2] text-white shadow-md"
                        : "bg-transparent text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {/* Icon Kamera (Opsional: Hapus svg ini jika ingin persis seperti gambar yang hanya teks 'Live Camera') */}
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Live Camera</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Upload Area */}
            {activeTab === "upload" && (
              <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
                {isProcessing ? (
                  <div className="flex flex-col items-center justify-center min-h-[300px]">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600 font-medium">
                      Removing background...
                    </p>
                  </div>
                ) : processedImage ? (
                  <div className="relative">
                    <div className="w-full max-h-[300px] sm:max-h-[400px] lg:max-h-[480px] rounded-xl overflow-hidden flex items-center justify-center bg-[url('/asset/transparent-grid.png')] bg-gray-100">
                      <img
                        src={processedImage}
                        alt="Result"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div className="mt-4 flex justify-center gap-3">
                      <a
                        href={processedImage}
                        download="removed-bg.png"
                        className="bg-[#0076D2] text-white rounded-3xl px-6 py-2 text-sm font-medium hover:bg-[#0056A3] transition-colors"
                      >
                        Download HD
                      </a>
                      <button
                        onClick={() => {
                          setProcessedImage(null);
                          setUploadedFile(null);
                        }}
                        className="bg-gray-100 text-gray-700 rounded-3xl px-6 py-2 text-sm font-medium hover:bg-gray-200 transition-colors"
                      >
                        Try Another
                      </button>
                    </div>
                  </div>
                ) : uploadedFile ? (
                  // Jika file sudah diupload (Preview Mode)
                  <div className="relative group">
                    <div className="w-full max-h-[300px] sm:max-h-[400px] lg:max-h-[480px] rounded-xl overflow-hidden flex items-center justify-center bg-gray-50 border border-gray-100">
                      <img
                        src={URL.createObjectURL(uploadedFile)}
                        alt="Uploaded Preview"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>

                    <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                      <button
                        onClick={handleBrowseClick}
                        className="bg-white/90 backdrop-blur-sm text-gray-700 border border-gray-200 rounded-3xl px-4 py-2 text-xs sm:text-sm font-medium hover:bg-white hover:text-blue-600 transition-all shadow-sm flex items-center gap-2"
                      >
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        Change Image
                      </button>

                      <button
                        onClick={() => processImage(uploadedFile)}
                        className="bg-[#0076D2] text-white rounded-3xl px-5 py-2 text-xs sm:text-sm font-medium hover:bg-[#0056A3] shadow-md transition-colors flex items-center gap-2"
                      >
                        Remove Background
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  // Jika belum ada file (Drag & Drop Mode)
                  <div
                    className={`bg-[#F1F9FA] border-2 border-[#58C3EA] border-dashed rounded-xl p-6 sm:p-8 lg:p-12 text-center transition-colors ${
                      dragActive
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <div className="mb-4 flex justify-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex items-center justify-center">
                        <img
                          src="/asset/Group 1.png"
                          alt="Preview"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                    <p className="text-gray-600 mb-2 font-medium text-sm sm:text-base">
                      Drag and drop your images or folders here
                    </p>
                    <p className="text-gray-500 mb-4 text-sm">or</p>
                    <button
                      onClick={handleBrowseClick}
                      className="bg-[#DBF2F3] text-blue-400 rounded-3xl px-4 sm:px-6 py-2 sm:py-2.5 font-medium inline-flex items-center gap-2 hover:bg-[#0076D2] hover:text-white transition-colors text-sm sm:text-base"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      Browse Files
                    </button>
                  </div>
                )}

                <p className="text-xs sm:text-sm text-blue-500 mt-3 flex items-center gap-2">
                  <img
                    src="/icons/info.svg"
                    alt="info"
                    className="w-3 h-3 sm:w-4 sm:h-4"
                  />
                  Supported formats: PNG, JPG, and WebP (Max 100MB)
                </p>

                {/* Footer Info & Error Message */}
                {errorMessage && (
                  <div className="mt-4 p-3 sm:p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-3xl shadow-sm animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <img
                          src="/icons/exclamation-circle.svg"
                          alt="error"
                          className="w-4 h-4 sm:w-5 sm:h-5"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs sm:text-sm font-semibold text-red-800 mb-1">
                          Failed!
                        </h4>
                        <p className="text-xs sm:text-sm text-red-700 leading-relaxed">
                          {errorMessage}
                        </p>
                      </div>
                      <button
                        onClick={() => setErrorMessage(null)}
                        className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
                      >
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                />
              </div>
            )}

            {/* Camera View */}
            {activeTab === "camera" && (
              <>
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="relative bg-gray-900 aspect-video">
                    {!isCaptured ? (
                      <>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                        {showGrid && (
                          <div className="absolute inset-0 pointer-events-none">
                            <div
                              className="w-full h-full bg-transparent"
                              style={{
                                backgroundImage: `linear-gradient(0deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 33.33%), linear-gradient(90deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 33.33%)`,
                                backgroundSize: "33.33% 33.33%",
                              }}
                            />
                          </div>
                        )}

                        {countdown !== null && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-sm">
                            <div className="text-white text-8xl font-bold animate-pulse drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)]">
                              {countdown}
                            </div>
                          </div>
                        )}

                        <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 flex gap-2">
                          <button
                            onClick={() => setShowGrid(!showGrid)}
                            className={`rounded-full p-2 sm:p-3 shadow-lg hover:bg-gray-100 transition-all ${
                              showGrid
                                ? "bg-blue-500 text-white"
                                : "bg-white text-gray-700"
                            }`}
                          >
                            <svg
                              className="w-5 h-5 sm:w-6 sm:h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={captureImage}
                            className="bg-white rounded-full p-2 sm:p-3 shadow-lg hover:bg-gray-100 transition-all"
                          >
                            <svg
                              className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <img
                          src={
                            capturedImage
                              ? URL.createObjectURL(capturedImage)
                              : ""
                          }
                          alt="Captured Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 flex flex-col sm:flex-row gap-2 sm:justify-between sm:items-center">
                          <button
                            onClick={handleRetake}
                            className="bg-white text-gray-800 rounded-3xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium inline-flex items-center justify-center gap-1 sm:gap-2 hover:bg-gray-100 transition-colors shadow-md"
                          >
                            <svg
                              className="w-3 h-3 sm:w-4 sm:h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                            Retake
                          </button>

                          <button
                            onClick={() => {
                              if (capturedImage) {
                                setUploadedFile(capturedImage);
                                setActiveTab("upload");
                                setIsCaptured(false);
                                setCapturedImage(null);
                                stopCamera();
                                processImage(capturedImage);
                              }
                            }}
                            className="bg-[#0076D2] text-white rounded-3xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium inline-flex items-center justify-center gap-1 sm:gap-2 hover:bg-[#0056A3] transition-colors shadow-md"
                          >
                            <svg
                              className="w-3 h-3 sm:w-4 sm:h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Remove Background
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-500 p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-xs sm:text-sm text-blue-700">
                        {isCaptured
                          ? "Photo captured! Choose to retake or remove the background."
                          : "Make sure you have good lighting for even cleaner results."}
                      </p>
                    </div>
                    {!isCaptured && (
                      <div className="flex items-center gap-2 mt-2 sm:mt-0">
                        <span className="text-xs sm:text-sm text-gray-600">
                          RealTime Camera
                        </span>
                        <select
                          value={cameraQuality}
                          onChange={(e) => setCameraQuality(e.target.value)}
                          className="text-xs sm:text-sm border-0 bg-transparent text-gray-700 focus:ring-0 cursor-pointer"
                        >
                          <option value="hd">HD</option>
                          <option value="fullhd">Full HD</option>
                          <option value="4k">4K</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Select Image Processing Model (Moved Here) */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4 text-sm">
                Select Image Processing Model
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <label
                  className={`flex-1 flex flex-col p-3 sm:p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedMode === "standard"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="radio"
                      name="mode"
                      value="standard"
                      checked={selectedMode === "standard"}
                      onChange={(e) => setSelectedMode(e.target.value)}
                      className="w-4 h-4 text-blue-600 accent-blue-600"
                    />
                    <div className="font-semibold text-gray-900 text-sm">
                      Standard
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 leading-relaxed">
                    Best for complex details like hair, fur, or semi-transparent
                    objects.
                  </div>
                </label>

                <label
                  className={`flex-1 flex flex-col p-3 sm:p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedMode === "high-quality"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="radio"
                      name="mode"
                      value="high-quality"
                      checked={selectedMode === "high-quality"}
                      onChange={(e) => setSelectedMode(e.target.value)}
                      className="w-4 h-4 text-blue-600 accent-blue-600"
                    />
                    <div className="font-semibold text-gray-900 text-sm">
                      High Quality
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 leading-relaxed">
                    Balance on best details available for most portraits and
                    product photos.
                  </div>
                </label>

                <label
                  className={`flex-1 flex flex-col p-3 sm:p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedMode === "fast"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="radio"
                      name="mode"
                      value="fast"
                      checked={selectedMode === "fast"}
                      onChange={(e) => setSelectedMode(e.target.value)}
                      className="w-4 h-4 text-blue-600 accent-blue-600"
                    />
                    <div className="font-semibold text-gray-900 text-sm">
                      Fast Processing
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 leading-relaxed">
                    Quick result, ideal for simple objects or solid color
                    background.
                  </div>
                </label>
              </div>
            </div>

            {/* Example Images */}
            <div className="rounded-2xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-2 text-base sm:text-lg">
                    No image? No Problem!
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Try our tool using these images and see how we handle even
                    the trickiest details like hair and fur.
                  </p>
                </div>
                <div className="flex gap-2 sm:gap-3 justify-center sm:justify-end">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      onClick={() => handleExampleImageClick(i)}
                      className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-white rounded-2xl cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all flex items-center justify-center shadow-sm overflow-hidden flex-shrink-0"
                    >
                      <img
                        src={`/asset/${i}.png`}
                        alt={`Example ${i}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}