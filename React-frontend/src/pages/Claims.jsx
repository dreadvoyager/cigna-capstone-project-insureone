
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, FileText, Clock, Search, IndianRupee } from 'lucide-react';
import Navbar from '../components/Navbar';
import ClaimModal from '../components/ClaimModal';
import { claimService } from '../services/claimService';
import { policyService } from '../services/policyService';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';

/** Confirmation modal for withdrawing a claim */
const ConfirmWithdrawModal = ({ claim, onConfirm, onClose }) => {
  if (!claim) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 to-rose-600 p-5">
          <h3 className="text-lg font-bold text-white">Withdraw Claim</h3>
          <p className="text-rose-100 mt-1 text-sm">Claim #{claim.claimId}</p>
        </div>
        <div className="p-6 space-y-4 text-slate-800">
          <p className="text-sm">
            Are you sure you want to withdraw this claim? This action cannot be undone.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Keep Claim
            </button>
            <button
              onClick={() => onConfirm(claim)}
              className="px-4 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 transition-all"
            >
              Confirm Withdraw
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Claims = () => {
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [filteredClaims, setFilteredClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const [showHistory, setShowHistory] = useState(false);
  const [confirmWithdrawClaim, setConfirmWithdrawClaim] = useState(null); // NEW
  const [enforcing, setEnforcing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterClaims();
  }, [claims, policies, searchTerm, filterStatus]);

  const normalizeStatus = (s) => String(s || '').trim().toLowerCase();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [claimsData, policiesData] = await Promise.all([
        claimService.getAllClaims(),
        policyService.getAllPolicies(),
      ]);

      setClaims(claimsData || []);
      setPolicies(policiesData || []);

      // Auto-withdraw claims when their policy is cancelled
      await enforcePolicyCancellation(claimsData || [], policiesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load claims. Please try again.', {
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

  /**
   * Enforce: If a policy is Cancelled, mark ALL its related claims as Withdrawn.
   */
  const enforcePolicyCancellation = async (claimsData, policiesData) => {
    if (enforcing) return 0;
    setEnforcing(true);

    try {
      const cancelledPolicyIds = (policiesData || [])
        .filter((p) => normalizeStatus(p.status) === 'cancelled')
        .map((p) => p.policyId);

      if (cancelledPolicyIds.length === 0) {
        setEnforcing(false);
        return 0;
      }

      const toWithdraw = (claimsData || []).filter(
        (c) => cancelledPolicyIds.includes(c.policyId) && normalizeStatus(c.status) !== 'withdrawn'
      );

      if (toWithdraw.length === 0) {
        setEnforcing(false);
        return 0;
      }

      const results = await Promise.allSettled(
        toWithdraw.map((c) => claimService.updateClaim(c.claimId, { ...c, status: 'Withdrawn' }))
      );

      const successCount = results.filter((r) => r.status === 'fulfilled').length;
      const failureCount = results.length - successCount;

      toast.info(
        `Policy cancelled → ${successCount} claim${successCount !== 1 ? 's' : ''} withdrawn${
          failureCount ? ` (${failureCount} failed)` : ''
        }`,
        {
          position: 'top-center',
          autoClose: 2500,
          style: {
            background: 'linear-gradient(135deg, #93C5FD, #FDE68A)',
            color: '#1F2937',
            fontWeight: 600,
            borderRadius: '12px',
            padding: '14px 18px',
          },
        }
      );

      if (successCount > 0) {
        const [claimsRefreshed, policiesRefreshed] = await Promise.all([
          claimService.getAllClaims(),
          policyService.getAllPolicies(),
        ]);
        setClaims(claimsRefreshed || []);
        setPolicies(policiesRefreshed || []);
      }

      return successCount;
    } catch (err) {
      console.error('Error enforcing policy cancellation:', err);
      return 0;
    } finally {
      setEnforcing(false);
    }
  };

  const filterClaims = () => {
    const q = searchTerm.trim().toLowerCase();
    let filtered = claims.filter((c) => normalizeStatus(c.status) !== 'withdrawn');

    if (filterStatus !== 'All') {
      filtered = filtered.filter((c) => c.status === filterStatus);
    }

    if (q) {
      filtered = filtered.filter((c) => {
        const policy = policies.find((p) => p.policyId === c.policyId);
        const policyName = policy ? `${policy.insurer} - ${policy.policyType}` : '';

        return (
          policyName.toLowerCase().includes(q) ||
          (c.description || '').toLowerCase().includes(q) ||
          (c.status || '').toLowerCase().includes(q)
        );
      });
    }

    setFilteredClaims(filtered);
  };

  const handleAddClaim = () => {
    setSelectedClaim(null);
    setShowModal(true);
  };

  const handleEditClaim = (claim) => {
    if (claim.status === 'Approved' || claim.status === 'Rejected') {
      toast.warning('Cannot edit processed claims.', {
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
    if (claim.status === 'Withdrawn') {
      toast.info('Withdrawn claims cannot be edited.', {
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
    setSelectedClaim(claim);
    setShowModal(true);
  };

  // Open confirmation modal for withdraw
  const handleWithdrawClaimClick = (claim) => {
    setConfirmWithdrawClaim(claim);
  };

  // Confirm action: perform withdrawal
  const confirmWithdraw = async (claim) => {
    try {
 const updatedClaim = {
        ...claim,
        status: 'Withdrawn',
      };

      // Call the service and await response
      const response = await claimService.updateClaim(claim.claimId, updatedClaim);
      console.log('Withdrawal response:', response); // DEBUG
      
      await fetchData();

      toast.success('Claim withdrawn successfully!', {
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

      setConfirmWithdrawClaim(null);
    } catch (error) {
      console.error('Error withdrawing claim:', error);
      toast.error('Failed to withdraw claim.', {
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

  const handleModalClose = async () => {
    setShowModal(false);
    setSelectedClaim(null);
    await fetchData(); // refresh after submit/update
  };

  const getPolicyName = (policyId) => {
    const policy = policies.find((p) => p.policyId === policyId);
    return policy ? `${policy.insurer} - ${policy.policyType}` : 'Unknown Policy';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Under Review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading claims..." />;
  }

  return (
    <div className="min-h-screen bg-white pt-16">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">My Claims</h1>
              <p className="text-slate-600 mt-2">Submit and track your insurance claims</p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowHistory(true)}
                className="flex items-center space-x-2 bg-slate-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-slate-700 transition-all hover:scale-105 shadow-lg"
              >
                <FileText className="h-5 w-5" />
                <span>Claims History</span>
              </button>

              <button
                onClick={handleAddClaim}
                className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-5 py-2.5 rounded-lg font-semibold hover:scale-105 transition-all shadow-lg"
              >
                <Plus className="h-5 w-5" />
                <span>File Claim</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search claims (by policy or description)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="All">All Status</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* No Results */}
        {filteredClaims.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-300 p-12 text-center shadow-sm">
            <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No claims found</h3>
            <p className="text-slate-600 mb-6">File your first claim to get started</p>
            <button
              onClick={handleAddClaim}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-all shadow-lg"
            >
              <Plus className="h-5 w-5" />
              <span>File Claim</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClaims.map((claim) => (
              <div
                key={claim.claimId}
                className="bg-white rounded-xl border border-slate-300 overflow-hidden hover:-translate-y-2 hover:shadow-lg transition-transform duration-300"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-4">
                      <p className="text-sm text-cyan-100 mb-1">Claim #{claim.claimId}</p>
                      <h3 className="text-lg font-bold text-white truncate">
                        {getPolicyName(claim.policyId)}
                      </h3>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                        claim.status
                      )}`}
                    >
                      {claim.status}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6">
                  <div className="space-y-3 mb-4 text-slate-800">
                    <div className="flex items-center space-x-2">
                      <IndianRupee className="h-5 w-5 text-emerald-600" />
                      <span className="font-semibold">Amount:</span>
                      <span>₹{claim.claimAmt?.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex items-start space-x-2">
                      <FileText className="h-5 w-5 text-cyan-600 mt-0.5" />
                      <div className="flex-1">
                        <span className="font-semibold">Description:</span>
                        <p className="text-sm text-slate-600 mt-1 line-clamp-3">
                          {claim.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-cyan-600" />
                      <span className="font-semibold">Submitted:</span>
                      <span className="text-sm">
                        {new Date(claim.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex space-x-2 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => handleEditClaim(claim)}
                      disabled={claim.status === 'Withdrawn'}
                      className="flex-1 flex items-center justify-center space-x-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleWithdrawClaimClick(claim)}
                      disabled={
                        claim.status === 'Approved' ||
                        claim.status === 'Rejected' ||
                        claim.status === 'Withdrawn'
                      }
                      className="flex-1 flex items-center justify-center space-x-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Withdraw</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Claim Modal */}
      {showModal && (
        <ClaimModal
          claim={selectedClaim}
          policies={policies}
          claims={claims}
          onClose={handleModalClose}
        />
      )}

      {/* Confirmation Modal */}
      {confirmWithdrawClaim && (
        <ConfirmWithdrawModal
          claim={confirmWithdrawClaim}
          onConfirm={confirmWithdraw}
          onClose={() => setConfirmWithdrawClaim(null)}
        />
      )}

      {/* Claims History */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl w-full overflow-y-auto max-h-[80vh]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-800">Claims History</h2>
              <button
                onClick={() => setShowHistory(false)}
                className="text-slate-600 hover:text-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {claims.map((claim) => (
                <div
                  key={claim.claimId}
                  className={`bg-white rounded-lg border border-slate-300 p-4 shadow-sm ${
                    claim.status === 'Withdrawn' ? 'opacity-50' : ''
                  }`}
                >
                  <p className="text-sm text-slate-500">Claim #{claim.claimId}</p>
                  <h3 className="font-semibold">{getPolicyName(claim.policyId)}</h3>
                  <p>
                    Status: <span className="font-bold">{claim.status}</span>
                  </p>
                  <p>Amount: ₹{claim.claimAmt?.toFixed(2)}</p>
                  <p>Submitted: {new Date(claim.submittedAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Claims;
