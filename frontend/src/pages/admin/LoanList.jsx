import React, { useEffect, useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { toast } from "react-toastify";
import Modal from "../../components/common/Modal";
import { API_BASE_URL } from "../../shared/config/env";
import { Link } from "react-router-dom";

const statusColors = {
  APPROVED: "bg-green-100 text-green-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  REJECTED: "bg-red-100 text-red-800",
};

const AdminLoans = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [processingLoanIds, setProcessingLoanIds] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/users/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();

      const usersWithLoans = await Promise.all(
        data.map(async (user) => {
          const resLoans = await fetch(
            `${API_BASE_URL}/api/loans/applications/${user.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const loans = resLoans.ok ? await resLoans.json() : [];
          return { ...user, loans };
        })
      );

      const filteredUsers = usersWithLoans.filter((u) => u.loans.length > 0);
      setUsers(filteredUsers);
    } catch (err) {
      console.error(err);
      toast.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (loan, action) => {
    setSelectedLoan(loan);
    setActionType(action);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedLoan(null);
    setActionType(null);
    setShowModal(false);
  };

  const markProcessing = (loanId, isProcessing) => {
    setProcessingLoanIds((prev) =>
      isProcessing ? [...new Set([...prev, loanId])] : prev.filter((id) => id !== loanId)
    );
  };

  const confirmAction = async () => {
    if (!selectedLoan || !actionType) return;
    markProcessing(selectedLoan.id, true);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/loans/${selectedLoan.id}/${actionType}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        }
      );
      if (!res.ok) throw new Error("Failed to update loan status");
      await fetchUsers();
      toast.success(`Loan ${actionType}d successfully!`);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error updating loan status");
    } finally {
      markProcessing(selectedLoan.id, false);
      closeModal();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="ROLE_ADMIN" />
      <div className="flex-1 overflow-auto">
        <Navbar title="Users with Loans" />
        <div className="p-6 space-y-6">
          {loading ? (
            <p className="text-center text-gray-500 mt-20">Loading users and loans...</p>
          ) : users.length === 0 ? (
            <p className="text-center text-gray-500 mt-20">No users have applied for loans.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) =>
                user.loans.map((loan) => {
                  const isProcessing = processingLoanIds.includes(loan.id);
                  return (
                    <div
                      key={loan.id}
                      className="bg-gradient-to-br from-white via-gray-50 to-white p-6 rounded-2xl shadow-xl transform hover:scale-105 hover:shadow-2xl transition-all duration-300"
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{user.name}</h3>
                      <p className="text-gray-600 mb-1">
                        <strong>Email:</strong> {user.email}
                      </p>
                      <p className="text-gray-600 mb-1">
                        <strong>Phone:</strong> {user.phone}
                      </p>
                      <p className="text-gray-600 mb-2">
                        <strong>Role:</strong> {user.role}
                      </p>

                      <hr className="my-2 border-gray-300" />

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
                      <p className="text-gray-700 mb-2">
                        <strong>Tenure:</strong> {loan.tenure}
                      </p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          statusColors[loan.status] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {loan.status}
                      </span>

                      <div className="mt-4 flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => openModal(loan, "approve")}
                          className="bg-green-500 hover:bg-green-600 text-white rounded px-4 py-2 text-sm disabled:opacity-60 transition"
                          disabled={isProcessing || loan.status === "APPROVED"}
                        >
                          {isProcessing && actionType === "approve" ? "Processing..." : "Approve"}
                        </button>
                        <button
                          onClick={() => openModal(loan, "reject")}
                          className="bg-red-500 hover:bg-red-600 text-white rounded px-4 py-2 text-sm disabled:opacity-60 transition"
                          disabled={isProcessing || loan.status === "REJECTED"}
                        >
                          {isProcessing && actionType === "reject" ? "Processing..." : "Reject"}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedLoan && (
        <Modal
          isOpen={showModal}
          onClose={closeModal}
          title={`Confirm ${actionType === "approve" ? "Approval" : "Rejection"}`}
          size="md"
          footer={
            <>
              <button
                className="btn btn-secondary"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className={`btn ${actionType === "approve" ? "btn-primary bg-green-500 hover:bg-green-600" : "btn-danger bg-red-500 hover:bg-red-600"}`}
                onClick={confirmAction}
              >
                {actionType === "approve" ? "Approve" : "Reject"}
              </button>
            </>
          }
        >
          <p className="text-gray-700 text-sm">
            Are you sure you want to {actionType} loan <b>#{selectedLoan.id}</b> from <b>{selectedLoan.providerName}</b>?
          </p>
        </Modal>
      )}
    </div>
  );
};

export default AdminLoans;
