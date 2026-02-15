
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Trash2, 
  Sparkles, 
  Loader2, 
  Menu, 
  X, 
  BookOpen, 
  ArrowRight,
  ClipboardCheck,
  Zap
} from 'lucide-react';
import { ModuleType, ChatMessage } from './types';
import { MODULES, getModuleIcon } from './constants';
import { generateAnalysis } from './services/geminiService';

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleType>('SUPERVISOR');
  const [inputText, setInputText] = useState('');
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, streamingText]);

  const handleProcess = async () => {
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      moduleType: activeModule,
      timestamp: Date.now()
    };

    setHistory(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    setStreamingText('');

    try {
      const result = await generateAnalysis(activeModule, userMsg.content, (text) => {
        setStreamingText(text);
      });

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result,
        moduleType: activeModule,
        timestamp: Date.now()
      };

      setHistory(prev => [...prev, assistantMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Xin lỗi, đã có lỗi xảy ra khi kết nối với hệ thống AI. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.",
        moduleType: activeModule,
        timestamp: Date.now()
      };
      setHistory(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setStreamingText(null);
    }
  };

  const clearHistory = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử hội thoại?")) {
      setHistory([]);
    }
  };

  const currentModule = MODULES.find(m => m.id === activeModule)!;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                <BookOpen size={20} />
              </div>
              <h1 className="font-bold text-xl tracking-tight text-slate-800">EconPhD AI</h1>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <p className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Modules</p>
            {MODULES.map((module) => (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                  activeModule === module.id 
                    ? `${module.color} text-white shadow-lg shadow-indigo-100` 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {getModuleIcon(module.icon, "w-5 h-5")}
                <div className="flex flex-col">
                  <span className="font-medium text-sm leading-tight">{module.name}</span>
                  <span className={`text-[10px] opacity-80 ${activeModule === module.id ? 'text-white' : 'text-slate-500'}`}>
                    {module.role}
                  </span>
                </div>
              </button>
            ))}

            <div className="pt-8 px-3">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <h3 className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Zap size={14} className="text-amber-500" /> PRO TIP
                </h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Sử dụng Editor AI sau cùng để tinh chỉnh văn phong theo chuẩn Q1 IMRaD.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-slate-100">
            <button 
              onClick={clearHistory}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
              Xóa lịch sử
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 md:px-8 justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className={`md:hidden p-2 text-slate-500 ${isSidebarOpen ? 'hidden' : ''}`}>
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${currentModule.color} text-white hidden sm:block`}>
                {getModuleIcon(currentModule.icon, "w-5 h-5")}
              </div>
              <div>
                <h2 className="font-semibold text-slate-800 leading-tight">{currentModule.name}</h2>
                <p className="text-xs text-slate-500">{currentModule.description}</p>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full">
            <ClipboardCheck size={14} className="text-emerald-500" />
            <span>Q1 Standards: NBER / OECD / WB</span>
          </div>
        </header>

        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth"
        >
          {history.length === 0 && !streamingText && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto px-4">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-6 text-indigo-600 animate-pulse">
                <Sparkles size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Chào mừng bạn đến với EconPhD AI</h3>
              <p className="text-slate-500 leading-relaxed">
                Hệ thống 5 module AI chuyên sâu giúp bạn xây dựng luận án tiến sĩ kinh tế chuẩn quốc tế. 
                Hãy dán nội dung nghiên cứu, câu hỏi hoặc phương pháp luận của bạn vào bên dưới để bắt đầu.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 w-full">
                <button onClick={() => setInputText("Kiểm tra tính khả thi chính sách cho đề xuất đánh thuế carbon tại Việt Nam.")} className="p-3 bg-white border border-slate-200 rounded-xl text-left text-sm text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 transition-all flex items-center gap-2">
                  <ArrowRight size={14} className="text-indigo-400" />
                  Gợi ý: Kiểm tra tính khả thi
                </button>
                <button onClick={() => setInputText("Thiết kế chiến lược nhận diện (identification strategy) cho nghiên cứu tác động của FDI lên tiền lương bằng phương pháp DID.")} className="p-3 bg-white border border-slate-200 rounded-xl text-left text-sm text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 transition-all flex items-center gap-2">
                  <ArrowRight size={14} className="text-indigo-400" />
                  Gợi ý: Soi phương pháp định lượng
                </button>
              </div>
            </div>
          )}

          {history.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-4 shadow-sm border ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 border-indigo-700 text-white' 
                  : 'bg-white border-slate-200 text-slate-800'
              }`}>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                    <div className={`p-1.5 rounded-md ${MODULES.find(m => m.id === msg.moduleType)?.color} text-white`}>
                      {getModuleIcon(MODULES.find(m => m.id === msg.moduleType)?.icon || '', "w-3 h-3")}
                    </div>
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      {MODULES.find(m => m.id === msg.moduleType)?.name} Feedback
                    </span>
                  </div>
                )}
                <div className={`whitespace-pre-wrap leading-relaxed ${msg.role === 'assistant' ? 'serif-font' : ''}`}>
                  {msg.content}
                </div>
                <div className={`mt-2 text-[10px] ${msg.role === 'user' ? 'text-indigo-200 text-right' : 'text-slate-400'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {streamingText && (
            <div className="flex justify-start">
              <div className="max-w-[85%] md:max-w-[75%] bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm text-slate-800">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                  <div className={`p-1.5 rounded-md ${currentModule.color} text-white`}>
                    {getModuleIcon(currentModule.icon, "w-3 h-3")}
                  </div>
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    {currentModule.name} is analyzing...
                  </span>
                </div>
                <div className="whitespace-pre-wrap leading-relaxed serif-font">
                  {streamingText}
                </div>
              </div>
            </div>
          )}

          {isLoading && !streamingText && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-sm flex items-center gap-3">
                <Loader2 size={20} className="animate-spin text-indigo-500" />
                <span className="text-sm text-slate-500 italic">Hệ thống đang xử lý dữ liệu...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-white border-t border-slate-200">
          <div className="max-w-4xl mx-auto relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleProcess();
                }
              }}
              placeholder={`Nhập nội dung cần ${currentModule.name} xử lý...`}
              className="w-full h-32 md:h-40 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all pr-14 text-slate-700"
            />
            <button
              onClick={handleProcess}
              disabled={isLoading || !inputText.trim()}
              className={`absolute bottom-4 right-4 p-3 rounded-xl transition-all duration-200 ${
                isLoading || !inputText.trim() 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 scale-100 hover:scale-105 active:scale-95'
              }`}
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded border border-slate-200 bg-white">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded border border-slate-200 bg-white">Shift+Enter</kbd> for new line
              </span>
              <span className="text-[10px] font-medium text-slate-500">
                Powered by Gemini 3 Flash
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
