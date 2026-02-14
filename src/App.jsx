import React, { useState, useEffect } from 'react';
import { useTheme } from './context/ThemeContext';
import { 
  Send, Moon, Sun, Sparkles, RefreshCw, 
  Layers, CheckCircle2, Calendar, Mic, MicOff 
} from 'lucide-react';
import GanttView from './GanttPage'; 

const App = () => {
  const { isDark, setIsDark } = useTheme();
  const [view, setView] = useState('brain'); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputText, setInputText] = useState(""); 
  const [actionItems, setActionItems] = useState([]); 
  
  const [messages, setMessages] = useState([
    { id: 1, role: 'ai', content: "Hello! I'm Naivik. Your 5-column sheet is synced and ready." }
  ]);

  // HELPER: Ensures data always matches the 5-column object structure
  const sanitizeData = (rawItems) => {
    if (!Array.isArray(rawItems)) return [];
    return rawItems.map(item => {
      if (Array.isArray(item)) {
        return {
          id: item[0] || 'N-???',
          task: item[1] || 'Untitled Task',
          owner: item[2] || 'Unassigned',
          priority: item[3] || 'Medium',
          date: item[4] || new Date().toLocaleDateString('en-US')
        };
      }
      return item; // Already an object
    });
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch("http://localhost:3001/tasks");
      const data = await response.json();
      if (data.items) {
        setActionItems(sanitizeData(data.items));
      }
    } catch (error) {
      console.error("Initial Fetch Error:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

const handleSendMessage = async (manualText = null) => {
  // 1. INPUT SOURCE: Use manualText (for voice) or inputText (for typing)
  const textToSend = manualText || inputText;
  
  if (!textToSend.trim() || isProcessing) return;

  // 2. OPTIMISTIC UI: Show user message and clear input immediately
  const userMessage = { 
    id: `user-${Date.now()}`, 
    role: "user", 
    content: textToSend.trim() 
  };
  
  setInputText(""); 
  setIsProcessing(true);
  setMessages((prev) => [...prev, userMessage]);

  try {
    // 3. SERVER HANDSHAKE: Send message to the Node.js backend
    const response = await fetch("http://localhost:3001/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: textToSend }),
    });

    if (!response.ok) throw new Error("Server communication failed.");

    const data = await response.json();

    // 4. CHAT UPDATE: Add Naivik's conversational analysis
    // GEMINI PROMPT TIP: Ensure the server isn't sending back task lists in the text!
    setMessages((prev) => [...prev, { 
      id: `ai-${Date.now()}`, 
      role: "assistant", 
      content: data.reply 
    }]);

    // 5. SIDEBAR SYNC: Update the "Quick Look" panel with filtered/relevant data
    if (data.items) {
      // sanitizeData ensures the data matches our 5-column object structure
      setActionItems(sanitizeData(data.items)); 
    }

    // 6. AUTO-SPEAK (Optional): If you want Naivik to speak back
    // if (data.reply) speakResponse(data.reply); 

  } catch (error) {
    console.error("Naivik Sync Error:", error);
    setMessages((prev) => [...prev, { 
      id: `error-${Date.now()}`, 
      role: "assistant", 
      content: "Brain stall. I'm having trouble connecting to the RAID log." 
    }]);
  } finally {
    // 7. CLEANUP: Stop the "Syncing..." skeleton animation
    setIsProcessing(false);
  }
};
  // Voice Logic
  const [isListening, setIsListening] = useState(false);
  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInputText(transcript);
      handleSendMessage(transcript);
    };
    recognition.start();
  };

  return (
    <div className="flex h-screen w-full bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* LEFT NAVIGATION */}
      <nav className="w-20 hidden lg:flex flex-col items-center py-8 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <div className="text-indigo-600 font-black text-2xl mb-12 cursor-pointer hover:scale-110 transition-transform" onClick={() => setView('brain')}>N.</div>
        <div className="flex flex-col gap-10">
          <Layers onClick={() => setView('brain')} className={`${view === 'brain' ? 'text-indigo-600' : 'text-slate-400'} cursor-pointer`} size={20} />
          <Calendar onClick={() => setView('gantt')} className={`${view === 'gantt' ? 'text-indigo-600' : 'text-slate-400'} cursor-pointer`} size={20} />
        </div>
        <button onClick={() => setIsDark(!isDark)} className="mt-auto p-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800">
          {isDark ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-slate-500" />}
        </button>
      </nav>

      {/* CENTER CONTENT */}
      <main className="flex-1 flex flex-col relative overflow-hidden max-w-5xl mx-auto border-x border-slate-100 dark:border-slate-800/50">
        <header className="p-6 flex justify-between items-center bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-xl font-bold tracking-tight">{view === 'brain' ? 'Naivik Brain.' : 'Gantt Timeline.'}</h2>
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Sheet Active</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {view === 'brain' ? (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-4 rounded-2xl max-w-[80%] ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isProcessing && <div className="animate-pulse text-indigo-500 text-xs font-bold uppercase tracking-widest ml-4">Syncing with Sheets...</div>}
            </div>
          ) : (
            <GanttView data={actionItems} />
          )}
        </div>

        {/* INPUT BAR */}
        <div className="p-6">
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-2 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg">
            <button onClick={startVoiceInput} className={`p-3 rounded-2xl ${isListening ? 'bg-rose-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-400'}`}>
              <Mic size={20} />
            </button>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Update task N-012 or add new task..."
              className="flex-1 bg-transparent border-none outline-none text-sm"
            />
            <button onClick={() => handleSendMessage()} className="p-3 bg-indigo-600 text-white rounded-2xl"><Send size={20} /></button>
          </div>
        </div>
      </main>

      {/* RIGHT SIDEBAR: QUICK LOOK */}
      <aside className="w-[350px] hidden xl:flex flex-col p-8 bg-slate-50 dark:bg-[#0f172a] h-screen border-l border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col">
            <h3 className="font-bold text-slate-400 text-xs uppercase tracking-widest">Quick Look</h3>
            {actionItems.length < 10 && ( // Only show if the list is filtered
              <button 
                onClick={fetchTasks} // Calls your original GET /tasks to reset
                className="text-[10px] text-indigo-500 font-bold hover:underline mt-1 flex items-center gap-1"
              >
                <RefreshCw size={10} /> Clear Filter
              </button>
            )}
          </div>
          <Sparkles className="text-amber-400" size={18} />
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {actionItems.map((item, idx) => {
            // Robust Date Check: Feb 1, 2026
            const taskDate = new Date(item.date);
            const today = new Date('2026-02-01');
            
            const isOverdue = taskDate < today;
            const isDueToday = taskDate.toDateString() === today.toDateString();
            const isCritical = item.priority === 'High' && (isOverdue || isDueToday);

            return (
              <div 
                key={item.id || idx} 
                className={`group bg-white dark:bg-slate-800 p-5 rounded-3xl border transition-all duration-500 hover:scale-[1.02]`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                    item.priority === 'High' 
                      ? 'bg-rose-500 text-white' 
                      : 'bg-indigo-500/10 text-indigo-500'
                  }`}>
                    {item.priority} {isCritical && '— CRITICAL'}
                  </span>
                  <span className={`text-[10px] font-bold ${isOverdue ? 'text-rose-500' : 'text-slate-400'}`}>
                    {item.date}
                  </span>
                </div>
                
                <p className={`text-sm font-bold leading-tight ${
                  isCritical ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'
                }`}>
                  {item.task}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-[10px] flex items-center justify-center font-bold shadow-sm">
                      {item.owner?.[0]}
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 group-hover:text-indigo-600 transition-colors">
                      {item.owner}
                    </span>
                  </div>
                  {isCritical && (
                    <div className="flex items-center gap-1 text-rose-500">
                      <span className="text-[8px] font-black uppercase">Urgent</span>
                      <RefreshCw size={12} className="animate-spin-slow" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
};

export default App;