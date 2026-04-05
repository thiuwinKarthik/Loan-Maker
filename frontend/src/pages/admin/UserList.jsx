import React, { useEffect, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import { API_BASE_URL } from "../../shared/config/env";


const UsersPage = () => {
  const [admin, setAdmin] = useState(null);
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const resAdmin = await fetch(`${API_BASE_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const adminData = await resAdmin.json();
      setAdmin(adminData);

      const resUsers = await fetch(`${API_BASE_URL}/api/users/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const usersData = await resUsers.json();
      setUsers(usersData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  if (!admin) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-gray-700">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      <Sidebar role={admin.role || "ROLE_ADMIN"} />
      <div className="flex-1 overflow-auto">
        <Navbar title="Users Management" />

        <div className="p-4 md:p-6 space-y-6">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
              <h2 className="text-xl md:text-2xl font-semibold">All Users</h2>
              
            </div>

            {users.length === 0 ? (
              <p className="text-gray-500">No users found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left border-collapse table-auto">
                  <thead>
                    <tr className="bg-gray-200 text-gray-700 uppercase text-xs sm:text-sm">
                      <th className="p-2 md:p-3">ID</th>
                      <th className="p-2 md:p-3">Name</th>
                      <th className="p-2 md:p-3">Email</th>
                      <th className="p-2 md:p-3">Phone</th>
                      <th className="p-2 md:p-3 text-center">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr
                        key={u.id}
                        className="border-b hover:bg-gray-50 transition"
                      >
                        <td className="p-2 md:p-3 font-medium">{u.id}</td>
                        <td className="p-2 md:p-3">{u.name}</td>
                        <td className="p-2 md:p-3 break-all">{u.email}</td>
                        <td className="p-2 md:p-3">{u.phone}</td>
                        <td className="p-2 md:p-3 text-center">
                          <span
                            className={`px-2 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm text-white ${
                              u.role === "ROLE_ADMIN"
                                ? "bg-blue-600"
                                : "bg-green-500"
                            }`}
                          >
                            {u.role.replace("ROLE_", "")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
