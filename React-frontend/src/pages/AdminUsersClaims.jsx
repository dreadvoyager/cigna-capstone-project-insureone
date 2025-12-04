import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";
import { adminService } from "../services/adminService";
import { Check, X, Trash2, Search } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/** Common toast style */
const toastOptions = {
  position: "top-center",
  autoClose: 2500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  icon: () => (
    <span style={{ color: "white", fontSize: "22px", fontWeight: "bold" }}>✔</span>
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

/** Inline confirm toast component */
const ConfirmToast = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div style={{ color: "#0F172A" }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{title}</div>
      <div style={{ marginBottom: 12 }}>{message}</div>

      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={onCancel}
          className="px-3 py-1 rounded-lg bg-gray-300 text-gray-800 hover:bg-gray-400"
        >
          Cancel
        </button>

        <button
          onClick={onConfirm}
          className="px-3 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

/** Reusable confirm() using toast */
const confirmWithToast = ({ title, message }) =>
  new Promise((resolve) => {
    const toastId = toast(
      <ConfirmToast
        title={title}
        message={message}
        onConfirm={() => {
          resolve(true);
          toast.dismiss(toastId);
        }}
        onCancel={() => {
          resolve(false);
          toast.dismiss(toastId);
        }}
      />,
      {
        ...toastOptions,
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      }
    );
  });

const AdminUsersClaims = () => {
  const navigate = useNavigate();
  const { userId } = useParams();

  const [claims, setClaims] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch claims
  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const data = await adminService.getClaimsForUser(userId);
        setClaims(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch claims", toastOptions);
      }
    };
    fetchClaims();
  }, [userId]);

  /** Approve / Reject with confirmation */
  const requestStatusUpdate = async (claimId, nextStatus) => {
    const ok = await confirmWithToast({
      title: `Confirm ${nextStatus}`,
      message: `Are you sure you want to approve claim ${claimId}?`,
    });

    if (!ok) return;

    try {
      await adminService.updateClaimStatus(claimId, { status: nextStatus });
      setClaims((prev) =>
        prev.map((c) =>
          c.claimId === claimId ? { ...c, status: nextStatus } : c
        )
      );
      toast.success(`Claim ${claimId} ${nextStatus}`, toastOptions);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status", toastOptions);
    }
  };

  /** DELETE with confirmation toast */
  const requestDelete = async (claimId) => {
    const ok = await confirmWithToast({
      title: "Confirm Delete",
      message: `Are you sure you want to delete claim ${claimId}?`,
    });

    if (!ok) return;

    try {
      await adminService.deleteClaim(claimId);
      setClaims((prev) => prev.filter((c) => c.claimId !== claimId));
      toast.info(`Claim ${claimId} deleted`, toastOptions);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete claim", toastOptions);
    }
  };

  const filteredClaims = claims.filter((claim) =>
    claim.claimId.toString().includes(searchTerm.toLowerCase()) ||
    claim.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.claimAmt.toString().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <AdminNavbar />

      <div className="pt-24 max-w-5xl mx-auto px-4">
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="mb-4 px-3 py-1 bg-gray-200 rounded-lg text-gray-800"
        >
          &larr; Back to Users
        </button>

        <h1 className="text-2xl font-bold mb-6 text-gray-800">User Claims</h1>

        {/* SEARCH */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by Claim ID, Status, or Amount..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-xl py-2 pl-10 pr-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* CLAIM LIST */}
        <div className="space-y-4">
          {filteredClaims.length > 0 ? (
            filteredClaims.map((claim) => {
              const statusLower = claim.status?.toLowerCase() || "";
              const isApproved = statusLower === "approved";
              const isRejected = statusLower === "rejected";
              const isWithdrawn = statusLower === "withdrawn";

              const disableActions = isApproved || isRejected || isWithdrawn;

              return (
                <div
                  key={claim.claimId}
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
                      ClaimId: {claim.claimId}
                    </h2>
                    <p className="text-sm">Amount: {claim.claimAmt}</p>
                    <p className="text-sm">Status: {claim.status}</p>
                  </div>

                  <div className="flex space-x-2">
                    {/* APPROVE */}
                    <button
                      onClick={() =>
                        requestStatusUpdate(claim.claimId, "Approved")
                      }
                      disabled={disableActions}
                      className={`flex items-center px-3 py-1 rounded-lg ${
                        disableActions
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-green-500 hover:bg-green-600 text-white"
                      }`}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      {isApproved ? "Approved" : "Approve"}
                    </button>

                    {/* REJECT */}
                    <button
                      onClick={() =>
                        requestStatusUpdate(claim.claimId, "Rejected")
                      }
                      disabled={disableActions}
                      className={`flex items-center px-3 py-1 rounded-lg ${
                        disableActions
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-yellow-400 hover:bg-yellow-500 text-gray-800"
                      }`}
                    >
                      <X className="w-4 h-4 mr-1" />
                      {isRejected ? "Rejected" : "Reject"}
                    </button>

                    {/* DELETE with confirmation */}
                    <button
                      onClick={() => requestDelete(claim.claimId)}
                      className="flex items-center px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 text-center text-lg font-medium mt-6">
              No claims found.
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminUsersClaims;