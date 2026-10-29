"use client";

import React, { useState, useEffect } from "react";
import { ApiClient } from "@/lib/api";
import {
  Video,
  Award,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  BookOpen,
  Send,
} from "lucide-react";

export default function MockInterviewPage() {
  const [roleTitle, setRoleTitle] = useState("Full Stack Web Developer");
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const roles = [
    "Full Stack Web Developer",
    "Data Scientist & Machine Learning Engineer",
    "General"
  ];

  const fetchQuestions = async (role: string) => {
    setLoading(true);
    setEvaluation(null);
    setUserAnswer("");
    try {
      const qList = await ApiClient.getInterviewQuestions(role);
      setQuestions(qList);
      setCurrentIdx(0);
    } catch (e) {
      console.warn("Failed to load interview questions", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions(roleTitle);
  }, [roleTitle]);

  const handleEvaluate = async () => {
    if (!userAnswer.trim() || !questions[currentIdx]) return;

    setEvaluating(true);
    try {
      const res = await ApiClient.evaluateInterviewAnswer(
        roleTitle,
        questions[currentIdx].question,
        userAnswer
      );
      setEvaluation(res);
    } catch (e: any) {
      alert(e.message || "Failed to evaluate answer.");
    } finally {
      setEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
      setUserAnswer("");
      setEvaluation(null);
    }
  };

  const currentQ = questions[currentIdx];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 mb-2">
            <Video className="w-3.5 h-3.5" />
            <span>AI Practice Arena</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Mock Interview Practice & AI Feedback
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Rehearse real recruitment rounds with instant evaluation on clarity, technical rigor, and STAR alignment.
          </p>
        </div>

        {/* Role Selector */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <span className="text-xs font-semibold text-slate-500 ml-2">Role:</span>
          <select
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-2"
          >
            {roles.map((r) => (
              <option key={r} value={r} className="dark:bg-slate-800">{r}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : currentQ ? (
        <div className="space-y-6">
          {/* Question Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 capitalize">
                {currentQ.category} Round • Question {currentIdx + 1} of {questions.length}
              </span>
              <span className="text-xs font-medium text-slate-400">STAR Evaluator Active</span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
              &ldquo;{currentQ.question}&rdquo;
            </h2>

            {/* Expected Key Points */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Key concepts top hiring managers look for:
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {currentQ.expected_key_points.map((pt: string, idx: number) => (
                  <span key={idx} className="px-2 py-0.5 rounded text-[11px] bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {pt}
                  </span>
                ))}
              </div>
            </div>

            {/* Answer Input */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Type your response as you would speak it in a live interview:
              </label>
              <textarea
                rows={5}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Structure your answer using Situation, Task, Action, and Measurable Result (STAR)..."
                className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={handleEvaluate}
                disabled={evaluating || !userAnswer.trim()}
                className="px-6 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2 text-xs shadow-md disabled:opacity-50"
              >
                {evaluating ? "Analyzing STAR Delivery..." : "Submit Answer for AI Scoring"}
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* AI Evaluation Result */}
          {evaluation && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Evaluation Finished</span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">AI Interview Feedback</h3>
                </div>
                <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-center min-w-[100px]">
                  <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{evaluation.score}/100</p>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Score</p>
                </div>
              </div>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 space-y-2">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> What You Did Well:
                  </span>
                  <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                    {evaluation.strengths.map((str: string, i: number) => (
                      <li key={i}>• {str}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 space-y-2">
                  <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" /> Areas to Polish:
                  </span>
                  <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                    {evaluation.areas_for_improvement.map((area: string, i: number) => (
                      <li key={i}>• {area}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Model Exemplary Answer */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" /> Exemplary Model Answer:
                </span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  &ldquo;{evaluation.model_answer}&rdquo;
                </p>
              </div>

              {/* Actionable Tip */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-300 text-xs">
                <Sparkles className="w-4 h-4 shrink-0 text-cyan-600" />
                <span><strong>Pro-Tip:</strong> {evaluation.actionable_tip}</span>
              </div>

              {currentIdx + 1 < questions.length && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2 text-xs"
                  >
                    Next Question ({currentIdx + 2}/{questions.length})
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

