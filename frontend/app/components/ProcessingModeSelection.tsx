import React from 'react';

interface ProcessingModeSelectionProps {
  selectedMode: string;
  onModeChange: (mode: string) => void;
}

export default function ProcessingModeSelection({ selectedMode, onModeChange }: ProcessingModeSelectionProps) {
  return (
    <div className="rounded-2xl px-4 sm:px-6">
      <h3 className="font-semibold text-gray-900 mb-4 text-sm">
        Select Image Processing Model
      </h3>

      <div className="flex flex-col sm:flex-row gap-3">
        {/* Standard Mode */}
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
              onChange={(e) => onModeChange(e.target.value)}
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
              onChange={(e) => onModeChange(e.target.value)}
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
              onChange={(e) => onModeChange(e.target.value)}
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
  );
}
