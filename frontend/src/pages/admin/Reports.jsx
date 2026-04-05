import React, { useEffect, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import { API_BASE_URL } from "../../shared/config/env";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CSVLink } from "react-csv";

const statusColors = {
  APPROVED: { bg: "#34D399", text: "#fff" },
  PENDING: { bg: "#FBBF24", text: "#000" },
  REJECTED: { bg: "#EF4444", text: "#fff" },
};

const Reports = () => {
  const [users, setUsers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadData = async () => {
      try {
        const resUsers = await fetch(`${API_BASE_URL}/api/users/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const usersData = await resUsers.json();
        setUsers(usersData);

        const loansWithUser = await Promise.all(
          usersData.map(async (user) => {
            const resLoans = await fetch(
              `${API_BASE_URL}/api/loans/applications/${user.id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            const userLoans = resLoans.ok ? await resLoans.json() : [];
            return userLoans.map((loan) => ({
              ...loan,
              userName: user.name,
              userEmail: user.email,
            }));
          })
        );

        const allLoans = loansWithUser.flat();
        setLoans(allLoans);
        setFilteredLoans(allLoans);
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, [token]);

  useEffect(() => {
    let filtered = loans;
    if (statusFilter !== "ALL")
      filtered = filtered.filter((loan) => loan.status === statusFilter);

    if (dateRange.from && dateRange.to) {
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      filtered = filtered.filter((loan) => {
        const loanDate = new Date(loan.applicationDate);
        return loanDate >= fromDate && loanDate <= toDate;
      });
    }
    setFilteredLoans(filtered);
  }, [statusFilter, dateRange, loans]);

  const statusChartData = ["APPROVED", "PENDING", "REJECTED"].map((status) => ({
    name: status,
    count: loans.filter((loan) => loan.status === status).length,
  }));

  const roleChartData = [
    { name: "Admins", value: users.filter((u) => u.role === "ROLE_ADMIN").length },
    { name: "Normal Users", value: users.filter((u) => u.role !== "ROLE_ADMIN").length },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="ROLE_ADMIN" />
      <div className="flex-1 overflow-auto">
        <Navbar title="Reports" />
        <div className="p-6 space-y-6">
          {/* Filters */}
          <div className="bg-white p-4 rounded shadow flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex flex-col gap-1">
              <label>Status</label>
              <select
                className="border px-2 py-1 rounded"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All</option>
                <option value="APPROVED">Approved</option>
                <option value="PENDING">Pending</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label>From</label>
              <input
                type="date"
                className="border px-2 py-1 rounded"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label>To</label>
              <input
                type="date"
                className="border px-2 py-1 rounded"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              />
            </div>
            <CSVLink
              data={filteredLoans}
              filename="loans_report.csv"
              className="ml-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Export CSV
            </CSVLink>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold mb-2">Loans by Status</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={statusChartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count">
                    {statusChartData.map((entry, index) => (
                      <Cell key={index} fill={statusColors[entry.name]?.bg || "#9CA3AF"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold mb-2">Users by Role</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={roleChartData} dataKey="value" nameKey="name" outerRadius={80} label>
                    <Cell fill="#3B82F6" />
                    <Cell fill="#10B981" />
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Loans Cards for Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLoans.map((loan) => (
              <div
                key={loan.id}
                className="bg-white p-6 rounded-2xl shadow-xl transform hover:scale-105 hover:shadow-2xl transition-all duration-300"
              >
                <h4 className="text-lg font-bold text-gray-800 mb-1">{loan.userName}</h4>
                <p className="text-gray-600 mb-1">
                  <strong>Email:</strong> {loan.userEmail}
                </p>
                <p className="text-gray-700 mb-1">
                  <strong>Application ID:</strong> {loan.id}
                </p>
                <p className="text-gray-700 mb-1">
                  <strong>Provider:</strong> {loan.providerName}
                </p>
                <p className="text-gray-700 mb-1">
                  <strong>Asset:</strong> {loan.assetType}
                </p>
                <p className="text-gray-700 mb-1">
                  <strong>Amount:</strong> ₹{loan.loanAmount}
                </p>
                <p className="text-gray-700 mb-1">
                  <strong>Tenure:</strong> {loan.tenure}
                </p>
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium mt-2 inline-block"
                  style={{
                    backgroundColor: statusColors[loan.status]?.bg || "#9CA3AF",
                    color: statusColors[loan.status]?.text || "#fff",
                  }}
                >
                  {loan.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
