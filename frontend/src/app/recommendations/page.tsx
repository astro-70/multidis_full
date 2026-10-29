"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiClient } from "@/lib/api";
import {
  Compass,
  Award,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  Layers,
  Sparkles,
  MapPin,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

function RecommendationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get("assessment_id");

  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const fetchRecommendations = async () => {
    setLoading(true);
    setError("");
    try {
      const data = assessmentId
        ? await ApiClient.generateRecommendations(assessmentId)
        : await ApiClient.getMyRecommendations();
      setRecommendations(data.recommendations || []);
    } catch (err: any) {
      setError(err.message || "Failed to load career recommendations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [assessmentId]);

  const handleGenerateRoadmap = async (careerId: string) => {
    setGenerating(true);
    try {
      await ApiClient.generateRoadmap(careerId);
      router.push("/roadmap");
    } catch (err: any) {
      alert(err.message || "Failed to generate roadmap.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-medium text-slate-500">
          Gemini AI is analyzing your aptitude traits against Indian job market patterns...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Explainable AI Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Your Top 5 Career Matches
          </h1>
          <p className="text-sm text-slate-500">
            Algorithmic recommendations scored against your problem-solving style, stream background, and Indian hiring demand.
          </p>
        </div>

        <button
          onClick={fetchRecommendations}
          className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Re-calculate Matches
        </button>
      </div>

      {/* AI Disclaimer Alert */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
          <p className="font-semibold">Explainable AI Transparency Notice</p>
          <p>
            Every match provides the explicit reasoning behind its score. PathFinder AI provides guidance based on verified data,
            but career success also hinges on deliberate practice and continuous execution.
          </p>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-6">
        {recommendations.map((rec, idx) => {
          const c = rec.career;
          return (
            <div
              key={rec.id || idx}
              className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition-all space-y-6"
            >
              {/* Card Top */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      Rank #{idx + 1}
                    </span>
                    <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
                      {c.category}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    {c.title}
                  </h2>
                </div>

                {/* Match Percentage Pill */}
                <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-4 py-2 rounded-2xl shrink-0">
                  <div className="text-right">
                    <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                      {rec.match_percentage}%
                    </div>
                    <div className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300">
                      Aptitude Fit
                    </div>
                  </div>
                  <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>

              {/* Description & Reasoning */}
              <div className="space-y-3">
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {c.description}
                </p>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-1">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Why this fits you:
                  </span>
                  <p className="leading-relaxed">{rec.reasoning}</p>
                </div>
              </div>

              {/* Indian Market Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Entry Package</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">{c.salary_entry_inr}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Senior Band</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">{c.salary_senior_inr}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Hiring Demand</span>
                  <p className="font-bold text-indigo-600 capitalize text-sm mt-0.5">{c.demand_level.replace("_", " ")}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Minimum Prerequisite</span>
                  <p className="font-semibold text-slate-700 dark:text-slate-300 text-xs truncate mt-0.5">{c.min_education}</p>
                </div>
              </div>

              {/* Pros and Cons */}
              {rec.pros_and_cons && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                  <div className="space-y-1.5">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Key Advantages:
                    </span>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                      {(rec.pros_and_cons.pros || []).map((pro: string, i: number) => (
                        <li key={i}>• {pro}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-1.5">
                    <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Challenge to Prepare For:
                    </span>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                      {(rec.pros_and_cons.cons || []).map((con: string, i: number) => (
                        <li key={i}>• {con}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
                <Link
                  href={`/skill-gap?career_id=${c.id}`}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Layers className="w-4 h-4" />
                  View Skill Gap Radar
                </Link>

                <button
                  onClick={() => handleGenerateRoadmap(c.id)}
                  disabled={generating}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2 text-xs shadow-md shadow-indigo-600/20 disabled:opacity-50"
                >
                  <MapPin className="w-4 h-4" />
                  {generating ? "Crafting Roadmap..." : "Generate 12-Week Roadmap"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function RecommendationsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-medium text-slate-500">Loading AI career matches...</p>
      </div>
    }>
      <RecommendationsContent />
    </Suspense>
  );
}
