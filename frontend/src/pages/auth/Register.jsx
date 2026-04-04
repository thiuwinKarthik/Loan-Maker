import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Eye, EyeOff, FileSignature } from "lucide-react";
import { toast } from "react-toastify";
import { authApi } from "../../features/auth/api";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    age: "",
    monthlyIncome: "",
    creditScore: "",
    existingEmi: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const payload = {
      ...formData,
      age: formData.age ? parseInt(formData.age, 10) : undefined,
      monthlyIncome: formData.monthlyIncome ? parseFloat(formData.monthlyIncome) : undefined,
      creditScore: formData.creditScore ? parseInt(formData.creditScore, 10) : undefined,
      existingEmi: formData.existingEmi ? parseFloat(formData.existingEmi) : undefined,
    };

    try {
      await authApi.register(payload);
      toast.success("Account created successfully! Welcome to Loan Maker.");
      navigate("/");
    } catch (err) {
      setError(err.message || "Registration failed. Please check your inputs.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative font-sans">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>

      <div className="w-full max-w-5xl relative z-10">
        
        {/* Header Title for the Page */}
        <div className="mb-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary-800 to-primary-950 flex items-center justify-center shadow-lg mb-4">
              <span className="font-bold text-white text-3xl leading-none">L</span>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Join Loan Maker</h2>
            <p className="text-gray-500 mt-2 font-medium">Create your account to unlock personalized loan offers instantly.</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
          
          {/* Left Info Panel */}
          <div className="bg-gradient-to-br from-primary-900 to-primary-950 p-10 lg:w-1/3 flex flex-col justify-between text-white">
            <div>
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6">
                <FileSignature size={24} className="text-primary-200" />
              </div>
              <h3 className="text-2xl font-bold mb-4">A Few Steps to Financial Freedom</h3>
              <p className="text-primary-200 text-sm leading-relaxed mb-4">
                We require some basic financial metrics to match you precisely with top lending partners.
              </p>
              <ul className="space-y-4 mt-8 text-sm text-primary-100">
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                  Fast pre-approval process
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                  No hidden credit checks
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                  Secure 256-bit encryption
                </li>
              </ul>
            </div>
            
            <div className="mt-12 pt-8 border-t border-primary-800/50">
              <p className="text-sm text-primary-300 mb-3">Already have an account?</p>
              <button 
                onClick={() => navigate('/')} 
                className="text-white hover:text-accent font-semibold flex items-center gap-2 group transition-colors px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm w-max"
                type="button"
              >
                Sign In Instead
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>

          {/* Form Area */}
          <div className="p-8 lg:p-12 lg:w-2/3">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-8 flex items-start gap-3">
                <span className="mt-0.5 font-bold">⚠</span>
                <div>
                  <p className="font-bold">Error creating account</p>
                  <p className="text-red-500 mt-1">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Full Name</label>
                  <input
                    type="text" name="name" onChange={handleChange} value={formData.name} required
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-medium placeholder-gray-400"
                    placeholder="John Doe"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Email Address</label>
                  <input
                    type="email" name="email" onChange={handleChange} value={formData.email} required
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-medium placeholder-gray-400"
                    placeholder="john@example.com"
                  />
                </div>

                <div className="space-y-1.5 relative">
                  <label className="text-sm font-semibold text-gray-700">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"} name="password" onChange={handleChange} value={formData.password} required
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-4 pr-10 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-medium placeholder-gray-400"
                      placeholder="••••••••"
                      minLength={6}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                  <input
                    type="tel" name="phone" onChange={handleChange} value={formData.phone}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-medium placeholder-gray-400"
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100">
                <h3 className="text-gray-900 font-bold mb-5 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex justify-center items-center text-xs">₹</span> 
                  Financial Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Age</label>
                    <input
                      type="number" name="age" onChange={handleChange} value={formData.age} required min="18"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-colors"
                      placeholder="e.g. 30"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Income/Mo.</label>
                    <input
                      type="number" name="monthlyIncome" onChange={handleChange} value={formData.monthlyIncome} required min="0" step="0.01"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-colors"
                      placeholder="₹"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Credit Score</label>
                    <input
                      type="number" name="creditScore" onChange={handleChange} value={formData.creditScore} min="300" max="900"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-colors"
                      placeholder="300 - 900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Current EMI</label>
                    <input
                      type="number" name="existingEmi" onChange={handleChange} value={formData.existingEmi} min="0" step="0.01"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-colors"
                      placeholder="₹"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-lg bg-primary-900 hover:bg-primary-950 text-white font-bold tracking-wide shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>Create Account <UserPlus size={18} /></>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
