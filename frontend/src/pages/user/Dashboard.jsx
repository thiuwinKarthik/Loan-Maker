import React, { useEffect, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import { Link } from "react-router-dom";
import { userApi } from "../../features/user/api";
import { session } from "../../shared/auth/session";
import { CreditCard, TrendingUp, ShieldCheck, ArrowRight, AlertCircle, Sparkles } from "lucide-react";

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [recommendedOffers, setRecommendedOffers] = useState([]);
  const [isEligible, setIsEligible] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    if (!session.getToken()) return;
    try {
      const userData = await userApi.profile();
      setUser(userData);

      const loansData = await userApi.loanApplications(userData.id);

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
          localStorage.setItem(lastKey, String(latest.id));
        }
      }

      const savedRaw = localStorage.getItem(`eligibility_result_${userData.id}`);
      if (savedRaw) {
        const saved = JSON.parse(savedRaw);
        setIsEligible(saved.prediction === true);
        if (saved.prediction === true && saved.recommendations?.length > 0) {
          setRecommendedOffers(saved.recommendations.slice(0, 4));
        } else {
          setRecommendedOffers([]);
        }
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-primary-900 font-medium">Loading Wealth Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-b from-gray-50 to-gray-100 font-sans text-gray-900 overflow-hidden">
      <Sidebar role={user?.role || "USER"} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar title={`Welcome back, ${user?.name?.split(' ')[0] || "User"}`} />

        <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8 container-responsive">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
                Financial Overview
              </h1>
              <p className="text-gray-500 mt-2">Manage your assets, track loans, and review elite offers.</p>
            </div>
            
            <Link to="/apply-loan" className="btn bg-primary-900 text-white hover:bg-primary-950 shadow-lg shadow-primary-900/20 px-6 py-3 shrink-0">
              New Application <ArrowRight size={18} />
            </Link>
          </div>

          {/* Bento Box Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Identity Card */}
            <div className="card col-span-1 md:col-span-1 border-0 bg-gradient-to-br from-primary-900 to-primary-950 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/5 blur-2xl"></div>
              <div className="relative z-10 space-y-6">
                <div>
                  <h3 className="text-primary-100 font-medium text-sm tracking-wider uppercase mb-1">Identity</h3>
                  <p className="text-2xl font-bold">{user?.name}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-primary-200">Email</span>
                    <span className="font-medium text-white">{user?.email}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-primary-200">Phone</span>
                    <span className="font-medium text-white">{user?.phone || 'Not Provided'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-primary-200">Role</span>
                    <span className="font-medium px-2 py-1 bg-primary-800 rounded text-xs">{user?.role}</span>
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-white/10">
                  <Link to="/profile" className="text-primary-200 text-sm font-medium hover:text-white flex items-center gap-1 transition-colors">
                    Manage Profile <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Eligibility & Offers Hero Widget */}
            <div className="card col-span-1 md:col-span-2 border border-gray-200 shadow-soft bg-white/50 flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-opacity">
                <ShieldCheck size={200} />
              </div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                  <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-2">
                    <Sparkles className="text-accent" size={24} /> 
                    Eligibility Status
                  </h3>
                  
                  {isEligible === true ? (
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      Excellent news. Your profile fulfills the criteria for premium lending partners. You have <strong className="text-accent bg-accent/10 px-2 py-0.5 rounded">{recommendedOffers.length} pre-approved</strong> matches awaiting your review.
                    </p>
                  ) : isEligible === false ? (
                    <p className="text-red-700/80 mb-6 leading-relaxed bg-red-50 p-3 rounded-lg border border-red-100 inline-block">
                      <AlertCircle className="inline mr-1" size={16} />
                      Your current metrics fall below our premier lending threshold. Review the AI Advisor to discover actionable improvements.
                    </p>
                  ) : (
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      You haven't run a recent eligibility check. Run our sophisticated analysis engine to unlock tailored borrowing options instantly.
                    </p>
                  )}

                  <Link to="/offers" className={`btn ${isEligible ? 'btn-secondary border-primary-200' : 'btn-primary'}`}>
                    {isEligible ? 'Recalculate Metrics' : 'Run Eligibility Check'}
                  </Link>
                </div>

                {/* Quick specific metric callouts */}
                <div className="flex md:flex-col gap-4 border-l pl-6 border-gray-200 hidden lg:flex">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-1">Pre-Approvals</p>
                    <p className="text-3xl font-bold text-gray-900">{recommendedOffers.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-1">Standing</p>
                    <p className={`text-lg font-bold ${isEligible ? 'text-accent' : (isEligible === false ? 'text-danger' : 'text-gray-400')}`}>
                      {isEligible ? 'Prime' : (isEligible === false ? 'Sub-Prime' : 'Pending')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Offers Grid */}
          {isEligible && recommendedOffers.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="text-primary-600" /> Executive Offers
                </h2>
                <Link to="/offers" className="text-sm font-semibold text-primary-700 hover:text-primary-800">View All Matches</Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recommendedOffers.map((offer, idx) => (
                  <div key={idx} className="card p-0 flex flex-col bg-white border border-gray-200 hover:border-primary-300 hover:shadow-xl transition-all duration-300 group overflow-hidden">
                    <div className="h-2 w-full bg-gradient-to-r from-primary-400 to-primary-600"></div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-bold text-gray-900 group-hover:text-primary-700 transition-colors">
                          {offer.lender || offer.bankName || `Institution ${idx + 1}`}
                        </h4>
                        <span className="bg-primary-50 text-primary-800 text-xs font-bold px-2.5 py-1 rounded border border-primary-100">
                          Match
                        </span>
                      </div>
                      
                      <div className="space-y-4 flex-1">
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-semibold">Interest Rate</p>
                          <p className="text-2xl font-bold text-gray-900">{parseFloat(offer.interest_rate || offer.interestRate).toFixed(2)}%</p>
                        </div>
                        
                        {(offer.maxAmount || offer.max_amount) && (
                          <div className="pt-4 border-t border-gray-100">
                            <p className="text-xs text-gray-500 uppercase font-semibold">Max Capital</p>
                            <p className="text-lg font-bold text-gray-800">
                              ₹{Number(offer.maxAmount || offer.max_amount).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <Link
                        to="/apply-loan"
                        state={{ providerName: offer.bankName || offer.lender }}
                        className="mt-6 w-full py-2.5 bg-gray-50 hover:bg-primary-50 text-primary-700 text-sm font-bold text-center rounded-lg border border-gray-200 hover:border-primary-200 transition-colors"
                      >
                        Secure Capital
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default UserDashboard;