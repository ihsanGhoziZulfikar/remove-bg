import React from 'react';

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img
            src="/asset/Frame 3.png"
            alt="logo"
            className="h-6 sm:h-8 lg:h-10 w-auto" />
        </div>
        <select className="text-blue-400 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>English</option>
          <option>Indonesia</option>
        </select>
      </div>
    </header>
  );
}
