"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ApiClient } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Compass, CheckCircle2, ArrowRight, Clock, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";

interface Option {
  id: string;
  text: string;
  category_tag: string;
  score_weight: number;
}

interface Question {
  id: number;
  text: string;
  category: string;
  options: Option[];
}

export default function AssessmentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(15);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAssessment() {
      try {
        const data = await ApiClient.startAssessment();
        setAssessmentId(data.assessment_id);
        setTotalQuestions(data.total_questions);
        setCurrentIndex(data.current_question_index);
        setCurrentQuestion(data.current_question);
      } catch (err: any) {
        setError(err.message || "Failed to load assessment questions.");
      } finally {
        setLoading(false);
      }
    }
    loadAssessment();
  }, []);

  const handleNext = async () => {
    if (!selectedOption || !currentQuestion || !assessmentId) return;

    setSubmitting(true);
    setError("");
    try {
      const res = await ApiClient.submitAnswer(assessmentId, {
        question_id: currentQuestion.id,
        selected_option_id: selectedOption.id,
        question_text: currentQuestion.text,
        selected_option_text: selectedOption.text,
        category_tag: selectedOption.category_tag,
        score_weight: selectedOption.score_weight,
      });

      if (res.is_completed) {
        router.push(`/recommendations?assessment_id=${assessmentId}`);
      } else if (res.next_question) {
        setCurrentIndex(res.current_question_index);
        setCurrentQuestion(res.next_question);
        setSelectedOption(null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to submit answer.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-medium text-slate-500">Initializing adaptive assessment session...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      {/* Header & Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
            <Compass className="w-4 h-4" />
            <span>PathFinder Adaptive Quiz</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Auto-saved</span>
          </div>
        </div>

        <div className="flex justify-between items-end">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Question {currentIndex + 1} of {totalQuestions}
          </h1>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
            {Math.round(((currentIndex + 1) / totalQuestions) * 100)}% Completed
          </span>
        </div>

        <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          ></div>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Question Card */}
      {currentQuestion && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {currentQuestion.category} Aptitude
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
              {currentQuestion.text}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((opt) => {
              const isSelected = selectedOption?.id === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setSelectedOption(opt)}
                  className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 ring-2 ring-indigo-500/20 shadow-sm"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : "border-slate-300 dark:border-slate-600"
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-normal">
                    {opt.text}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Response encrypted & analyzed via Gemini AI</span>
            </div>

            <button
              onClick={handleNext}
              disabled={!selectedOption || submitting}
              className="px-6 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm shadow-md disabled:opacity-50"
            >
              {submitting ? "Processing..." : currentIndex + 1 === totalQuestions ? "Finish & Reveal Careers" : "Next Question"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

