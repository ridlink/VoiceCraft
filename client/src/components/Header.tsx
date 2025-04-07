import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TbMenu2, TbX, TbHome, TbMicrophone, TbFiles, TbDashboard, TbLogin, TbLogout, TbUserCircle, TbSettings } from "react-icons/tb";
import SettingsDialog from "@/components/SettingsDialog";

export default function Header() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="mr-2 text-white bg-white/20 p-2 rounded-full">
              <TbMicrophone size={24} />
            </span>
            <span className="font-display text-xl font-bold text-white">VoiceCraft</span>
          </Link>

          {/* Desktop Navigation */}
          {!isMobile ? (
            <nav className="hidden md:flex items-center space-x-1">
              <NavigationMenu>
                <NavigationMenuList className="bg-blue-800 rounded-lg p-1">
                  <NavigationMenuItem>
                    <Link href="/">
                      <NavigationMenuLink 
                        className={`${navigationMenuTriggerStyle()} ${location === "/" ? "bg-white/30 text-white font-bold" : "text-white hover:text-white hover:bg-white/20"}`}
                        active={location === "/"}
                      >
                        Dashboard
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  
                  <NavigationMenuItem>
                    <Link href="/create">
                      <NavigationMenuLink 
                        className={`${navigationMenuTriggerStyle()} ${location === "/create" ? "bg-white/30 text-white font-bold" : "text-white hover:text-white hover:bg-white/20"}`}
                        active={location === "/create"}
                      >
                        Create
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  
                  {user && (
                    <>
                      <NavigationMenuItem>
                        <Link href="/library">
                          <NavigationMenuLink 
                            className={`${navigationMenuTriggerStyle()} ${location === "/library" ? "bg-white/30 text-white font-bold" : "text-white hover:text-white hover:bg-white/20"}`}
                            active={location === "/library"}
                          >
                            Library
                          </NavigationMenuLink>
                        </Link>
                      </NavigationMenuItem>
                    </>
                  )}
                </NavigationMenuList>
              </NavigationMenu>

              <div className="ml-4">
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-white/20 hover:bg-white/30 text-white">
                        <Avatar>
                          <AvatarImage src={user.avatar || ""} alt={user.username} />
                          <AvatarFallback className="bg-primary-400 text-white">
                            {getInitials(user.fullName || user.username)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <span className="font-medium text-sm">{user.fullName || user.username}</span>
                          <span className="text-xs text-gray-500">{user.email}</span>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <Link href="/">
                        <DropdownMenuItem>
                          <TbDashboard className="mr-2 text-primary-500" />
                          Dashboard
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/create">
                        <DropdownMenuItem>
                          <TbHome className="mr-2 text-primary-500" />
                          Create
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/library">
                        <DropdownMenuItem>
                          <TbFiles className="mr-2 text-primary-500" />
                          My Library
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                      <SettingsDialog />
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500 focus:bg-red-50">
                        <TbLogout className="mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link href="/auth">
                    <Button className="bg-white text-blue-600 hover:bg-white/90 font-medium">
                      <TbLogin className="mr-2" />
                      Login
                    </Button>
                  </Link>
                )}
              </div>
            </nav>
          ) : (
            /* Mobile Menu Button */
            <div className="md:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleMobileMenu} 
                className="text-white hover:bg-white/20"
              >
                {mobileMenuOpen ? <TbX size={24} /> : <TbMenu2 size={24} />}
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        {isMobile && mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-3 border-t border-white/20 mt-3">
            <nav className="flex flex-col space-y-3 bg-blue-800 p-2 rounded-lg">
              <Link href="/" onClick={closeMobileMenu}>
                <Button
                  variant={location === "/" ? "default" : "ghost"}
                  className={`justify-start w-full ${location === "/" ? "bg-white/30 text-white font-bold" : "text-white hover:text-white hover:bg-white/20"}`}
                >
                  <TbDashboard className="mr-2" />
                  Dashboard
                </Button>
              </Link>
              
              <Link href="/create" onClick={closeMobileMenu}>
                <Button
                  variant={location === "/create" ? "default" : "ghost"}
                  className={`justify-start w-full ${location === "/create" ? "bg-white/30 text-white font-bold" : "text-white hover:text-white hover:bg-white/20"}`}
                >
                  <TbHome className="mr-2" />
                  Create
                </Button>
              </Link>
              
              {user && (
                <>
                  <Link href="/library" onClick={closeMobileMenu}>
                    <Button
                      variant={location === "/library" ? "default" : "ghost"}
                      className={`justify-start w-full ${location === "/library" ? "bg-white/30 text-white font-bold" : "text-white hover:text-white hover:bg-white/20"}`}
                    >
                      <TbFiles className="mr-2" />
                      Library
                    </Button>
                  </Link>
                </>
              )}
              
              {user ? (
                <>
                  <div className="pt-2 mt-2 border-t border-white/20">
                    <SettingsDialog />
                  </div>
                  <Button
                    variant="outline"
                    className="justify-start w-full mt-2 text-white border-white/30 hover:bg-red-500/30 hover:text-white font-medium"
                    onClick={() => {
                      handleLogout();
                      closeMobileMenu();
                    }}
                  >
                    <TbLogout className="mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <Link href="/auth" onClick={closeMobileMenu}>
                  <Button
                    variant="outline"
                    className="justify-start w-full text-white border-white/30 hover:bg-blue-500/30 hover:text-white font-medium"
                  >
                    <TbLogin className="mr-2" />
                    Login
                  </Button>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}