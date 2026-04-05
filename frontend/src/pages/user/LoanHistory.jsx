import React, { useEffect, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../shared/config/env";
import { CheckCircle, XCircle, FileText, Download } from "lucide-react";
import Modal from "../../components/common/Modal";

const statusColors = {
  APPROVED: { bg: "#059669", outline: "#05966930" },
  PENDING: { bg: "#d97706", outline: "#d9770630" },
  REJECTED: { bg: "#dc2626", outline: "#dc262630" },
};

const LoanHistory = () => {
  const [user, setUser] = useState(null);
  const [loans, setLoans] = useState([]);
  const [offers, setOffers] = useState([]);
  const [eligibleAmount, setEligibleAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalLoan, setModalLoan] = useState(null);
  const [modalType, setModalType] = useState("");

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const resUser = await fetch(`${API_BASE_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = await resUser.json();
      setUser(userData);

      const resLoans = await fetch(
        `${API_BASE_URL}/api/loans/applications/${userData.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const loansData = await resLoans.json();
      setLoans(loansData || []);

      try {
        const sorted = [...(loansData || [])].sort((a, b) => {
          const da = a.applicationDate ? new Date(a.applicationDate).getTime() : 0;
          const db = b.applicationDate ? new Date(b.applicationDate).getTime() : 0;
          if (da !== db) return db - da;
          return (b.id || 0) - (a.id || 0);
        });

        const latest = sorted[0];
        if (latest && ["approved", "rejected"].includes(latest.status.toLowerCase())) {
          const lastKey = `last_notified_${latest.status}_${userData.id}`;
          const lastId = localStorage.getItem(lastKey);
          if (String(latest.id) !== String(lastId || "")) {
            setModalLoan(latest);
            setModalType(latest.status.toLowerCase());
            localStorage.setItem(lastKey, String(latest.id));
          }
        }
      } catch (_) {}

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  if (loading || !user) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-primary-900 font-medium">Retrieving Ledger...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 font-sans text-gray-900 overflow-hidden">
      <Sidebar role={user.role || "USER"} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar title={"Application Ledger"} />

        <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8 container-responsive">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
                <FileText className="text-accent" size={36} /> Capital Applications
              </h1>
              <p className="text-gray-500 mt-2">Comprehensive ledger of all your institutional capital requests.</p>
            </div>
          </div>

          <Modal
            isOpen={!!modalLoan}
            onClose={() => setModalLoan(null)}
            title={modalType === "approved" ? "Approval Verified" : "Application Declined"}
            size="md"
            footer={
              <div className="flex justify-center w-full">
                <button
                  className="w-full bg-[#0b1d30] text-white font-bold tracking-wide uppercase px-4 py-3 rounded-lg hover:bg-[#06101c] transition"
                  onClick={() => setModalLoan(null)}
                >
                  Acknowledge
                </button>
              </div>
            }
          >
            {modalLoan && (
              <div className="space-y-6 text-center py-4">
                <div className="flex justify-center">
                  {modalType === "approved" ? (
                    <CheckCircle className="w-20 h-20 text-emerald-500" strokeWidth={1.5} />
                  ) : (
                    <XCircle className="w-20 h-20 text-red-500" strokeWidth={1.5} />
                  )}
                </div>

                <h3 className="text-2xl font-bold text-gray-900">
                  {modalType === "approved"
                    ? "Capital Deployment Authorized"
                    : "Capital Request Declined"}
                </h3>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-left space-y-3 mx-auto max-w-sm">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Ref ID</span>
                    <span className="font-bold text-gray-900">#L-{modalLoan.id}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Requested Principal</span>
                    <span className="font-bold text-gray-900">₹{Number(modalLoan.loanAmount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Underwriter</span>
                    <span className="font-semibold text-gray-700">{modalLoan.providerName}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Final Decision</span>
                    <span className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded" style={{
                      backgroundColor: statusColors[(modalLoan.status || '').toUpperCase()]?.outline || '#e5e7eb',
                      color: statusColors[(modalLoan.status || '').toUpperCase()]?.bg || '#374151'
                    }}>
                      {modalLoan.status}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Modal>

          <div className="card shadow-soft border border-gray-200 rounded-2xl bg-white p-0 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">Historical Records</h2>
              <button className="text-sm font-semibold text-primary-600 hover:text-primary-800 bg-white px-3 py-1.5 rounded-md border border-gray-200 shadow-sm transition-all flex items-center gap-2">
                <Download size={16} /> Export CSV
              </button>
            </div>
            
            {loans.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="text-gray-400" size={24} />
                </div>
                <p className="text-gray-500 font-medium">No application records exist in your ledger.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200/80">
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ref ID</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Underwriter</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Collateral Asset</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Principal</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Term Lifecycle</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Resolution Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loans.map((l) => {
                      const sKey = (l.status || '').toUpperCase();
                      const sColor = statusColors[sKey] || { bg: '#6b7280', outline: '#f3f4f6' };
                      return (
                        <tr key={l.id} className="hover:bg-primary-50/30 transition-colors">
                          <td className="px-6 py-4 text-sm font-bold text-gray-900">#L-{l.id}</td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-gray-800">{l.providerName}</span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-600">{l.assetType}</td>
                          <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">₹{Number(l.loanAmount).toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 font-medium text-center">{l.tenure} Months</td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-md inline-block min-w-[100px] text-center" 
                              style={{
                                backgroundColor: sColor.outline,
                                color: sColor.bg,
                                border: `1px solid ${sColor.outline}`
                              }}>
                              {l.status || "UNKNOWN"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
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

export default LoanHistory;
