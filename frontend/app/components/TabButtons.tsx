import React from 'react';

interface TabButtonsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function TabButtons({ activeTab, onTabChange }: TabButtonsProps) {
  return (
    <div className="flex justify-center">
      <div className="inline-flex bg-white rounded-2xl p-1 shadow-sm border border-gray-200 overflow-hidden">
        <button
          onClick={() => onTabChange("upload")}
          className={`rounded-2xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2 transition-colors ${
            activeTab === "upload"
              ? "bg-[#0076D2] text-white"
              : "bg-transparent text-gray-600 hover:bg-gray-50"
          }`}
        >
          <svg
            className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
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
          <span className="hidden sm:inline">Upload Image</span>
          <span className="sm:hidden">Upload</span>
        </button>
        <button
          onClick={() => onTabChange("camera")}
          className={`rounded-2xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2 transition-colors ${
            activeTab === "camera"
              ? "bg-[#0076D2] text-white"
              : "bg-transparent text-gray-600 hover:bg-gray-50"
          }`}
        >
          <svg
            className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
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
          <span className="hidden sm:inline">Live Camera</span>
          <span className="sm:hidden">Camera</span>
        </button>
      </div>
    </div>
  );
}
