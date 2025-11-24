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
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="mt-2 text-secondary">
            Manage your account preferences
          </p>
        </div>

        {/* Profile Section */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <h2 className="text-xl font-semibold text-foreground mb-4">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              <input
                type="text"
                defaultValue={user?.name || ""}
                className="w-full px-4 py-3 border border-border bg-card text-foreground rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <input
                type="email"
                defaultValue={user?.email || ""}
                disabled
                className="w-full px-4 py-3 border border-border bg-sidebar text-secondary rounded-lg cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-secondary">
                Email cannot be changed
              </p>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <h2 className="text-xl font-semibold text-foreground mb-4">Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Auto-delete files</p>
                <p className="text-xs text-secondary">
                  Automatically delete processed files after 24 hours
                </p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
              />
            </div>
            <div className="flex items-center justify-between py-3 border-t border-border">
              <div>
                <p className="text-sm font-medium text-foreground">Email notifications</p>
                <p className="text-xs text-secondary">
                  Receive email when processing is complete
                </p>
              </div>
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Plan Info */}
        <div className="bg-gradient-to-r from-primary/10 to-orange-500/10 border border-primary/30 rounded-xl p-6 shadow-card">
          <h2 className="text-xl font-semibold text-foreground mb-2">Current Plan</h2>
          <p className="text-3xl font-bold text-primary mb-1">FREE</p>
          <p className="text-sm text-secondary mb-4">
            30MB max file size • Basic features
          </p>
          <button className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-all hover:shadow-glow-orange">
            Upgrade to Pro
          </button>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-700 font-medium">Settings saved successfully!</p>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3.5 px-6 bg-primary hover:bg-primary/90 disabled:bg-secondary/30 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all hover:shadow-glow-orange flex items-center justify-center gap-2"
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
    </div>
  );
}

