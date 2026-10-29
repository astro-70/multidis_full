"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ApiClient } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  BarChart3,
  Flame,
  Award,
  Zap,
  MapPin,
  FileCheck,
  Compass,
  ArrowRight,
  Sparkles,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const data = await ApiClient.getDashboard();
        setOverview(data);
      } catch (e) {
        console.warn("Failed to load dashboard data", e);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-medium text-slate-500">Loading student learning overview...</p>
      </div>
    );
  }

  const badges = overview?.badges || [];
  const nextAction = overview?.next_best_action;
  const roadmap = overview?.active_roadmap;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Welcome back, {overview?.user_name || "Aspirant"}!
            </h1>
            <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              {overview?.streak_days || 4} Day Streak
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Current Education Phase: <span className="capitalize font-semibold text-slate-700 dark:text-slate-300">{overview?.education_level?.replace("_", " ") || "College"}</span>
            {overview?.stream ? ` • ${overview.stream}` : ""}
          </p>
        </div>

        <Link
          href="/assessment"
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5"
        >
          <Compass className="w-3.5 h-3.5" />
          Retake Assessment
        </Link>
      </div>

      {/* Next Best Action Hero Card */}
      {nextAction && (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-600 to-indigo-800 text-white shadow-xl shadow-indigo-600/20 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-200">
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
            Recommended Next Step
          </div>
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold">{nextAction.title}</h2>
            <p className="text-xs sm:text-sm text-indigo-100 max-w-xl leading-relaxed">{nextAction.description}</p>
          </div>
          <div>
            <Link
              href={nextAction.action_url}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-indigo-900 bg-white hover:bg-indigo-50 shadow-md text-xs transition-transform hover:scale-105"
            >
              Continue Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Active Roadmap Progress */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Target Career Roadmap</span>
            <MapPin className="w-4 h-4 text-indigo-500" />
          </div>
          {roadmap ? (
            <div className="space-y-3">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">{roadmap.career_title}</h3>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Curriculum Completed</span>
                  <span className="font-bold text-indigo-600">{roadmap.progress_percentage}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full transition-all duration-300"
                    style={{ width: `${roadmap.progress_percentage}%` }}
                  ></div>
                </div>
              </div>
              <Link
                href="/roadmap"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
              >
                Go to Weekly Steps <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-slate-500">No active roadmap. Pick a career to get started.</p>
              <Link href="/recommendations" className="text-xs font-semibold text-indigo-600 hover:underline">
                Pick a Career →
              </Link>
            </div>
          )}
        </div>

        {/* ATS Score */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Resume Readiness</span>
            <FileCheck className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {overview?.latest_ats_score ? `${overview.latest_ats_score}/100` : "Not Scanned"}
            </div>
            <p className="text-xs text-slate-500">
              {overview?.latest_ats_score
                ? "Simulated ATS benchmark score against target hiring keywords."
                : "Upload your resume PDF to detect missing skills and formatting gaps."}
            </p>
            <Link
              href="/resume-analyser"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
            >
              Scan Resume <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Career Clarity */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Career Clarity Score</span>
            <Compass className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-extrabold text-emerald-600">
              {overview?.career_clarity_score || 72}/100
            </div>
            <p className="text-xs text-slate-500">
              Based on completed quiz modules, skill coverage, and roadmap execution.
            </p>
            <Link
              href="/compare"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
            >
              Compare Career Options <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Badges Earned */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-600" />
          Milestone Badges Unlocked
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {badges.map((b: any) => (
            <div
              key={b.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="truncate">
                <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{b.title}</p>
                <p className="text-[10px] text-slate-400 truncate">{b.description}</p>
              </div>
            </div>
          ))}
          {badges.length === 0 && (
            <p className="text-xs text-slate-400 col-span-4">Complete your first assessment to unlock badges!</p>
          )}
        </div>
      </div>
    </div>
  );
}

