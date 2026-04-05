import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import { API_BASE_URL } from "../../shared/config/env";
import Sidebar from "../../components/layout/Sidebar";
import { toast } from "react-toastify";

const LoanApply = () => {
  const [assets, setAssets] = useState([]);
  const [providers, setProviders] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [tenure, setTenure] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const token = localStorage.getItem("token");

  const fallbackProviders = [
    { id: 1, bankName: "HDFC Bank" },
    { id: 2, bankName: "ICICI Bank" },
    { id: 3, bankName: "SBI" },
    { id: 8, bankName: "Axis Bank" },
    { id: 9, bankName: "Kotak Bank" },
  ];

  const location = useLocation();

  // Load providers once
  useEffect(() => {
    setProviders(fallbackProviders);
  }, []);

  // Preselect provider from Offers page (if provided)
  useEffect(() => {
    if (location.state?.providerName && providers.length > 0) {
      const match = providers.find(
        (p) =>
          p.bankName.toLowerCase() ===
          location.state.providerName.toLowerCase()
      );
      if (match) {
        setSelectedProvider(match.id);
      }
    }
  }, [location.state, providers]);

  // Fetch user's assets once
  useEffect(() => {
    const fetchAssets = async () => {
      if (!user || !token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/assets/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch assets");
        const data = await res.json();
        setAssets(data);
      } catch (err) {
        console.error("Error fetching assets:", err);
        setAssets([]);
        toast.error("Failed to load your assets. Add assets first!");
      }
    };

    fetchAssets();
  }, [user?.id, token]);

  // Handle loan application
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedAsset || !selectedProvider || !loanAmount || !tenure) {
      setMessage("Please fill all fields");
      return;
    }

    if (loanAmount <= 0 || tenure <= 0) {
      setMessage("Loan amount and tenure must be positive");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/loans/apply/${user.id}/${selectedProvider}/${selectedAsset}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            loanAmount: Number(loanAmount),
            tenure: Number(tenure),
          }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to apply for loan");
      }

      const data = await res.json();
      setMessage(`Loan applied successfully! Application ID: ${data.id}`);
      toast.success("Loan applied successfully!");
      setSelectedAsset("");
      setSelectedProvider("");
      setLoanAmount("");
      setTenure("");
    } catch (err) {
      console.error("Loan application error:", err);
      setMessage(err.message || "Error applying for loan");
      toast.error(err.message || "Error applying for loan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={user?.role || "USER"} />
      <div className="flex-1">
        <Navbar title="Apply for Loan" />
        <div className="container-responsive py-6">
          <div className="w-full max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="card space-y-6">
              <h2 className="text-3xl font-bold text-center text-gray-700 mb-6">
                Apply for Loan
              </h2>

              {/* Asset Dropdown */}
              <div>
                <label className="block text-gray-700 mb-2 font-semibold">
                  Select Asset
                </label>
                <select
                  value={selectedAsset}
                  onChange={(e) => setSelectedAsset(e.target.value)}
                  className="input-base"
                  required
                >
                  <option value="">-- Select Your Asset --</option>
                  {assets.length === 0 ? (
                    <option value="" disabled>
                      No assets found
                    </option>
                  ) : (
                    assets.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.assetType} (₹
                        {asset.value.toLocaleString("en-IN")})
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Provider Dropdown */}
              <div>
                <label className="block text-gray-700 mb-2 font-semibold">
                  Select Provider
                </label>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="input-base"
                  required
                >
                  <option value="">-- Select Provider --</option>
                  {providers.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.bankName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Loan Amount */}
              <div>
                <label className="block text-gray-700 mb-2 font-semibold">
                  Loan Amount (₹)
                </label>
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  min="1"
                  required
                  className="input-base"
                />
              </div>

              {/* Tenure */}
              <div>
                <label className="block text-gray-700 mb-2 font-semibold">
                  Tenure (Months)
                </label>
                <input
                  type="number"
                  value={tenure}
                  onChange={(e) => setTenure(e.target.value)}
                  min="1"
                  required
                  className="input-base"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full"
              >
                {isLoading ? "Processing..." : "Apply for Loan"}
              </button>

              {message && (
                <div
                  className={`p-4 rounded-xl text-center text-lg ${
                    message.includes("successfully")
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {message}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanApply;
