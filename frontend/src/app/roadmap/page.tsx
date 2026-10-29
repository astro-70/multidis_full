"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ApiClient } from "@/lib/api";
import {
  MapPin,
  CheckCircle2,
  Circle,
  Video,
  ExternalLink,
  BookOpen,
  Code,
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchRoadmap = async () => {
    try {
      const data = await ApiClient.getActiveRoadmap();
      setRoadmap(data);
    } catch (e) {
      console.warn("Failed to fetch roadmap", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleToggleStep = async (stepId: string, currentStatus: boolean) => {
    setTogglingId(stepId);
    try {
      const updated = await ApiClient.toggleStepProgress(stepId, !currentStatus);
      setRoadmap(updated);
    } catch (e: any) {
      alert(e.message || "Failed to update step.");
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-medium text-slate-500">Loading your personalized career roadmap...</p>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 flex items-center justify-center mx-auto shadow-md">
          <MapPin className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">No Active Roadmap Found</h2>
          <p className="text-xs text-slate-500">
            Take the career assessment or pick a career from recommendations to generate your 12-week plan.
          </p>
        </div>
        <Link
          href="/recommendations"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-indigo-600 text-white text-xs shadow-md hover:bg-indigo-700"
        >
          View Recommended Careers <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              Active Milestone Plan
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold">{roadmap.title}</h1>
            <p className="text-xs sm:text-sm text-indigo-200">
              {roadmap.total_duration_weeks}-week roadmap covering foundations, applied frameworks, and capstone deployment.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shrink-0 text-center min-w-[120px]">
            <p className="text-3xl font-black text-cyan-300">{roadmap.progress_percentage}%</p>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-indigo-200 mt-0.5">Progress</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-black/30 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-cyan-400 to-indigo-400 h-full transition-all duration-500"
            style={{ width: `${roadmap.progress_percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Steps Timeline */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          Milestones & Weekly Curriculum
        </h2>

        <div className="space-y-6 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 before:z-0">
          {roadmap.steps.map((step: any, idx: number) => {
            const isCompleted = step.is_completed;
            const isPending = togglingId === step.id;

            return (
              <div
                key={step.id}
                className={`relative z-10 p-6 sm:p-7 rounded-3xl border transition-all ${
                  isCompleted
                    ? "bg-slate-50 dark:bg-slate-900/60 border-emerald-300 dark:border-emerald-900/60 shadow-sm"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-md hover:border-indigo-400"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleStep(step.id, isCompleted)}
                      disabled={isPending}
                      className="mt-0.5 shrink-0 transition-transform hover:scale-110"
                      title={isCompleted ? "Mark incomplete" : "Mark milestone completed"}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-7 h-7 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                      ) : (
                        <Circle className="w-7 h-7 text-slate-300 hover:text-indigo-600" />
                      )}
                    </button>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          Week {step.week_number}
                        </span>
                        {isCompleted && (
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            Milestone Cleared
                          </span>
                        )}
                      </div>
                      <h3 className={`text-lg font-bold ${isCompleted ? "line-through text-slate-500" : "text-slate-900 dark:text-white"}`}>
                        {step.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Free Learning Resources */}
                {step.free_resources && step.free_resources.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-indigo-500" /> Curated Free Masterclasses & Guides:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {step.free_resources.map((res: any, rIdx: number) => (
                        <a
                          key={rIdx}
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs text-slate-700 dark:text-slate-200 group transition-colors"
                        >
                          <div className="truncate mr-2">
                            <p className="font-semibold truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{res.title}</p>
                            <p className="text-[10px] text-slate-400">{res.source} {res.duration ? `• ${res.duration}` : ""}</p>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Capstone Project Brief */}
                {step.project_brief && (
                  <div className="mt-4 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-950/50 text-xs space-y-2">
                    <span className="font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                      <Code className="w-4 h-4" /> Capstone Deliverable: {step.project_brief.title}
                    </span>
                    <p className="text-slate-600 dark:text-slate-400">{step.project_brief.description}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(step.project_brief.suggested_tech || []).map((tech: string, tIdx: number) => (
                        <span key={tIdx} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

