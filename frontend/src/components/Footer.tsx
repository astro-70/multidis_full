"use client";

import React from "react";
import Link from "next/link";
import { Compass, Heart, Shield, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Footer() {
  const { t } = useAuth();

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 mt-20 text-slate-600 dark:text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">PathFinder AI</span>
            </div>
            <p className="max-w-md text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Democratizing personalized, world-class career guidance for every Indian student, college graduate,
              and career switcher. Built with Explainable Generative AI, transparent skill-gap analytics, and 100% free roadmaps.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Aligned with NEP 2020 & Indian National Skills Qualification Framework (NSQF).</span>
            </div>
          </div>

          {/* Quick Features */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-3">Key Solutions</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><Link href="/assessment" className="hover:text-indigo-600 transition-colors">Career Assessment Quiz</Link></li>
              <li><Link href="/recommendations" className="hover:text-indigo-600 transition-colors">AI Match & Reasoning</Link></li>
              <li><Link href="/roadmap" className="hover:text-indigo-600 transition-colors">Personalized Roadmaps</Link></li>
              <li><Link href="/resume-analyser" className="hover:text-indigo-600 transition-colors">ATS Resume Analyser</Link></li>
              <li><Link href="/mock-interview" className="hover:text-indigo-600 transition-colors">Mock AI Interview</Link></li>
            </ul>
          </div>

          {/* Resources & Support */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-3">Indian Education Tracks</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><Link href="/exams" className="hover:text-indigo-600 transition-colors">JEE / GATE / CAT Deadlines</Link></li>
              <li><Link href="/exams" className="hover:text-indigo-600 transition-colors">National Scholarships (NOS, PMRF)</Link></li>
              <li><Link href="/compare" className="hover:text-indigo-600 transition-colors">Salary & Role Comparison</Link></li>
              <li><Link href="/chat" className="hover:text-indigo-600 transition-colors">AI Mentor Support 24/7</Link></li>
              <li><Link href="/settings" className="hover:text-indigo-600 transition-colors">Data Privacy & Export</Link></li>
            </ul>
          </div>
        </div>

        {/* AI Guardrail Disclaimer Banner */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <Shield className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
              <strong className="text-slate-700 dark:text-slate-300">Responsible AI Notice:</strong> {t.disclaimer}
            </p>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
            <p>© {new Date().getFullYear()} PathFinder AI Systems. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Crafted with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for Indian Aspirants
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

