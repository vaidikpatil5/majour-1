"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, MessageSquare, Zap, ChevronRight, Brain, Play, X, Loader2 } from "lucide-react";

export default function LandingPage() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-teal-500 selection:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/60 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-teal-500" />
            <span className="text-xl font-bold tracking-tighter text-white">
              DOCU<span className="text-teal-500">MIND</span>
            </span>
          </div>
          <Link 
            href="/chat" 
            className="group relative inline-flex h-9 items-center justify-center overflow-hidden rounded-full bg-teal-600 px-6 font-medium text-white transition-all hover:bg-teal-500 hover:scale-105"
          >
            <span className="mr-2">Launch App</span>
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-20 text-center">
        <div className="absolute top-1/2 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-500/20 blur-[100px]" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          <div className="mb-6 inline-block rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-sm font-medium text-teal-300">
            🚀 Powered by Advanced RAG Technology
          </div>
          
          <h1 className="mb-8 text-5xl font-extrabold tracking-tight md:text-7xl">
            Stop Searching. <br />
            Start <span className="text-transparent bg-clip-text bg-linear-to-r from-teal-400 to-cyan-500">Conversing.</span>
          </h1>
          
          <p className="mb-10 text-lg text-gray-400 md:text-xl max-w-2xl mx-auto">
            DocuMind transforms your static PDFs into intelligent, conversational partners. 
            Upload research papers, contracts, or books and get instant answers.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row justify-center">
            <Link 
              href="/chat" 
              className="inline-flex h-14 items-center justify-center rounded-full bg-teal-600 px-8 text-lg font-bold text-white shadow-lg shadow-teal-500/25 transition-all hover:bg-teal-500 hover:scale-105"
            >
              Start Chatting Free
            </Link>
            
            <button 
              onClick={() => setIsDemoOpen(true)}
              className="group inline-flex h-14 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 text-lg font-bold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-teal-500/50"
            >
              <Play className="h-5 w-5 fill-current text-white transition-transform group-hover:scale-110" />
              See How It Works
            </button>
          </div>
        </motion.div>
      </section>

      {/* DEMO MODAL (Fake Chat) */}
      <AnimatePresence>
        {isDemoOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
            onClick={() => setIsDemoOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-3xl rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/10 bg-black/50 p-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="ml-2 text-sm text-gray-400">DocuMind AI Demo</span>
                </div>
                <button onClick={() => setIsDemoOpen(false)} className="text-gray-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="h-[400px] w-full bg-black/50 p-6 flex flex-col gap-4 overflow-hidden">
                <SimulatedChat />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* How it Works Section */}
      <section className="py-24 bg-zinc-900/30">
        <div className="container mx-auto px-6">
          <motion.h2 {...fadeInUp} className="mb-16 text-center text-3xl font-bold md:text-4xl">
             How <span className="text-teal-500">DocuMind</span> Works
          </motion.h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: FileText, title: "1. Upload", desc: "Drag and drop your PDF documents." },
              { icon: Brain, title: "2. Analyze", desc: "AI indexes your document instantly." },
              { icon: MessageSquare, title: "3. Chat", desc: "Ask questions and get answers." }
            ].map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="group rounded-2xl border border-white/10 bg-black p-8 hover:border-teal-500/50 transition-colors"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400">
                  <item.icon size={24} />
                </div>
                <h3 className="mb-2 text-xl font-bold">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- YAHAN HAI WO SECTION JO MISSING THA (Students & Pros) --- */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div className="space-y-8">
              <motion.h2 
                {...fadeInUp}
                className="text-3xl font-bold md:text-4xl"
              >
                Why Students & Pros <br />
                <span className="text-teal-500">Love DocuMind</span>
              </motion.h2>
              
              <div className="space-y-6">
                {[
                  { title: "Save Hours of Reading", desc: "Get summaries and key takeaways instantly." },
                  { title: "Citation Backed Answers", desc: "Every answer comes with a reference to the source page." },
                  { title: "Bank-Grade Security", desc: "Your files are processed in memory and never shared." }
                ].map((feature, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex gap-4"
                  >
                    <div className="mt-1 h-2 w-2 rounded-full bg-teal-500" />
                    <div>
                      <h4 className="text-lg font-bold">{feature.title}</h4>
                      <p className="text-gray-400">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Visual Abstract Representation */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-square rounded-2xl bg-linear-to-br from-teal-900/50 to-black border border-white/10 p-8 flex items-center justify-center"
            >
               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
               <div className="text-center space-y-4 z-10">
                  <div className="p-4 bg-teal-500/20 rounded-xl inline-block backdrop-blur-md border border-teal-500/30">
                    <span className="text-2xl">🤖 + 📄 = 💡</span>
                  </div>
                  <p className="text-teal-200 font-mono text-sm">
                    Processing 100+ pages...<br/>
                    Extracting Key Insights...<br/>
                    Ready to Chat.
                  </p>
               </div>
            </motion.div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black py-10 text-center text-gray-500">
        <p>© 2025 DocuMind AI. Built for the Future.</p>
      </footer>
    </div>
  );
}

// --- Component for the Fake Chat Animation ---
function SimulatedChat() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 1000), 
      setTimeout(() => setStep(2), 2500), 
      setTimeout(() => setStep(3), 4500), 
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-col gap-6 font-mono text-sm">
      {/* Step 1: User Message */}
      {step >= 1 && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="self-end rounded-2xl rounded-tr-sm bg-teal-600 px-4 py-3 text-white max-w-[80%]"
        >
          <p>Summarize this legal contract for me. What are the key terms?</p>
        </motion.div>
      )}

      {/* Step 2: Processing */}
      {step === 2 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="self-start flex items-center gap-2 text-teal-500"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Analyzing document...</span>
        </motion.div>
      )}

      {/* Step 3: AI Response */}
      {step >= 3 && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="self-start rounded-2xl rounded-tl-sm border border-white/10 bg-zinc-900 px-4 py-3 text-gray-300 max-w-[90%]"
        >
          <p className="mb-2"><span className="text-teal-400 font-bold">DocuMind:</span> Based on the document, here are the key terms:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Contract duration is 12 months.</li>
            <li>Termination requires 30 days notice.</li>
            <li>Payment terms are Net-30.</li>
          </ul>
        </motion.div>
      )}
    </div>
  );
}