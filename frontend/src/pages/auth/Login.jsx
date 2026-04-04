import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, Eye, EyeOff, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import { authApi } from "../../features/auth/api";
import { session } from "../../shared/auth/session";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const loginData = await authApi.login(formData);
      const token = loginData?.token;
      if (!token) throw new Error("Invalid login credentials");

      session.setToken(token);
      const user = await authApi.profile();
      session.setUser(user);
      
      toast.success(`Welcome back, ${user.name}! 🎉`);
      
      if (user.role === "ROLE_ADMIN") navigate("/admin");
      else if (user.role === "USER") navigate("/dashboard");
      else throw new Error("Unauthorized role");
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex relative font-sans">
      
      {/* Left Form Side */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 z-10 w-full lg:w-1/2 bg-white shadow-[0_0_40px_rgba(0,0,0,0.05)] relative">
        
        <div className="w-full max-w-md">
          {/* Logo / Header */}
          <div className="mb-10 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-800 to-primary-950 flex items-center justify-center shadow-lg mb-6">
              <span className="font-bold text-white text-3xl leading-none">L</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-500 font-medium tracking-wide">Sign in to Loan Maker to manage your finances.</p>
          </div>

          <div className="bg-white border text-gray-800 border-gray-100 rounded-2xl shadow-xl p-8 relative">
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm mb-6 rounded-lg">
                <span className="block font-medium">Login Failed</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  onChange={handleChange}
                  value={formData.email}
                  required
                  placeholder="name@example.com"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    onChange={handleChange}
                    value={formData.password}
                    required
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-medium pr-12"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-700 transition-colors p-1"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-lg bg-primary-900 hover:bg-primary-950 text-white font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>Sign In To Dashboard <LogIn size={18} /></>
                  )}
                </button>
              </div>
            </form>
          </div>

          <p className="text-center text-gray-500 text-sm mt-8 pb-8">
            Don't have an account yet?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-primary-700 font-bold hover:text-primary-900 cursor-pointer underline underline-offset-4 decoration-primary-200 hover:decoration-primary-700 transition-colors"
            >
              Apply now
            </span>
          </p>
        </div>
      </div>

      {/* Right side Marketing display */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-primary-900 to-primary-950 overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-primary-900 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="relative z-10 max-w-lg text-white">
          <div className="inline-flex rounded-full px-4 py-1.5 bg-primary-800 border border-primary-700 text-primary-100 text-sm font-semibold mb-6 shadow-md">
            The #1 Marketplace for Loans
          </div>
          <h2 className="text-4xl font-bold mb-6 leading-tight">Financial freedom, just a click away.</h2>
          <p className="text-primary-200 text-lg mb-10 leading-relaxed font-light">
            Compare premium loan offers tailored to your credit profile. Powered by secure integrations with top banking institutions.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10">
              <div className="bg-emerald-500/20 p-2 rounded-full text-emerald-400">
                <CheckCircle size={20} />
              </div>
              <div>
                <p className="font-semibold">Pre-approved Offers</p>
                <p className="text-sm text-primary-300">No impact on your credit score</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10">
              <div className="bg-blue-500/20 p-2 rounded-full text-blue-400">
                <CheckCircle size={20} />
              </div>
              <div>
                <p className="font-semibold">AI Loan Advisor</p>
                <p className="text-sm text-primary-300">24/7 personal financial counseling</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
