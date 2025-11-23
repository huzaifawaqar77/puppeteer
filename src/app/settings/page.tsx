"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Save, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSuccess(false);

    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="mt-2 text-gray-400">
          Manage your account preferences
        </p>
      </div>

      {/* Profile Section */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              defaultValue={user?.name || ""}
              className="w-full px-4 py-3 border border-white/10 bg-white/5 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              defaultValue={user?.email || ""}
              disabled
              className="w-full px-4 py-3 border border-white/10 bg-white/5 text-gray-500 rounded-lg cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500">
              Email cannot be changed
            </p>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Preferences</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Auto-delete files</p>
              <p className="text-xs text-gray-400">
                Automatically delete processed files after 24 hours
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="h-5 w-5 rounded border-white/10 bg-white/5 text-primary focus:ring-primary"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Email notifications</p>
              <p className="text-xs text-gray-400">
                Receive email when processing is complete
              </p>
            </div>
            <input
              type="checkbox"
              className="h-5 w-5 rounded border-white/10 bg-white/5 text-primary focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Plan Info */}
      <div className="bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-2">Current Plan</h2>
        <p className="text-3xl font-bold text-primary mb-1">FREE</p>
        <p className="text-sm text-gray-400 mb-4">
          30MB max file size • Basic features
        </p>
        <button className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors">
          Upgrade to Pro
        </button>
      </div>

      {success && (
        <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4">
          <p className="text-sm text-green-400">Settings saved successfully!</p>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 px-6 bg-primary hover:bg-primary/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {saving ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="h-5 w-5" />
            Save Settings
          </>
        )}
      </button>
    </div>
  );
}
