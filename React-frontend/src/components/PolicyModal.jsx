import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { policyService } from '../services/policyService';
import { jwtDecode } from "jwt-decode";
import { toast } from 'react-toastify';

const PolicyModal = ({ policy, onClose }) => {
  const mode = policy?.mode || (policy ? "edit" : "create");
  const isRenew = mode === "renew";
  const isEdit = mode === "edit";
  const isCreate = mode === "create";

  const todayISO = new Date().toISOString().split("T")[0];
  const addDaysISO = (dateStr, days) => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  };

  const [formData, setFormData] = useState({
    insurer: "",
    policyType: "",
    premiumAmt: "",
    startDate: todayISO,
    endDate: addDaysISO(todayISO, 1),
    status: "Active",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // --------------------------
  // PREFILL LOGIC
  // --------------------------
  useEffect(() => {
    if (isCreate) {
      // Set default start + end
      const newStart = todayISO;
      setFormData({
        insurer: "",
        policyType: "",
        premiumAmt: "",
        startDate: newStart,
        endDate: addDaysISO(newStart, 1),
        status: "Active",
      });
      return;
    }

    if (policy) {
      const oldEnd = policy.endDate?.split("T")[0] || todayISO;
      const nextStart = addDaysISO(oldEnd, 1);

      setFormData({
        insurer: policy.insurer,
        policyType: policy.policyType,
        premiumAmt: policy.premiumAmt,
        startDate: isRenew ? nextStart : policy.startDate.split("T")[0],
        endDate: policy.endDate.split("T")[0],
        status: isRenew ? "Active" : policy.status,
      });
    }
  }, [policy]); // eslint-disable-line

  // --------------------------
  // MIN LOGIC FOR DATES
  // --------------------------
  const startMin = todayISO;
  const endMin = addDaysISO(formData.startDate, 1);

  // --------------------------
  // ON CHANGE HANDLER
  // --------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Renew → only allow editing endDate
    if (isRenew && name !== "endDate") return;

    // Edit → lock start & end
    if (isEdit && (name === "startDate" || name === "endDate")) return;

    let updated = { ...formData, [name]: value };

    // If user changes start date → force update end date min
    if (name === "startDate") {
      const newMinEnd = addDaysISO(value, 1);

      if (new Date(updated.endDate) < new Date(newMinEnd)) {
        updated.endDate = newMinEnd;
      }
    }

    setFormData(updated);
    setError("");
  };

  // --------------------------
  // VALIDATION
  // --------------------------
  const validateForm = () => {
    if (!formData.insurer || !formData.policyType || formData.premiumAmt === "" ||
        !formData.startDate || !formData.endDate) {
      setError("Please fill all required fields");
      return false;
    }

    if (isNaN(parseFloat(formData.premiumAmt)) || parseFloat(formData.premiumAmt) <= 0) {
      setError("Premium must be greater than 0");
      return false;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const minEnd = new Date(endMin);

    if (isCreate && start < new Date(todayISO)) {
      setError("Start date cannot be in the past");
      return false;
    }

    if (end < minEnd) {
      setError(`End date must be after ${endMin}`);
      return false;
    }

    return true;
  };

  // --------------------------
  // SUBMIT HANDLER
  // --------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const decoded = jwtDecode(token);

      const payload = {
        ...formData,
        premiumAmt: parseFloat(formData.premiumAmt),
        status: isRenew ? "Active" : formData.status,
        userId: decoded.id,
      };

      if (isCreate) {
        await policyService.createPolicy(payload);
      } else {
        await policyService.updatePolicy(policy.policyId, payload);
      }

      toast.success(
        isCreate
          ? "Policy Created!"
          : isRenew
          ? "Policy Renewed!"
          : "Policy Updated!",
        {
          position: "top-center",
          style: {
            background: "linear-gradient(135deg, #6EE7B7, #38BDF8)",
            color: "#0F172A",
            fontWeight: "600",
            borderRadius: "12px",
          },
          icon: "✔️",
        }
      );

      onClose();
    } catch (err) {
      setError("Failed to save policy");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------
  // UI STARTS
  // --------------------------
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-600 to-green-500 p-6 flex justify-between">
          <h2 className="text-2xl text-white font-bold">
            {isCreate ? "Add New Policy" : isRenew ? "Renew Policy" : "Edit Policy"}
          </h2>
          <button onClick={onClose}><X className="text-white h-6 w-6" /></button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {error && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-lg flex space-x-3">
              <AlertCircle className="text-red-600 h-5 w-5" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Insurer */}
            <div>
              <label className="text-sm font-medium">Insurer *</label>
              <select
                type="text"
                name="insurer"
                value={formData.insurer}
                onChange={handleChange}
                disabled={isRenew}
                className={`w-full px-4 py-3 border rounded-lg ${isRenew ? "bg-gray-100 cursor-not-allowed" : ""}`}
               >
                <option value="">Select Insurer</option>
                
                <option value="Cigna">Cigna</option>
                <option value="ICICI">ICICI</option>
                <option value="HDFC">HDFC</option>
                <option value="Bajaj Allianz">Bajaj Allianz</option>
                <option value="New India">New India</option>
                <option value="Max Insurance">Max Insurance</option>
                
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="text-sm font-medium">Policy Type *</label>
              <select
                name="policyType"
                value={formData.policyType}
                onChange={handleChange}
                disabled={isRenew}
                className={`w-full px-4 py-3 border rounded-lg ${isRenew ? "bg-gray-100 cursor-not-allowed" : ""}`}
              >
                <option value="">Select Type</option>
                <option value="Life">Life</option>
                <option value="Health">Health</option>
                <option value="Motor">Motor</option>
                <option value="Home">Home</option>
                <option value="Travel">Travel</option>
              </select>
            </div>

            {/* Premium */}
            <div>
              <label className="text-sm font-medium">Premium *</label>
              <input
                type="number"
                name="premiumAmt"
                value={formData.premiumAmt}
                onChange={handleChange}
                disabled={isRenew}
                className={`w-full px-4 py-3 border rounded-lg ${isRenew ? "bg-gray-100 cursor-not-allowed" : ""}`}
              />
            </div>

            {/* Status */}
            <div>
              <label className="text-sm font-medium">Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={isRenew}
                className={`w-full px-4 py-3 border rounded-lg ${isRenew ? "bg-gray-100 cursor-not-allowed" : ""}`}
              >
                <option value="Active">Active</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="text-sm font-medium">Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                disabled={isEdit || isRenew}
                min={startMin}
                className={`w-full px-4 py-3 border rounded-lg ${
                  isEdit || isRenew ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
            </div>

            {/* End Date */}
            <div>
              <label className="text-sm font-medium">End Date *</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                disabled={isEdit}
                min={endMin}
                className={`w-full px-4 py-3 border rounded-lg ${
                  isEdit ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-4 pt-4">
            <button onClick={onClose} type="button" className="flex-1 border rounded-lg px-6 py-3 bg-gray-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold"
            >
              {loading ? "Saving..." : isCreate ? "Create Policy" : isRenew ? "Renew Policy" : "Update Policy"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PolicyModal;
