
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Shield } from 'lucide-react';
import { useSelector } from 'react-redux';
import { authService } from '../services/authService';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch= useDispatch();
  //  Prefer Redux for UI state
  const { fullName, isAuthenticated } = useSelector((state) => state.auth);
  const [persistedUser, setPersistedUser] = useState(() => authService.getCurrentUser());

  const user = authService.getCurrentUser();

    useEffect(() => {
    // sync on mount
    setPersistedUser(authService.getCurrentUser());
 
    const onStorage = (e) => {
      if (e.key === 'user') setPersistedUser(authService.getCurrentUser());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleLogout = () => {
    authService.logout();
    dispatch(logout()); 
    navigate('/');
  };

const effectiveIsAuthenticated = isAuthenticated || !!persistedUser;
const displayName = fullName || persistedUser?.fullName || persistedUser?.name || '';

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          
          {/* Logo + Title + Welcome */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl">
              <Shield className="h-6 w-6 text-slate-950" />
            </div>
            <Link
              to={effectiveIsAuthenticated ? '/dashboard' : '/'}
              className="text-xl font-bold text-white tracking-tight"
            >
              InsureOne
            </Link>
            <div className='flex justify'></div>
            {/* ✅ Show welcome ONLY when authenticated & name exists */}
            {effectiveIsAuthenticated && displayName && (
              <span className="ml-5 text-white/95 font-semibold text-sm sm:text-base tracking-wide">
                Welcome, <span className="font-bold">{displayName}</span>
              </span>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-6">
            {!effectiveIsAuthenticated ? (
              /* PUBLIC / LOGGED OUT */
              <>
                <Link
                  to="/login"
                  className="text-slate-300 font-medium px-4 py-2 rounded-lg transition-all 
                  hover:text-white hover:shadow-md hover:shadow-emerald-400/40 hover:bg-slate-900/40 
                  transform hover:scale-[1.03]"
                >
                  Sign In
                </Link>
                
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 
                  text-slate-950 font-semibold hover:from-emerald-400 hover:to-cyan-400 
                  transition-all transform hover:scale-[1.05] 
                  hover:shadow-lg hover:shadow-emerald-400/40"
                >
                  Get Started
                </Link>
              </>
            ) : (
              /* LOGGED IN */
              <>
                <Link
                  to="/dashboard"
                  className={`transition-colors font-medium ${
                    isActive('/dashboard')
                      ? 'text-emerald-400'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Dashboard
                </Link>

                <Link
                  to="/policies"
                  className={`transition-colors font-medium ${
                    isActive('/policies')
                      ? 'text-emerald-400'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Policies
                </Link>

                <Link
                  to="/claims"
                  className={`transition-colors font-medium ${
                    isActive('/claims')
                      ? 'text-emerald-400'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Claims
                </Link>

                <div className="flex items-center space-x-4 border-l border-slate-700 pl-4">
                  <span className="text-slate-300 text-sm">
                    {user?.email || user?.username || fullName || 'User'}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-slate-300 hover:text-white transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;