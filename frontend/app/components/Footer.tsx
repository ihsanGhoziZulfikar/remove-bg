 export default function Footer() {
    return (
        <footer className="bg-[#F5F5F5] mt-8 lg:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-3">
                <img
                  src="/asset/Frame 3.png"
                  alt="logo"
                  className="h-6 sm:h-8"
                />
              </div>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Effortlessly remove image backgrounds in seconds with our
                AI-powered tool.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 lg:gap-16 w-full lg:w-auto">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-3 text-xs sm:text-sm">
                  Features
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
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
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-3 text-xs sm:text-sm">
                  Support & Resources
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
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
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-3 text-xs sm:text-sm">
                  Company & Legal
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
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
          <div className="mt-8 lg:mt-12 text-center text-xs sm:text-sm text-gray-500">
            © 2025 Remove BG. All rights reserved.
          </div>
        </div>
      </footer>
    )
 }