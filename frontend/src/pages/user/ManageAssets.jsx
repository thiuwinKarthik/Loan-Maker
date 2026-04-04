// ManageAssets.jsx
import React, { useEffect, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import { toast } from "react-toastify";

const ManageAssets = () => {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const token = localStorage.getItem("token");

  const [assets, setAssets] = useState([]);
  const [assetType, setAssetType] = useState("");
  const [assetValue, setAssetValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deleteAssetId, setDeleteAssetId] = useState(null); // for modal
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAssets = async () => {
    if (!user || !token) return;
    try {
      const res = await fetch(`http://localhost:8080/api/assets/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch assets");
      const data = await res.json();
      setAssets(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load assets ❌");
    }
  };

  const handleAddAsset = async () => {
    if (!assetType || !assetValue) {
      toast.warn("Please fill all fields ⚠️");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/assets/${user.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ assetType, value: Number(assetValue) }),
      });

      if (!res.ok) throw new Error("Failed to add asset");

      const newAsset = await res.json();
      setAssets((prev) => [...prev, newAsset]);
      setAssetType("");
      setAssetValue("");
      toast.success("Asset added successfully ✅");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to add asset ❌");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDeleteAsset = (assetId) => {
    setDeleteAssetId(assetId);
  };

  const cancelDelete = () => {
    setDeleteAssetId(null);
  };

  const handleDeleteAsset = async () => {
    if (!deleteAssetId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`http://localhost:8080/api/assets/${deleteAssetId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete asset");
      setAssets((prev) => prev.filter((a) => a.id !== deleteAssetId));
      toast.success("Asset deleted successfully ✅");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to delete asset ❌");
    } finally {
      setIsDeleting(false);
      setDeleteAssetId(null);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={user?.role || "USER"} />
      <div className="flex-1">
        <Navbar title="Manage Assets" />
        <div className="container-responsive py-6 max-w-4xl mx-auto">
          {/* Add New Asset */}
          <div className="card space-y-4">
            <h2 className="text-2xl font-bold">Add New Asset</h2>
            <input
              type="text"
              placeholder="Asset Type (GOLD, PROPERTY, etc.)"
              value={assetType}
              onChange={(e) => setAssetType(e.target.value.toUpperCase())}
              className="input-base"
            />
            <input
              type="number"
              placeholder="Asset Value"
              value={assetValue}
              onChange={(e) => setAssetValue(e.target.value)}
              className="input-base"
            />
            <button
              onClick={handleAddAsset}
              disabled={isLoading}
              className="btn btn-primary disabled:opacity-60"
            >
              {isLoading ? "Adding..." : "Add Asset"}
            </button>
          </div>

          {/* Asset Table */}
          <div className="mt-10">
            <h2 className="text-2xl font-bold mb-4">Your Assets</h2>
            {assets.length === 0 ? (
              <p>No assets added yet.</p>
            ) : (
              <table className="w-full text-left border-collapse table-auto">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="p-2">ID</th>
                    <th className="p-2">Type</th>
                    <th className="p-2">Value</th>
                    <th className="p-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => (
                    <tr key={asset.id} className="border-b">
                      <td className="p-2">{asset.id}</td>
                      <td className="p-2">{asset.assetType}</td>
                      <td className="p-2">₹{asset.value.toLocaleString("en-IN")}</td>
                      <td className="p-2">
                        <button
                          onClick={() => confirmDeleteAsset(asset.id)}
                          className="btn btn-danger px-3 py-1"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Custom Delete Confirmation Modal */}
        {deleteAssetId && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="card w-[400px]">
              <h2 className="text-lg font-semibold text-gray-800">Confirm Delete</h2>
              <p className="text-gray-600 mt-2 text-sm">
                Are you sure you want to delete asset <b>#{deleteAssetId}</b>?
              </p>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={cancelDelete}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAsset}
                  className="btn btn-danger"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageAssets;
