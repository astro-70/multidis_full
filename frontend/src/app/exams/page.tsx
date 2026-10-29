"use client";

import React, { useState, useEffect } from "react";
import { ApiClient } from "@/lib/api";
import {
  Award,
  Calendar,
  Bell,
  ExternalLink,
  GraduationCap,
  Sparkles,
  Filter,
  CheckCircle,
} from "lucide-react";

export default function ExamsScholarshipsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [remindedId, setRemindedId] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await ApiClient.getExams(filterType || undefined);
      setItems(data);
    } catch (e) {
      console.warn("Failed to fetch exams", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [filterType]);

  const handleCalendarLink = async (examId: string) => {
    try {
      const res = await ApiClient.getExamCalendarLink(examId);
      if (res.calendar_url) {
        window.open(res.calendar_url, "_blank");
      }
    } catch (e) {
      alert("Failed to generate Google Calendar link.");
    }
  };

  const handleRemindMe = async (examId: string) => {
    try {
      await ApiClient.remindExam(examId);
      setRemindedId(examId);
      setTimeout(() => setRemindedId(null), 3000);
    } catch (e: any) {
      alert(e.message || "Failed to schedule email reminder.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>Opportunities & Fellowships</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Exams, Scholarships & Deadlines
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            National entrance assessments and government funding schemes with calendar synchronization.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
          <button
            onClick={() => setFilterType("")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterType === "" ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-sm" : "text-slate-600 dark:text-slate-400"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType("entrance_exam")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterType === "entrance_exam" ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-sm" : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Entrance Exams
          </button>
          <button
            onClick={() => setFilterType("scholarship")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterType === "scholarship" ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-sm" : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Scholarships
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((exam) => (
            <div
              key={exam.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md hover:border-indigo-500 transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    {exam.type.replace("_", " ")}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {exam.frequency}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                  {exam.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {exam.description}
                </p>

                {exam.reward_or_seat_info && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                    <strong className="text-indigo-600 dark:text-indigo-400">Seat / Grant Benefit: </strong>
                    {exam.reward_or_seat_info}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                <a
                  href={exam.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  Official Portal <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCalendarLink(exam.id)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                    title="Add to Google Calendar"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleRemindMe(exam.id)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-semibold flex items-center gap-1 transition-colors"
                  >
                    {remindedId === exam.id ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Reminded!
                      </>
                    ) : (
                      <>
                        <Bell className="w-3.5 h-3.5" /> Remind Me
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

