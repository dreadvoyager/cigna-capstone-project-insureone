// ---- SAME IMPORTS ----
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";
import { adminService } from "../services/adminService";
import { Pencil, Trash2, X, Search } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ---- SAME TOAST OPTIONS ----
const toastOptions = {
  position: "top-center",
  autoClose: 2500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  icon: () => (
    <span style={{ color: "white", fontSize: "22px", fontWeight: "bold" }}>
      ✔
    </span>
  ),
  style: {
    fontSize: "18px",
    padding: "18px 22px",
    borderRadius: "14px",
    fontFamily: "'Poppins', 'Segoe UI', sans-serif",
    background: "linear-gradient(135deg, #6EE7B7, #38BDF8)",
    color: "#0F172A",
    fontWeight: "600",
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
    border: "1px solid rgba(0,0,0,0.1)",
  },
};

const AdminUsersPolicies = () => {
  const navigate = useNavigate();
  const { userId } = useParams();

  const [policies, setPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch Policies
  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const data = await adminService.getPoliciesForUser(userId);
        setPolicies(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch policies", toastOptions);
      }
    };
    fetchPolicies();
  }, [userId]);

  // --------------------------------------------------------------------
  // ❗ NEW : DELETE CONFIRMATION USING TOASTIFY
  // --------------------------------------------------------------------
  const confirmDelete = (policyId) => {
    toast(
      ({ closeToast }) => (
        <div style={{ textAlign: "center" }}>
          <p style={{ fontWeight: "bold", marginBottom: "10px" }}>
            Are you sure you want to delete policy {policyId}?
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
            <button
              onClick={() => {
                closeToast();
                handleDelete(policyId);
              }}
              style={{
                padding: "6px 16px",
                borderRadius: "10px",
                background: "#ef4444",
                color: "white",
                fontWeight: "600",
              }}
            >
              Yes
            </button>

            <button
              onClick={closeToast}
              style={{
                padding: "6px 16px",
                borderRadius: "10px",
                background: "#d1d5db",
                fontWeight: "600",
                color: "#1f2937",
              }}
            >
              No
            </button>
          </div>
        </div>
      ),
      { ...toastOptions, autoClose: false }
    );
  };

  // ---- Delete Actual Operation ----
  const handleDelete = async (policyId) => {
    try {
      await adminService.deletePolicy(policyId);
      setPolicies(policies.filter((p) => p.policyId !== policyId));
      toast.info(`Policy ${policyId} deleted`, toastOptions);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete policy", toastOptions);
    }
  };

  // --------------------------------------------------------------------
  // CANCEL CONFIRMATION (Already Working)
  // --------------------------------------------------------------------
  const confirmCancel = (policy) => {
    toast(
      ({ closeToast }) => (
        <div style={{ textAlign: "center" }}>
          <p style={{ fontWeight: "bold", marginBottom: "10px" }}>
            Are you sure you want to cancel this policy?
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
            <button
              onClick={() => {
                closeToast();
                handleCancel(policy);
              }}
              style={{
                padding: "6px 16px",
                borderRadius: "10px",
                background: "#ef4444",
                color: "white",
                fontWeight: "600",
              }}
            >
              Yes
            </button>

            <button
              onClick={closeToast}
              style={{
                padding: "6px 16px",
                borderRadius: "10px",
                background: "#d1d5db",
                fontWeight: "600",
                color: "#1f2937",
              }}
            >
              No
            </button>
          </div>
        </div>
      ),
      { ...toastOptions, autoClose: false }
    );
  };

  const handleCancel = async (policy) => {
    try {
      const updated = { ...policy, status: "Cancelled" };
      await adminService.updatePolicy(policy.policyId, updated);

      setPolicies(
        policies.map((p) => (p.policyId === policy.policyId ? updated : p))
      );

      toast.warn(`Policy ${policy.policyId} cancelled`, toastOptions);
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel policy", toastOptions);
    }
  };

  // --------------------------------------------------------------------
  // UPDATE WORKFLOW (Same)
  // --------------------------------------------------------------------
  const handleUpdateClick = (policy) => {
    setSelectedPolicy(policy);
    setFormData(policy);
    setShowUpdateModal(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminService.updatePolicy(selectedPolicy.policyId, formData);
      setPolicies(
        policies.map((p) =>
          p.policyId === selectedPolicy.policyId ? formData : p
        )
      );
      setShowUpdateModal(false);
      toast.success(`Policy ${selectedPolicy.policyId} updated`, toastOptions);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update policy", toastOptions);
    }
  };

  const filteredPolicies = policies.filter(
    (policy) =>
      policy.policyType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.insurer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.premiumAmt.toString().includes(searchTerm.toLowerCase())
  );

  // --------------------------------------------------------------------
  // UI RENDERING (Unchanged except delete button trigger)
  // --------------------------------------------------------------------
  return (
    <>
      <AdminNavbar />
      <div className="pt-24 max-w-5xl mx-auto px-4">
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="mb-4 px-3 py-1 bg-gray-200 rounded-lg text-gray-800"
        >
          ← Back to Users
        </button>

        <h1 className="text-2xl font-bold mb-6 text-gray-800">User Policies</h1>

        {/* SEARCH BAR */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by Policy Type, Insurer, Status, or Premium..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-xl py-2 pl-10 pr-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="space-y-4">
          {filteredPolicies.length > 0 ? (
            filteredPolicies.map((policy) => {
              const isCancelled = policy.status === "Cancelled";

              return (
                <div
                  key={policy.policyId}
                  className="rounded-xl p-5 flex items-center justify-between shadow-md"
                  style={{
                    background: "linear-gradient(135deg, #6EE7B7, #38BDF8)",
                    color: "#0F172A",
                    border: "1px solid rgba(0,0,0,0.1)",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                  }}
                >
                  <div>
                    <h2 className="text-lg font-semibold">
                      {policy.policyType} - {policy.insurer}
                    </h2>
                    <p className="text-sm">
                      Premium: {policy.premiumAmt} | Status: {policy.status}
                    </p>
                    <p className="text-sm">
                      {new Date(policy.startDate).toLocaleDateString()} -{" "}
                      {new Date(policy.endDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    {/* UPDATE */}
                    <button
                      onClick={() => handleUpdateClick(policy)}
                      disabled={isCancelled}
                      className={`flex items-center px-3 py-1 rounded-lg ${
                        isCancelled
                          ? "bg-gray-400 cursor-not-allowed text-white"
                          : "bg-emerald-500 hover:bg-emerald-600 text-white"
                      }`}
                    >
                      <Pencil className="w-4 h-4 mr-1" /> Update
                    </button>

                    {/* DELETE with CONFIRMATION */}
                    <button
                      onClick={() => confirmDelete(policy.policyId)}
                      className="flex items-center px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </button>

                    {/* CANCEL */}
                    <button
                      onClick={() => confirmCancel(policy)}
                      disabled={isCancelled}
                      className={`flex items-center px-3 py-1 rounded-lg ${
                        isCancelled
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-yellow-400 hover:bg-yellow-500 text-gray-800"
                      }`}
                    >
                      <X className="w-4 h-4 mr-1" />{" "}
                      {isCancelled ? "Cancelled" : "Cancel"}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 text-center text-lg font-medium mt-6">
              No policies found.
            </p>
          )}
        </div>

        {/* UPDATE MODAL (Same) */}
        {showUpdateModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <form
              onSubmit={handleUpdateSubmit}
              className="bg-white p-6 rounded-xl w-full max-w-md space-y-4"
            >
              <h2 className="text-xl font-bold">Update Policy</h2>

              <input
                type="text"
                placeholder="Insurer"
                value={formData.insurer}
                onChange={(e) =>
                  setFormData({ ...formData, insurer: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-lg"
              />

              <input
                type="text"
                placeholder="Policy Type"
                value={formData.policyType}
                onChange={(e) =>
                  setFormData({ ...formData, policyType: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-lg"
              />

              <input
                type="number"
                placeholder="Premium Amount"
                value={formData.premiumAmt}
                onChange={(e) =>
                  setFormData({ ...formData, premiumAmt: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-lg"
              />

              <input
                type="date"
                placeholder="Start Date"
                value={formData.startDate?.split("T")[0]}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-lg"
              />

              <input
                type="date"
                placeholder="End Date"
                value={formData.endDate?.split("T")[0]}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-lg"
              />

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminUsersPolicies;