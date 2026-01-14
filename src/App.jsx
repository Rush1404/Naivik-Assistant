import React, { useState } from 'react';
import { useTheme } from './context/ThemeContext';
import { Send, Moon, Sun, Sparkles, RefreshCw, Layers, CheckCircle2, Calendar } from 'lucide-react';

const App = () => {
  const { isDark, setIsDark } = useTheme();
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, role: 'ai', text: "Hello! I've synced with your Google Sheets. Phase 1 is 80% complete. Reschedule the timeline?" }
  ]);
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
  
    const userMsg = { id: Date.now(), role: 'user', text: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsProcessing(true); // Triggers the 'Pulsing' UI state
  
    try {
      // 1. Post to WP REST API (Application Core)
      const response = await fetch('http://naivik-pm-assistant.local/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputValue }),
      });
  
      const aiResponse = await response.json();
  
      // 2. Add AI response to thread
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        role: 'ai', 
        text: aiResponse.message 
      }]);
  
      // 3. If the AI modified the project, the 'Sync' will pick it up automatically
    } catch (error) {
      console.error("API Error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-white dark:bg-naivik-dark-bg text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* 1. LEFT NAVIGATION RAIL */}
      <nav className="w-20 hidden lg:flex flex-col items-center py-8 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <div className="text-naivik-indigo font-black text-2xl mb-12">N.</div>
        <div className="flex flex-col gap-10">
          <Layers className="text-slate-400 hover:text-naivik-indigo cursor-pointer transition-colors" size={20} />
          <Calendar className="text-slate-400 hover:text-naivik-indigo cursor-pointer transition-colors" size={20} />
          <CheckCircle2 className="text-slate-400 hover:text-naivik-indigo cursor-pointer transition-colors" size={20} />
        </div>
        <button onClick={() => setIsDark(!isDark)} className="mt-auto p-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-all">
          {isDark ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-slate-500" />}
        </button>
      </nav>

      {/* 2. CENTER: THE BRAIN (Wide Chat) */}
      <main className="flex-1 flex flex-col relative overflow-hidden max-w-5xl mx-auto border-x border-slate-100 dark:border-slate-800/50">
        <header className="p-6 flex justify-between items-center bg-white/80 dark:bg-naivik-dark-bg/80 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-xl font-bold tracking-tight">Brain.</h2>
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Live Sync</span>
          </div>
        </header>

        {/* Chat Thread */}
        <div className="flex-1 overflow-y-auto px-6 py-10 space-y-10">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-6 rounded-[2rem] text-lg leading-relaxed backdrop-blur-md transition-all ${
                msg.role === 'user' 
                ? 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-br-none shadow-sm' 
                : 'bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-900 dark:text-indigo-100 border border-white/20 dark:border-indigo-500/20 rounded-tl-none shadow-lg'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex items-center gap-3 text-naivik-indigo ml-4">
              <RefreshCw size={18} className="animate-spin" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] opacity-60">Naivik is thinking...</span>
            </div>
          )}
        </div>

        {/* Floating Input Area */}
        <div className="p-6 pb-10">
          <div className="relative max-w-3xl mx-auto group">
            <input 
              className="w-full p-5 pr-16 bg-slate-100 dark:bg-slate-800/50 border border-transparent dark:border-slate-700/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-lg dark:text-white shadow-xl"
              placeholder="Ask me to move a deadline..."
              onKeyDown={(e) => e.key === 'Enter' && setIsProcessing(true)}
            />
            <button className="absolute right-3 top-3 p-3 bg-naivik-indigo text-white rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-500/20">
              <Send size={22} />
            </button>
          </div>
        </div>
      </main>

      {/* 3. RIGHT: MINI DASHBOARD */}
      <aside className="w-[350px] hidden xl:flex flex-col p-8 bg-slate-50 dark:bg-slate-900/30">
        <div className="flex items-center justify-between mb-12">
          <h3 className="font-bold text-slate-400 text-xs uppercase tracking-[0.2em]">Quick Look</h3>
          <Sparkles className="text-amber-400" size={18} />
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-naivik-dark-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h4 className="text-sm font-bold mb-6 flex justify-between">
              <span>Gantt Pulse</span>
              <span className="text-emerald-500 text-[10px]">ACTIVE</span>
            </h4>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full bg-indigo-500 transition-all duration-1000 ${isProcessing ? 'w-full animate-pulse' : 'w-2/3'}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default App;