"use client";

import React, { useState, useEffect, useRef } from "react";
import { ApiClient } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Bot, Send, User, Sparkles, Compass, MessageSquare, Clock } from "lucide-react";

export default function ChatPage() {
  const { user, refreshUser } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "What core projects should I build for campus placements?",
    "How do I switch from manual testing to Cloud DevOps?",
    "Explain the difference between JEE Mains and BITSAT strategy",
    "Which free YouTube playlists are best for Next.js and FastAPI?"
  ];

  useEffect(() => {
    async function initChat() {
      try {
        const sessions = await ApiClient.getChatSessions();
        if (sessions && sessions.length > 0) {
          setSessionId(sessions[0].id);
          setMessages(sessions[0].messages || []);
        } else {
          const newSession = await ApiClient.createChatSession("Career Guidance Session");
          setSessionId(newSession.id);
          setMessages([
            {
              id: "intro",
              sender: "assistant",
              content: `Hello ${user?.full_name ? user.full_name.split(" ")[0] : "Astro"}! I'm your PathFinder AI Career Mentor. I have full context on your education background and active roadmap milestones. What questions or career roadblocks can we solve together today?`,
              created_at: new Date().toISOString()
            }
          ]);
        }
      } catch (e) {
        console.warn("Failed to init chat session", e);
      }
    }
    initChat();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || !sessionId || sending) return;

    const tempUserMsg = {
      id: Date.now().toString(),
      sender: "user",
      content: text,
      created_at: new Date().toISOString()
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setInput("");
    setSending(true);

    try {
      const reply = await ApiClient.sendChatMessage(sessionId, text);
      setMessages((prev) => [...prev, reply]);
      if (text.toUpperCase().includes("NAME")) {
        refreshUser();
      }
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "assistant",
          content: "I'm experiencing a brief network hiccup. Please try asking again in a moment.",
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              PathFinder AI Career Counselor
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            </h1>
            <p className="text-xs text-slate-500">Context-Aware AI Guidance for Indian Aspirants</p>
          </div>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="h-[520px] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md p-6 overflow-y-auto space-y-4">
        {messages.map((m) => {
          const isUser = m.sender === "user";
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-indigo-600 border border-indigo-200 dark:border-indigo-800"
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? "bg-indigo-600 text-white rounded-tr-none shadow-sm"
                    : "bg-slate-50 dark:bg-slate-800/70 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-800 rounded-tl-none shadow-sm"
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}

        {sending && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-indigo-600 flex items-center justify-center">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-400">
              Formulating practical personalized guidance...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="flex flex-wrap gap-2">
        {quickPrompts.map((qp, i) => (
          <button
            key={i}
            onClick={() => handleSend(qp)}
            className="text-[11px] font-medium px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 transition-colors border border-slate-200/60 dark:border-slate-700"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div className="relative flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask anything about entrance exams, salary expectations, or project ideas..."
          className="w-full pl-5 pr-14 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-md"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || sending}
          className="absolute right-2 p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

