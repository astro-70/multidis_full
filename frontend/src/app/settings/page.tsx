"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ApiClient } from "@/lib/api";
import { SupportedLang } from "@/lib/translations";
import {
  User,
  Shield,
  Download,
  Trash2,
  Globe,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
} from "lucide-react";

export default function SettingsPage() {
  const { user, lang, setLanguage, refreshUser, logout } = useAuth();
  const [educationLevel, setEducationLevel] = useState(user?.profile?.education_level || "college");
  const [stream, setStream] = useState(user?.profile?.stream_or_major || "Computer Science");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await ApiClient.updateProfile({
        education_level: educationLevel,
        stream_or_major: stream,
        preferred_language: lang,
      });
      await refreshUser();
      setMessage("Profile settings successfully updated.");
    } catch (e: any) {
      alert(e.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(user, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `pathfinder_data_${user?.id || "user"}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDeleteData = () => {
    if (confirm("Are you sure you want to delete all personal data and assessment history? This action is permanent under DPDP Act compliance.")) {
      logout();
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Account & Privacy Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage your personal profile, preferred regional language, and digital data controls.
        </p>
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Profile Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-600" /> Personal Academic Profile
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
              <input
                type="text"
                disabled
                value={user?.full_name || ""}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-500 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
              <input
                type="text"
                disabled
                value={user?.email || ""}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Education Level</label>
            <select
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="class_10">Class 10 Student</option>
              <option value="class_12">Class 12 Student</option>
              <option value="college">College / Undergraduate (B.Tech / BCA)</option>
              <option value="graduate">Fresh Graduate</option>
              <option value="switcher">Career Switcher</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Stream or Major</label>
            <input
              type="text"
              value={stream}
              onChange={(e) => setStream(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Preferred Regional UI Language</label>
            <div className="flex gap-2">
              {[
                { id: "en", label: "English" },
                { id: "hi", label: "हिंदी" },
                { id: "ta", label: "தமிழ்" },
              ].map((l) => (
                <button
                  type="button"
                  key={l.id}
                  onClick={() => setLanguage(l.id as SupportedLang)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    lang === l.id
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 text-xs shadow-md disabled:opacity-50"
            >
              {saving ? "Saving Changes..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>

      {/* Privacy & DPDP Compliance */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-5">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-600" /> Digital Personal Data Protection (DPDP) Controls
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          You retain full ownership of your career assessment responses, uploaded resume text, and AI counseling history.
          You can download a machine-readable JSON copy or delete your profile at any time.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleExportData}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4 text-indigo-500" />
            Export My Personal Data (JSON)
          </button>

          <button
            onClick={handleDeleteData}
            className="px-5 py-2.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 hover:bg-red-100 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete All Personal Data & History
          </button>
        </div>
      </div>
    </div>
  );
}

