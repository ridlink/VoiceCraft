import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="text-sm text-gray-500 mb-3 sm:mb-0">
            &copy; {new Date().getFullYear()} VoiceCraft AI. All rights reserved.
          </div>
          
          <div className="flex items-center gap-6">
            <Link href="/">
              <a className="text-gray-500 hover:text-primary-600 text-sm">Privacy Policy</a>
            </Link>
            <Link href="/">
              <a className="text-gray-500 hover:text-primary-600 text-sm">Terms of Service</a>
            </Link>
            <Link href="/">
              <a className="text-gray-500 hover:text-primary-600 text-sm">Help Center</a>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
