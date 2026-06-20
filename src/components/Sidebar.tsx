import { motion } from 'motion/react';
import { Bookmark, User, LogOut, Plus, Settings, Menu, Building2, Map, MessageSquare, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activePage: 'ai' | 'explore' | 'saved' | 'settings' | 'profile';
  setActivePage: (page: 'ai' | 'explore' | 'saved' | 'settings' | 'profile') => void;
  onNewChat?: () => void;
  isSideWindowOpen?: boolean;
}

export default function Sidebar({ isOpen, onToggle, activePage, setActivePage, onNewChat, isSideWindowOpen = false }: SidebarProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isSideWindowOpen ? 260 : (isOpen ? 260 : 68) }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white/60 text-gray-800 flex flex-col h-full overflow-hidden shrink-0 z-40 relative border-r border-white/40 backdrop-blur-md shadow-sm"
    >
      <div className="h-16 flex items-center px-3.5 shrink-0 mt-2">
        {isSideWindowOpen ? (
          <div className="flex items-center text-gray-800 w-full p-2.5 gap-3">
            <div className="shrink-0 flex items-center justify-center w-6 h-6">
              <div className="p-1.5 bg-gradient-to-br from-blue-900 to-slate-800 rounded-lg text-white shadow-sm shrink-0 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <span className="font-sans font-bold tracking-tight text-lg text-gray-900 ml-1">
              LuxeReal
            </span>
          </div>
        ) : (
          <button 
            onClick={onToggle} 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`flex items-center text-gray-500 hover:bg-gray-100/70 rounded-xl transition-all cursor-pointer overflow-hidden ${isOpen ? 'w-full p-2.5 gap-3' : 'w-11 h-11 justify-center'}`}
            title={isOpen ? "Collapse menu" : "Expand menu"}
          >
            <div className="shrink-0 flex items-center justify-center w-6 h-6">
              {isHovered && !isOpen ? (
                <Menu className="w-6 h-6 text-gray-700 animate-in fade-in zoom-in duration-200" />
              ) : (
                <div className="p-1.5 bg-gradient-to-br from-blue-900 to-slate-800 rounded-lg text-white shadow-sm shrink-0 flex items-center justify-center animate-in fade-in zoom-in duration-200">
                  <Building2 className="w-4 h-4" />
                </div>
              )}
            </div>
            {isOpen && (
              <span className="font-sans font-bold tracking-tight text-lg text-gray-900 ml-1 animate-in fade-in duration-300">
                LuxeReal
              </span>
            )}
          </button>
        )}
      </div>

      {!isSideWindowOpen && (
        <>
          <div className="px-3 mt-5">
            <button 
               onClick={() => {
                  if (onNewChat) {
                    onNewChat();
                  } else {
                    setActivePage('ai');
                    if (activePage === 'ai') window.location.reload();
                  }
               }}
               className="flex items-center gap-3 p-2 w-full bg-transparent text-gray-700 rounded-xl border border-gray-200 transition-all hover:bg-gray-50 overflow-hidden h-11 shrink-0 whitespace-nowrap relative"
               title="New chat"
            >
              <Plus className="w-5 h-5 shrink-0 ml-1 text-gray-600" />
              <span 
                className={`font-medium text-sm transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
              >
                New chat
              </span>
            </button>
          </div>

          <div className="px-3 mt-4 space-y-1">
            <SidebarItem 
              icon={<Map className="w-5 h-5" />} 
              label="Explore Properties" 
              isOpen={isOpen} 
              isActive={activePage === 'explore'}
              onClick={() => setActivePage('explore')}
            />
          </div>

          <div className="flex-1 mt-6 overflow-y-auto pl-3 pr-2 scrollbar-thin scrollbar-thumb-gray-200">
          </div>

          <div className="px-3 pb-6 space-y-1 mt-2">
            <SidebarItem 
               icon={<Bookmark className="w-5 h-5" />} 
               label="Saved Properties" 
               isOpen={isOpen} 
               isActive={activePage === 'saved'}
               onClick={() => setActivePage('saved')}
            />
            <SidebarItem 
               icon={<Settings className="w-5 h-5" />} 
               label="Settings" 
               isOpen={isOpen} 
               isActive={activePage === 'settings'}
               onClick={() => setActivePage('settings')}
            />
            <SidebarItem 
               icon={<User className="w-5 h-5" />} 
               label="Profile" 
               isOpen={isOpen} 
               isActive={activePage === 'profile'}
               onClick={() => setActivePage('profile')}
            />
            <SidebarItem icon={<LogOut className="w-5 h-5" />} label="Log out" isOpen={isOpen} onClick={() => navigate('/')} />
          </div>
        </>
      )}
    </motion.aside>
  );
}

function SidebarItem({ icon, label, isOpen, onClick, isActive }: any) {
  return (
    <button onClick={onClick} title={!isOpen ? label : ''} className={`flex items-center gap-3 w-full p-3 rounded-full transition-all group whitespace-nowrap h-11 ${isActive ? 'bg-[var(--color-royal-blue)]/10 text-[var(--color-royal-blue)]' : 'text-gray-600 hover:bg-gray-200/60'}`}>
       <span className={`shrink-0 ml-0.5 ${isActive ? 'text-[var(--color-royal-blue)]' : ''}`}>{icon}</span>
       <span className={`font-medium text-sm pr-4 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'} ${isActive ? 'text-[var(--color-royal-blue)]' : ''}`}>
         {label}
       </span>
    </button>
  )
}
