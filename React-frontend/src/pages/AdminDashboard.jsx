
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";
import { adminService } from "../services/adminService";
import { authService } from "../services/authService";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await adminService.getAllUsers();
        const filtered = data.filter((u) => u.fullName !== "System Administrator");
        setUsers(filtered);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const goToPolicies = (userId) => {
    navigate(`/admin/users/${userId}/policies`);
  };

  const goToClaims = (userId) => {
    navigate(`/admin/users/${userId}/claims`);
  };

  const filteredUsers = users.filter((u) =>
    u.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <AdminNavbar />
      <div className="pt-24 max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">All Users</h1>

        {/* SEARCH */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-xl py-2 pl-10 pr-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* USERS */}
        <div className="space-y-4">
          {filteredUsers.map((u) => (
            <div
              key={u.id}
              className="rounded-xl p-5 flex items-center justify-between shadow-md"
              style={{
                background: "linear-gradient(135deg, #6EE7B7, #38BDF8)", // Gradient
                color: "#0F172A",
                border: "1px solid rgba(0,0,0,0.1)",
                boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
              }}
            >
              <div>
                <h2 className="text-xl font-semibold">{u.fullName}</h2>
                <p className="text-sm">{u.email}</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => goToPolicies(u.id)}
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
                >
                  Policies
                </button>
                <button
                  onClick={() => goToClaims(u.id)}
                  className="px-4 py-2 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white font-semibold" // ✅ Darker shade
                >
                  Claims
                </button>
              </div>
            </div>
          ))}
          {filteredUsers.length === 0 && <p className="text-gray-400">No users found.</p>}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
