import React, { useState, useEffect } from "react";
import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import { Link } from "react-router-dom";
import { session } from "../../shared/auth/session";
import { offersApi } from "../../features/offers/api";

const Offers = () => {
  const [formData, setFormData] = useState({
    age: "",
    income: "",
    existing_emi: "",
    credit_score: "",
    asset_value: "",
    loan_amount: "",
    tenure: "",
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const getCurrentUser = () => {
    return session.getUser();
  };

  const saveEligibilityResult = (data) => {
    try {
      const user = getCurrentUser();
      if (!user || !user.id) return;

      const recommendations = Array.isArray(data.recommendations) ? [...data.recommendations] : [];
      const sortedRecommendations = recommendations.sort((a, b) => {
        const rateA = a.interest_rate || a.interestRate || 999;
        const rateB = b.interest_rate || b.interestRate || 999;
        return rateA - rateB;
      });

      const payload = {
        timestamp: Date.now(),
        prediction: data.prediction,
        eligibility_score: data.eligibility_score || data.score || null,
        eligible_amount: data.eligible_amount || data.eligibleAmount || 0,
        recommendations: sortedRecommendations,
        formData: { ...formData },
      };

      localStorage.setItem(`eligibility_result_${user.id}`, JSON.stringify(payload));
      window.dispatchEvent(new CustomEvent("eligibility-updated"));
      return true;
    } catch {
      return false;
    }
  };

  const loadEligibilityResult = () => {
    try {
      const user = getCurrentUser();
      if (!user || !user.id) return null;

      const savedResult = localStorage.getItem(`eligibility_result_${user.id}`);
      if (!savedResult) return null;

      const parsedResult = JSON.parse(savedResult);
      if (parsedResult && typeof parsedResult === "object") return parsedResult;

      return null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    setInitialLoading(true);
    const savedResult = loadEligibilityResult();
    if (savedResult) {
      setResult(savedResult);
      if (savedResult.formData) setFormData(savedResult.formData);
    }
    setInitialLoading(false);
  }, []);

  useEffect(() => {
    const handleEligibilityUpdate = () => {
      const savedResult = loadEligibilityResult();
      if (savedResult) setResult(savedResult);
    };
    window.addEventListener("eligibility-updated", handleEligibilityUpdate);
    return () => window.removeEventListener("eligibility-updated", handleEligibilityUpdate);
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await offersApi.predictAndRecommend(formData);
      setResult(data);
      saveEligibilityResult(data);
    } catch (err) {
      setError(err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const clearSavedOffers = () => {
    try {
      const user = getCurrentUser();
      if (user && user.id) {
        localStorage.removeItem(`eligibility_result_${user.id}`);
        setResult(null);
        setFormData({
          age: "",
          income: "",
          existing_emi: "",
          credit_score: "",
          asset_value: "",
          loan_amount: "",
          tenure: "",
        });
        window.dispatchEvent(new CustomEvent("eligibility-updated"));
      }
    } catch {
      setError("Unable to clear saved offers.");
    }
  };

  if (initialLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar role="USER" />
        <div className="flex-1">
          <Navbar title="Loan Offers" />
          <div className="container-responsive py-6 flex justify-center">
            <div className="card w-full max-w-3xl">
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading saved offers...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const gradients = [
    "from-red-200 via-red-300 to-red-400",
    "from-orange-200 via-orange-300 to-orange-400",
    "from-yellow-200 via-yellow-300 to-yellow-400",
    "from-lime-200 via-lime-300 to-lime-400",
    "from-teal-200 via-teal-300 to-teal-400",
    "from-cyan-200 via-cyan-300 to-cyan-400",
    "from-fuchsia-200 via-fuchsia-300 to-fuchsia-400",
    "from-rose-200 via-rose-300 to-rose-400",
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="USER" />
      <div className="flex-1">
        <Navbar title="Loan Offers" />

        {result && result.timestamp && (
          <div className="container-responsive pt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex justify-between items-center">
              <p className="text-sm text-blue-700">
                <strong>Saved Offers Found!</strong> Last updated: {new Date(result.timestamp).toLocaleString()}
              </p>
              <button onClick={clearSavedOffers} className="text-blue-600 hover:text-blue-800 text-sm underline">
                Clear & Start Fresh
              </button>
            </div>
          </div>
        )}

        <div className="container-responsive py-6 flex justify-center">
          <div className="card w-full max-w-3xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              {result && result.timestamp ? "Update Your" : "Test and Check"} Loan Offers
            </h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(formData).map((field) => (
                <div key={field} className="flex flex-col">
                  <label className="text-gray-700 font-medium capitalize">{field.replace("_", " ")}</label>
                  <input type="number" name={field} value={formData[field]} onChange={handleChange} className="mt-1 input-base" required />
                </div>
              ))}

              <button type="submit" className="col-span-1 md:col-span-2 btn btn-primary">
                {loading ? "Processing..." : result && result.timestamp ? "Update Offers" : "Test Eligibility"}
              </button>
            </form>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {result && (
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <h3 className="text-xl font-semibold text-gray-800">Eligibility Result</h3>
                <p className="mt-2 text-lg">
                  {result.prediction ? (
                    <span className="text-green-600 font-bold">✅ Eligible for Loan</span>
                  ) : (
                    <span className="text-red-600 font-bold">❌ Not Eligible</span>
                  )}
                </p>
                {result.eligibility_score && (
                  <p className="mt-2">
                    <span className="font-medium">Eligibility Score:</span>{" "}
                    <span className="text-blue-600 font-bold">{result.eligibility_score}</span>
                  </p>
                )}
                {(result.eligible_amount || result.eligibleAmount) && (
                  <p className="mt-2">
                    <span className="font-medium">Eligible Amount:</span>{" "}
                    <span className="text-green-600 font-bold">₹{result.eligible_amount || result.eligibleAmount}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {result?.prediction === true &&
 result?.recommendations &&
 result.recommendations.length > 0 && (
  <div className="container-responsive pb-6">
    {/* Recommended Offers Heading */}
    <h2 className="text-3xl font-extrabold text-center mb-8 bg-gradient-to-r from-purple-500 via-violet-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-lg">
      🎯 Recommended Loan Offers
    </h2>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {result.recommendations.map((bank, idx) => (
        <div
          key={idx}
          className={`border border-gray-200 rounded-2xl p-5 flex flex-col justify-between bg-gradient-to-br ${gradients[idx % gradients.length]} shadow-lg transform hover:scale-105 hover:shadow-2xl transition-all duration-300 relative`}
        >
          {idx === 0 && (
            <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
              Best Rate
            </div>
          )}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-3">
              {bank.lender || bank.bankName || `Bank ${idx + 1}`}
            </h4>
            <div className="space-y-2">
              <p className="text-gray-700 flex items-center">
                <span className="text-lg mr-2">💰</span>
                <span className="font-medium">Interest Rate:</span>{" "}
                <span className="text-blue-700 font-bold ml-1">
                  {bank.interest_rate || bank.interestRate}%
                </span>
              </p>
              {(bank.maxAmount || bank.max_amount) && (
                <p className="text-gray-700 flex items-center">
                  <span className="text-lg mr-2">📈</span>
                  <span className="font-medium">Max Loan:</span>{" "}
                  <span className="text-green-600 font-bold ml-1">
                    ₹{bank.maxAmount || bank.max_amount}
                  </span>
                </p>
              )}
              <p className="mt-3 text-green-600 font-semibold flex items-center">
                <span className="text-lg mr-2">✅</span>
                Eligible Offer
              </p>
            </div>
          </div>
          <Link
            to="/apply-loan"
            state={{
              providerName: bank.lender || bank.bankName,
              recommendedLoanAmount:
                bank.maxAmount || bank.max_amount || formData.loan_amount,
            }}
            className="mt-4 btn btn-primary text-center transition-colors duration-200 hover:bg-blue-700"
          >
            Apply Now
          </Link>
        </div>
      ))}
    </div>
  </div>
)}


        {!result && !loading && (
          <div className="container-responsive pb-6">
            <div className="card text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🏦</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Loan Offers Yet</h3>
              <p className="text-gray-500 mb-6">
                Fill out the eligibility form above to discover personalized loan offers from our partner banks.
              </p>
              <div className="flex justify-center">
                <Link to="/dashboard" className="btn btn-outline">
                  Go to Dashboard
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Offers;

