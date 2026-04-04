import React, { useEffect, useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { toast } from "react-toastify";

const AdminUsers = () => {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [promotingIds, setPromotingIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8080/api/users/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "ROLE_ADMIN") {
      fetchUsers();
    } else {
      toast.error("Unauthorized");
    }
  }, []);

  const openModal = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setShowModal(false);
  };

  const confirmPromote = async () => {
    if (!selectedUser) return;

    const userId = selectedUser.id;
    setPromotingIds((prev) => [...prev, userId]);

    try {
      const res = await fetch(`http://localhost:8080/api/admin/users/promote/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to promote user");

      toast.success("User promoted to admin ✅");
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Promotion failed ❌");
    } finally {
      setPromotingIds((prev) => prev.filter((id) => id !== userId));
      closeModal();
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar role={user?.role || "USER"} />
      <div className="flex-1">
        <Navbar title="Manage Admin" />
        <div className="p-6 max-w-6xl mx-auto space-y-6">
          {loading ? (
            <p className="text-center text-gray-500 mt-10">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="text-center text-gray-500 mt-10">No users found.</p>
          ) : (
            <>
              {/* Table for large screens */}
              <div className="hidden md:block">
                <table className="w-full text-left border-collapse table-auto bg-white rounded-xl shadow overflow-hidden">
                  <thead className="bg-gray-200 text-gray-700">
                    <tr>
                      <th className="p-3">ID</th>
                      <th className="p-3">Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Role</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b hover:bg-gray-50 transition">
                        <td className="p-3">{u.id}</td>
                        <td className="p-3">{u.name}</td>
                        <td className="p-3">{u.email}</td>
                        <td className="p-3">{u.role}</td>
                        <td className="p-3 text-center">
                          {u.role === "USER" ? (
                            <button
                              onClick={() => openModal(u)}
                              disabled={promotingIds.includes(u.id)}
                              className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {promotingIds.includes(u.id) ? "Promoting..." : "Promote to Admin"}
                            </button>
                          ) : (
                            <span className="text-gray-500">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cards for mobile */}
              <div className="md:hidden grid grid-cols-1 gap-4">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="bg-white p-4 rounded-2xl shadow-xl transform hover:scale-105 hover:shadow-2xl transition-all duration-300"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{u.name}</h3>
                    <p className="text-gray-600 mb-1">
                      <strong>ID:</strong> {u.id}
                    </p>
                    <p className="text-gray-600 mb-1">
                      <strong>Email:</strong> {u.email}
                    </p>
                    <p className="text-gray-600 mb-3">
                      <strong>Role:</strong> {u.role}
                    </p>
                    {u.role === "USER" ? (
                      <button
                        onClick={() => openModal(u)}
                        disabled={promotingIds.includes(u.id)}
                        className="bg-blue-600 text-white w-full px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {promotingIds.includes(u.id) ? "Promoting..." : "Promote to Admin"}
                      </button>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-[400px]">
            <h2 className="text-lg font-semibold text-gray-800">Confirm Promotion</h2>
            <p className="text-gray-600 mt-2 text-sm">
              Are you sure you want to promote <b>{selectedUser.name}</b> to admin?
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeModal}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmPromote}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Promote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
