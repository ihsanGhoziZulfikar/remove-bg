"use client";

import React, { useState, useRef, useEffect } from "react";

export default function RemoveBGApp() {
  const [selectedMode, setSelectedMode] = useState("standard");
  const [dragActive, setDragActive] = useState(false);
  const [activeTab, setActiveTab] = useState("upload"); // "upload" or "camera"
  const [stream, setStream] = useState(null);
  const [cameraQuality, setCameraQuality] = useState("hd");
  const videoRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    // Handle file upload logic here
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: false
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
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "camera") {
      startCamera();
    } else {
      stopCamera();
    }
  };

  const captureImage = () => {
    // Capture image logic here
    console.log("Capturing image...");
  };

  useEffect(() => {
    // Cleanup camera when component unmounts
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img 
              src="/asset/Frame 3.png" 
              alt="logo" />
          </div>
          <select className="text-blue-400 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>English</option>
            <option>Indonesia</option>
          </select>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-5 grid-rows-5 gap-8 items-start">
          {/* Left Column - Preview */}
          <div className="col-span-2 row-span-5">
            <div className="rounded-2xl p-8 relative">
              <div className="relative">
                <img
                  src="/asset/image 8.png"
                  alt="Background"
                  className="w-full rounded-xl"
                />
              </div>
            </div>

            <div className="mt-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Remove Image
                <br />
                Backgrounds in
                <br />
                Seconds for Free
              </h1>
              <p className="text-gray-600 text-lg">
                The fastest way to get a transparent background. Drag in
                existing files for a quick fix, or jump on a live camera to
                create something new on the spot.
              </p>
            </div>
          </div>

          {/* Right Column - Upload Area / Camera */}
          <div className="col-span-3 row-span-5 col-start-3 space-y-4">
            {/* Tab Buttons */}
            <div className="flex justify-center">
              <div className="inline-flex bg-white rounded-2xl p-1 shadow-sm border border-gray-200">
                <button 
                  onClick={() => handleTabChange("upload")}
                  className={`rounded-2xl px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors ${
                    activeTab === "upload" 
                      ? "bg-[#0076D2] text-white" 
                      : "bg-transparent text-gray-600 hover:bg-gray-50"
                  }`}
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
                  Upload Image
                </button>
                <button 
                  onClick={() => handleTabChange("camera")}
                  className={`rounded-2xl px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors ${
                    activeTab === "camera" 
                      ? "bg-[#0076D2] text-white" 
                      : "bg-transparent text-gray-600 hover:bg-gray-50"
                  }`}
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
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Live Camera
                </button>
              </div>
            </div>

            {/* Upload Area - Show when activeTab is "upload" */}
            {activeTab === "upload" && (
              <>
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div
                    className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                      dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <div className="mb-4 flex justify-center">
                      <div className="w-24 h-24 flex items-center justify-center">
                        <img
                          src="/asset/Group 1.png"
                          alt="Preview"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                    <p className="text-gray-600 mb-2 font-medium">
                      Drag and drop your images or folders here
                    </p>
                    <p className="text-gray-500 mb-4">or</p>
                    <button className="bg-[#DBF2F3] text-blue-400 rounded-3xl px-6 py-2.5 font-medium inline-flex items-center gap-2 hover:bg-[#0076D2] hover:text-white transition-colors">
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
                  <p className="text-sm text-blue-500 mt-3 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Supported formats: PNG, JPG, and WebP (Max 100MB)
                  </p>
                </div>

                {/* Processing Mode Selection */}
                <div className="rounded-2xl px-6">
                  <h3 className="font-semibold text-gray-900 mb-4 text-sm">
                    Select Image Processing Model
                  </h3>

                  <div className="flex gap-3">
                    {/* Standard Mode */}
                    <label
                      className={`flex-1 flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all ${
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

                    {/* High Quality Mode */}
                    <label
                      className={`flex-1 flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all ${
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

                    {/* Fast Processing Mode */}
                    <label
                      className={`flex-1 flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all ${
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
              </>
            )}

            {/* Camera View - Show when activeTab is "camera" */}
            {activeTab === "camera" && (
              <>
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="relative bg-gray-900 aspect-video">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Camera Controls Overlay */}
                    <div className="absolute bottom-4 right-4">
                      <button 
                        onClick={captureImage}
                        className="bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-all"
                      >
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Info Banner */}
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-blue-700">
                      Make sure you have good lighting for even cleaner results.
                    </p>
                    <div className="ml-auto flex items-center gap-2">
                      <span className="text-sm text-gray-600">RealTime Camera</span>
                      <select 
                        value={cameraQuality}
                        onChange={(e) => setCameraQuality(e.target.value)}
                        className="text-sm border-0 bg-transparent text-gray-700 focus:ring-0 cursor-pointer"
                      >
                        <option value="hd">HD</option>
                        <option value="fullhd">Full HD</option>
                        <option value="4k">4K</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Example Images */}
            <div className="rounded-2xl p-6 flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-2 text-lg">
                  No image? No Problem!
                </h3>
                <p className="text-sm text-gray-600">
                  Try our tool using these images and see how we handle even the
                  trickiest details like hair and fur.
                </p>
              </div>

              <div className="flex gap-3 ml-8">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-24 h-24 bg-white rounded-2xl cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all flex items-center justify-center shadow-sm overflow-hidden"
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
      </main>

      {/* Footer */}
      <footer className="bg-[#F5F5F5] border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-start">
            {/* Left Section - Logo and Description */}
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-3">
                <img src="/asset/Frame 3.png" alt="logo" className="h-8" />
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Effortlessly remove image backgrounds in seconds with our
                AI-powered tool.
              </p>
            </div>

            {/* Right Section - Links in 3 Columns */}
            <div className="flex gap-16">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 text-sm">
                  Features
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="hover:text-blue-600 cursor-pointer">
                    Upload Image
                  </li>
                  <li className="hover:text-blue-600 cursor-pointer">
                    Live Camera
                  </li>
                  <li className="hover:text-blue-600 cursor-pointer">
                    Batch Processing
                  </li>
                  <li className="hover:text-blue-600 cursor-pointer">
                    Advanced Editor
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3 text-sm">
                  Support & Resources
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="hover:text-blue-600 cursor-pointer">
                    How it works
                  </li>
                  <li className="hover:text-blue-600 cursor-pointer">
                    Help Center
                  </li>
                  <li className="hover:text-blue-600 cursor-pointer">
                    API Documentation
                  </li>
                  <li className="hover:text-blue-600 cursor-pointer">
                    Contact Us
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3 text-sm">
                  Company & Legal
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="hover:text-blue-600 cursor-pointer">
                    Terms of Service
                  </li>
                  <li className="hover:text-blue-600 cursor-pointer">
                    Privacy Policy
                  </li>
                  <li className="hover:text-blue-600 cursor-pointer">
                    Cookie Policy
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 text-center text-sm text-gray-500">
            © 2025 Remove BG. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}