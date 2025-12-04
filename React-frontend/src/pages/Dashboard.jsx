import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileText, AlertTriangle, TrendingUp, Plus } from 'lucide-react';
import Navbar from '../components/Navbar';
import { policyService } from '../services/policyService';
import { claimService } from '../services/claimService';
import LoadingSpinner from '../components/LoadingSpinner';
import SupportCard from '../components/SupportCard';   

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPolicies: 0,
    activePolicies: 0,
    totalClaims: 0,
    pendingClaims: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showSupport, setShowSupport] = useState(false);

  const supportInfo = {
    phone: "+91-9876543210",
    email: "support@insureone.com",
    address: "Bengaluru, India 560085",
    hours: "Mon–Fri • 9AM–6PM"
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [policies, claims] = await Promise.all([
        policyService.getAllPolicies(),
        claimService.getAllClaims(),
      ]);

      setStats({
        totalPolicies: policies.length,
        activePolicies: policies.filter(p => p.status === 'Active').length,
        totalClaims: claims.length,
        pendingClaims: claims.filter(c => c.status === 'Submitted' || c.status === 'Under Review').length,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Policies',
      value: stats.totalPolicies,
      icon: Shield,
      colorClasses: 'from-emerald-500 to-cyan-500',
      link: '/policies',
    },
    {
      title: 'Active Policies',
      value: stats.activePolicies,
      icon: TrendingUp,
      colorClasses: 'from-emerald-400 to-cyan-400',
      link: '/policies',
    },
    {
      title: 'Total Claims',
      value: stats.totalClaims,
      icon: FileText,
      colorClasses: 'from-emerald-500 to-cyan-500',
      link: '/claims',
    },
    {
      title: 'Pending Claims',
      value: stats.pendingClaims,
      icon: AlertTriangle,
      colorClasses: 'from-emerald-400 to-cyan-400',
      link: '/claims',
    },
  ];

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-white pt-16">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-1 leading-tight">
            Dashboard
          </h1>
          <p className="text-slate-600 mt-2">Overview of your insurance policies and claims</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Link
                key={index}
                to={stat.link}
                className="rounded-2xl overflow-hidden bg-white border border-slate-300 transition-transform transform hover:-translate-y-1 hover:shadow-lg"
              >
                <div className={`p-6 bg-gradient-to-r ${stat.colorClasses}`}>
                  <Icon className="h-12 w-12 text-white mb-4" />
                  <p className="text-white text-sm font-medium mb-1">{stat.title}</p>
                  <p className="text-white text-4xl font-bold">{stat.value}</p>
                </div>
                <div className="p-4 bg-white/90">
                  <p className="text-sm text-slate-600">View details →</p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions + Support */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Quick Actions */}
          <div className="rounded-2xl bg-white border border-slate-300 p-8 transition-shadow hover:shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Quick Actions</h2>
              <div className="p-2 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </div>

            <div className="space-y-4">
              <Link
                to="/policies"
                className="block p-4 rounded-xl border border-slate-300 hover:border-emerald-200 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">Add New Policy</h3>
                    <p className="text-sm text-slate-600">Create a new insurance policy</p>
                  </div>
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                </div>
              </Link>

              <Link
                to="/claims"
                className="block p-4 rounded-xl border border-slate-300 hover:border-cyan-200 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">File New Claim</h3>
                    <p className="text-sm text-slate-600">Submit a new insurance claim</p>
                  </div>
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Support Section */}
          <div className="rounded-2xl overflow-hidden bg-white border border-slate-300 p-8 relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 pointer-events-none"></div>

            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-4 text-slate-900">Need Help?</h2>
              <p className="mb-6 text-slate-600">
                Our support team is here to assist you with any questions about your policies or claims.
              </p>

              {/* Contact Support button */}
              <button
                onClick={() => setShowSupport(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-emerald-400 hover:to-cyan-400 transition-all transform hover:scale-105 shadow-2xl shadow-emerald-500/25"
              >
                Contact Support
              </button>

              {showSupport && (
                <div className="mt-6">
                  <SupportCard info={supportInfo} onClose={() => setShowSupport(false)} />
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
