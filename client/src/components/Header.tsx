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
import { TbMenu2, TbX, TbHome, TbMicrophone, TbFiles, TbDashboard, TbLogin, TbLogout, TbUserCircle } from "react-icons/tb";

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
    <header className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="mr-2 text-primary">
              <TbMicrophone size={28} />
            </span>
            <span className="font-display text-xl font-bold">VoiceCraft</span>
          </Link>

          {/* Desktop Navigation */}
          {!isMobile ? (
            <nav className="hidden md:flex items-center space-x-1">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <Link href="/">
                      <NavigationMenuLink 
                        className={navigationMenuTriggerStyle()}
                        active={location === "/"}
                      >
                        Home
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  
                  <NavigationMenuItem>
                    <Link href="/voices">
                      <NavigationMenuLink 
                        className={navigationMenuTriggerStyle()}
                        active={location === "/voices"}
                      >
                        Voices
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  
                  {user && (
                    <>
                      <NavigationMenuItem>
                        <Link href="/library">
                          <NavigationMenuLink 
                            className={navigationMenuTriggerStyle()}
                            active={location === "/library"}
                          >
                            Library
                          </NavigationMenuLink>
                        </Link>
                      </NavigationMenuItem>
                      
                      <NavigationMenuItem>
                        <Link href="/dashboard">
                          <NavigationMenuLink 
                            className={navigationMenuTriggerStyle()}
                            active={location === "/dashboard"}
                          >
                            Dashboard
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
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar>
                          <AvatarImage src={user.avatar || ""} alt={user.username} />
                          <AvatarFallback>
                            {getInitials(user.fullName || user.username)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <Link href="/dashboard">
                        <DropdownMenuItem>
                          <TbDashboard className="mr-2" />
                          Dashboard
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/library">
                        <DropdownMenuItem>
                          <TbFiles className="mr-2" />
                          My Library
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <TbLogout className="mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link href="/auth">
                    <Button>
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
              <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
                {mobileMenuOpen ? <TbX size={24} /> : <TbMenu2 size={24} />}
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        {isMobile && mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-3 border-t border-gray-200 mt-3">
            <nav className="flex flex-col space-y-3">
              <Link href="/" onClick={closeMobileMenu}>
                <Button
                  variant={location === "/" ? "default" : "ghost"}
                  className="justify-start w-full"
                >
                  <TbHome className="mr-2" />
                  Home
                </Button>
              </Link>
              
              <Link href="/voices" onClick={closeMobileMenu}>
                <Button
                  variant={location === "/voices" ? "default" : "ghost"}
                  className="justify-start w-full"
                >
                  <TbMicrophone className="mr-2" />
                  Voices
                </Button>
              </Link>
              
              {user && (
                <>
                  <Link href="/library" onClick={closeMobileMenu}>
                    <Button
                      variant={location === "/library" ? "default" : "ghost"}
                      className="justify-start w-full"
                    >
                      <TbFiles className="mr-2" />
                      Library
                    </Button>
                  </Link>
                  
                  <Link href="/dashboard" onClick={closeMobileMenu}>
                    <Button
                      variant={location === "/dashboard" ? "default" : "ghost"}
                      className="justify-start w-full"
                    >
                      <TbDashboard className="mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                </>
              )}
              
              {user ? (
                <Button
                  variant="ghost"
                  className="justify-start w-full border-t border-gray-200 mt-2 pt-2"
                  onClick={() => {
                    handleLogout();
                    closeMobileMenu();
                  }}
                >
                  <TbLogout className="mr-2" />
                  Logout
                </Button>
              ) : (
                <Link href="/auth" onClick={closeMobileMenu}>
                  <Button
                    variant="default"
                    className="justify-start w-full"
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