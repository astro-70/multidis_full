"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Compass,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  FileCheck2,
  Video,
  Bot,
  GraduationCap,
  Briefcase,
  Layers,
  CheckCircle2,
  DollarSign,
  Search,
} from "lucide-react";

export default function LandingPage() {
  const { t } = useAuth();
  const [selectedPersona, setSelectedPersona] = useState<"school" | "college" | "switcher">("college");

  const personas = {
    school: {
      badge: "Classes 10 - 12 (CBSE / ICSE / State Boards)",
      title: "Stream & Undergrad Course Guidance",
      desc: "Stop guessing between PCM, PCB, Commerce, and Arts. Understand which streams unlock the most future-proof high-paying career trajectories in India and abroad.",
      features: [
        "Stream Compatibility Index based on aptitude",
        "JEE, NEET, CUET & CLAT entrance roadmaps",
        "Emerging hybrid fields: Biotech, AI Ethics, Fintech"
      ]
    },
    college: {
      badge: "Engineering, Degree & BCA Students",
      title: "Campus Placements & Tech Readiness",
      desc: "Tier 2 & 3 college with limited placement drives? Build proof-of-work repositories, crack technical interviews, and target product firms paying 12-30+ LPA.",
      features: [
        "Dynamic 12-Week Roadmap with free YouTube projects",
        "Instant ATS Resume score with keyword optimization",
        "Mock AI Interview practice with STAR feedback"
      ]
    },
    switcher: {
      badge: "Working Professionals & Fresh Graduates",
      title: "Pivoting to Modern High-Growth Roles",
      desc: "Transition from manual testing, support, or non-tech jobs into High-Demand Careers like Data Engineering, Cloud DevOps, Product Management, and AI.",
      features: [
        "Skill Gap Radar: user skills vs market prerequisites",
        "Salary Benchmarks: entry vs senior Indian LPA bands",
        "Free structured upskilling tracks without costly bootcamps"
      ]
    }
  };

  return (
    <div className="space-y-24 py-6">
      {/* Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto space-y-6 pt-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t.hero.badge}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
          Discover Your Ideal Career Path with{" "}
          <span className="gradient-text">Explainable AI</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {t.hero.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/assessment"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-base"
          >
            <Compass className="w-5 h-5" />
            {t.hero.ctaPrimary}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
          <Link
            href="/recommendations"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 text-base"
          >
            <Search className="w-4 h-4" />
            {t.hero.ctaSecondary}
          </Link>
        </div>

        {/* Highlight Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 max-w-3xl mx-auto text-left">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">25+ Careers</p>
              <p className="text-xs text-slate-500">Meticulously mapped to Indian salaries & demand</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Explainable AI</p>
              <p className="text-xs text-slate-500">Confidence scores, pros & cons, zero false guarantees</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">100% Free Resources</p>
              <p className="text-xs text-slate-500">Curated YouTube lectures, documentation & capstones</p>
            </div>
          </div>
        </div>
      </section>

      {/* Target User Persona Switcher */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Tailored Specifically for Your Education Phase
          </h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">
            Choose your current stage to explore how PathFinder AI assists you at every fork in the road.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-200/70 dark:bg-slate-800/70 backdrop-blur-sm gap-1">
            <button
              onClick={() => setSelectedPersona("school")}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                selectedPersona === "school"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              School Students (10-12)
            </button>
            <button
              onClick={() => setSelectedPersona("college")}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                selectedPersona === "college"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              College / B.Tech Students
            </button>
            <button
              onClick={() => setSelectedPersona("switcher")}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                selectedPersona === "switcher"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Graduates & Career Switchers
            </button>
          </div>
        </div>

        {/* Tab Card */}
        <div className="max-w-4xl mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              {personas[selectedPersona].badge}
            </span>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {personas[selectedPersona].title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {personas[selectedPersona].desc}
            </p>
            <ul className="space-y-2 pt-2">
              {personas[selectedPersona].features.map((feat, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
            <div className="pt-2">
              <Link
                href="/assessment"
                className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Start personalized evaluation <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-cyan-500/10 border border-indigo-100 dark:border-indigo-950/60 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-indigo-200/40 dark:border-indigo-900/40">
              <span className="text-xs font-semibold text-slate-500">Live Simulation</span>
              <span className="text-xs font-bold text-emerald-600">Adaptive AI active</span>
            </div>
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-white/80 dark:bg-slate-800/80 shadow-sm text-xs">
                <p className="font-semibold text-slate-800 dark:text-slate-200">Recommended Next Step:</p>
                <p className="text-slate-500 mt-1">Complete Section 2 of 15 questions to unlock salary trajectory estimates.</p>
              </div>
              <div className="p-3 rounded-lg bg-white/80 dark:bg-slate-800/80 shadow-sm text-xs flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-300 font-medium">Predicted Aptitude Alignment:</span>
                <span className="font-bold text-indigo-600">92% Product Tech</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Step System Workflow */}
      <section className="space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            The Complete End-to-End Career Acceleration Engine
          </h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">
            Everything you need from your initial career doubt to acing high-paying campus placements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 hover:border-indigo-500 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Adaptive Assessment</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              15-20 questions measuring RIASEC traits, mathematical intuition, creative sense, and career urgency. Save and resume anytime.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 hover:border-indigo-500 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Top 5 AI Recommendations</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Instant match percentages, transparent explainability, confidence intervals, and realistic pros and cons tailored to India.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 hover:border-indigo-500 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Skill Gap Radar</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Compares your existing skills with target industry demands. Visualizes missing tools, libraries, and readiness categories.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 hover:border-indigo-500 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg">
              4
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">12-Week Free Roadmap</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Curated YouTube masterclasses, official docs, real-world capstone assignments, and tick-off progress tracking.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 hover:border-indigo-500 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-lg">
              5
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">ATS Resume Analyser</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Drop your PDF resume to receive simulated ATS parsing scores, missing keywords, and section-by-section improvements.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 hover:border-indigo-500 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
              6
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Mock Interview & 24/7 AI</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Practice real interview questions for your role. Receive instant STAR model feedback and access your AI mentor 24/7.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white text-center space-y-6 shadow-2xl">
        <h2 className="text-3xl sm:text-4xl font-extrabold max-w-2xl mx-auto">
          Start Your Free Career Assessment Today
        </h2>
        <p className="text-indigo-200 text-sm sm:text-base max-w-xl mx-auto">
          Join thousands of Indian students unlocking high-clarity careers. No credit cards, no hidden charges.
        </p>
        <div>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold bg-white text-indigo-900 hover:bg-indigo-50 transition-all shadow-lg hover:scale-105"
          >
            Create Free Account & Begin
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

