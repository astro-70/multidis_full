"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClient } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { SupportedLang } from "@/lib/translations";
import { GraduationCap, BookOpen, Target, Globe, ArrowRight, CheckCircle2 } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { setLanguage, refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [educationLevel, setEducationLevel] = useState("college");
  const [stream, setStream] = useState("Computer Science & Engineering");
  const [targetDomain, setTargetDomain] = useState("Software & AI");
  const [preferredLang, setPreferredLang] = useState<SupportedLang>("en");
  const [submitting, setSubmitting] = useState(false);

  const educationOptions = [
    { id: "class_10", label: "Class 10 Student", desc: "Choosing Class 11-12 stream (Science / Commerce / Arts)" },
    { id: "class_12", label: "Class 12 Student", desc: "Preparing for UG Entrance (JEE, NEET, CUET, CLAT)" },
    { id: "college", label: "College / B.Tech / BCA", desc: "Preparing for campus placements, internships, GATE, CAT" },
    { id: "graduate", label: "Fresh Graduate", desc: "Actively seeking entry-level roles or off-campus hiring" },
    { id: "switcher", label: "Working Professional", desc: "Switching from non-tech, operations or support into tech" },
  ];

  const streamOptions = [
    "Computer Science & Engineering",
    "Information Technology / BCA / MCA",
    "Electronics & Communication (ECE)",
    "Mechanical / Automobile / EV",
    "Civil / Infrastructure / Smart Cities",
    "Commerce / B.Com / BBA / Finance",
    "Science (PCM / PCB / Biotechnology)",
    "Arts / Humanities / Law / Design",
  ];

  const domainOptions = [
    { title: "Software & AI Development", desc: "Web, Cloud, Mobile, LLMs & MLOps" },
    { title: "Data, Analytics & Finance", desc: "Data Science, FinTech, Investment Banking" },
    { title: "Product & Digital Design", desc: "Product Management, UX/UI, Growth" },
    { title: "Core & Electric Mobility", desc: "EVs, IoT, Solar Energy, Semiconductors" },
    { title: "Civil Services & Governance", desc: "UPSC, State PSCs, Public Administration" },
  ];

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      await ApiClient.updateProfile({
        education_level: educationLevel,
        stream_or_major: stream,
        target_domain: targetDomain,
        preferred_language: preferredLang,
        career_clarity_score: 55,
      });
      setLanguage(preferredLang);
      await refreshUser();
      router.push("/assessment");
    } catch (e) {
      console.error("Profile update failed", e);
      router.push("/assessment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Progress Header */}
      <div className="mb-8 text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          Step {step} of 4: Profile Personalization
        </span>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {step === 1 && "What is your current education level?"}
          {step === 2 && "Which stream or major best describes you?"}
          {step === 3 && "What career domain interests you most?"}
          {step === 4 && "Choose your preferred learning language"}
        </h1>
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-4">
          <div
            className="bg-indigo-600 h-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Step 1: Education */}
      {step === 1 && (
        <div className="space-y-3">
          {educationOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setEducationLevel(opt.id)}
              className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                educationLevel === opt.id
                  ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
              }`}
            >
              <GraduationCap className={`w-5 h-5 shrink-0 mt-0.5 ${educationLevel === opt.id ? "text-indigo-600" : "text-slate-400"}`} />
              <div className="flex-1">
                <p className="font-semibold text-slate-900 dark:text-white text-sm">{opt.label}</p>
                <p className="text-xs text-slate-500">{opt.desc}</p>
              </div>
              {educationLevel === opt.id && <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />}
            </button>
          ))}
          <div className="pt-4 flex justify-end">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2 text-sm shadow-md"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Stream */}
      {step === 2 && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {streamOptions.map((st) => (
              <button
                key={st}
                onClick={() => setStream(st)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  stream === st
                    ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
                }`}
              >
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{st}</p>
              </button>
            ))}
          </div>
          <div className="pt-4 flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-6 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2 text-sm shadow-md"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Target Domain */}
      {step === 3 && (
        <div className="space-y-3">
          {domainOptions.map((d) => (
            <button
              key={d.title}
              onClick={() => setTargetDomain(d.title)}
              className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                targetDomain === d.title
                  ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
              }`}
            >
              <Target className={`w-5 h-5 shrink-0 mt-0.5 ${targetDomain === d.title ? "text-indigo-600" : "text-slate-400"}`} />
              <div className="flex-1">
                <p className="font-semibold text-slate-900 dark:text-white text-sm">{d.title}</p>
                <p className="text-xs text-slate-500">{d.desc}</p>
              </div>
              {targetDomain === d.title && <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />}
            </button>
          ))}
          <div className="pt-4 flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium"
            >
              Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="px-6 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2 text-sm shadow-md"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Language */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "en", label: "English", sub: "Global Tech Standard" },
              { id: "hi", label: "हिंदी", sub: "Hindi Language Support" },
              { id: "ta", label: "தமிழ்", sub: "Tamil Language Support" },
            ].map((l) => (
              <button
                key={l.id}
                onClick={() => setPreferredLang(l.id as SupportedLang)}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  preferredLang === l.id
                    ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
                }`}
              >
                <Globe className={`w-5 h-5 mx-auto mb-1 ${preferredLang === l.id ? "text-indigo-600" : "text-slate-400"}`} />
                <p className="font-bold text-slate-900 dark:text-white text-sm">{l.label}</p>
                <p className="text-[11px] text-slate-500">{l.sub}</p>
              </button>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700 dark:text-slate-300">Ready to begin your assessment?</p>
            <p>Your responses adapt dynamically based on your stream and aptitude. You can pause and resume at any time.</p>
          </div>

          <div className="pt-4 flex justify-between">
            <button
              onClick={() => setStep(3)}
              className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium"
            >
              Back
            </button>
            <button
              onClick={handleFinish}
              disabled={submitting}
              className="px-8 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2 text-sm shadow-lg shadow-indigo-600/30"
            >
              {submitting ? "Saving..." : "Start Adaptive Assessment"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

