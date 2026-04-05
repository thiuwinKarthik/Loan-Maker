import React, { useEffect, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../../shared/config/env";
import { Users, FileText, CheckCircle, XCircle, Clock, ShieldCheck, Activity, BrainCircuit } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

const statusColors = {
  APPROVED: { bg: "#059669", text: "#fff" }, // emerald-600
  PENDING: { bg: "#d97706", text: "#fff" }, // amber-600
  REJECTED: { bg: "#dc2626", text: "#fff" }, // red-600
};

const AdminDashboard = () => {
  const [userStats, setUserStats] = useState({});
  const [loanStats, setLoanStats] = useState({});
  const [loans, setLoans] = useState([]);
  const [recentLoans, setRecentLoans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        
        const [resUsers, resLoans, resAllUsers] = await Promise.all([
          fetch(`${API_BASE_URL}/api/users/stats`, { headers }),
          fetch(`${API_BASE_URL}/api/loans/stats`, { headers }),
          fetch(`${API_BASE_URL}/api/users/all`, { headers })
        ]);

        const [users, loansData, allUsers] = await Promise.all([
          resUsers.json(), resLoans.json(), resAllUsers.json()
        ]);

        setUserStats(users);
        setLoanStats(loansData);

        const loansWithUser = await Promise.all(
          allUsers.map(async (user) => {
            const resUserLoans = await fetch(
              `${API_BASE_URL}/api/loans/applications/${user.id}`,
              { headers }
            );
            const userLoans = resUserLoans.ok ? await resUserLoans.json() : [];
            return userLoans.map((loan) => ({
              ...loan,
              userName: user.name,
              userEmail: user.email,
            }));
          })
        );

        const allLoansFlat = loansWithUser.flat();
        setLoans(allLoansFlat);

        const latest = [...allLoansFlat]
          .sort((a, b) => new Date(b.applicationDate) - new Date(a.applicationDate))
          .slice(0, 5);
        setRecentLoans(latest);
      } catch (err) {
        console.error(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) loadData();
  }, [token]);

  const providerData = loans.reduce((acc, loan) => {
    const existing = acc.find((d) => d.name === loan.providerName);
    if (existing) existing.value++;
    else acc.push({ name: loan.providerName || "Unknown", value: 1 });
    return acc;
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-primary-900 font-medium">Mounting Executive Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-b from-gray-50 to-gray-100 font-sans text-gray-900 overflow-hidden">
      <Sidebar role="ROLE_ADMIN" />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar title="Executive Administration" />

        <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8 container-responsive">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
                <ShieldCheck className="text-accent" size={36} /> Global Command Center
              </h1>
              <p className="text-gray-500 mt-2">Institution-wide analytics, portfolio distribution, and risk indexing.</p>
            </div>
            <div className="flex gap-3">
              <Link to="/admin/advisor" className="btn bg-primary-100 text-primary-900 hover:bg-primary-200 shadow-sm px-6 py-3 shrink-0 flex items-center gap-2">
                <BrainCircuit size={18} /> Global AI Policy
              </Link>
            </div>
          </div>

          {/* Metric KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            <MetricCard title="Total Network Users" value={userStats.totalUsers || 0} icon={<Users size={24} className="text-accent" />} trend="+12% Active" />
            <MetricCard title="Global Applications" value={loanStats.totalLoans || 0} icon={<FileText size={24} className="text-primary-500" />} trend="Stable Volume" />
            <MetricCard title="Approved Portfolio" value={loanStats.approvedLoans || 0} icon={<CheckCircle size={24} className="text-emerald-500" />} trend="+4% Conversion" />
            <MetricCard title="Pending Assessments" value={loanStats.pendingLoans || 0} icon={<Clock size={24} className="text-amber-500" />} trend="Requires Action" alert />
          </div>

          {/* Analytics Grids */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            
            {/* Status Chart */}
            <div className="col-span-1 lg:col-span-2 card p-0 overflow-hidden flex flex-col border border-gray-200 shadow-soft bg-white/95">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Activity size={18} className="text-primary-600" /> Capital Deployment Velocity
                </h3>
              </div>
              <div className="p-6 flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: "Approved Capital", value: loanStats.approvedLoans || 0 },
                    { name: "Pending Review", value: loanStats.pendingLoans || 0 },
                    { name: "Rejected Risk", value: loanStats.rejectedLoans || 0 },
                  ]}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                    <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      <Cell fill={statusColors.APPROVED.bg} />
                      <Cell fill={statusColors.PENDING.bg} />
                      <Cell fill={statusColors.REJECTED.bg} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Provider Chart */}
            <div className="col-span-1 border border-gray-200 card p-0 shadow-soft bg-gradient-to-b from-[#0b1d30] to-[#06101c] text-white">
               <div className="p-6 border-b border-primary-800/50">
                <h3 className="font-bold text-white tracking-wide">Liquidity by Partner</h3>
              </div>
              <div className="p-6 flex-1 flex justify-center items-center h-[300px]">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={providerData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={85} paddingAngle={5}>
                      {providerData.map((_, i) => (
                        <Cell key={i} fill={["#d4af37", "#0ea5e9", "#ef4444", "#10b981", "#8b5cf6"][i % 5]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{backgroundColor: '#0b1d30', border: '1px solid #1e3a8a', color: 'white', borderRadius: '8px'}} itemStyle={{color: 'white'}} />
                    <Legend wrapperStyle={{fontSize: '12px', paddingTop: '20px'}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Loans */}
          <div className="card border border-gray-200 shadow-soft bg-white p-0 overflow-hidden mt-8">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900">Live Application Ledger</h3>
              <Link to="/admin/loans" className="text-sm font-semibold text-primary-600 hover:text-primary-800 bg-white px-3 py-1.5 rounded-md border border-gray-200 shadow-sm hover:shadow transition-all">View Complete Ledger</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200/80">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ref ID</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Borrower</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Institution Underwriter</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Principal Requested</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentLoans.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500 italic">No ledger entries detected.</td>
                    </tr>
                  ) : recentLoans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-primary-50/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">#L-{loan.id}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">{loan.userName}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-medium">{loan.providerName}</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">₹{Number(loan.loanAmount).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-md" style={{
                          backgroundColor: `${statusColors[loan.status.toUpperCase()]?.bg}15` || "#f3f4f6",
                          color: statusColors[loan.status.toUpperCase()]?.bg || "#6b7280",
                          border: `1px solid ${statusColors[loan.status.toUpperCase()]?.bg}30`
                        }}>
                          {loan.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// Mini Component
const MetricCard = ({ title, value, icon, trend, alert }) => (
  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm relative overflow-hidden group hover:shadow-md hover:border-primary-200 transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className="text-gray-500 text-xs font-bold uppercase tracking-wider">{title}</div>
      <div className="p-2 bg-gray-50 rounded-lg group-hover:scale-110 transition-transform">{icon}</div>
    </div>
    <div className="text-3xl font-bold text-gray-900 mb-2">{value}</div>
    <div className={`text-xs font-semibold ${alert ? 'text-amber-600' : 'text-emerald-600'}`}>
      {trend}
    </div>
    {alert && <div className="absolute top-0 right-0 w-2 h-full bg-amber-500"></div>}
  </div>
);

export default AdminDashboard;
