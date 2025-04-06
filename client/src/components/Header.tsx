import { useState } from "react";
import { Link } from "wouter";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-primary-600">
            <i className="ri-sound-module-fill text-2xl"></i>
          </span>
          <h1 className="font-display font-bold text-lg sm:text-xl text-gray-800">VoiceCraft AI</h1>
        </div>
        
        <div className="hidden sm:flex items-center gap-6">
          <nav className="flex gap-5">
            <Link href="/">
              <a className="text-gray-600 hover:text-primary-600 font-medium text-sm transition-colors">Dashboard</a>
            </Link>
            <Link href="/">
              <a className="text-gray-600 hover:text-primary-600 font-medium text-sm transition-colors">History</a>
            </Link>
            <Link href="/">
              <a className="text-gray-600 hover:text-primary-600 font-medium text-sm transition-colors">Voices</a>
            </Link>
            <Link href="/">
              <a className="text-gray-600 hover:text-primary-600 font-medium text-sm transition-colors">Help</a>
            </Link>
          </nav>
          
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
              <i className="ri-user-line"></i>
            </span>
          </div>
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <button className="sm:hidden text-gray-500">
              <i className="ri-menu-line text-xl"></i>
            </button>
          </SheetTrigger>
          <SheetContent>
            <nav className="flex flex-col gap-4 mt-8">
              <Link href="/">
                <a className="text-gray-600 hover:text-primary-600 font-medium transition-colors py-2">Dashboard</a>
              </Link>
              <Link href="/">
                <a className="text-gray-600 hover:text-primary-600 font-medium transition-colors py-2">History</a>
              </Link>
              <Link href="/">
                <a className="text-gray-600 hover:text-primary-600 font-medium transition-colors py-2">Voices</a>
              </Link>
              <Link href="/">
                <a className="text-gray-600 hover:text-primary-600 font-medium transition-colors py-2">Help</a>
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
