"use client";

import React, { useState } from "react";
import { ApiClient } from "@/lib/api";
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  FileCheck,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";

export default function ResumeAnalyserPage() {
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("Full Stack Web Developer");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a resume file (PDF, DOCX, or TXT).");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("target_role", targetRole);

      const data = await ApiClient.analyzeResume(formData);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to analyze resume.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
          <FileText className="w-3.5 h-3.5" />
          <span>ATS Screening Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          AI Resume & ATS Analyser
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Simulate how Applicant Tracking Systems and Indian hiring recruiters parse your technical profile.
        </p>
      </div>

      {/* Upload Box */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Target Career Role
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Full Stack Web Developer or Data Scientist"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center hover:border-indigo-500 transition-colors">
            <UploadCloud className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {file ? file.name : "Upload your resume (PDF, DOCX, or TXT)"}
            </p>
            <p className="text-xs text-slate-400 mt-1">Maximum file size: 10MB</p>
            <label className="inline-block mt-4 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
              Browse Files
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !file}
            className="w-full py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 text-sm shadow-md disabled:opacity-50"
          >
            {loading ? "Extracting & Benchmarking..." : "Run ATS Scan & Gap Analysis"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Analysis Results Display */}
      {result && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Scan Complete</span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                ATS Compatibility Report
              </h2>
              <p className="text-xs text-slate-500">File: {result.file_name} • Role: {result.target_role}</p>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-center min-w-[130px]">
              <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{result.ats_score}/100</p>
              <p className="text-[10px] uppercase font-bold text-slate-500 mt-0.5">Overall ATS Score</p>
            </div>
          </div>

          {/* Section Scores */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(result.section_scores || {}).map(([sec, score]: any) => (
              <div key={sec} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-xs capitalize text-slate-400">{sec}</span>
                <p className="text-xl font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">{score}%</p>
              </div>
            ))}
          </div>

          {/* Missing High Leverage Keywords */}
          {result.missing_keywords && result.missing_keywords.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Missing High-Impact Keywords for {result.target_role}:
              </span>
              <div className="flex flex-wrap gap-2">
                {result.missing_keywords.map((kw: string, i: number) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                  >
                    + {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Extracted Verified Skills */}
          {result.extracted_skills && result.extracted_skills.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4" /> Detected Skills in Resume:
              </span>
              <div className="flex flex-wrap gap-2">
                {result.extracted_skills.map((sk: string, i: number) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actionable Suggestions */}
          {result.improvement_suggestions && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-500" /> Actionable Fixes to Reach 90+ ATS Score:
              </span>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                {result.improvement_suggestions.map((sug: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <span>{sug}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

