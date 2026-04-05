import React, { useEffect, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import { API_BASE_URL } from "../../shared/config/env";
import Sidebar from "../../components/layout/Sidebar";
import { toast } from "react-toastify";

const UserProfile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [updating, setUpdating] = useState(false);

  // Fetch logged-in user profile
  const getProfile = async () => {
    try {
      const token = localStorage.getItem("token"); // JWT token
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch profile");

      const data = await response.json();

      setProfile({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
      });
    } catch (err) {
      toast.error("Failed to load profile");
      console.error(err);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // Update profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
        }),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error("Failed to update profile");
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const user = storedUser ? JSON.parse(storedUser) : null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={user?.role || "USER"} />
      <div className="flex-1 ">
        <Navbar title={"My Profile"} />
        <div className="container-responsive py-6">
          <h1 className="text-2xl font-semibold mb-6 text-gray-800">Update your profile</h1>
          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block mb-2 font-medium text-gray-600">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="input-base"
                required
              />
            </div>

            {/* Email (readonly) */}
            <div>
              <label className="block mb-2 font-medium text-gray-600">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={profile.email}
                readOnly
                className="input-base bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block mb-2 font-medium text-gray-600">
                Phone
              </label>
              <input
                type="text"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="input-base"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={updating}
              className="btn btn-primary w-full"
            >
              {updating ? "Updating..." : "Update Profile"}
            </button>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
