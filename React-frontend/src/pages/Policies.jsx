
import { useState, useEffect } from 'react';
import { Plus, RefreshCcw, Calendar, IndianRupee, Search, Info, XCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import PolicyModal from '../components/PolicyModal';
import { policyService } from '../services/policyService';
import PolicyInfoModal from '../components/PolicyInfoModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';

/** Lightweight confirmation modal */
const ConfirmCancelModal = ({ policy, onConfirm, onClose }) => {
  if (!policy) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 p-5">
          <h3 className="text-lg font-bold text-white">Cancel Policy</h3>
          <p className="text-cyan-100 mt-1 text-sm">
            {policy.insurer} — {policy.policyType}
          </p>
        </div>

        <div className="p-6 space-y-4 text-slate-800">
          <p className="text-sm">
            Are you sure you want to cancel this policy? This action will prevent renewals and may
            affect claim eligibility.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Keep Policy
            </button>
            <button
              onClick={() => onConfirm(policy)}
              className="px-4 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 transition-all"
            >
              Confirm Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Policies = () => {
  const [policies, setPolicies] = useState([]);
  const [filteredPolicies, setFilteredPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoPolicy, setInfoPolicy] = useState(null);

  // New: confirmation modal state
  const [confirmCancelPolicy, setConfirmCancelPolicy] = useState(null);

  useEffect(() => {
    fetchPolicies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterPolicies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [policies, searchTerm, filterStatus]);

  const fetchPolicies = async () => {
    try {
      const data = await policyService.getAllPolicies();
      setPolicies(data || []);
    } catch (error) {
      console.error('Error fetching policies:', error);
      toast.error('Failed to load policies. Please try again.', {
        position: 'top-center',
        autoClose: 2500,
        style: {
          background: 'linear-gradient(135deg, #FCA5A5, #F87171)',
          color: '#1E293B',
          fontWeight: 600,
          borderRadius: '12px',
          padding: '16px',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilExpiry = (endDate) => {
    const today = new Date();
    const expiryDate = new Date(endDate);
    const diffTime = expiryDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const filterPolicies = () => {
    let filtered = [...policies];

    const computeStatus = (p) => (getDaysUntilExpiry(p.endDate) <= 0 ? 'Lapsed' : p.status);

    if (filterStatus !== 'All') {
      filtered = filtered.filter((p) => computeStatus(p) === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.insurer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.policyType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPolicies(filtered);
  };

  const handleAddPolicy = () => {
    setSelectedPolicy(null);
    setShowModal(true);
  };

  const handleRenewPolicy = (policy) => {
    if (policy.status === 'Cancelled') {
      toast.info('Cancelled policies cannot be renewed.', {
        position: 'top-center',
        autoClose: 2500,
        icon: '🚫',
        style: {
          background: 'linear-gradient(135deg, #93C5FD, #FDE68A)',
          color: '#1F2937',
          fontWeight: 600,
          borderRadius: '12px',
          padding: '14px 18px',
        },
      });
      return;
    }
    setSelectedPolicy({ ...policy, mode: 'renew' });
    setShowModal(true);
  };

  // Entry point: show confirmation modal instead of window.confirm
  const handleCancelPolicyClick = (policy) => {
    if (policy.status !== 'Active') {
      toast.warning('Only active policies can be cancelled.', {
        position: 'top-center',
        autoClose: 2500,
        icon: '⚠️',
        style: {
          background: 'linear-gradient(135deg, #FDE68A, #F59E0B)',
          color: '#1F2937',
          fontWeight: 600,
          borderRadius: '12px',
          padding: '14px 18px',
        },
      });
      return;
    }
    setConfirmCancelPolicy(policy); // open modal
  };

  // Confirm action: perform cancellation
  const confirmCancel = async (policy) => {
    try {
      await policyService.updatePolicy(policy.policyId, { ...policy, status: 'Cancelled' });

      toast.success('Policy cancelled successfully.', {
        position: 'top-center',
        autoClose: 2500,
        icon: '✅',
        style: {
          background: 'linear-gradient(135deg, #6EE7B7, #38BDF8)',
          color: '#0F172A',
          fontWeight: 600,
          borderRadius: '12px',
          padding: '14px 18px',
        },
      });

      setConfirmCancelPolicy(null);
      fetchPolicies();
    } catch (err) {
      console.error('Cancel error:', err);
      toast.error('Failed to cancel policy.', {
        position: 'top-center',
        autoClose: 2500,
        icon: '❌',
        style: {
          background: 'linear-gradient(135deg, #FCA5A5, #F87171)',
          color: '#1E293B',
          fontWeight: 600,
          borderRadius: '12px',
          padding: '16px',
        },
      });
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedPolicy(null);
    fetchPolicies();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Lapsed':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const canRenew = (policy) => {
    const daysLeft = getDaysUntilExpiry(policy.endDate);
    return daysLeft <= 30; // includes lapsed (<= 0)
  };

  const handleShowInfo = (policyId) => {
    const selected = policies.find((p) => p.policyId === policyId);
    setInfoPolicy(selected);
    setShowInfoModal(true);
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading policies..." />;
  }

  return (
    <div className="min-h-screen bg-white pt-16">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">My Policies</h1>
            <p className="text-slate-600 mt-2">Manage your insurance policies</p>
          </div>

          <button
            onClick={handleAddPolicy}
            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 px-5 py-2.5 rounded-lg font-semibold hover:scale-105 transition-all shadow-lg"
          >
            <Plus className="h-5 w-5" />
            <span>Add Policy</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by insurer or policy type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-slate-300 rounded-lg"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Lapsed">Lapsed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Policies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPolicies.map((policy) => {
            const daysLeft = getDaysUntilExpiry(policy.endDate);
            const computedStatus = daysLeft <= 0 ? 'Lapsed' : policy.status;

            return (
              <div
                key={policy.policyId}
                className="bg-white border border-slate-300 rounded-xl hover:-translate-y-1 hover:shadow-2xl transition-all overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-white">{policy.insurer}</h3>
                      <p className="text-cyan-100">{policy.policyType}</p>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(computedStatus)}`}>
                        {computedStatus}
                      </span>

                      {daysLeft <= 30 && daysLeft > 0 && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-300">
                          Expires in {daysLeft} days
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 text-slate-800 space-y-3">
                  <div className="flex items-center space-x-2">
                    <IndianRupee className="h-5 w-5 text-emerald-600" />
                    <span className="font-semibold">Premium:</span>
                    <span>₹{policy.premiumAmt?.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-cyan-600" />
                    <span className="font-semibold">Start:</span>
                    <span>{new Date(policy.startDate).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-cyan-600" />
                    <span className="font-semibold">End:</span>
                    <span>{new Date(policy.endDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex space-x-2 p-4 border-t border-slate-300">
                  {/* Cancel button — ONLY Active & >30 days */}
                  {policy.status === 'Active' && daysLeft > 30 && (
                    <button
                      onClick={() => handleCancelPolicyClick(policy)}
                      className="flex-1 flex items-center justify-center space-x-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                  )}

                  {/* Renew button — Only expiring soon OR lapsed */}
                  {computedStatus !== 'Cancelled' && canRenew(policy) && (
                    <button
                      onClick={() => handleRenewPolicy(policy)}
                      className="flex-1 flex items-center justify-center space-x-1 px-4 py-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors"
                    >
                      <RefreshCcw className="h-4 w-4" />
                      <span>Renew</span>
                    </button>
                  )}

                  {/* Info button — always visible */}
                  <button
                    onClick={() => handleShowInfo(policy.policyId)}
                    className="flex-1 flex items-center justify-center space-x-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Info className="h-4 w-4" />
                    <span>Info</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      {showModal && <PolicyModal policy={selectedPolicy} onClose={handleModalClose} />}
      {showInfoModal && <PolicyInfoModal policy={infoPolicy} onClose={() => setShowInfoModal(false)} />}

      {/* Confirmation Modal */}
      {confirmCancelPolicy && (
        <ConfirmCancelModal
          policy={confirmCancelPolicy}
          onConfirm={confirmCancel}
          onClose={() => setConfirmCancelPolicy(null)}
        />
      )}
    </div>
  );
};

export default Policies;
