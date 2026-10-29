"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ApiClient } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  ShieldAlert,
  Users,
  Award,
  Compass,
  FileText,
  BarChart2,
  TrendingUp,
  PlusCircle,
  CheckCircle,
} from "lucide-react";

export default function AdminPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const data = await ApiClient.getAdminMetrics();
        setMetrics(data);
      } catch (e) {
        console.warn("Failed to load admin metrics", e);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  if (user && user.role !== "admin") {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto" />
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Admin Privileges Required</h1>
        <p className="text-xs text-slate-500">
          This portal is reserved for academic counselors and administrators. Please log in with an admin account.
        </p>
        <Link href="/login" className="inline-block px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold">
          Switch Account
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>System Administration & Governance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Platform Usage & Content Governance
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Real-time metrics on candidate assessments, career demand catalogs, and ATS scan pipelines.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs text-slate-400">Total Registered Aspirants</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {metrics?.total_users || 0}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs text-slate-400">Assessments Initiated</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600">
                {metrics?.total_assessments_started || 0}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs text-slate-400">Completion Rate</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                {metrics?.completion_rate_pct || 100}%
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs text-slate-400">Total ATS Resumes Parsed</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-purple-600">
                {metrics?.total_resumes_analyzed || 0}
              </p>
            </div>
          </div>

          {/* Database Content Health */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" /> Catalog Database Seed Status
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-200">Active High-Demand Careers</span>
                <p className="text-slate-500 text-sm font-semibold text-indigo-600">
                  {metrics?.total_careers || 26} Verified Careers Loaded
                </p>
                <p className="text-slate-400 text-[11px]">Includes Software, Data, Design, EV Powertrain, Legal, and Civil Infrastructure.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-200">National Competitive Exams & Schemes</span>
                <p className="text-slate-500 text-sm font-semibold text-emerald-600">
                  {metrics?.total_exams_scholarships || 7} Opportunities Active
                </p>
                <p className="text-slate-400 text-[11px]">JEE, GATE, CAT, UPSC, National Overseas, PMRF, AICTE Pragati.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

