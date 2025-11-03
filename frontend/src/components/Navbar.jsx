import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { LogOut, SunMoon, User, Brain } from "lucide-react";
import { useEffect, useState } from "react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const { theme } = useThemeStore();
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  // Determine if current theme is dark based on your theme names
  useEffect(() => {
    const darkThemes = ['black', 'dark'];
    setIsDarkTheme(darkThemes.includes(theme));
  }, [theme]);

  return (
    <header
      className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
      backdrop-blur-lg bg-base-100/80"
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          {/* Logo with theme detection using Zustand store */}
          <Link
            to="/"
            className="flex items-center hover:opacity-90 transition-all"
          >
            {/* Show dark logo for light themes */}
            <img
              src="/logo.png"
              alt="Opinions Logo"
              className={`w-40 h-40 object-contain rounded-2xl hover:scale-105 transition-transform drop-shadow-[0_0_6px_rgba(59,130,246,0.4)] ${
                !isDarkTheme ? 'block' : 'hidden'
              }`}
            />
            {/* Show light logo for dark themes */}
            <img
              src="/logo3.png"
              alt="Opinions Logo"
              className={`w-40 h-40 object-contain rounded-2xl hover:scale-105 transition-transform drop-shadow-[0_0_6px_rgba(59,130,246,0.4)] ${
                isDarkTheme ? 'block' : 'hidden'
              }`}
            />
          </Link>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            {/* Themes Button */}
            <Link 
              to={"/themes"} 
              className="btn btn-sm gap-2 bg-base-200 hover:bg-base-300 border-base-300 text-base-content"
            >
              <SunMoon className="size-4" />
              <span className="hidden sm:inline">Themes</span>
            </Link>

            {/* Demo/Learn More Button */}
            <Link 
              to={"/demo"} 
              className="btn btn-sm gap-2 bg-base-200 hover:bg-base-300 border-base-300 text-base-content"
            >
              <Brain className="size-4" />
              <span className="hidden sm:inline">Learn More</span>
            </Link>

            {/* Authenticated User Menu */}
            {authUser && (
              <>
                {/* Profile Button */}
                <Link 
                  to={"/profile"} 
                  className="btn btn-sm gap-2 bg-base-200 hover:bg-base-300 border-base-300 text-base-content"
                >
                  <User className="size-4" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>

                {/* Logout Button */}
                <button 
                  className="btn btn-sm gap-2 bg-base-200 hover:bg-base-300 border-base-300 text-base-content" 
                  onClick={logout}
                >
                  <LogOut className="size-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;