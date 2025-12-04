import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { authService } from '../services/authService';
import { toast } from 'react-toastify';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
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

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      await authService.register({
        fullName: formData.username,
        email: formData.email,
        password: formData.password,
      });

      // SUCCESS TOAST
      toast.success("Registration Successful! Welcome aboard!", {
        position: "top-center",
        autoClose: 2500,
        style: {
          background: "linear-gradient(135deg, #6EE7B7, #38BDF8)",
          color: "#0F172A",
          fontWeight: 600,
          borderRadius: "12px",
          fontSize: "16px",
        }
      });

      navigate('/login'); // redirect to login after registering
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      console.log(formData);
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
        <div className="bg-white border border-slate-300 rounded-2xl shadow-md overflow-hidden">

          <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-white/10">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mt-4">Create Account</h2>
            <p className="text-cyan-100 mt-1">Join us to manage your insurance</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg"
                  placeholder="Choose a username"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg"
                  placeholder="At least 6 characters"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-lg"
                  placeholder="Confirm your password"
                />
                {formData.confirmPassword &&
                  formData.password === formData.confirmPassword && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500" />
                  )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-3 rounded-lg font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-slate-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-emerald-600 hover:text-emerald-700 font-semibold"
                >
                  Sign in here
                </Link>
              </p>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
};

export default Register;