import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, SunMoon, User,Brain } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();

  return (
   
    <header
      className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
      backdrop-blur-lg bg-base-100/80"
    >
     
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          {/* Logo Only */}
          <Link
            to="/"
            className="flex items-center hover:opacity-90 transition-all"
          >
            <img
              src="/logo.png"
              alt="Opinions Logo"
              className="w-40 h-40 object-contain rounded-2xl hover:scale-105 transition-transform drop-shadow-[0_0_6px_rgba(59,130,246,0.4)]"
            />
          </Link>

          {/* Buttons Section */}
          <div className="flex items-center gap-2">
            <Link to={"/themes"} className="btn btn-sm gap-2">
              <SunMoon />
              <span className="hidden sm:inline">Themes</span>
            </Link>
            <Link to={"/demo"} className="btn btn-sm gap-2">
              <Brain/>
              <span className="hidden sm:inline">Learn More</span>
            </Link>

            {authUser && (
              <>
                <Link to={"/profile"} className="btn btn-sm gap-2">
                  <User className="size-5" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>

                <button className="flex gap-2 items-center" onClick={logout}>
                  <LogOut className="size-5" />
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
