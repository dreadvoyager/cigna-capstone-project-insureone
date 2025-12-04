
import { useState, useEffect, useMemo } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { claimService } from '../services/claimService';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

const ClaimModal = ({ claim, policies, claims = [], onClose }) => {
  const [formData, setFormData] = useState({
    policyId: '',
    claimAmt: '',
    description: '',
    status: 'Submitted',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Populate form when editing an existing claim
  useEffect(() => {
    if (claim) {
      setFormData({
        policyId: String(claim.policyId ?? ''),
        claimAmt: String(claim.claimAmt ?? ''),
        description: claim.description ?? '',
        status: claim.status ?? 'Submitted',
      });
    }
  }, [claim]);

  // --- Helpers for normalization ---
  const normalizeId = (v) => {
    const num = Number(v);
    return Number.isNaN(num) ? String(v).trim() : num; // allow numeric compare first
  };
  const normalizeStatus = (s) => String(s || '').trim().toLowerCase();
  const toNumber = (v) => {
    const n = Number(v);
    return Number.isNaN(n) ? 0 : n;
  };

  // Selected policy (compare robustly)
  const selectedPolicy = useMemo(() => {
    const formId = normalizeId(formData.policyId);
    return policies.find((p) => normalizeId(p.policyId) === formId);
  }, [policies, formData.policyId]);

  // Which statuses count towards remaining limit?
  // We count Submitted, Under Review, Approved (excluding Rejected, Cancelled, etc.)
  const countedStatuses = new Set(['submitted', 'under review', 'approved']);

  // Claims relevant to the selected policy (excluding rejected etc.)
  const relevantClaims = useMemo(() => {
    const formId = normalizeId(formData.policyId);
    return (claims || [])
      .filter((c) => normalizeId(c.policyId) === formId)
      .filter((c) => countedStatuses.has(normalizeStatus(c.status)));
  }, [claims, formData.policyId]);

  // Exclude current claim when editing
  const relevantClaimsExcludingCurrent = useMemo(() => {
    if (!claim) return relevantClaims;
    return relevantClaims.filter((c) => c.claimId !== claim.claimId);
  }, [relevantClaims, claim]);

  // Sum already claimed (excluding current when editing)
  const totalClaimedExcludingCurrent = useMemo(() => {
    return relevantClaimsExcludingCurrent.reduce(
      (sum, c) => sum + toNumber(c.claimAmt),
      0
    );
  }, [relevantClaimsExcludingCurrent]);

  const premium = toNumber(selectedPolicy?.premiumAmt);
  const originalAmt = toNumber(claim?.claimAmt);

  // Available ceiling for the current input: premium - (others) + (original if editing)
  const availableLimitForThisClaim = useMemo(() => {
    const available = premium - totalClaimedExcludingCurrent + originalAmt;
    return Math.max(0, available);
  }, [premium, totalClaimedExcludingCurrent, originalAmt]);

  const activePolicies = useMemo(
    () => policies.filter((p) => normalizeStatus(p.status) === 'active'),
    [policies]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const validateForm = () => {
    // Required fields
    if (!formData.policyId || !formData.claimAmt || !formData.description) {
      setError('Please fill in all required fields');
      return false;
    }

    const amt = toNumber(formData.claimAmt);
    if (amt <= 0) {
      setError('Claim amount must be greater than 0');
      return false;
    }

    if (formData.description.length < 10) {
      setError('Description must be at least 10 characters long');
      return false;
    }

    if (formData.description.length > 200) {
      setError('Description must not exceed 200 characters');
      return false;
    }

    if (!selectedPolicy) {
      setError('Please select a valid policy');
      return false;
    }

    // Multiple-claim rule: new amount cannot exceed available limit
    if (amt > availableLimitForThisClaim) {
      const prettyLimit = availableLimitForThisClaim.toLocaleString('en-IN', {
        maximumFractionDigits: 2,
      });
      setError(`Claim amount cannot exceed the available limit: ₹${prettyLimit}`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setError('User is not authenticated');
        setLoading(false);
        return;
      }

      // Decode token to get userId
      const decoded = jwtDecode(token);
      const userId = decoded.id; // Adjust to your JWT payload

      // Prepare claim payload
      const claimData = {
        ...formData,
        policyId: parseInt(formData.policyId, 10),
        claimAmt: parseFloat(formData.claimAmt),
        userId,
        submittedAt: new Date().toISOString(),
      };

      console.log('Claim data before sending:', claimData);

      if (claim) {
        await claimService.updateClaim(claim.claimId, claimData);
      } else {
        await claimService.createClaim(claimData);
      }

      toast.success("Claim submitted successfully! We'll take it from here", {
        position: 'top-center',
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        icon: () => (
          <span style={{ color: 'white', fontSize: '22px', fontWeight: 'bold' }}>
            ✔
          </span>
        ),
        style: {
          fontSize: '18px',
          padding: '18px 22px',
          borderRadius: '14px',
          fontFamily: "'Poppins', 'Segoe UI', sans-serif",
          background: 'linear-gradient(135deg, #6EE7B7, #38BDF8)',
          color: '#0F172A',
          fontWeight: '600',
          boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
          border: '1px solid rgba(0,0,0,0.1)',
        },
      });

      onClose();
    } catch (err) {
      console.error('Error object:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.message || 'Failed to save claim');
    } finally {
      setLoading(false);
    }
  };

  // Immediate UI guard for the button
  const amt = toNumber(formData.claimAmt);
  const violatesAvailableLimit =
    selectedPolicy && amt > availableLimitForThisClaim;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-green-500 to-blue-600 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">
            {claim ? 'Edit Claim' : 'File New Claim'}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {activePolicies.length === 0 && !claim && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                You don't have any active policies. Please add a policy before filing a claim.
              </p>
            </div>
          )}

          {/* Policy select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Policy *
            </label>
            <select
              name="policyId"
              value={formData.policyId}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              required
              disabled={!!claim}
            >
              <option value="">Choose a policy</option>
              {activePolicies.map((policy) => (
                <option key={policy.policyId} value={policy.policyId}>
                  {policy.insurer} - {policy.policyType} (₹
                  {toNumber(policy.premiumAmt).toLocaleString('en-IN')})
                </option>
              ))}
            </select>
            {claim && (
              <p className="text-sm text-gray-500 mt-1">
                Policy cannot be changed for existing claims
              </p>
            )}
          </div>

          {/* Claim Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Claim Amount *
            </label>
            <input
              type="number"
              name="claimAmt"
              value={formData.claimAmt}
              onChange={handleChange}
              step="0.01"
              min="0"
              // Max reflects available limit for this claim (including current claim when editing)
              max={
                selectedPolicy
                  ? Number(availableLimitForThisClaim.toFixed(2))
                  : undefined
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="0.00"
              required
            />

            {/* Helper: show premium & available */}
            {selectedPolicy && (
              <div className="text-sm text-gray-600 mt-2 space-y-1">
                <p>
                  Policy premium:{' '}
                  <strong>₹{premium.toLocaleString('en-IN')}</strong>
                </p>
                <p>
                  Already claimed (excluding this form):{' '}
                  <strong>
                    ₹{totalClaimedExcludingCurrent.toLocaleString('en-IN')}
                  </strong>
                </p>
                <p>
                  Available limit for this claim:{' '}
                  <strong>
                    ₹{availableLimitForThisClaim.toLocaleString('en-IN')}
                  </strong>
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description * (10-200 characters)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              maxLength="200"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
              placeholder="Describe the reason for your claim..."
              required
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>Minimum 10 characters</span>
              <span>{formData.description.length}/200</span>
            </div>
          </div>

          {/* Status (readonly when editing) */}
          {claim && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                disabled
              >
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Status is managed by administrators
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                loading ||
                (activePolicies.length === 0 && !claim) ||
                violatesAvailableLimit
              }
              className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? 'Saving...' : claim ? 'Update Claim' : 'Submit Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClaimModal;
