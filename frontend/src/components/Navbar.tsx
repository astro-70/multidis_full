"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { SupportedLang } from "@/lib/translations";
import {
  Compass,
  FileText,
  MapPin,
  Bot,
  Video,
  BarChart3,
  Award,
  Globe,
  Menu,
  X,
  User,
  LogOut,
  ShieldAlert,
  GitCompare,
} from "lucide-react";

export default function Navbar() {
  const { user, logout, lang, setLanguage, t } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/dashboard", label: t.nav.dashboard, icon: BarChart3 },
    { href: "/assessment", label: t.nav.assessment, icon: Compass },
    { href: "/recommendations", label: t.nav.recommendations, icon: Award },
    { href: "/roadmap", label: t.nav.roadmap, icon: MapPin },
    { href: "/resume-analyser", label: t.nav.resume, icon: FileText },
    { href: "/chat", label: t.nav.chat, icon: Bot },
    { href: "/mock-interview", label: t.nav.interview, icon: Video },
    { href: "/compare", label: t.nav.compare, icon: GitCompare },
    { href: "/exams", label: t.nav.exams, icon: Award },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-cyan-600 dark:from-indigo-400 dark:to-cyan-400">
              {t.nav.brand}
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              India Edition
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.slice(0, 7).map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  active
                    ? "bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-semibold"
                    : "text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <Icon className="w-4 h-4 opacity-75" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions & Utilities */}
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <div className="relative flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
            <Globe className="w-4 h-4 text-slate-500 dark:text-slate-400 ml-1 mr-1" />
            <select
              value={lang}
              onChange={(e) => setLanguage(e.target.value as SupportedLang)}
              className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
            >
              <option value="en" className="dark:bg-slate-800">English</option>
              <option value="hi" className="dark:bg-slate-800">हिंदी</option>
              <option value="ta" className="dark:bg-slate-800">தமிழ்</option>
            </select>
          </div>

          {/* User Auth Info */}
          {user ? (
            <div className="flex items-center gap-2">
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="hidden md:flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {t.nav.admin}
                </Link>
              )}
              <Link
                href="/settings"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <User className="w-4 h-4 text-indigo-500" />
                <span className="hidden sm:inline font-medium">{user.full_name.split(" ")[0]}</span>
              </Link>
              <button
                onClick={logout}
                title={t.nav.signOut}
                className="p-2 text-slate-500 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 px-3 py-1.5 rounded-lg transition-colors"
              >
                {t.nav.signIn}
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg shadow-sm shadow-indigo-600/30 transition-all hover:shadow"
              >
                {t.nav.getStarted}
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-6 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 font-medium"
              >
                <Icon className="w-5 h-5 text-indigo-500" />
                {item.label}
              </Link>
            );
          })}
          {user?.role === "admin" && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 font-semibold"
            >
              <ShieldAlert className="w-5 h-5" />
              {t.nav.admin} Portal
            </Link>
          )}
        </div>
      )}
    </header>
  );
}

