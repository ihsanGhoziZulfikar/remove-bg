import React from 'react';

interface UploadAreaProps {
  uploadedFile: File | null;
  dragActive: boolean;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onBrowseClick: () => void;
}

export default function UploadArea({
  uploadedFile,
  dragActive,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onBrowseClick
}: UploadAreaProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
      {uploadedFile ? (
        <div className="relative">
          <div className="w-full max-h-[300px] sm:max-h-[400px] lg:max-h-[480px] rounded-xl overflow-hidden flex items-center justify-center bg-gray-50">
            <img
              src={URL.createObjectURL(uploadedFile)}
              alt="Uploaded Preview"
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 bg-transparent bg-opacity-50 rounded-lg p-2 sm:p-4 text-white">
            <button
              onClick={onBrowseClick}
              className="bg-white text-gray-800 rounded-3xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium inline-flex items-center gap-1 sm:gap-2 hover:bg-gray-100 transition-colors"
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
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              Change Image
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`bg-[#F1F9FA] border-2 border-[#58C3EA] border-dashed rounded-xl p-6 sm:p-8 lg:p-12 text-center transition-colors ${
            dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
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
            onClick={onBrowseClick}
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
        <img src="/icons/info.svg" alt="info" className="w-3 h-3 sm:w-4 sm:h-4" />
        Supported formats: PNG, JPG, and WebP (Max 100MB)
      </p>
    </div>
  );
}
