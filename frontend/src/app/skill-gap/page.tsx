"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ApiClient } from "@/lib/api";
import {
  Layers,
  Award,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  BarChart2,
  Sparkles,
  MapPin,
} from "lucide-react";

function SkillGapContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const careerId = searchParams.get("career_id");

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    async function loadGap() {
      if (!careerId) {
        // Fallback to first available career
        try {
          const careers = await ApiClient.getCareers();
          if (careers.length > 0) {
            router.replace(`/skill-gap?career_id=${careers[0].id}`);
            return;
          }
        } catch (e) {
          setError("Failed to fetch careers.");
          setLoading(false);
          return;
        }
      }

      try {
        const gapData = await ApiClient.getSkillGap(careerId!);
        setData(gapData);
      } catch (err: any) {
        setError(err.message || "Failed to load skill gap analysis.");
      } finally {
        setLoading(false);
      }
    }
    loadGap();
  }, [careerId]);

  const handleStartRoadmap = async () => {
    if (!careerId) return;
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
        <p className="text-sm font-medium text-slate-500">Calculating skill delta and market proficiency benchmarks...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Unable to load Skill Gap</h2>
        <p className="text-xs text-slate-500">{error || "Please select a valid career from recommendations."}</p>
        <Link
          href="/recommendations"
          className="inline-flex px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
        >
          Back to Recommendations
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Target Role Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Skill Gap Analyser: {data.career_title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Comparing your verified proficiency (Level 0-5) against Indian industry hiring benchmarks.
          </p>
        </div>

        <button
          onClick={handleStartRoadmap}
          disabled={generating}
          className="px-6 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2 text-xs shadow-md shadow-indigo-600/20 disabled:opacity-50"
        >
          <MapPin className="w-4 h-4" />
          {generating ? "Building..." : "Build Missing Skills Roadmap"}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Summary Readiness Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs text-slate-400">Current Alignment</span>
          <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{data.match_percentage}%</p>
          <p className="text-xs text-slate-500">Coverage across critical prerequisites</p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1 sm:col-span-2">
          <span className="text-xs text-slate-400">Readiness Evaluation</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              {data.readiness_level}
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 pt-1 leading-relaxed">
            {data.summary}
          </p>
        </div>
      </div>

      {/* Visual Skill Gap Radar / Bars */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-600" />
            Skill-by-Skill Proficiency Breakdown
          </h2>
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
              <span>Your Current Skill</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700"></div>
              <span>Target Benchmark</span>
            </div>
          </div>
        </div>

        {/* Interactive Bar Comparison Matrix */}
        <div className="space-y-4">
          {data.skills.map((item: any, i: number) => {
            const userPct = (item.user_proficiency / 5) * 100;
            const targetPct = (item.required_proficiency / 5) * 100;
            const hasGap = item.gap > 0;

            return (
              <div key={i} className="space-y-1.5 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{item.skill_name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {item.importance}
                    </span>
                  </div>
                  <div className="text-right text-[11px] font-medium text-slate-500">
                    {hasGap ? (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">Gap: -{item.gap} Levels</span>
                    ) : (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Benchmark Met
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar overlay */}
                <div className="relative w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  {/* Target level bar */}
                  <div
                    className="absolute top-0 bottom-0 left-0 bg-slate-300 dark:bg-slate-700 rounded-full opacity-60"
                    style={{ width: `${targetPct}%` }}
                  ></div>
                  {/* User level bar */}
                  <div
                    className={`absolute top-0 bottom-0 left-0 rounded-full transition-all duration-500 ${
                      userPct >= targetPct ? "bg-emerald-500" : "bg-indigo-600"
                    }`}
                    style={{ width: `${userPct}%` }}
                  ></div>
                </div>

                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Level {item.user_proficiency} / 5</span>
                  <span>Required: Level {item.required_proficiency} / 5</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function SkillGapPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-medium text-slate-500">Calculating skill delta and market proficiency benchmarks...</p>
      </div>
    }>
      <SkillGapContent />
    </Suspense>
  );
}
