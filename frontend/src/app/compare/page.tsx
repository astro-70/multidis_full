"use client";

import React, { useState, useEffect } from "react";
import { ApiClient } from "@/lib/api";
import {
  GitCompare,
  TrendingUp,
  DollarSign,
  Briefcase,
  GraduationCap,
  Sparkles,
  Check,
} from "lucide-react";

export default function CareerComparePage() {
  const [allCareers, setAllCareers] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [comparison, setComparison] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCareers() {
      try {
        const list = await ApiClient.getCareers();
        setAllCareers(list);
        if (list.length >= 2) {
          const initial = [list[0].id, list[1].id];
          setSelectedIds(initial);
          const comp = await ApiClient.compareCareers(initial);
          setComparison(comp);
        }
      } catch (e) {
        console.warn("Failed to load careers for comparison", e);
      } finally {
        setLoading(false);
      }
    }
    loadCareers();
  }, []);

  const handleToggleCareer = async (id: string) => {
    let next: string[];
    if (selectedIds.includes(id)) {
      if (selectedIds.length <= 2) {
        alert("Please keep at least 2 careers selected for side-by-side comparison.");
        return;
      }
      next = selectedIds.filter((x) => x !== id);
    } else {
      if (selectedIds.length >= 3) {
        alert("You can compare up to 3 careers side by side.");
        return;
      }
      next = [...selectedIds, id];
    }

    setSelectedIds(next);
    try {
      const comp = await ApiClient.compareCareers(next);
      setComparison(comp);
    } catch (e) {
      console.warn("Failed to update comparison", e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
          <GitCompare className="w-3.5 h-3.5" />
          <span>Side-by-Side Analysis</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Compare Roles, Salaries & Indian Demand
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Select 2 to 3 target paths to contrast entry compensation, growth trajectory, and prerequisites.
        </p>
      </div>

      {/* Career Picker Pills */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          Select careers to compare (max 3):
        </label>
        <div className="flex flex-wrap gap-2">
          {allCareers.map((c) => {
            const isSelected = selectedIds.includes(c.id);
            return (
              <button
                key={c.id}
                onClick={() => handleToggleCareer(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5" />}
                {c.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Grid */}
      {comparison && comparison.careers && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {comparison.careers.map((career: any) => (
              <div
                key={career.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-5"
              >
                <div className="space-y-1 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    {career.category}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{career.title}</h3>
                </div>

                {/* Salary Bands */}
                <div className="space-y-2 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Indian Salary Progression:
                  </span>
                  <div className="space-y-1.5">
                    <div className="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                      <span className="text-slate-400">Entry Level (0-2 Yrs):</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{career.salary_entry_inr}</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                      <span className="text-slate-400">Mid Level (3-6 Yrs):</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{career.salary_mid_inr}</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                      <span className="text-slate-400">Senior Level (7+ Yrs):</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{career.salary_senior_inr}</span>
                    </div>
                  </div>
                </div>

                {/* Demand & Growth */}
                <div className="space-y-2 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-cyan-500" /> Market Demand & Outlook:
                  </span>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Demand Level:</span>
                      <span className="font-bold capitalize text-indigo-600">{career.demand_level.replace("_", " ")}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal">{career.growth_outlook}</p>
                  </div>
                </div>

                {/* Prerequisite & Common Roles */}
                <div className="space-y-2 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-purple-500" /> Prerequisite:
                  </span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">{career.min_education}</p>
                </div>

                {/* Top Skills */}
                <div className="space-y-2 text-xs pt-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Key Prerequisite Skills:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {career.top_skills.map((sk: string, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 text-xs text-slate-500 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>{comparison.comparison_summary}</span>
          </div>
        </div>
      )}
    </div>
  );
}

