/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Layout, 
  Settings, 
  User, 
  Heart,
  QrCode,
  ChevronRight, 
  ChevronLeft, 
  Loader2, 
  Edit3, 
  Download, 
  Palette, 
  Moon, 
  Star, 
  ArrowRight,
  Sparkles,
  Share2,
  Trash2,
  X,
  School,
  GraduationCap,
  Baby,
  PenTool,
  Clock,
  History,
  FileText,
  Zap,
  Maximize2,
  Minimize2,
  ArrowUpRight,
  Globe,
  Award,
  Atom, 
  Languages, 
  History as HistoryIcon, 
  FileImage, 
  FileDown, 
  BookOpen, 
  Monitor, 
  TrendingUp, 
  Flag, 
  ChevronDown,
  Type,
  Palette as PaletteIcon,
  Save,
  Bold,
  Italic,
  ListPlus,
  Trash,
  Undo2,
  Redo2,
  Underline,
  AlignCenter,
  AlignLeft,
  AlignRight,
  FolderPlus,
  Image as ImageIcon,
  Play,
  Camera,
  CheckCircle,
  MessageSquare,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import { 
  AppView, 
  Assignment, 
  SlideContent, 
  OutputMode,
  AssignmentVersion,
  INDIAN_LANGUAGES, 
  PRESETS, 
  TEACHER_MODES,
  UserPreferences,
  AssignmentFormat,
  FORMATS
} from './types';
import { generateAssignment, improveSlideContent } from './services/gemini';
import { findOfflineTemplate, TEMPLATE_DATA } from './data/templates';
import { TEMPLATE_METADATA, CATEGORY_LIST } from './data/catalog';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell
} from 'recharts';
import { useRef } from 'react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import pptxgen from "pptxgenjs";

export default function App() {
  const [view, setView] = useState<AppView>('splash');
  const [topic, setTopic] = useState('');
  const [marks, setMarks] = useState(10);
  const [language, setLanguage] = useState(INDIAN_LANGUAGES[0]);
  const [teacherMode, setTeacherMode] = useState(TEACHER_MODES[1]);
  const [format, setFormat] = useState<AssignmentFormat>('Quick Pres');
  const [slideCount, setSlideCount] = useState(12);
  const [selectedImage, setSelectedImage] = useState<{ mimeType: string; data: string } | null>(null);
  const [currentAssignment, setCurrentAssignment] = useState<Assignment | null>(null);
  const [currentMode, setCurrentMode] = useState<OutputMode>('Normal');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [loadingStep, setLoadingStep] = useState(0);
  const [library, setLibrary] = useState<Assignment[]>([]);
  const [prefs, setPrefs] = useState<UserPreferences>({
    userClass: '10th Grade',
    language: 'English',
    writingStyle: 'Professional',
    themeColor: '#6C63FF',
    fontSize: 'medium',
    hasDonated: false
  });
  const [showThankYou, setShowThankYou] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [aiUsage, setAiUsage] = useState({ count: 0, lastReset: new Date().toDateString() });
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [pendingAiAction, setPendingAiAction] = useState<(() => void) | null>(null);
  
  const [activeStyles, setActiveStyles] = useState<{ bold: boolean; italic: boolean; underline: boolean; align: 'left' | 'center' | 'right' }>({
    bold: false,
    italic: false,
    underline: false,
    align: 'left'
  });

  // Daily Limit Logic
  useEffect(() => {
    const stored = localStorage.getItem('ai_generation_usage');
    const today = new Date().toDateString();
    
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.lastReset !== today) {
        // Reset for new day
        const resetData = { count: 0, lastReset: today };
        setAiUsage(resetData);
        localStorage.setItem('ai_generation_usage', JSON.stringify(resetData));
      } else {
        setAiUsage(parsed);
      }
    } else {
      localStorage.setItem('ai_generation_usage', JSON.stringify({ count: 0, lastReset: today }));
    }
  }, []);

  const incrementAiUsage = () => {
    const newData = { ...aiUsage, count: aiUsage.count + 1 };
    setAiUsage(newData);
    localStorage.setItem('ai_generation_usage', JSON.stringify(newData));
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeCategory, setActiveCategory] = useState('School Subjects');
  const [history, setHistory] = useState<Assignment[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectedElement, setSelectedElement] = useState<{ type: 'title' | 'point' | 'overall', index?: number } | null>(null);
  const [activeToolPanel, setActiveToolPanel] = useState<'none' | 'add' | 'design' | 'text' | 'image' | 'slides' | 'more'>('none');
  const [applyToAll, setApplyToAll] = useState(true);
  const [presentationStyle, setPresentationStyle] = useState<'Formal' | 'Fun' | 'Simple'>('Formal');
  const [showNotes, setShowNotes] = useState(false);
  const slideRef = useRef<HTMLDivElement>(null);

  const loadingSteps = [
    "Initializing Gemini Pro Engine...",
    "Researching topic: ${topic}...",
    "Structuring comprehensive slides...",
    "Optimizing content for ${language}...",
    "Designing Normal, Simplified & Detailed versions...",
    "Applying educational tone: ${teacherMode}...",
    "Generating tables and data charts...",
    "Finalizing high-quality presentation..."
  ];

  // Load library from local storage
  useEffect(() => {
    const saved = localStorage.getItem('assignment_library');
    if (saved) setLibrary(JSON.parse(saved));
    
    const savedPrefs = localStorage.getItem('user_prefs');
    if (savedPrefs) setPrefs(JSON.parse(savedPrefs));
  }, []);

  // Save changes to local storage
  useEffect(() => {
    localStorage.setItem('assignment_library', JSON.stringify(library));
  }, [library]);

  useEffect(() => {
    if (view === 'splash') {
      const timer = setTimeout(() => setView('home'), 2000);
      return () => clearTimeout(timer);
    }
  }, [view]);

  useEffect(() => {
    let interval: any;
    if (view === 'loading') {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep(prev => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [view, loadingSteps.length]);

  const saveCurrentAssignment = () => {
    if (!currentAssignment) return;
    setSaveStatus('saving');
    
    // Check if it's already in the library
    setLibrary(prev => {
      const exists = prev.find(a => a.id === currentAssignment.id);
      if (exists) {
        return prev.map(a => a.id === currentAssignment.id ? currentAssignment : a);
      }
      return [currentAssignment, ...prev];
    });

    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 800);
  };

  // Debounced history to prevent lag during rapid typing
  const debouncedAddToHistory = useMemo(() => {
    let timeout: any;
    return (newAsst: Assignment) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(JSON.parse(JSON.stringify(newAsst)));
        if (newHistory.length > 50) newHistory.shift();
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }, 500);
    };
  }, [history, historyIndex]);

  const addToHistory = (newAsst: Assignment) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newAsst)));
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setCurrentAssignment(JSON.parse(JSON.stringify(prev)));
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setCurrentAssignment(JSON.parse(JSON.stringify(next)));
      setHistoryIndex(historyIndex + 1);
    }
  };

  const updateSlideData = (field: 'title' | 'points' | 'imageUrl' | 'table' | 'chartData' | 'shape', value: any, index?: number) => {
    if (!currentAssignment) return;
    const updatedVersions = currentAssignment.versions.map(v => {
      if (v.mode === currentMode) {
        const newSlides = [...v.slides];
        const currentSlide = { ...newSlides[currentSlideIndex] };
        
        if (field === 'title') {
          currentSlide.title = value;
        } else if (field === 'imageUrl') {
          currentSlide.imageUrl = value;
        } else if (field === 'table') {
          currentSlide.table = value;
        } else if (field === 'chartData') {
          currentSlide.chartData = value;
        } else if (field === 'shape') {
          currentSlide.shape = value;
        } else if (field === 'points' && index !== undefined) {
          const newPoints = [...currentSlide.points];
          newPoints[index] = value;
          currentSlide.points = newPoints;
        } else if (field === 'points' && index === undefined) {
          // Add new point
          currentSlide.points = [...currentSlide.points, value];
        }
        
        newSlides[currentSlideIndex] = currentSlide;
        return { ...v, slides: newSlides };
      }
      return v;
    });
    const updatedAssignment = { ...currentAssignment, versions: updatedVersions };
    setCurrentAssignment(updatedAssignment);
    // Debounce history adding for performance
    debouncedAddToHistory(updatedAssignment);
  };

  const addPoint = (index: number) => {
    if (!currentAssignment) return;
    const updatedVersions = currentAssignment.versions.map(v => {
      if (v.mode === currentMode) {
        const newSlides = [...v.slides];
        const currentSlide = { ...newSlides[currentSlideIndex] };
        const newPoints = [...currentSlide.points];
        newPoints.splice(index, 0, 'New point...');
        currentSlide.points = newPoints;
        newSlides[currentSlideIndex] = currentSlide;
        return { ...v, slides: newSlides };
      }
      return v;
    });
    const updatedAssignment = { ...currentAssignment, versions: updatedVersions };
    setCurrentAssignment(updatedAssignment);
    addToHistory(updatedAssignment);
  };

  const addSlide = () => {
    if (!currentAssignment) return;
    const newSlide: SlideContent = { title: 'New Slide', points: ['Click here to add text...'] };
    const updatedVersions = currentAssignment.versions.map(v => {
      if (v.mode === currentMode) {
        return { ...v, slides: [...v.slides, newSlide] };
      }
      return v;
    });
    const updatedAssignment = { ...currentAssignment, versions: updatedVersions };
    setCurrentAssignment(updatedAssignment);
    setCurrentSlideIndex(currentVersion(updatedAssignment).slides.length - 1);
    addToHistory(updatedAssignment);
  };

  const deleteSlide = () => {
    if (!currentAssignment) return;
    const currentV = currentVersion(currentAssignment);
    if (currentV.slides.length <= 1) return;
    
    const updatedVersions = currentAssignment.versions.map(v => {
      if (v.mode === currentMode) {
        const newSlides = v.slides.filter((_, i) => i !== currentSlideIndex);
        return { ...v, slides: newSlides };
      }
      return v;
    });
    const updatedAssignment = { ...currentAssignment, versions: updatedVersions };
    setCurrentAssignment(updatedAssignment);
    setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
    addToHistory(updatedAssignment);
  };

  const handleManualCreate = () => {
    const emptyAssignment: Assignment = {
      id: Math.random().toString(36).substr(2, 9),
      topic: "Untitled Presentation",
      tone: "Professional",
      language: "English",
      marks: 10,
      teacherMode: "Average",
      createdAt: Date.now(),
      isManual: true,
      versions: [{
        mode: 'Normal',
        slides: [{ title: 'Presentation Title', points: ['Add your first point here...'] }]
      }]
    };
    setCurrentAssignment(emptyAssignment);
    setCurrentSlideIndex(0);
    setCurrentMode('Normal');
    setView('editor');
    setHistory([JSON.parse(JSON.stringify(emptyAssignment))]);
    setHistoryIndex(0);
  };

  const currentVersion = (asst: Assignment | null) => {
    if (!asst) return { mode: 'Normal', slides: [] } as AssignmentVersion;
    return asst.versions.find(v => v.mode === currentMode) || asst.versions[0];
  };

  const currentV = useMemo(() => {
    if (!currentAssignment) return { mode: 'Normal' as OutputMode, slides: [] as SlideContent[] } as AssignmentVersion;
    return currentVersion(currentAssignment);
  }, [currentAssignment, currentMode]);

  const handleCreateAssignment = async (customTopic?: any) => {
    const topicToUse = typeof customTopic === 'string' ? customTopic : topic;
    if (!topicToUse && !selectedImage) return;

    // Check Usage Limit
    if (aiUsage.count >= 3) {
      setShowUsageModal(true);
      return;
    }

    // Show confirmation modal for usage count
    setPendingAiAction(() => () => startActualGeneration(topicToUse));
    setShowUsageModal(true);
  };

  const startActualGeneration = async (topicToUse: string) => {
    setErrorMessage(null);
    setView('loading');
    
    try {
      const assignment = await generateAssignment({
        topic: topicToUse || "Presentation from uploaded notes",
        tone: presentationStyle,
        language,
        marks,
        teacherMode,
        format,
        numSlides: slideCount,
        sourceImage: selectedImage || undefined
      });
      const finalAssignment = { ...assignment, isManual: false };
      setCurrentAssignment(finalAssignment);
      setLibrary(prev => [finalAssignment, ...prev]);
      setCurrentSlideIndex(0);
      setCurrentMode('Normal');
      incrementAiUsage(); // Increment count on success
      setTimeout(() => setView('editor'), 1000);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Something went wrong. Please try again.");
      setView('home');
    }
  };

  const handleImprove = async (instruction: string) => {
    if (!currentAssignment || isImproving) return;
    setIsImproving(true);
    try {
      const currentVersion = currentAssignment.versions.find(v => v.mode === currentMode);
      if (!currentVersion) return;
      
      const currentSlide = currentVersion.slides[currentSlideIndex];
      const improved = await improveSlideContent(currentSlide, instruction, language);
      
      const updatedVersions = currentAssignment.versions.map(v => {
        if (v.mode === currentMode) {
          const newSlides = [...v.slides];
          newSlides[currentSlideIndex] = improved;
          return { ...v, slides: newSlides };
        }
        return v;
      });
      
      const updatedAssignment = { ...currentAssignment, versions: updatedVersions };
      setCurrentAssignment(updatedAssignment);
      setLibrary(prev => prev.map(a => a.id === updatedAssignment.id ? updatedAssignment : a));
    } finally {
      setIsImproving(false);
    }
  };

  const renderSplash = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 flex flex-col items-center justify-center bg-bg-dark z-50 p-6">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8 }} className="w-24 h-24 purple-gradient rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-primary/30">
        <Sparkles className="w-12 h-12 text-white" />
      </motion.div>
      <h1 className="text-4xl font-bold text-gradient mb-2">Gen AI Workspace</h1>
      <p className="text-slate-400">Your AI Study Buddy</p>
    </motion.div>
  );

  const renderUsageModal = () => (
    <AnimatePresence>
      {showUsageModal && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-sm glass rounded-[2.5rem] p-8 border border-white/10 shadow-2xl text-center relative overflow-hidden"
          >
            {aiUsage.count >= 3 ? (
              <>
                <div className="w-20 h-20 rounded-3xl bg-red-500/20 flex items-center justify-center text-red-400 mx-auto mb-6 shadow-xl shadow-red-500/10">
                  <AlertCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black mb-4">Daily Limit Reached</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                  You've used all 3 AI generations for today. Your limit will reset at midnight automatically.
                </p>
                <button 
                  onClick={() => setShowUsageModal(false)}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all border border-white/10"
                >
                  Got it
                </button>
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-3xl bg-primary/20 flex items-center justify-center text-primary mx-auto mb-6 shadow-xl shadow-primary/10">
                  <Zap className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black mb-2">Confirm Generation</h3>
                <div className="mb-6">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Remaining Today</span>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className="text-3xl font-black text-white">{3 - aiUsage.count}</span>
                    <span className="text-slate-600 font-bold">/ 3</span>
                  </div>
                </div>

                {aiUsage.count === 2 && (
                  <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl mb-6 flex items-start gap-3 text-left">
                    <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                    <p className="text-[10px] text-orange-200/80 leading-tight">
                      <span className="font-bold text-orange-400">Warning:</span> This is your last AI generation for today. Use it wisely!
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      setShowUsageModal(false);
                      setPendingAiAction(null);
                    }}
                    className="flex-1 py-4 bg-white/5 text-slate-400 rounded-2xl font-bold text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      if (pendingAiAction) {
                        pendingAiAction();
                        setPendingAiAction(null);
                      }
                      setShowUsageModal(false);
                    }}
                    className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/30 text-sm"
                  >
                    Generate
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderHome = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-bg-dark flex flex-col p-6 pb-24 text-white selection:bg-primary/20">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 md:mb-10">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl purple-gradient flex items-center justify-center text-white shadow-lg shadow-primary/30">
            <Layout className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <h1 className="text-lg md:text-xl font-bold tracking-tight text-white">Assignment<span className="text-primary italic text-gradient">AI</span></h1>
        </div>
        <button onClick={() => setView('profile')} className="w-8 h-8 md:w-10 md:h-10 rounded-full glass flex items-center justify-center shadow-sm overflow-hidden text-slate-300">
          <User className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>

      {/* AI Usage Progress */}
      <div className="flex items-center justify-between px-5 py-3 glass rounded-3xl border border-white/5 mb-8 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Zap className="w-5 h-5 transition-transform hover:scale-110" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">AI Tokens</span>
            <span className="text-xs font-bold text-slate-200">Daily Generation Limit</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
             <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden mb-1">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(aiUsage.count / 3) * 100}%` }}
                className={`h-full ${aiUsage.count >= 3 ? 'bg-red-500' : aiUsage.count === 2 ? 'bg-orange-500' : 'bg-primary'}`}
              />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase">{aiUsage.count}/3 Generations Used</span>
          </div>
        </div>
      </div>

      {/* Main Choice Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <motion.button 
          whileHover={{ y: -5, scale: 1.02 }} 
          onClick={() => setView('create')}
          className="glass p-6 rounded-[2rem] border border-white/10 flex flex-col gap-4 text-left shadow-2xl relative overflow-hidden group min-h-[160px]"
        >
          <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
            <Sparkles className="w-32 h-32 rotate-12" />
          </div>
          <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-1">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-1">AI Create</h3>
            <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">Topic to structured presentation in seconds.</p>
          </div>
        </motion.button>

        <motion.button 
          whileHover={{ y: -5, scale: 1.02 }} 
          onClick={() => setView('templates')}
          className="glass p-6 rounded-[2rem] border border-white/10 flex flex-col gap-4 text-left shadow-2xl relative overflow-hidden group min-h-[160px]"
        >
          <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
            <Layout className="w-32 h-32 rotate-12" />
          </div>
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-1">
            <Layout className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-1">Templates</h3>
            <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">Browse 50+ pre-built school templates.</p>
          </div>
        </motion.button>

        <motion.button 
          whileHover={{ y: -5, scale: 1.02 }} 
          onClick={handleManualCreate}
          className="glass p-6 rounded-[2rem] border border-white/10 flex flex-col gap-4 text-left shadow-2xl relative overflow-hidden group min-h-[160px]"
        >
          <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
            <PenTool className="w-32 h-32 rotate-12" />
          </div>
          <div className="w-10 h-10 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-400 mb-1">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-1">Manual Design</h3>
            <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">Start with a blank canvas and design manually.</p>
          </div>
        </motion.button>

        <motion.button 
          whileHover={{ y: -5, scale: 1.02 }} 
          onClick={() => setView('library')}
          className="glass p-6 rounded-[2rem] border border-white/10 flex flex-col gap-4 text-left shadow-2xl relative overflow-hidden group min-h-[160px]"
        >
          <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
            <HistoryIcon className="w-32 h-32 rotate-12" />
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-1">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-1">My Library</h3>
            <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">Access all your previously generated projects.</p>
          </div>
        </motion.button>
      </div>

      {/* Recent Activity */}
      <div className="flex-1">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-lg font-bold">Recent Projects</h2>
          <button onClick={() => setView('library')} className="text-sm font-bold text-primary hover:underline">View All</button>
        </div>
        {library.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-10">
            {library.slice(0, 5).map(asst => (
              <motion.button 
                key={asst.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setCurrentAssignment(asst);
                  setCurrentSlideIndex(0);
                  setCurrentMode('Normal');
                  setView('editor');
                }}
                className="w-48 flex-shrink-0 group"
              >
                <div className="aspect-[4/3] rounded-2xl glass border border-white/10 mb-3 shadow-2xl flex flex-col overflow-hidden group-hover:border-primary/50 transition-all">
                  <div className="flex-1 p-3 flex flex-col gap-1.5 overflow-hidden">
                    <div className="w-full h-2 bg-primary/20 rounded-full" />
                    <div className="w-2/3 h-1.5 bg-white/5 rounded-full" />
                    <div className="w-full h-1.5 bg-white/5 rounded-full" />
                    <div className="w-1/2 h-1.5 bg-white/5 rounded-full" />
                    <div className="mt-auto flex justify-between items-center">
                       <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-slate-500" />
                       </div>
                       <Sparkles className="w-3 h-3 text-primary/30" />
                    </div>
                  </div>
                  <div className="h-2 bg-white/5 px-3 flex items-center gap-1">
                    <div className="h-0.5 flex-1 bg-primary" />
                    <div className="h-0.5 flex-1 bg-white/10" />
                    <div className="h-0.5 flex-1 bg-white/10" />
                  </div>
                </div>
                <h4 className="text-sm font-bold truncate text-left mb-1 group-hover:text-primary transition-colors">{asst.topic}</h4>
                <p className="text-[10px] text-slate-500 text-left">{new Date(asst.createdAt).toLocaleDateString()}</p>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 glass rounded-[2rem] border border-white/5 border-dashed">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/5">
              <FolderPlus className="w-6 h-6 text-slate-600" />
            </div>
            <p className="text-slate-500 font-medium">No projects yet. Start by choosing a mode above!</p>
          </div>
        )}
      </div>

      {/* Persistent Bottom Nav Mobile */}
      <nav className="fixed bottom-6 left-6 right-6 h-16 glass border border-white/10 rounded-full flex items-center justify-around px-4 z-40 shadow-2xl md:hidden text-slate-500">
        <button onClick={() => setView('home')} className="p-2 text-primary">
          <Layout className="w-6 h-6" />
        </button>
        <button onClick={handleManualCreate} className="p-4 bg-primary rounded-full -mt-10 shadow-xl shadow-primary/30 text-white">
          <Plus className="w-6 h-6" />
        </button>
        <button onClick={() => setView('profile')} className="p-2">
          <Settings className="w-6 h-6" />
        </button>
      </nav>
    </motion.div>
  );

  const renderCreate = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="min-h-screen bg-bg-dark p-6 flex flex-col">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('home')} className="p-2 glass rounded-full">
            <ChevronLeft />
          </button>
          <h2 className="text-2xl font-bold text-gradient">AI Creation</h2>
        </div>
        
        {/* Compact Usage Indicator */}
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 mb-1">
            <Zap className={`w-3 h-3 ${aiUsage.count >= 3 ? 'text-red-400' : 'text-primary'}`} />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{aiUsage.count}/3 Generations Used</span>
          </div>
          <div className="h-1 w-24 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(aiUsage.count / 3) * 100}%` }}
              className={`h-full ${aiUsage.count >= 3 ? 'bg-red-500' : aiUsage.count === 2 ? 'bg-orange-500' : 'bg-primary'}`}
            />
          </div>
        </div>
      </header>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
          <X className="w-4 h-4 text-red-500" />
          <p className="text-xs text-red-400">{errorMessage}</p>
        </div>
      )}

      <div className="flex-1 space-y-8 overflow-y-auto no-scrollbar pb-10">
        <div className="space-y-4">
          <label className="text-sm text-slate-400 font-bold uppercase tracking-wider">What is your topic?</label>
          <textarea 
            rows={4}
            placeholder="e.g. Impact of Artificial Intelligence in Education..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all resize-none text-lg"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <label className="text-sm text-slate-400 font-bold uppercase tracking-wider">Language</label>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold"
            >
              {INDIAN_LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
            </select>
          </div>
          <div className="space-y-4">
            <label className="text-sm text-slate-400 font-bold uppercase tracking-wider">Style</label>
            <select 
              value={presentationStyle}
              onChange={(e) => setPresentationStyle(e.target.value as any)}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold"
            >
              {['Formal', 'Fun', 'Simple'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-sm text-slate-400 font-bold uppercase tracking-wider">Assignment Format</label>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {FORMATS.map(f => (
              <button 
                key={f}
                onClick={() => setFormat(f)}
                className={`px-6 py-3 rounded-xl border font-bold whitespace-nowrap transition-all ${format === f ? 'bg-primary border-primary text-white shadow-lg' : 'bg-slate-800/50 border-slate-700/50 text-slate-400'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-sm text-slate-400 font-bold uppercase tracking-wider">Number of Slides</label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {[5, 10, 12, 15, 20].map(n => (
              <button 
                key={n}
                onClick={() => setSlideCount(n)}
                className={`py-3 rounded-xl border font-bold transition-all text-sm md:text-base ${slideCount === n ? 'bg-primary border-primary text-white shadow-lg' : 'bg-slate-800/50 border-slate-700/50 text-slate-400'}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-sm text-slate-400 font-bold uppercase tracking-wider">Hand-written Notes / Photos (Optional)</label>
          <div className="flex flex-col gap-4">
            <input 
              type="file" 
              accept="image/*" 
              id="ai-photo-upload" 
              className="hidden" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    const base64 = reader.result as string;
                    setSelectedImage({
                      mimeType: file.type,
                      data: base64.split(',')[1]
                    });
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            <label 
              htmlFor="ai-photo-upload"
              className="w-full aspect-video glass rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/50 transition-all overflow-hidden relative"
            >
              {selectedImage ? (
                <>
                  <img src={`data:${selectedImage.mimeType};base64,${selectedImage.data}`} alt="Selected" className="absolute inset-0 w-full h-full object-cover opacity-40" referrerPolicy="no-referrer" />
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <CheckCircle className="w-10 h-10 text-primary" />
                    <span className="text-sm font-bold text-white">Image Uploaded Successfully</span>
                    <button 
                      onClick={(e) => { e.preventDefault(); setSelectedImage(null); }}
                      className="text-[10px] text-white/60 hover:text-white underline mt-2"
                    >
                      Remove and try another
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-400">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-white">Upload Hand-written Text</p>
                    <p className="text-[10px] text-slate-500">Scan notes, questions or ideas</p>
                  </div>
                </>
              )}
            </label>
          </div>
        </div>

        <button 
          onClick={() => handleCreateAssignment()}
          disabled={!topic.trim() && !selectedImage}
          className="w-full h-16 purple-gradient rounded-2xl font-bold text-white shadow-xl shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-4 active:scale-95 transition-transform"
        >
          Generate Presentation
          <Sparkles className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );

  const renderLoading = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex flex-col items-center justify-center p-10 text-center">
      <div className="relative mb-12">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="w-48 h-48 rounded-full border-4 border-slate-700 border-t-primary shadow-[0_0_40px_-10px_rgba(108,99,255,0.5)]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Zap className="w-16 h-16 text-primary animate-pulse" />
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={loadingStep} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{loadingSteps[loadingStep].replace('${language}', language)}</h2>
          <p className="text-slate-500 max-w-xs mx-auto">This usually takes about 30 seconds for a high-quality multi-mode assignment.</p>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );

  const renderPowerPointEditor = () => {
    const currentSlide = currentV.slides[currentSlideIndex] || (currentV.slides[0] as SlideContent);

    const updateTheme = (theme: string, applyToAll: boolean = false) => {
      if (!currentAssignment) return;
      const updatedVersions = currentAssignment.versions.map(v => {
        if (v.mode === currentMode) {
          const newSlides = v.slides.map((s, idx) => {
            if (applyToAll || idx === currentSlideIndex) {
              return { ...s, theme };
            }
            return s;
          });
          return { ...v, slides: newSlides };
        }
        return v;
      });
      const updatedAssignment = { ...currentAssignment, versions: updatedVersions };
      setCurrentAssignment(updatedAssignment);
      addToHistory(updatedAssignment);
    };

    const deleteSlide = () => {
      if (!currentAssignment || currentVersion(currentAssignment).slides.length <= 1) return;
      const updatedVersions = currentAssignment.versions.map(v => {
        if (v.mode === currentMode) {
          const newSlides = v.slides.filter((_, i) => i !== currentSlideIndex);
          return { ...v, slides: newSlides };
        }
        return v;
      });
      const updatedAssignment = { ...currentAssignment, versions: updatedVersions };
      setCurrentAssignment(updatedAssignment);
      setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
      addToHistory(updatedAssignment);
    };

    const duplicateSlide = () => {
      if (!currentAssignment) return;
      const updatedVersions = currentAssignment.versions.map(v => {
        if (v.mode === currentMode) {
          const newSlides = [...v.slides];
          const slideToCopy = JSON.parse(JSON.stringify(newSlides[currentSlideIndex]));
          newSlides.splice(currentSlideIndex + 1, 0, slideToCopy);
          return { ...v, slides: newSlides };
        }
        return v;
      });
      const updatedAssignment = { ...currentAssignment, versions: updatedVersions };
      setCurrentAssignment(updatedAssignment);
      setCurrentSlideIndex(currentSlideIndex + 1);
      addToHistory(updatedAssignment);
    };

    const handleGalleryUpload = (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          updateSlideData('imageUrl', base64);
          setActiveToolPanel('none');
        };
        reader.readAsDataURL(file);
      }
    };

    const renderToolPanel = () => {
      const panelBaseCls = "absolute bottom-0 left-0 right-0 glass rounded-t-[2.5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.3)] p-8 z-[60] text-white border-t border-white/10";
      
      switch (activeToolPanel) {
        case 'add':
          return (
            <motion.div initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }} className={panelBaseCls}>
               <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-bold">Add to Slide</h3>
                </div>
                <button onClick={() => setActiveToolPanel('none')} className="p-2 glass rounded-full text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="grid grid-cols-3 gap-6">
                {[
                  { icon: Type, label: 'Text', color: 'bg-blue-500', action: () => updateSlideData('points', 'New point here...', currentSlide.points.length) },
                  { icon: ImageIcon, label: 'Image', color: 'bg-purple-500', action: () => document.getElementById('gallery-upload')?.click() },
                  { icon: Star, label: 'Shapes', color: 'bg-yellow-500', action: () => updateSlideData('shape', { type: 'star', color: '#F59E0B' }) },
                  { icon: BarChart, label: 'Chart', color: 'bg-pink-500', action: () => updateSlideData('chartData', [{ name: 'Jan', value: 400 }, { name: 'Feb', value: 300 }, { name: 'Mar', value: 500 }, { name: 'Apr', value: 280 }]) },
                  { icon: ListPlus, label: 'Table', color: 'bg-green-500', action: () => updateSlideData('table', { headers: ['Product', 'Sales', 'Trend'], rows: [['AI Tool', '1.2k', '+12%'], ['API', '4.5k', '+5%'], ['Platform', '2.1k', '+8%']] }) },
                  { icon: Plus, label: 'New Slide', color: 'bg-primary', action: addSlide },
                ].map((item, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => { item.action?.(); if (item.label !== 'Image') setActiveToolPanel('none'); }}
                    className="flex flex-col items-center gap-3 group"
                  >
                    <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl ${item.color} flex items-center justify-center text-white shadow-lg group-active:scale-90 transition-transform`}>
                      <item.icon className="w-7 h-7 md:w-8 md:h-8" />
                    </div>
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-white">{item.label}</span>
                  </button>
                ))}
              </div>
              <input type="file" id="gallery-upload" className="hidden" accept="image/*" onChange={handleGalleryUpload} />
            </motion.div>
          );
        case 'design':
          return (
             <motion.div initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }} className={panelBaseCls}>
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-orange-400" />
                    <h3 className="text-xl font-bold">Visual Themes</h3>
                  </div>
                  <button onClick={() => setActiveToolPanel('none')} className="p-2 glass rounded-full text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                </div>
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6">
                  {[
                    { name: 'Dark Slate', color: 'bg-slate-950', border: 'border-slate-800', cls: 'bg-slate-900 text-white dark-theme' },
                    { name: 'Paper White', color: 'bg-white', border: 'border-slate-200', cls: 'bg-white text-slate-900' },
                    { name: 'Deep Royal', color: 'bg-blue-900', border: 'border-blue-800', cls: 'bg-blue-900 text-white dark-theme' },
                    { name: 'Vibrant Indigo', color: 'bg-indigo-600', border: 'border-indigo-500', cls: 'bg-indigo-600 text-white dark-theme' },
                    { name: 'Emerald Forest', color: 'bg-emerald-900', border: 'border-emerald-800', cls: 'bg-emerald-900 text-white dark-theme' },
                    { name: 'Soft Rose', color: 'bg-rose-50', border: 'border-rose-100', cls: 'bg-rose-50 text-rose-900' },
                  ].map((theme, idx) => (
                    <button key={idx} onClick={() => { updateTheme(theme.cls, applyToAll); setActiveToolPanel('none'); }} className="flex-shrink-0 flex flex-col items-center gap-2">
                       <div className={`w-28 h-16 rounded-xl ${theme.color} ${theme.border} border-2 shadow-sm relative overflow-hidden`}>
                          <div className="absolute inset-x-0 bottom-0 h-4 bg-black/10" />
                       </div>
                       <span className="text-[10px] font-bold text-slate-400">{theme.name}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between p-5 glass rounded-[2rem]">
                   <span className="text-sm font-bold text-slate-300">Apply to all slides</span>
                   <button 
                    onClick={() => setApplyToAll(!applyToAll)}
                    className={`w-14 h-7 rounded-full flex items-center px-1 transition-colors ${applyToAll ? 'bg-primary shadow-[0_0_15px_rgba(108,99,255,0.4)]' : 'bg-white/10'}`}
                   >
                      <motion.div animate={{ x: applyToAll ? 28 : 0 }} className="w-5 h-5 bg-white rounded-full shadow-md" />
                   </button>
                </div>
             </motion.div>
          );
        case 'text':
           return (
             <motion.div initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }} className={panelBaseCls}>
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-2">
                    <Type className="w-5 h-5 text-blue-400" />
                    <h3 className="text-xl font-bold">Design Options</h3>
                  </div>
                  <button onClick={() => setActiveToolPanel('none')} className="p-2 glass rounded-full text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                </div>
                <div className="grid grid-cols-4 gap-4">
                   {[
                     { icon: Bold, label: 'Bold', command: 'bold', active: activeStyles.bold },
                     { icon: Italic, label: 'Italic', command: 'italic', active: activeStyles.italic },
                     { icon: Underline, label: 'Underline', command: 'underline', active: activeStyles.underline },
                     { icon: AlignLeft, label: 'Left', command: 'justifyLeft', active: activeStyles.align === 'left' },
                     { icon: AlignCenter, label: 'Center', command: 'justifyCenter', active: activeStyles.align === 'center' },
                     { icon: AlignRight, label: 'Right', command: 'justifyRight', active: activeStyles.align === 'right' },
                     { icon: Sparkles, label: 'AI Polish', color: 'text-primary' },
                     { icon: Trash, label: 'Clear', command: 'removeFormat' },
                   ].map((item, idx) => (
                     <button 
                      key={idx} 
                      onMouseDown={(e) => { 
                        e.preventDefault(); // Prevent focus loss from editor
                        if (item.command) {
                          document.execCommand(item.command);
                          if (item.command === 'bold') setActiveStyles(p => ({...p, bold: !p.bold}));
                          if (item.command === 'italic') setActiveStyles(p => ({...p, italic: !p.italic}));
                          if (item.command === 'underline') setActiveStyles(p => ({...p, underline: !p.underline}));
                          if (item.command === 'justifyLeft') setActiveStyles(p => ({...p, align: 'left'}));
                          if (item.command === 'justifyCenter') setActiveStyles(p => ({...p, align: 'center'}));
                          if (item.command === 'justifyRight') setActiveStyles(p => ({...p, align: 'right'}));
                        }
                      }} 
                      className={`flex flex-col items-center gap-2 p-4 glass rounded-3xl transition-all active:scale-95 group ${item.active ? 'bg-primary/20 ring-2 ring-primary/50' : 'hover:bg-white/5'}`}
                     >
                        <item.icon className={`w-6 h-6 ${item.active ? 'text-primary' : (item.color || 'text-slate-400 group-hover:text-white')}`} />
                        <span className={`text-[10px] font-bold ${item.active ? 'text-primary' : 'text-slate-500 group-hover:text-slate-300'}`}>{item.label}</span>
                     </button>
                   ))}
                </div>
             </motion.div>
           );
        case 'image':
           return (
            <motion.div initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }} className={panelBaseCls}>
               <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-purple-400" />
                    <h3 className="text-xl font-bold">Media Library</h3>
                  </div>
                  <button onClick={() => setActiveToolPanel('none')} className="p-2 glass rounded-full text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <button 
                    onClick={() => document.getElementById('gallery-upload')?.click()}
                    className="h-32 rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3 hover:border-primary/50 hover:bg-primary/5 transition-all text-slate-400 hover:text-primary"
                   >
                      <Camera className="w-8 h-8" />
                      <span className="text-sm font-bold">Upload Local</span>
                   </button>
                   <button className="h-32 rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3 opacity-50 cursor-not-allowed text-slate-400">
                      <Search className="w-8 h-8" />
                      <span className="text-sm font-bold">Web Search</span>
                   </button>
                </div>
                <input type="file" id="gallery-upload" className="hidden" accept="image/*" onChange={handleGalleryUpload} />
            </motion.div>
           );
        case 'slides':
           return (
            <motion.div initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }} className={panelBaseCls}>
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-2">
                    <Layout className="w-5 h-5 text-green-400" />
                    <h3 className="text-xl font-bold">Slide Controls</h3>
                  </div>
                  <button onClick={() => setActiveToolPanel('none')} className="p-2 glass rounded-full text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                   <button onClick={() => { addSlide(); setActiveToolPanel('none'); }} className="flex flex-col items-center gap-2 p-5 glass rounded-3xl hover:bg-green-500/10 transition-all text-green-400">
                      <Plus className="w-7 h-7" />
                      <span className="text-[10px] font-bold uppercase">New</span>
                   </button>
                   <button onClick={() => { duplicateSlide(); setActiveToolPanel('none'); }} className="flex flex-col items-center gap-2 p-5 glass rounded-3xl hover:bg-blue-500/10 transition-all text-blue-400">
                      <HistoryIcon className="w-7 h-7" />
                      <span className="text-[10px] font-bold uppercase">Clone</span>
                   </button>
                   <button onClick={() => { deleteSlide(); setActiveToolPanel('none'); }} className="flex flex-col items-center gap-2 p-5 glass rounded-3xl hover:bg-red-500/10 transition-all text-red-400">
                      <Trash2 className="w-7 h-7" />
                      <span className="text-[10px] font-bold uppercase">Delete</span>
                   </button>
                </div>
             </motion.div>
           );
        case 'more':
           return (
            <motion.div initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }} className={panelBaseCls}>
               <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-slate-400" />
                    <h3 className="text-xl font-bold">More Options</h3>
                  </div>
                  <button onClick={() => setActiveToolPanel('none')} className="p-2 glass rounded-full text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-4">
                   <button onClick={() => { 
                      updateSlideData('table', undefined);
                      updateSlideData('chartData', undefined);
                      updateSlideData('shape', undefined);
                      updateSlideData('imageUrl', undefined);
                      setActiveToolPanel('none');
                   }} className="w-full p-4 glass rounded-2xl flex items-center justify-between hover:bg-red-500/10 group transition-all">
                      <div className="flex items-center gap-3 text-red-500">
                         <Trash className="w-5 h-5" />
                         <span className="font-bold">Visual Clean up</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-red-400" />
                   </button>
                   <button onClick={() => setView('profile')} className="w-full p-4 glass rounded-2xl flex items-center justify-between hover:bg-white/5 transition-all">
                      <div className="flex items-center gap-3">
                         <User className="w-5 h-5 text-slate-400" />
                         <span className="font-bold">Account Settings</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-500" />
                   </button>
                   <button 
                    onClick={saveCurrentAssignment}
                    className="p-4 glass rounded-2xl flex items-center justify-between hover:bg-primary/10 group transition-all"
                   >
                      <div className="flex items-center gap-3 text-primary">
                         <Save className={`w-5 h-5 ${saveStatus === 'saving' ? 'animate-bounce' : ''}`} />
                         <span className="font-bold">{saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save to Library'}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-primary" />
                   </button>
                </div>
            </motion.div>
           );
        default: return null;
      }
    };

    return (
      <div className="h-screen bg-bg-dark flex flex-col overflow-hidden text-white selection:bg-primary/20 relative">
        {/* Top bar */}
        <header className="h-16 glass px-4 flex items-center justify-between gap-4 z-50 border-b border-white/10">
          <div className="flex items-center gap-2">
            <button onClick={() => setView('home')} className="p-2 glass rounded-xl text-slate-400 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <input 
                type="text" 
                value={currentAssignment.topic}
                onChange={(e) => setCurrentAssignment({...currentAssignment, topic: e.target.value})}
                className="font-bold text-sm bg-transparent outline-none border-b border-transparent hover:border-white/20 focus:border-primary transition-all max-w-[150px] truncate text-white"
              />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-0.5">Editor Mode</span>
            </div>
          </div>

          <div className="flex-1 flex gap-2">
             <button onClick={undo} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"><Undo2 className="w-4 h-4" /></button>
             <button onClick={redo} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"><Redo2 className="w-4 h-4" /></button>
          </div>

          <div className="flex items-center gap-2">
             <button 
              onClick={() => setShowNotes(!showNotes)}
              className={`px-4 h-10 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${showNotes ? 'bg-orange-500 text-white shadow-lg' : 'glass text-slate-300 hover:text-white border border-white/10'}`}
             >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Speech & Tips</span>
             </button>
          </div>

                    <div className="flex items-center gap-2">
                       <button 
                        onClick={saveCurrentAssignment}
                        className={`px-4 h-10 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-white/10 ${saveStatus === 'saved' ? 'bg-green-500 text-white' : 'glass text-slate-300 hover:text-white'}`}
                       >
                          <Save className={`w-3.5 h-3.5 ${saveStatus === 'saving' ? 'animate-bounce' : ''}`} />
                          <span>{saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Save'}</span>
                       </button>
                    </div>

                    <div className="flex items-center gap-2">
            <button onClick={() => setView('preview')} className="p-2 text-slate-400 hover:text-primary transition-all rounded-xl">
              <Play className="w-5 h-5 fill-current" />
            </button>
            <button 
              onClick={() => setView('export')}
              className="bg-primary px-4 h-10 rounded-xl text-white text-xs font-bold shadow-[0_10px_20px_rgba(108,99,255,0.3)] flex items-center gap-2 hover:bg-primary/90 active:scale-95 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden relative">
          <div className="w-[100px] glass border-r border-white/10 overflow-y-auto hidden md:flex flex-col items-center py-6 gap-6 no-scrollbar">
            {currentV.slides.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500">{i + 1}</span>
                <button 
                  onClick={() => setCurrentSlideIndex(i)}
                  className={`w-16 aspect-video rounded-lg border-2 transition-all overflow-hidden bg-white/5 flex items-center justify-center relative ${currentSlideIndex === i ? 'border-primary shadow-lg shadow-primary/20' : 'border-white/5 hover:border-white/20'}`}
                >
                  <div className="scale-[0.15] opacity-30 flex flex-col gap-2">
                    <div className="w-[160px] h-4 bg-slate-400 rounded" />
                    <div className="w-full h-1 bg-slate-500" />
                    <div className="w-full h-1 bg-slate-500" />
                  </div>
                </button>
              </div>
            ))}
            <button onClick={addSlide} className="w-16 aspect-video rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center text-slate-600 hover:text-primary hover:border-primary transition-all">
              <Plus className="w-6 h-6" />
            </button>
          </div>

          <main className="flex-1 relative flex flex-col items-center justify-start md:justify-center p-4 md:p-12 overflow-y-auto md:overflow-hidden bg-[#0A0F1E] no-scrollbar">
             {/* Mobile Slide Navigator */}
             <div className="flex md:hidden w-full gap-2 mb-4 overflow-x-auto no-scrollbar py-2">
                {currentV.slides.map((s, i) => (
                  <button 
                    key={i}
                    onClick={() => setCurrentSlideIndex(i)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full font-bold text-xs border transition-all ${currentSlideIndex === i ? 'bg-primary text-white border-primary shadow-lg' : 'bg-white/5 text-slate-500 border-white/10'}`}
                  >
                    Slide {i + 1}
                  </button>
                ))}
                <button onClick={addSlide} className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-500"><Plus className="w-4 h-4" /></button>
             </div>

             <div className="w-full max-w-4xl relative group">
                <motion.div 
                  ref={slideRef}
                  key={currentSlideIndex}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`w-full aspect-[16/9] shadow-[0_30px_100px_rgba(0,0,0,0.5)] rounded-3xl p-6 md:p-12 relative flex flex-col group overflow-hidden border border-white/5 ${currentSlide.theme || 'bg-white text-slate-900'}`}
                >
                   {currentSlide.imageUrl && (
                     <div className="absolute inset-0 z-0">
                       <img src={currentSlide.imageUrl} className="w-full h-full object-cover opacity-20 blur-[2px]" referrerPolicy="no-referrer" alt="Slide Background" />
                     </div>
                   )}
                   <div className="relative z-10 h-full flex flex-col">
                      <div className="flex-1 flex flex-col">
                        <div 
                          contentEditable
                          dangerouslySetInnerHTML={{ __html: currentSlide.title }}
                          onBlur={(e) => updateSlideData('title', e.currentTarget.innerHTML)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              document.execCommand('insertLineBreak');
                            }
                          }}
                          className={`text-2xl sm:text-3xl md:text-5xl font-black bg-transparent outline-none w-full mb-4 md:mb-8 selection:bg-primary/20 tracking-tight leading-tight min-h-[1em] ${currentSlide.theme?.includes('dark-theme') ? 'text-white' : 'text-slate-900'}`}
                        />
                        
                        <div className="flex-1 flex flex-col md:flex-row gap-4 md:gap-8">
                          <div className="flex-1 space-y-4 md:space-y-6 overflow-hidden">
                             {currentSlide.points.map((p, i) => (
                               <div key={i} className="flex gap-4 md:gap-5 group items-start">
                                 <div className={`mt-2.5 w-3 h-3 rounded-full border-2 border-primary/30 group-hover:bg-primary transition-all flex-shrink-0`} />
                                 <div 
                                   contentEditable
                                   dangerouslySetInnerHTML={{ __html: p }}
                                   onBlur={(e) => updateSlideData('points', e.currentTarget.innerHTML, i)}
                                   onFocus={() => {
                                      // Apply active styles when focusing if set
                                      if (activeStyles.bold) document.execCommand('bold');
                                      if (activeStyles.italic) document.execCommand('italic');
                                      if (activeStyles.underline) document.execCommand('underline');
                                   }}
                                   onKeyDown={(e) => {
                                     if (e.key === 'Enter') {
                                       e.preventDefault();
                                       addPoint(i + 1);
                                     }
                                   }}
                                   className={`flex-1 bg-transparent outline-none text-lg md:text-2xl opacity-90 focus:opacity-100 selection:bg-primary/20 leading-relaxed min-h-[1.5em] ${currentSlide.theme?.includes('dark-theme') ? 'text-white' : 'text-slate-700'}`}
                                  />
                               </div>
                             ))}

                             {currentSlide.table && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 overflow-hidden rounded-2xl border border-white/10 glass">
                                  <table className="w-full text-left">
                                    <thead className="bg-white/5">
                                      <tr>
                                        {currentSlide.table.headers.map((h, i) => (
                                          <th key={i} className="p-3 text-[10px] font-black uppercase tracking-widest text-slate-500">{h}</th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                      {currentSlide.table.rows.map((row, i) => (
                                        <tr key={i} className="hover:bg-white/5 transition-colors">
                                          {row.map((cell, j) => (
                                            <td key={j} className="p-3 text-xs md:text-sm font-medium">{cell}</td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </motion.div>
                             )}

                             {currentSlide.chartData && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-48 md:h-64 w-full mt-6 bg-white/5 rounded-3xl p-6 border border-white/5">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={currentSlide.chartData}>
                                      <XAxis 
                                        dataKey="name" 
                                        stroke={currentSlide.theme?.includes('dark-theme') ? '#475569' : '#94a3b8'} 
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                      />
                                      <Tooltip 
                                        contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                                        itemStyle={{ color: '#fff' }}
                                      />
                                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                         {currentSlide.chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={['#6C63FF', '#4F46E5', '#A5B4FC', '#C7D2FE'][index % 4]} />
                                          ))}
                                      </Bar>
                                    </BarChart>
                                  </ResponsiveContainer>
                                </motion.div>
                             )}

                             <button 
                              onClick={() => updateSlideData('points', 'New point...', currentSlide.points.length)}
                              className="bg-primary/5 hover:bg-primary/10 p-4 rounded-3xl border border-primary/10 flex items-center gap-3 text-primary font-bold transition-all active:scale-[0.98]"
                             >
                                <Plus className="w-5 h-5" />
                                <span className="text-sm">Add New Line</span>
                             </button>
                          </div>

                          {currentSlide.shape && (
                            <motion.div 
                              initial={{ scale: 0, rotate: -20 }}
                              animate={{ scale: 1, rotate: 0 }}
                              className="absolute top-1/2 right-20 -translate-y-1/2 pointer-events-none opacity-[0.08] mix-blend-overlay z-0 hidden lg:block"
                            >
                               {currentSlide.shape.type === 'star' && <Star className="w-64 h-64 fill-current" style={{ color: currentSlide.shape.color }} />}
                               {currentSlide.shape.type === 'circle' && <div className="w-64 h-64 rounded-full" style={{ backgroundColor: currentSlide.shape.color }} />}
                               {currentSlide.shape.type === 'square' && <div className="w-64 h-64 rounded-3xl" style={{ backgroundColor: currentSlide.shape.color }} />}
                            </motion.div>
                          )}

                          {currentSlide.imageUrl && (
                            <div className="w-1/3 aspect-video rounded-3xl overflow-hidden shadow-2xl relative group hidden sm:block">
                               <img src={currentSlide.imageUrl} className="w-full h-full object-cover shadow-2xl" alt="Slide" referrerPolicy="no-referrer" />
                               <button 
                                onClick={() => updateSlideData('imageUrl', undefined)}
                                className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                               >
                                 <X className="w-4 h-4" />
                               </button>
                            </div>
                          )}
                        </div>
                      </div>
                   </div>

                   {/* Speech and Suggested Images Overlay */}
                   <AnimatePresence>
                      {showNotes && (
                         <motion.div 
                           initial={{ y: 50, opacity: 0 }}
                           animate={{ y: 0, opacity: 1 }}
                           exit={{ y: 50, opacity: 0 }}
                           className="absolute bottom-6 inset-x-6 z-[70] glass rounded-[2rem] p-6 border border-white/20 shadow-2xl backdrop-blur-xl"
                         >
                            <div className="flex justify-between items-center mb-4">
                              <div className="flex items-center gap-2 text-orange-400">
                                <MessageSquare className="w-5 h-5" />
                                <h4 className="font-bold text-sm uppercase tracking-widest">Presenter Notes</h4>
                              </div>
                              <button onClick={() => setShowNotes(false)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-3">
                                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Suggested Speech Script</span>
                                 <p className="text-xs md:text-sm text-slate-200 leading-relaxed italic">"{currentSlide.speech || 'Focus on explaining the core concept of this slide clearly...'}"</p>
                              </div>
                              <div className="space-y-3">
                                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Visual Suggestions</span>
                                 <div className="flex flex-wrap gap-2">
                                    {currentSlide.suggestedImages?.map((img, idx) => (
                                       <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400">
                                          <ImageIcon className="w-3 h-3" />
                                          {img}
                                       </div>
                                    ))}
                                    {(!currentSlide.suggestedImages || currentSlide.suggestedImages.length === 0) && (
                                      <span className="text-xs text-slate-600 italic">No suggestions available for this slide.</span>
                                    )}
                                 </div>
                              </div>
                            </div>
                         </motion.div>
                      )}
                   </AnimatePresence>
                </motion.div>
             </div>
          </main>

          <AnimatePresence>
            {activeToolPanel !== 'none' && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setActiveToolPanel('none')}
                  className="absolute inset-0 bg-black/40 flex backdrop-blur-[4px] z-[55]" 
                />
                {renderToolPanel()}
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="glass px-4 h-24 md:h-20 flex items-center justify-around z-50 border-t border-white/10">
          {[
            { id: 'add', icon: Plus, label: 'Add' },
            { id: 'design', icon: Palette, label: 'Design' },
            { id: 'text', icon: Type, label: 'Text' },
            { id: 'image', icon: ImageIcon, label: 'Image' },
            { id: 'slides', icon: Layout, label: 'Slides' },
            { id: 'more', icon: Settings, label: 'More' },
          ].map((tool) => (
            <button 
              key={tool.id} 
              onClick={() => setActiveToolPanel(activeToolPanel === tool.id ? 'none' : tool.id as any)}
              className={`flex flex-col items-center gap-1 group transition-all ${activeToolPanel === tool.id ? 'text-primary' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <div className={`p-2.5 rounded-2xl transition-all ${activeToolPanel === tool.id ? 'bg-primary/15' : 'group-active:bg-white/5'}`}>
                <tool.icon className={`w-6 h-6 md:w-5 md:h-5 ${activeToolPanel === tool.id ? 'animate-pulse' : ''}`} />
              </div>
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderEditor = () => {
    if (!currentAssignment) return null;
    if (currentAssignment.isManual) return renderPowerPointEditor();
    
    // Original simplified editor for AI results
    const currentV = currentVersion(currentAssignment);
    const currentSlide = currentV.slides[currentSlideIndex];

    return (
      <div className="min-h-screen bg-slate-900 flex flex-col selection:bg-primary/20">
        <header className="p-4 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <button onClick={() => setView('home')} className="p-2 glass rounded-full"><ChevronLeft className="w-5 h-5" /></button>
            <h1 className="font-bold text-white truncate max-w-[150px]">{currentAssignment.topic}</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setView('preview')} className="p-2 glass rounded-xl text-white"><Play className="w-5 h-5" /></button>
            <button onClick={() => setView('export')} className="px-4 py-2 bg-primary rounded-xl text-white text-xs font-bold">Export</button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center gap-8 overflow-y-auto">
          <motion.div 
            ref={slideRef}
            key={currentSlideIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-4xl aspect-[16/9] bg-white rounded-3xl p-10 md:p-16 shadow-2xl relative flex flex-col justify-center ${currentMode === 'Handwritten' ? 'handwritten' : ''}`}
          >
            <textarea 
              value={currentSlide.title}
              onChange={(e) => updateSlideData('title', e.target.value)}
              className="text-3xl md:text-5xl font-black text-slate-900 bg-transparent outline-none w-full mb-8 resize-none text-center"
              rows={2}
            />
            <div className="space-y-4">
              {currentSlide.points.map((p, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-primary mt-3 flex-shrink-0" />
                  <textarea 
                    value={p}
                    onChange={(e) => updateSlideData('points', e.target.value, i)}
                    className="w-full bg-transparent text-lg md:text-2xl text-slate-600 outline-none resize-none leading-relaxed"
                    rows={1}
                    onInput={(e: any) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Slide Thumbnails Scroll */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar w-full max-w-4xl py-2">
            {currentV.slides.map((_, i) => (
              <button 
                key={i}
                onClick={() => setCurrentSlideIndex(i)}
                className={`w-14 h-14 flex-shrink-0 rounded-xl font-bold transition-all border-2 ${currentSlideIndex === i ? 'border-primary bg-primary text-white scale-110 shadow-lg' : 'border-white/10 bg-white/5 text-slate-400'}`}
              >
                {i + 1}
              </button>
            ))}
            <button onClick={addSlide} className="w-14 h-14 flex-shrink-0 bg-white/5 border-2 border-dashed border-white/10 text-slate-400 rounded-xl flex items-center justify-center hover:border-primary/50 transition-all">
              <Plus />
            </button>
          </div>
        </main>

        <footer className="p-6 bg-slate-900 border-t border-white/5 flex justify-around">
           <button onClick={() => setCurrentMode('Normal')} className={`flex flex-col items-center gap-1 ${currentMode === 'Normal' ? 'text-primary' : 'text-slate-500'}`}>
              <Layout className="w-6 h-6" />
              <span className="text-[10px] font-bold">Normal</span>
           </button>
           <button onClick={() => setCurrentMode('Simplified')} className={`flex flex-col items-center gap-1 ${currentMode === 'Simplified' ? 'text-primary' : 'text-slate-500'}`}>
              <Sparkles className="w-6 h-6" />
              <span className="text-[10px] font-bold">Simple</span>
           </button>
           <button onClick={() => setCurrentMode('Detailed')} className={`flex flex-col items-center gap-1 ${currentMode === 'Detailed' ? 'text-primary' : 'text-slate-500'}`}>
              <BookOpen className="w-6 h-6" />
              <span className="text-[10px] font-bold">Details</span>
           </button>
           <button 
            disabled={isImproving}
            onClick={() => handleImprove('make more professional')} 
            className={`flex flex-col items-center gap-1 ${isImproving ? 'opacity-30' : 'text-slate-500'}`}
           >
              <Zap className={`w-6 h-6 ${isImproving ? 'animate-pulse' : ''}`} />
              <span className="text-[10px] font-bold">Refine</span>
           </button>
        </footer>
      </div>
    );
  };

  const renderTemplates = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-slate-50 flex flex-col text-slate-900 selection:bg-primary/20">
      <header className="px-6 py-6 flex flex-col gap-6 bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('home')} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ChevronLeft /></button>
          <h2 className="text-xl font-bold">Templates</h2>
        </div>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search templates (science, history, design...)" 
            className="w-full bg-slate-100 border-none rounded-2xl py-4 pl-12 pr-6 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
          {CATEGORY_LIST.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {/* Start Blank Option */}
          <button 
            onClick={handleManualCreate}
            className="aspect-[4/5] bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 group hover:border-primary/50 hover:bg-primary/5 transition-all shadow-sm"
          >
             <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-md transition-all">
                <Plus className="w-8 h-8 text-slate-400 group-hover:text-primary" />
             </div>
             <span className="font-bold text-slate-400 group-hover:text-primary">Start Blank</span>
          </button>

          {Object.entries(TEMPLATE_METADATA)
            .filter(([title, t]) => {
              if (activeCategory === 'All') return true;
              return t.category === activeCategory;
            })
            .map(([title, t], i) => (
            <motion.button 
              key={i}
              whileHover={{ y: -5 }}
              onClick={() => {
                const template = findOfflineTemplate(title);
                if (template) {
                  const finalTemplate = { ...template, isManual: true };
                  setCurrentAssignment(finalTemplate);
                  setCurrentSlideIndex(0);
                  setCurrentMode('Normal');
                  setView('editor');
                }
              }}
              className="flex flex-col gap-3 text-left group"
            >
              <div className="aspect-[4/5] bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden relative">
                 <img 
                    src={`https://picsum.photos/seed/${t.keyword || title}/400/500`} 
                    referrerPolicy="no-referrer"
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                 />
                 <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                    <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">{t.category}</span>
                 </div>
              </div>
              <div>
                <h4 className="font-bold text-sm truncate">{title}</h4>
                <p className="text-[10px] text-slate-400 font-bold">12 Slides • Professional</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderPreview = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black z-[100] flex flex-col lg:flex-row">
       <div className="flex-1 flex items-center justify-center p-4 lg:p-12 relative">
          <div className="w-full max-w-5xl aspect-[16/9] bg-white rounded-lg shadow-2xl overflow-hidden relative group">
             {/* Slide Content (Simplified for preview) */}
             <div className="p-10 md:p-16 h-full flex flex-col justify-center text-slate-900">
                <h1 className="text-4xl md:text-7xl font-black mb-8 leading-tight tracking-tight">
                   {currentVersion(currentAssignment).slides[currentSlideIndex].title}
                </h1>
                <div className="space-y-6">
                   {currentVersion(currentAssignment).slides[currentSlideIndex].points.map((p, i) => (
                      <p key={i} className="text-xl md:text-3xl text-slate-600 leading-relaxed font-medium">
                        {p}
                      </p>
                   ))}
                </div>
             </div>
             
             {/* Overlay controls */}
             <div className="absolute inset-x-0 bottom-0 p-8 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-4">
                  <button onClick={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))} className="p-4 bg-black/50 text-white rounded-full backdrop-blur-md hover:bg-black/70 transition-all"><ChevronLeft /></button>
                  <button onClick={() => setCurrentSlideIndex(prev => Math.min(currentVersion(currentAssignment).slides.length - 1, prev + 1))} className="p-4 bg-black/50 text-white rounded-full backdrop-blur-md hover:bg-black/70 transition-all"><ChevronRight /></button>
                </div>
                <div className="px-6 py-3 bg-black/50 text-white rounded-full backdrop-blur-md text-sm font-bold">
                   {currentSlideIndex + 1} / {currentVersion(currentAssignment).slides.length}
                </div>
             </div>
          </div>
       </div>
       
       <div className="w-full lg:w-80 bg-slate-900 p-8 flex flex-col gap-8">
          <div className="flex justify-between items-center">
             <h2 className="text-xl font-bold text-white">Presentation Mode</h2>
             <button onClick={() => setView('editor')} className="p-2 bg-white/10 rounded-full text-white"><X /></button>
          </div>
          
          <div className="space-y-4 flex-1">
             <p className="text-slate-400 text-sm">Swipe or use arrow keys to navigate. Press ESC or the X button to exit.</p>
             <button onClick={() => setView('editor')} className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20">End Presentation</button>
          </div>
          
          <div className="flex items-center gap-4 text-white/40">
             <Monitor className="w-5 h-5" />
             <span className="text-xs font-bold uppercase tracking-widest">External Display Ready</span>
          </div>
       </div>
    </motion.div>
  );

  const renderDonation = () => {
    const upiId = '9699806803@ibl';
    const upiName = 'Developer';
    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&cu=INR`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUrl)}`;

    const handleDownloadQR = async () => {
      try {
        const response = await fetch(qrCodeUrl);
        const blob = await response.blob();
        saveAs(blob, 'developer_upi_qr.png');
      } catch (err) {
        console.error('Failed to download QR:', err);
      }
    };

    const handleDirectPay = () => {
      window.location.href = upiUrl;
      // Mark as potential donated state for future sessions
      const newPrefs = { ...prefs, hasDonated: true };
      setPrefs(newPrefs);
      localStorage.setItem('ai_studio_prefs', JSON.stringify(newPrefs));
    };

    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="fixed inset-0 z-[110] flex flex-col items-center justify-center p-4 md:p-6 bg-gradient-to-br from-blue-600 to-purple-700 overflow-y-auto"
      >
        <div className="w-full max-w-md text-center mb-6 md:mb-10 pt-10 md:pt-0">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight px-4">Support the Developer ❤️</h2>
          <p className="text-blue-100 text-base md:text-lg font-medium px-6">If you like this app, you can support me. <br className="hidden md:block"/> Totally optional! 🙌</p>
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-10 w-full max-w-md shadow-2xl flex flex-col items-center gap-6 md:gap-8 mx-auto"
        >
          <div className="text-center">
            <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-1">Donate via Alphabetical UPI</h3>
            <p className="text-slate-400 text-xs md:text-sm font-medium">Scan QR or click below to pay</p>
          </div>

          <div className="relative group w-48 h-48 md:w-64 md:h-64 bg-white rounded-2xl md:rounded-3xl flex items-center justify-center shadow-inner overflow-hidden border border-slate-100">
            <img 
              src={qrCodeUrl} 
              className="w-full h-full object-contain p-3 md:p-4 transition-transform group-hover:scale-105 duration-300" 
              alt="Developer UPI QR Code" 
              referrerPolicy="no-referrer"
            />
            
            <button 
              onClick={handleDownloadQR}
              className="absolute bottom-2 right-2 p-2.5 md:p-3 bg-primary text-white rounded-full shadow-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-primary/90 focus:opacity-100"
              title="Download QR Code"
            >
              <Download className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
          </div>

          <div className="w-full space-y-3">
            <button 
              onClick={handleDirectPay}
              className="w-full py-4 bg-primary text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 text-sm md:text-base"
            >
              <Heart className="w-4 h-4 md:w-5 md:h-5 fill-current" />
              Direct Pay with UPI
            </button>
            
            <button 
              onClick={handleDownloadQR}
              className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all text-sm md:text-base"
            >
              <Download className="w-4 h-4 md:w-5 md:h-5 text-slate-500" />
              Download QR Image
            </button>
          </div>

          <div className="text-center w-full mt-2">
            <p className="text-slate-400 text-[11px] md:text-xs font-medium italic">"Your support fuels this creative project!"</p>
          </div>
        </motion.div>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setView('home')}
          className="mt-8 md:mt-12 px-8 py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white font-bold transition-all border border-white/20 text-sm md:text-base"
        >
          Back to Home
        </motion.button>
      </motion.div>
    );
  };

  const renderThankYouPopup = () => (
    <AnimatePresence>
      {showThankYou && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-[32px] p-8 md:p-12 w-full max-w-sm text-center shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 via-red-500 to-purple-500" />
            
            <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-pink-500 fill-current animate-pulse" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Heartfelt Thanks!</h2>
            <p className="text-slate-500 leading-relaxed mb-8">
              Your support means the world to me. It helps keep this app free, updated, and growing every day. ❤️
            </p>
            
            <button 
              onClick={() => setShowThankYou(false)}
              className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-black/10"
            >
              You're Welcome! 🌟
            </button>
            
            <motion.div 
              className="absolute -bottom-10 -right-10 opacity-10"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-40 h-40" />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const handleExportImages = async () => {
    if (!currentAssignment || !slideRef.current) return;
    setIsExporting(true);
    try {
      const currentVersion = currentAssignment.versions.find(v => v.mode === currentMode) || currentAssignment.versions[0];
      const prevIndex = currentSlideIndex;
      
      for (let i = 0; i < currentVersion.slides.length; i++) {
        setCurrentSlideIndex(i);
        await new Promise(r => setTimeout(r, 800));
        const dataUrl = await toPng(slideRef.current, { pixelRatio: 2 });
        saveAs(dataUrl, `${currentAssignment.topic}_Slide_${i+1}.png`);
      }
      setCurrentSlideIndex(prevIndex);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const renderExport = () => (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="min-h-screen bg-slate-50 flex flex-col p-6 text-slate-900">
       <header className="flex items-center gap-4 mb-10">
          <button onClick={() => setView('editor')} className="p-2 bg-white rounded-full shadow-sm"><ChevronLeft /></button>
          <h2 className="text-2xl font-bold">Export Options</h2>
       </header>
       
       <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {[
               { id: 'pdf', icon: FileDown, label: 'Download PDF', desc: 'Best for printing and offline reading', color: 'bg-red-500', action: handleExportPDF },
               { id: 'pptx', icon: FileDown, label: 'Download PPTX', desc: 'Editable PowerPoint presentation', color: 'bg-orange-500', action: handleExportPPT },
               { id: 'images', icon: ImageIcon, label: 'Save as Images', desc: 'Saves each slide as high-res PNG', color: 'bg-blue-500', action: handleExportImages },
               { id: 'share', icon: Share2, label: 'Share Link', desc: 'Anyone with the link can view', color: 'bg-green-500' },
             ].map((opt) => (
                <button 
                  key={opt.id}
                  onClick={() => opt.action?.()}
                  className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-6 text-left hover:shadow-xl hover:scale-[1.02] transition-all group"
                >
                   <div className={`w-14 h-14 rounded-2xl ${opt.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                      <opt.icon className="w-7 h-7" />
                   </div>
                   <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{opt.label}</h3>
                      <p className="text-xs text-slate-400">{opt.desc}</p>
                   </div>
                   {isExporting && <Loader2 className="w-5 h-5 animate-spin text-slate-300" />}
                </button>
             ))}
          </div>

          <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10 mt-10">
             <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                   <Monitor className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold">Live Presentation</h3>
             </div>
             <p className="text-sm text-slate-500 mb-6">Open this presentation in a dedicated full-screen view for classrooms or meetings.</p>
             <button onClick={() => setView('preview')} className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/30">Open Presenter Mode</button>
          </div>
       </div>
    </motion.div>
  );

  const renderLibrary = () => (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="min-h-screen p-6">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => setView('home')} className="p-2 glass rounded-full"><ChevronLeft /></button>
        <h2 className="text-2xl font-bold">Assignment Library</h2>
      </header>
      <div className="space-y-4">
        {library.map(asst => (
          <div key={asst.id} className="relative group">
            <button 
              onClick={() => { setCurrentAssignment(asst); setView('editor'); }}
              className="w-full glass p-5 rounded-3xl flex items-center gap-5 text-left border border-white/5 hover:border-primary/50 transition-all"
            >
              <div className="p-4 bg-primary/10 rounded-2xl">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg mb-1">{asst.topic}</h4>
                <div className="flex gap-2">
                  <span className="text-[10px] px-2 py-0.5 bg-slate-800 rounded-full text-slate-400">{asst.teacherMode}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-slate-800 rounded-full text-slate-400">{asst.language}</span>
                </div>
              </div>
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setLibrary(prev => prev.filter(a => a.id !== asst.id));
              }}
              className="absolute top-4 right-4 p-2 bg-red-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const renderProfile = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen p-6">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => setView('home')} className="p-2 glass rounded-full"><ChevronLeft /></button>
        <h2 className="text-2xl font-bold">Settings</h2>
      </header>

      <div className="glass p-6 rounded-3xl mb-8 flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-4 border-2 border-primary/50">
          <User className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-xl font-bold">User Guest</h3>
        <p className="text-slate-500 text-sm">{library.length} Projects Saved</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-xs text-slate-500 mb-2 block uppercase font-bold tracking-wider">Context Preferences</label>
          <div className="glass rounded-3xl overflow-hidden divide-y divide-white/5">
             <div className="p-5 flex items-center justify-between">
              <span className="font-medium">Current Class</span>
              <select 
                value={prefs.userClass}
                onChange={(e) => setPrefs({...prefs, userClass: e.target.value})}
                className="bg-transparent text-primary font-bold outline-none"
              >
                {['8th Grade', '10th Grade', '12th Grade', 'Bachelor Degree', 'Masters'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="p-5 flex items-center justify-between">
              <span className="font-medium">Default Language</span>
              <select 
                value={prefs.language}
                onChange={(e) => setPrefs({...prefs, language: e.target.value})}
                className="bg-transparent text-primary font-bold outline-none"
              >
                {INDIAN_LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-500 mb-2 block uppercase font-bold tracking-wider">UI Customization</label>
          <div className="glass rounded-3xl overflow-hidden divide-y divide-white/5">
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <PaletteIcon className="w-4 h-4 text-slate-500" />
                <span className="font-medium">Theme Color</span>
              </div>
              <div className="flex gap-2">
                {['#6C63FF', '#EF4444', '#10B981', '#F59E0B'].map(c => (
                  <button 
                    key={c} 
                    onClick={() => setPrefs({...prefs, themeColor: c})}
                    className={`w-6 h-6 rounded-full border-2 ${prefs.themeColor === c ? 'border-white' : 'border-transparent'}`} 
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Type className="w-4 h-4 text-slate-500" />
                <span className="font-medium">Font Size</span>
              </div>
              <select 
                value={prefs.fontSize}
                onChange={(e) => setPrefs({...prefs, fontSize: e.target.value as any})}
                className="bg-transparent text-primary font-bold outline-none"
              >
                {['small', 'medium', 'large'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
             <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Save className="w-4 h-4 text-slate-500" />
                <span className="font-medium">Manual Backup Only</span>
              </div>
              <div className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black text-slate-500">ACTIVE</div>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setView('donation')}
          className="w-full py-4 bg-primary/10 text-primary font-bold flex items-center justify-center gap-2 rounded-2xl mb-4 hover:bg-primary/20 transition-all"
        >
          <Heart className="w-5 h-5 fill-current" />
          Support the Developer
        </button>

        <button 
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          className="w-full py-4 text-red-500 font-bold flex items-center justify-center gap-2 glass rounded-2xl"
        >
          <Trash2 className="w-5 h-5" />
          Reset All Data
        </button>
      </div>
    </motion.div>
  );

  const handleExportPDF = async () => {
    if (!currentAssignment || !slideRef.current) return;
    setIsExporting(true);
    try {
      const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape for presentation style
      const currentVersion = currentAssignment.versions.find(v => v.mode === currentMode) || currentAssignment.versions[0];
      
      const prevIndex = currentSlideIndex;
      
      for (let i = 0; i < currentVersion.slides.length; i++) {
        setCurrentSlideIndex(i);
        // Wait longer for charts/images to settle
        await new Promise(r => setTimeout(r, 800));
        
        const canvas = await toPng(slideRef.current, { 
          pixelRatio: 2,
          skipFonts: false,
          style: { transform: 'scale(1)', transformOrigin: 'top left' }
        });
        
        if (i > 0) pdf.addPage();
        const imgProps = pdf.getImageProperties(canvas);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(canvas, 'PNG', 0, 0, pdfWidth, pdfHeight);
      }
      
      setCurrentSlideIndex(prevIndex);
      pdf.save(`${currentAssignment.topic.replace(/\s+/g, '_')}_Assignment.pdf`);
    } catch (err) {
      console.error(err);
      alert("PDF Export error: Please try opening the app in a new tab if it persists.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportImage = async () => {
    if (!slideRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(slideRef.current, { 
        pixelRatio: 3,
        backgroundColor: currentMode === 'Handwritten' ? '#ffffff' : '#0f172a'
      });
      saveAs(dataUrl, `${currentAssignment?.topic}_Slide_${currentSlideIndex + 1}.png`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPPT = async () => {
    if (!currentAssignment) return;
    setIsExporting(true);
    try {
      const pres = new pptxgen();
      const currentVersion = currentAssignment.versions.find(v => v.mode === currentMode) || currentAssignment.versions[0];
      
      pres.title = currentAssignment.topic;
      
      currentVersion.slides.forEach(slide => {
        const pptSlide = pres.addSlide();
        
        // Background color based on mode
        if (currentMode === 'Handwritten') {
          pptSlide.background = { color: 'FFFFFF' };
        } else {
          pptSlide.background = { color: '0F172A' };
        }

        // Title
        const stripHtml = (html: string) => {
          const tmp = document.createElement('DIV');
          tmp.innerHTML = html;
          return tmp.textContent || tmp.innerText || '';
        };

        pptSlide.addText(stripHtml(slide.title), { 
          x: 0.5, y: 0.5, w: '90%', h: 1, 
          fontSize: 24, bold: true, color: currentMode === 'Handwritten' ? '000000' : 'FFFFFF',
          align: 'center'
        });

        // Points
        const pointsText = slide.points.map(p => ({ text: stripHtml(p), options: { bullet: true, fontSize: 16 } }));
        pptSlide.addText(pointsText, { 
          x: 0.5, y: 1.5, w: '90%', h: '60%',
          color: currentMode === 'Handwritten' ? '444444' : 'CCCCCC',
          align: 'left',
          valign: 'top'
        });

        // Attribution
        pptSlide.addText("Generated by Gen AI Workspace", {
          x: 0.5, y: 5.2, w: '90%', fontSize: 10, italic: true, color: '888888', align: 'right'
        });
      });

      await pres.writeFile({ fileName: `${currentAssignment.topic.replace(/\s+/g, '_')}_Presentation.pptx` });
    } catch (err) {
      console.error(err);
      alert("PPT Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };


  return (
    <div className={`min-h-screen relative overflow-x-hidden selection:bg-primary/30 ${view === 'home' ? 'max-w-7xl mx-auto' : ''}`}>
      <AnimatePresence mode="wait">
        {view === 'splash' && renderSplash()}
        {view === 'home' && renderHome()}
        {view === 'create' && renderCreate()}
        {view === 'loading' && renderLoading()}
        {view === 'editor' && renderEditor()}
        {view === 'library' && renderLibrary()}
        {view === 'profile' && renderProfile()}
        {view === 'templates' && renderTemplates()}
        {view === 'export' && renderExport()}
        {view === 'preview' && renderPreview()}
        {view === 'donation' && renderDonation()}
      </AnimatePresence>
      {renderUsageModal()}
      {renderThankYouPopup()}
      {(view === 'editor' && isImproving) && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm">
           <div className="glass p-6 rounded-3xl flex items-center gap-4">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <span className="font-bold">AI Improving Content...</span>
           </div>
        </div>
      )}
      {isExporting && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex flex-col items-center justify-center backdrop-blur-md">
           <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-20 h-20 rounded-full border-4 border-primary border-t-transparent mb-6" />
           <h3 className="text-xl font-bold mb-2">Generating Files...</h3>
           <p className="text-slate-400 text-sm">Capturing slides and formatting document</p>
        </div>
      )}
    </div>
  );
}

