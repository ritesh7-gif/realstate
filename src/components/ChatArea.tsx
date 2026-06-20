import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp, ThumbsDown, ThumbsUp, Copy, Pencil, Check, Mic, X, Map, Search, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';
import { ChatMessage, Property } from '../types';
import PropertyCard from './PropertyCard';
import PropertyDetails from './PropertyDetails';
import { fetchOpenAIChat } from '../utils/openai';

interface ChatAreaProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  onExploreAll?: () => void;
  userName?: string;
  onSideWindowToggle?: (isOpen: boolean) => void;
}

const suggestions = [
  "Residential Land",
  "Farm Land",
  "Investment Land",
  "Roadside Land",
  "Premium Land"
];

const featuredProperties: Property[] = [
  {
    id: "f1",
    name: "Crown Forest Villas",
    type: "Luxury Villa",
    location: "Khandala, Maharashtra",
    price: "₹15.5 Cr",
    area: "8,500 sq ft",
    shortDescription: "Ultra-luxury villas nested in Khandala forests overlooking the valley.",
    longDescription: "Crown Forest Villas bring you an unmatched experience of living in harmony with nature without compromising on world-class amenities. Complete with private pools, home theaters, and landscaped gardens.",
    features: ["Private Pool", "Home Theater", "Forest View", "Smart Home"],
    imageUrl: "https://images.unsplash.com/photo-1613490901237-8ddb1dd79691?auto=format&fit=crop&q=80&w=800",
    investmentHighlights: ["High capital appreciation", "Exclusive community", "Premium rentals"]
  },
  {
    id: "f2",
    name: "Horizon Commercial Tower",
    type: "Commercial Office",
    location: "Kharadi, Pune",
    price: "From ₹5 Cr",
    area: "2,000 - 15,000 sq ft",
    shortDescription: "Grade-A IT office spaces in the heart of Pune's commercial hub.",
    longDescription: "Horizon Tower features LEED-certified sustainable architecture, column-less floor plates, high-speed elevators, and a central location to attract top talent.",
    features: ["LEED Certified", "Central AC", "Cafeteria", "Ample Parking"],
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
    investmentHighlights: ["Pre-leased options available", "8-10% rental yield expected", "Prime IT corridor"]
  },
  {
    id: "f3",
    name: "Verdant Farm Plots",
    type: "Farm Land",
    location: "Mulshi, Pune",
    price: "From ₹1.2 Cr",
    area: "1 Acre+",
    shortDescription: "Scenic farm plots by the Mulshi lake, perfect for a second home.",
    longDescription: "Build your dream organic farm or a weekend getaway home at Verdant Farm Plots. Includes basic infrastructure like internal roads, water connection, and electricity to the plot.",
    features: ["Lake View", "Road Access", "Water Connection", "Fenced"],
    imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800",
    investmentHighlights: ["Rapid development in Mulshi", "Tourism potential", "Organic farming ready"]
  }
];

export default function ChatArea({ messages, setMessages, onExploreAll, userName = "Guest", onSideWindowToggle }: ChatAreaProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  
  const [feedback, setFeedback] = useState<Record<string, 'like' | 'dislike'>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Onboarding States
  const [hasShownProperties, setHasShownProperties] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState({ 
    type: '', 
    location: '', 
    budget: '',
    size: '',
    features: '',
    timeline: ''
  });
  const [tempLocation, setTempLocation] = useState("");
  const [step4Question, setStep4Question] = useState("");
  const [step4Suggestions, setStep4Suggestions] = useState<string[]>([]);
  const [step4Input, setStep4Input] = useState("");

  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const isStarted = hasShownProperties || messages.filter((m: any) => !m.isHidden).length > 0;

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (onSideWindowToggle) {
      onSideWindowToggle(!!selectedProperty);
    }
  }, [selectedProperty, onSideWindowToggle]);

  const submitOnboardingStep3 = (budget: string) => {
    setOnboardingData(prev => ({ ...prev, budget }));
    setOnboardingStep(4);
  };

  const submitOnboardingStep4 = (size: string) => {
    setOnboardingData(prev => ({ ...prev, size }));
    setOnboardingStep(5);
  };

  const submitOnboardingStep5 = (features: string) => {
    setOnboardingData(prev => ({ ...prev, features }));
    setOnboardingStep(6);
  };

  const submitOnboardingStep6 = async (timeline: string) => {
    const completeData = { ...onboardingData, timeline };
    setOnboardingData(completeData);
    setOnboardingStep(7); // Loading step
    setIsLoading(true);

    try {
      const initialPrompt = `I am looking for a ${completeData.type} in ${completeData.location} with a budget of ${completeData.budget}. Preferred land size is ${completeData.size}. Key features required: ${completeData.features}. Target utilization timeline: ${timeline}.`;
      
      const data = await fetchOpenAIChat(initialPrompt, []);
      
      if (data.functionCall && data.functionCall.name === 'recommendProperties') {
          setHasShownProperties(true);
          setMessages([
              { id: Date.now().toString(), role: 'user', content: initialPrompt, isHidden: true } as any,
              { id: (Date.now() + 1).toString(), role: 'ai', content: data.text, properties: data.functionCall.arguments.properties, suggestions: data.suggestions } as any
          ]);
      } else {
          // Fallback just in case it disobeys constraints
          setHasShownProperties(true);
          setMessages([
              { id: Date.now().toString(), role: 'user', content: initialPrompt, isHidden: true } as any,
              { id: (Date.now() + 1).toString(), role: 'ai', content: data.text, suggestions: data.suggestions } as any
          ]);
      }
    } catch (e) {
      console.error(e);
      // fallback
      setHasShownProperties(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSend = async (messageId: string, newText: string) => {
    if (!newText.trim()) return;
    const targetIndex = messages.findIndex(m => m.id === messageId);
    if (targetIndex === -1) return;
    
    // slice the messages up to the targetIndex (drop the edited message and everything after)
    const historyToKeep = messages.slice(0, targetIndex);
    const newMessages: ChatMessage[] = [...historyToKeep, { id: Date.now().toString(), role: 'user', content: newText }];
    
    setMessages(newMessages);
    setEditingId(null);
    setIsLoading(true);

    try {
      const data = await fetchOpenAIChat(newText, historyToKeep);
      
      const aiMessage: ChatMessage = {
         id: (Date.now() + 1).toString(),
         role: 'ai',
         content: data.text || "Here are some excellent options I found for you:",
         properties: data.functionCall?.name === 'recommendProperties' ? data.functionCall.arguments.properties : undefined,
         suggestions: data.suggestions
      };

      setMessages([...newMessages, aiMessage]);
    } catch (error) {
      console.error(error);
      setMessages([...newMessages, { id: 'err', role: 'ai', content: "Sorry, an error occurred while connecting to the AI." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (text: string) => {
    let finalMsg = text;
    if (!finalMsg.trim() && isRecording) {
      finalMsg = "I am looking for some luxury villas or real estate options.";
    }
    if (!finalMsg.trim()) return;
    
    setInput('');
    setIsRecording(false);
    const newMessages: ChatMessage[] = [...messages, { id: Date.now().toString(), role: 'user', content: finalMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const data = await fetchOpenAIChat(text, messages);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: data.text || "Here are some excellent options I found for you:",
        properties: data.functionCall?.name === 'recommendProperties' ? data.functionCall.arguments.properties : undefined,
        suggestions: data.suggestions
      };

      setMessages([...newMessages, aiMessage]);
    } catch (error) {
      console.error(error);
      setMessages([...newMessages, { id: 'err', role: 'ai', content: "Sorry, an error occurred while connecting to the AI." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex h-full w-full bg-transparent relative overflow-hidden">
      <div className={`flex flex-col h-full transition-all duration-300 relative z-10 shrink-0 ${selectedProperty ? 'w-full md:w-[65%] border-r border-gray-200/50' : 'w-full'} ${!isStarted ? 'overflow-y-auto overflow-x-hidden scroll-smooth' : 'overflow-hidden'}`}>
        {!isStarted && (
          <div className="absolute top-[45vh] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] max-w-[1000px] h-[600px] bg-gradient-to-tr from-blue-300/30 via-indigo-300/20 to-purple-300/30 blur-[90px] rounded-full pointer-events-none -z-10 opacity-0" />
        )}

      {isStarted && (
        <div className="absolute inset-0 overflow-y-auto px-4 md:px-8 pb-32">
          <div className="w-full max-w-4xl mx-auto space-y-12 pb-8 pt-8">
            <AnimatePresence>
            {messages.filter((m: any) => !m.isHidden).map((msg, index) => (
              <motion.div 
                layout
                key={msg.id}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className={`flex flex-col group/message ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                {editingId === msg.id ? (
                  <div className="w-full max-w-[85%] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                     <textarea 
                       value={editContent}
                       onChange={(e) => setEditContent(e.target.value)}
                       onKeyDown={(e) => {
                         if (e.key === 'Enter' && !e.shiftKey) {
                           e.preventDefault();
                           handleEditSend(msg.id, editContent);
                         }
                       }}
                       className="w-full bg-transparent p-4 outline-none resize-none text-gray-900"
                       rows={3}
                       autoFocus
                     />
                     <div className="flex items-center justify-end gap-2 p-3 bg-gray-50 border-t border-gray-100">
                       <button onClick={() => setEditingId(null)} className="px-4 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-200/50 rounded-full transition-colors">Cancel</button>
                       <button onClick={() => handleEditSend(msg.id, editContent)} className="px-4 py-1.5 text-sm font-medium text-white bg-[var(--color-royal-blue)] hover:bg-blue-600 rounded-full transition-colors">Save & Submit</button>
                     </div>
                  </div>
                ) : (
                  <>
                    <div 
                      className={`max-w-[85%] py-4 rounded-[1.5rem] ${
                        msg.role === 'user' 
                          ? 'bg-blue-600 text-white shadow-sm px-6 font-medium' 
                          : 'bg-white/80 backdrop-blur-md text-gray-900 shadow-sm border border-gray-100 px-6 font-light leading-relaxed'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <span className="whitespace-pre-wrap">{msg.content}</span>
                      ) : (
                        <div className="markdown-body">
                          <Markdown>{msg.content}</Markdown>
                        </div>
                      )}
                    </div>
                    
                    {msg.properties && msg.properties.length > 0 && (
                      <div className="mt-6 mb-6 grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
                        {msg.properties.map((p, idx) => (
                          <PropertyCard key={idx} property={p} onViewDetails={() => setSelectedProperty(p)} />
                        ))}
                      </div>
                    )}

                    {msg.suggestions && msg.suggestions.length > 0 && index === messages.length - 1 && (
                      <div className="mt-5 mb-2 flex flex-wrap gap-3 w-full max-w-[85%]">
                        {msg.suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(suggestion)}
                            disabled={isLoading}
                            className="text-left px-5 py-2.5 bg-white border border-blue-200 hover:border-blue-400 text-blue-700 rounded-full text-sm font-medium transition-all hover:bg-blue-50 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className={`flex items-center gap-3 mt-3 transition-opacity ${msg.role === 'user' ? 'justify-end opacity-0 group-hover/message:opacity-100 mr-2' : 'justify-start opacity-100 ml-2'}`}>
                       {msg.role === 'user' ? (
                          <>
                             <button onClick={() => { setEditingId(msg.id); setEditContent(msg.content); }} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" title="Edit message"><Pencil className="w-4 h-4" /></button>
                             <button onClick={() => handleCopy(msg.id, msg.content)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" title="Copy message">
                               {copiedId === msg.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                             </button>
                          </>
                       ) : (
                          <>
                             <button onClick={() => setFeedback(prev => ({ ...prev, [msg.id]: 'like' }))} className={`p-1 hover:bg-gray-100 rounded-full transition-colors ${feedback[msg.id] === 'like' ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-700'}`} title="Good response"><ThumbsUp className="w-4 h-4" /></button>
                             <button onClick={() => setFeedback(prev => ({ ...prev, [msg.id]: 'dislike' }))} className={`p-1 hover:bg-gray-100 rounded-full transition-colors ${feedback[msg.id] === 'dislike' ? 'text-red-600 bg-red-50' : 'text-gray-400 hover:text-gray-700'}`} title="Bad response"><ThumbsDown className="w-4 h-4" /></button>
                             <button onClick={() => handleCopy(msg.id, msg.content)} className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors" title="Copy message">
                               {copiedId === msg.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                             </button>
                          </>
                       )}
                    </div>
                  </>
                )}
              </motion.div>
            ))}
            </AnimatePresence>
            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex self-start px-2 py-4">
                <div className="flex gap-1.5 items-center">
                  <div className="w-2 h-2 bg-[var(--color-royal-blue)]/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-[var(--color-royal-blue)]/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-[var(--color-royal-blue)]/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}
            <div ref={endOfMessagesRef} />
          </div>
        </div>
      )}

      <div 
         className={`w-full max-w-4xl px-4 md:px-6 flex flex-col mx-auto transition-all duration-300 ${isStarted ? 'absolute bottom-0 left-0 right-0 z-20 pb-8 pt-4 bg-transparent' : 'flex-1 justify-center'}`}
      >
         {!isStarted ? (
            <div className="flex flex-col items-center justify-center w-full">
                {onboardingStep === 1 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col items-center w-full">
                    {userName && (
                      <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="text-gray-600 font-medium text-2xl md:text-3xl mb-4 tracking-wide">
                        Welcome back, <span className="font-semibold text-[var(--color-royal-blue)]">{userName}</span>
                      </motion.p>
                    )}
                    <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900 text-center mb-10">
                      What are you looking for today?
                    </motion.h2>
                    <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-3xl mx-auto">
                      {["Residential Land", "Farm Land", "Investment Land", "Roadside Land", "Premium Land"].map((s, i) => (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                          whileHover={{ y: -4, scale: 1.02, boxShadow: "0 20px 40px -10px rgba(28,61,114,0.15), 0 10px 20px -10px rgba(28,61,114,0.1)" }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => { setTimeout(() => { setOnboardingData(prev => ({...prev, type: s})); setOnboardingStep(2); }, 150) }}
                          className="px-6 py-4 rounded-[1.25rem] border border-white/60 bg-white/40 backdrop-blur-xl text-gray-700 font-medium hover:bg-[var(--color-royal-blue)] hover:text-white hover:border-[var(--color-royal-blue)] transition-colors text-base shadow-lg whitespace-nowrap shrink-0 group relative overflow-hidden"
                        >
                          <span className="relative z-10">{s}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {onboardingStep === 2 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col items-center w-full max-w-xl mx-auto">
                    <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900 text-center mb-10">
                      Which city or locality are you interested in?
                    </motion.h2>
                    <motion.form 
                      initial={{ opacity: 0, y: 20, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      onSubmit={(e) => { e.preventDefault(); if (tempLocation.trim()) { setOnboardingData(prev => ({...prev, location: tempLocation.trim()})); setOnboardingStep(3); } }} 
                      className="w-full relative shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] ring-1 ring-gray-200/60 rounded-[2rem] bg-white/60 backdrop-blur-2xl group transition-all"
                    >
                       <input autoFocus type="text" value={tempLocation} onChange={e => setTempLocation(e.target.value)} placeholder="e.g. Pune, Mumbai, Khandala..." className="w-full bg-transparent text-gray-900 pl-6 pr-16 py-[1.25rem] rounded-[2rem] outline-none transition-all text-sm md:text-base placeholder:text-gray-500 font-medium z-10" />
                       <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center z-20">
                         <button type="submit" disabled={!tempLocation.trim()} className="p-3 bg-[var(--color-royal-blue)] text-white rounded-full hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 transition-all flex items-center justify-center shadow-md">
                           <ArrowUp className="w-5 h-5" />
                         </button>
                       </div>
                    </motion.form>
                    <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
                      {["Pune", "Mumbai", "Nashik", "Bangalore", "Hyderabad"].map((city, i) => (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                          whileHover={{ y: -2, scale: 1.04, boxShadow: "0 10px 20px -10px rgba(0,0,0,0.1)" }}
                          whileTap={{ scale: 0.96 }}
                          type="button"
                          onClick={() => { setTempLocation(city); setTimeout(() => { setOnboardingData(prev => ({...prev, location: city})); setOnboardingStep(3); }, 150); }}
                          className="px-5 py-2.5 rounded-full border border-white/60 bg-white/50 backdrop-blur-xl text-gray-700 font-medium hover:bg-[var(--color-royal-blue)] hover:text-white hover:border-[var(--color-royal-blue)] transition-colors text-sm shadow-sm whitespace-nowrap shrink-0"
                        >
                          {city}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {onboardingStep === 3 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col items-center w-full">
                    <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900 text-center mb-10">
                      What is your budget?
                    </motion.h2>
                    <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-3xl mx-auto">
                      {["Under ₹25L", "₹25L – ₹50L", "₹50L – ₹1Cr", "Above ₹1Cr"].map((s, i) => (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                          whileHover={{ y: -4, scale: 1.02, boxShadow: "0 20px 40px -10px rgba(28,61,114,0.15), 0 10px 20px -10px rgba(28,61,114,0.1)" }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => { setTimeout(() => submitOnboardingStep3(s), 150) }}
                          className="px-6 py-4 rounded-[1.25rem] border border-white/60 bg-white/40 backdrop-blur-xl text-gray-700 font-medium hover:bg-[var(--color-royal-blue)] hover:text-white hover:border-[var(--color-royal-blue)] transition-colors text-base shadow-lg whitespace-nowrap shrink-0 group relative overflow-hidden"
                        >
                          <span className="relative z-10">{s}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {onboardingStep === 4 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col items-center w-full">
                    <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900 text-center mb-10">
                      What is your preferred plot size or area?
                    </motion.h2>
                    <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-3xl mx-auto">
                      {["Under 2,000 Sq Ft", "2,000 – 5,000 Sq Ft", "5,000 – 10,000 Sq Ft", "10,000 Sq Ft – 1 Acre", "Above 1 Acre"].map((s, i) => (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                          whileHover={{ y: -4, scale: 1.02, boxShadow: "0 20px 40px -10px rgba(28,61,114,0.15), 0 10px 20px -10px rgba(28,61,114,0.1)" }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => { setTimeout(() => submitOnboardingStep4(s), 150) }}
                          className="px-6 py-4 rounded-[1.25rem] border border-white/60 bg-white/40 backdrop-blur-xl text-gray-700 font-medium hover:bg-[var(--color-royal-blue)] hover:text-white hover:border-[var(--color-royal-blue)] transition-colors text-base shadow-lg whitespace-nowrap shrink-0 group relative overflow-hidden"
                        >
                          <span className="relative z-10">{s}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {onboardingStep === 5 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col items-center w-full">
                    <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900 text-center mb-10">
                      Which key features or approvals do you require?
                    </motion.h2>
                    <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-3xl mx-auto">
                      {["PMRDA Approved", "Gated Community", "Road-Touch Access", "Scenic Lake/Valley View", "Clear Title / Ready Possession"].map((s, i) => (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                          whileHover={{ y: -4, scale: 1.02, boxShadow: "0 20px 40px -10px rgba(28,61,114,0.15), 0 10px 20px -10px rgba(28,61,114,0.1)" }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => { setTimeout(() => submitOnboardingStep5(s), 150) }}
                          className="px-6 py-4 rounded-[1.25rem] border border-white/60 bg-white/40 backdrop-blur-xl text-gray-700 font-medium hover:bg-[var(--color-royal-blue)] hover:text-white hover:border-[var(--color-royal-blue)] transition-colors text-base shadow-lg whitespace-nowrap shrink-0 group relative overflow-hidden"
                        >
                          <span className="relative z-10">{s}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {onboardingStep === 6 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col items-center w-full">
                    <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900 text-center mb-10">
                      What is your timeline for acquisition or construction?
                    </motion.h2>
                    <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-3xl mx-auto">
                      {["Immediate (Within 3 Months)", "Short-Term (3 – 12 Months)", "Medium-Term (1 – 3 Years)", "Long-Term / Investment Holding"].map((s, i) => (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                          whileHover={{ y: -4, scale: 1.02, boxShadow: "0 20px 40px -10px rgba(28,61,114,0.15), 0 10px 20px -10px rgba(28,61,114,0.1)" }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => { setTimeout(() => submitOnboardingStep6(s), 150) }}
                          className="px-6 py-4 rounded-[1.25rem] border border-white/60 bg-white/40 backdrop-blur-xl text-gray-700 font-medium hover:bg-[var(--color-royal-blue)] hover:text-white hover:border-[var(--color-royal-blue)] transition-colors text-base shadow-lg whitespace-nowrap shrink-0 group relative overflow-hidden"
                        >
                          <span className="relative z-10">{s}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {onboardingStep === 7 && (
                  <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col items-center w-full max-w-xl mx-auto py-24">
                     <div className="mb-6 py-4">
                       <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                     </div>
                     <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-xl font-medium tracking-tight text-gray-600 text-center">
                       Finding your ideal properties...
                     </motion.h2>
                  </motion.div>
                )}
            </div>
         ) : (
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }} 
            className="w-full max-w-2xl mx-auto relative shadow-[0_8px_30px_rgb(0,0,0,0.08)] ring-1 ring-gray-200 rounded-[2rem] bg-white group transition-all"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isRecording ? "Listening..." : "Ask about these properties..."}
              disabled={isRecording}
              className="w-full bg-transparent text-gray-900 pl-4 pr-[7rem] md:pl-6 md:pr-[9rem] py-[1.125rem] rounded-[2rem] outline-none transition-all text-sm md:text-base placeholder:text-gray-500 font-medium z-10 disabled:opacity-50"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 z-20">
              {isRecording ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100/90 text-red-600 rounded-full animate-pulse mr-1">
                     <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                     <span className="text-xs font-semibold uppercase tracking-wider">Rec</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsRecording(false)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-[22px] h-[22px]" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsRecording(true)}
                  className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-200/50 rounded-full transition-colors flex items-center justify-center cursor-pointer"
                >
                  <Mic className="w-[22px] h-[22px]" />
                </button>
              )}
              <button 
                type="submit" 
                disabled={!input.trim() && !isRecording}
                className="p-2.5 bg-[var(--color-royal-blue)] text-white rounded-full hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center ml-1"
              >
                <ArrowUp className="w-5 h-5" />
              </button>
            </div>
          </form>
         )}
      </div>


      </div>

      {/* Desktop Side Panel */}
      <AnimatePresence>
        {selectedProperty && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "35%", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="h-full bg-white relative z-10 hidden md:block overflow-hidden shrink-0"
          >
            <PropertyDetails 
              property={selectedProperty} 
              onClose={() => setSelectedProperty(null)} 
              onInterest={(val) => {
                 setMessages([...messages, { 
                   id: Date.now().toString(), 
                   role: 'user', 
                   content: `I am interested in ${val.name}. My details: ${val.details}.` 
                 }]);
                 setIsLoading(true);
                 setTimeout(() => {
                   setMessages(m => [
                     ...m, 
                     { id: Date.now().toString(), role: 'ai', content: `Thank you! I have recorded your interest in ${val.name}. One of our senior associates will contact you shortly to arrange a visit.` }
                   ]);
                   setIsLoading(false);
                 }, 1000);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {selectedProperty && (
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="absolute inset-0 bg-white z-50 md:hidden h-full w-full flex flex-col overflow-hidden"
          >
            <PropertyDetails 
              property={selectedProperty} 
              onClose={() => setSelectedProperty(null)} 
              onInterest={(val) => {
                 setMessages([...messages, { 
                   id: Date.now().toString(), 
                   role: 'user', 
                   content: `I am interested in ${val.name}. My details: ${val.details}.` 
                 }]);
                 setIsLoading(true);
                 setTimeout(() => {
                   setMessages(m => [
                     ...m, 
                     { id: Date.now().toString(), role: 'ai', content: `Thank you! I have recorded your interest in ${val.name}. One of our senior associates will contact you shortly to arrange a visit.` }
                   ]);
                   setIsLoading(false);
                 }, 1000);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
