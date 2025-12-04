import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';
import LoadingSpinner from '../components/LoadingSpinner';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/authSlice';
import { jwtDecode } from 'jwt-decode';


const Login = () => {
  const dispatch= useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    // try {
    //   await authService.login(formData);
    //   navigate('/dashboard');
    // } catch (err) {
    //   setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    // } finally {
    //   setLoading(false);
    // }

        try {
        await authService.login(formData);

        const user = authService.getCurrentUser();
        console.log(user);

        
        if (user && user.name) {
        dispatch(
          setUser({
            fullName: user.name,     
          })
        );
      }
      console.log(user.name);


        if (!user || !user.role) {
          setError("Unable to fetch role. Contact support.");
          return;
        }

        if (user.role === "Admin") {
          navigate("/admin/dashboard");
        } else if (user.role === "Client") {
            // changed here
          navigate("/dashboard");
        } else {
          setError("Unknown role. Contact support.");
        }

      } catch (err) {
        console.log(err);
        setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      } finally {
        setLoading(false);
      }
    
  };

  return (
   <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 flex items-center justify-center px-4 relative">
    <Link 
      to="/" 
      className="absolute top-6 left-6 flex items-center text-gray-700 hover:text-blue-700 font-medium"
    >
      <svg xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 mr-1" 
          fill="none" 
          viewBox="0 0 24 24" 
          strokeWidth={2} 
          stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      Back to Home
    </Link>
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white border border-slate-300 rounded-2xl shadow-md overflow-hidden">
          {/* Header (gradient) */}
          <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-white/10">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mt-4">Welcome Back</h2>
            <p className="text-cyan-100 mt-1">Sign in to manage your policies</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white text-slate-800"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white text-slate-800"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-3 rounded-lg font-semibold hover:from-emerald-400 hover:to-cyan-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? 'Signing in...' : 'Sign In'}
             
            </button>

            <div className="text-center">
              <p className="text-slate-600">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-emerald-600 hover:text-emerald-700 font-semibold"
                >
                  Register here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;