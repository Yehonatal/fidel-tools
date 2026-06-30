"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Send, Check } from "lucide-react";

export default function EnterprisePage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    size: "1-10",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="w-full max-w-7xl mx-auto px-6 py-12 md:py-20 flex-grow flex flex-col justify-center transition-colors duration-300 font-sans">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
        
        {/* Left Column Description */}
        <div className="lg:w-[45%] flex flex-col justify-between py-1 space-y-8 lg:space-y-0">
          <div className="space-y-6">
            <span className="text-[10px] font-bold font-mono text-zinc-500 uppercase tracking-widest block">
              03 / ENTERPRISE SUPPORT
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.05] font-sans">
              Scale your Ethiopic NLP pipelines.
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-zinc-400 leading-relaxed max-w-sm">
              Deploy isolated instances, manage custom model weights, negotiate tailored uptime SLAs, and receive 24/7 priority engineer support for high-volume production applications.
            </p>
          </div>

          <div className="pt-4 lg:pt-0">
            <Link
              href="/infrastructure"
              className="text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors inline-flex items-center gap-1.5"
            >
              <span>VIEW INFRASTRUCTURE PRICING</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Column Form */}
        <div className="lg:w-[55%]">
          <div className="border border-slate-200 dark:border-zinc-900 bg-white dark:bg-[#070709] rounded-lg p-8 shadow-sm dark:shadow-xl transition-colors duration-300">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white font-mono">
                  MESSAGE SENT
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
                  Thank you for reaching out. A technical lead will get back to your organization within 2 business hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="text-[10px] font-bold font-mono tracking-widest text-zinc-550 dark:text-zinc-500 uppercase border-b border-slate-200 dark:border-zinc-900 pb-3">
                  GET IN TOUCH
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="text-[9px] font-bold font-mono text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">
                      Full Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full text-xs bg-zinc-50 dark:bg-black border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 focus:border-blue-500 rounded p-2.5 outline-none text-zinc-850 dark:text-zinc-200 transition-colors"
                    />
                  </div>

                  {/* Company */}
                  <div className="space-y-1.5">
                    <label htmlFor="company" className="text-[9px] font-bold font-mono text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">
                      Company
                    </label>
                    <input
                      id="company"
                      type="text"
                      required
                      placeholder="Company name"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full text-xs bg-zinc-50 dark:bg-black border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 focus:border-blue-500 rounded p-2.5 outline-none text-zinc-850 dark:text-zinc-200 transition-colors"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-[9px] font-bold font-mono text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">
                    Company Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-xs bg-zinc-50 dark:bg-black border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 focus:border-blue-500 rounded p-2.5 outline-none text-zinc-850 dark:text-zinc-200 transition-colors"
                  />
                </div>

                {/* Company Size */}
                <div className="space-y-1.5">
                  <label htmlFor="size" className="text-[9px] font-bold font-mono text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">
                    Company Size
                  </label>
                  <select
                    id="size"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className="w-full text-xs bg-zinc-50 dark:bg-black border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 focus:border-blue-500 rounded p-2.5 outline-none text-zinc-850 dark:text-zinc-200 transition-colors"
                  >
                    <option value="1-10">1-10 Employees</option>
                    <option value="11-50">11-50 Employees</option>
                    <option value="51-200">51-200 Employees</option>
                    <option value="201-1000">201-1000 Employees</option>
                    <option value="1000+">1000+ Employees</option>
                  </select>
                </div>

                {/* Details */}
                <div className="space-y-1.5">
                  <label htmlFor="description" className="text-[9px] font-bold font-mono text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">
                    What do you need help with?
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    required
                    placeholder="Tell us about your project requirements and volume load..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full text-xs bg-zinc-50 dark:bg-black border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 focus:border-blue-500 rounded p-2.5 outline-none text-zinc-850 dark:text-zinc-200 transition-colors resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full py-2.5 rounded text-xs font-bold bg-slate-900 hover:bg-black dark:bg-white text-white dark:text-black dark:hover:bg-zinc-100 transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>SEND MESSAGE</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
