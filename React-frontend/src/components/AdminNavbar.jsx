import { Link, useNavigate } from "react-router-dom";
import { LogOut, Shield, BadgeCheck } from "lucide-react";
import { authService } from "../services/authService";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";

const AdminNavbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { fullName, isAuthenticated } = useSelector((state) => state.auth);
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();      // clear localStorage
    dispatch(logout());        // clear Redux state
    navigate("/");            
  };

  const displayName =
    fullName || user?.fullName || user?.username || user?.email || "Admin";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">

          {/* Left Logo */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl">
              <Shield className="h-6 w-6 text-slate-950" />
            </div>

            <Link
              to={isAuthenticated ? "/admin/dashboard" : "/"}
              className="text-xl font-bold text-white tracking-tight"
            >
              InsureOne
            </Link>
          </div>

          {/* Center Admin Indicator */}
          <div className="hidden sm:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-1.5 rounded-full shadow-md">
              <BadgeCheck className="h-5 w-5 text-slate-950" />
              <span className="text-slate-900 font-semibold tracking-wide">
                Admin Dashboard
              </span>
            </div>
          </div>

          {/* Right User Info + Logout */}
          {isAuthenticated && (
            <div className="flex items-center space-x-4">
              <span className="text-slate-300 text-sm">
                {displayName}
              </span>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-slate-300 hover:text-white transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;