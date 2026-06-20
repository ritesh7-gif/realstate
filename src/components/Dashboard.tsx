import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import ExploreProperties from './ExploreProperties';
import { ChatMessage } from '../types';
import { AnimatePresence, motion } from 'motion/react';
import { Menu, Building2 } from 'lucide-react';

const defaultProfile = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+91 98765 43210'
};

export default function Dashboard() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // Closed by default for full-screen experience
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSideWindowOpen, setIsSideWindowOpen] = useState(false);
  const [isMobileMenuHovered, setIsMobileMenuHovered] = useState(false);
  const [activePage, setActivePage] = useState<'ai' | 'explore' | 'saved' | 'settings' | 'profile'>('ai');
  const [savedPropertyIds, setSavedPropertyIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('savedPropertyIds');
    return saved ? JSON.parse(saved) : [];
  });
  
  useEffect(() => {
    localStorage.setItem('savedPropertyIds', JSON.stringify(savedPropertyIds));
  }, [savedPropertyIds]);

  const toggleSaveProperty = (id: string) => {
    setSavedPropertyIds(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };
  
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : defaultProfile;
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    alert('Profile saved successfully!');
  };

  const handleInterest = (val: any) => {
    setMessages(prev => [...prev, { 
      id: Date.now().toString(), 
      role: 'user', 
      content: `I am interested in ${val.name}. My details: ${val.details}.` 
    }]);
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(m => [
        ...m, 
        { id: Date.now().toString(), role: 'ai', content: `Thank you! I have recorded your interest in ${val.name}. One of our senior associates will contact you shortly to arrange a visit.` }
      ]);
    }, 1000);
  };

  const handleNewChat = () => {
    setActivePage('ai');
    setMessages([]);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-[100dvh] w-full bg-slate-50 font-sans relative overflow-hidden">
      {/* Blurred Property Background */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-slate-50 overflow-hidden">
        <div 
          className="absolute inset-[-5%] bg-[url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center blur-[12px] opacity-70"
        />
        <div className="absolute inset-0 bg-white/50 backdrop-blur-xl"></div>
      </div>

      {/* Overlay for mobile sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="absolute inset-0 bg-black/10 z-30 transition-opacity md:hidden"
             onClick={() => setIsSidebarOpen(false)}
           />
        )}
      </AnimatePresence>
      
      <div className="hidden md:block h-full relative z-30 shrink-0">
        <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} activePage={activePage} setActivePage={setActivePage} onNewChat={handleNewChat} isSideWindowOpen={activePage === 'ai' && isSideWindowOpen} />
      </div>

      <div className={`md:hidden absolute top-0 left-0 bottom-0 z-40 transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar isOpen={true} onToggle={() => setIsSidebarOpen(false)} activePage={activePage} setActivePage={setActivePage} onNewChat={handleNewChat} isSideWindowOpen={activePage === 'ai' && isSideWindowOpen} />
      </div>
      
      <main className="flex-1 relative flex flex-col min-w-0 transition-all h-full overflow-hidden bg-transparent">
        {/* Header for toggling sidebar on mobile */}
        <div className="absolute top-0 left-0 p-4 flex items-center z-20 md:hidden">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            onMouseEnter={() => setIsMobileMenuHovered(true)}
            onMouseLeave={() => setIsMobileMenuHovered(false)}
            className="p-2.5 hover:bg-white/80 rounded-xl transition-all text-gray-700 backdrop-blur-md shadow-sm border border-white/40 shrink-0 flex items-center justify-center w-11 h-11 cursor-pointer bg-white/60 animate-in fade-in duration-200"
            title="Open menu"
          >
            {isMobileMenuHovered ? (
              <Menu className="w-6 h-6 text-gray-700 animate-in fade-in zoom-in duration-200" />
            ) : (
              <div className="p-1.5 bg-gradient-to-br from-blue-900 to-slate-800 rounded-lg text-white shadow-sm shrink-0 flex items-center justify-center animate-in fade-in zoom-in duration-200">
                <Building2 className="w-4 h-4" />
              </div>
            )}
          </button>
        </div>

        <div className={activePage === 'ai' ? 'contents' : 'hidden'}>
          <ChatArea messages={messages} setMessages={setMessages} onExploreAll={() => setActivePage('explore')} userName={userProfile.firstName} onSideWindowToggle={(isOpen) => setIsSideWindowOpen(isOpen)} />
        </div>
        <div className={activePage === 'explore' ? 'contents' : 'hidden'}>
          <ExploreProperties 
            onInterest={handleInterest} 
            onBackToChat={() => setActivePage('ai')} 
            savedPropertyIds={savedPropertyIds}
            onSaveProperty={toggleSaveProperty}
          />
        </div>
        <div className={activePage === 'saved' ? 'contents' : 'hidden'}>
          {savedPropertyIds.length > 0 ? (
            <ExploreProperties 
              onInterest={handleInterest} 
              savedPropertyIds={savedPropertyIds}
              onSaveProperty={toggleSaveProperty}
              showOnlySaved={true}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-transparent p-6 text-center">
              <h2 className="text-2xl font-medium tracking-tight text-gray-900 mb-2">Saved Properties</h2>
              <p className="text-gray-500 font-light max-w-sm">Properties you save will appear here for quick access later.</p>
            </div>
          )}
        </div>
        {activePage === 'settings' && (
          <div className="flex-1 bg-transparent p-8 overflow-y-auto">
            <div className="max-w-2xl mx-auto md:mt-8">
              <h2 className="text-3xl font-medium tracking-tight text-gray-900 mb-8 mt-12 md:mt-0">Settings</h2>
              
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications</h3>
                  <div className="flex items-center justify-between py-3 border-b border-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">Email Alerts</p>
                      <p className="text-sm text-gray-500 font-light">Receive updates about your saved properties</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-royal-blue)]"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-gray-900">Marketing Communications</p>
                      <p className="text-sm text-gray-500 font-light">Receive offers and newsletters</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-royal-blue)]"></div>
                    </label>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Preferences</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                      <select className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl font-light outline-none focus:bg-white focus:border-gray-300 transition-colors">
                        <option>INR (₹)</option>
                        <option>USD ($)</option>
                        <option>EUR (€)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                      <select className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl font-light outline-none focus:bg-white focus:border-gray-300 transition-colors">
                        <option>English</option>
                        <option>Hindi</option>
                        <option>Marathi</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {activePage === 'profile' && (
          <div className="flex-1 bg-gray-50/50 p-8 overflow-y-auto">
            <div className="max-w-2xl mx-auto md:mt-8">
              <h2 className="text-3xl font-medium tracking-tight text-gray-900 mb-8 mt-12 md:mt-0">Your Profile</h2>
              
              <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 mb-6">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-24 h-24 bg-[var(--color-royal-blue)]/10 text-[var(--color-royal-blue)] rounded-full flex items-center justify-center text-3xl font-medium">
                    {userProfile.firstName[0]}{userProfile.lastName[0]}
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900">{userProfile.firstName} {userProfile.lastName}</h3>
                    <p className="text-gray-500 font-light mb-2">{userProfile.email}</p>
                    <button className="text-sm px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      Change Avatar
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input type="text" value={userProfile.firstName} onChange={e => setUserProfile(prev => ({...prev, firstName: e.target.value}))} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-light outline-none focus:bg-white focus:border-gray-300 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input type="text" value={userProfile.lastName} onChange={e => setUserProfile(prev => ({...prev, lastName: e.target.value}))} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-light outline-none focus:bg-white focus:border-gray-300 transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input type="email" value={userProfile.email} onChange={e => setUserProfile(prev => ({...prev, email: e.target.value}))} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-light outline-none focus:bg-white focus:border-gray-300 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input type="tel" value={userProfile.phone} onChange={e => setUserProfile(prev => ({...prev, phone: e.target.value}))} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-light outline-none focus:bg-white focus:border-gray-300 transition-colors" />
                  </div>
                  <div className="pt-4 border-t border-gray-50 flex justify-end">
                    <button type="submit" className="px-6 py-2.5 bg-[var(--color-royal-blue)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
