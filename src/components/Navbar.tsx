import { motion } from "motion/react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin: boolean;
  onLoginClick: () => void;
}

export default function Navbar({ activeTab, setActiveTab, isAdmin, onLoginClick }: NavbarProps) {
  const tabs = ["Reel", "Work", "About", "Contact", ...(isAdmin ? ["Admin"] : [])];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <button 
            onClick={() => setActiveTab("Landing")}
            className="text-xl font-bold tracking-tighter hover:opacity-70 transition-opacity"
          >
            PORTFOLIO
          </button>
          <div className="hidden md:flex items-center gap-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm uppercase tracking-widest transition-all ${
                  activeTab === tab ? "text-white font-bold" : "text-white/50 hover:text-white"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="nav-underline"
                    className="h-0.5 bg-white mt-1"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {isAdmin ? (
            <span className="text-[10px] bg-white text-black px-2 py-0.5 rounded font-bold uppercase">Admin Mode</span>
          ) : (
            <button 
              onClick={onLoginClick}
              className="text-[10px] text-white/20 hover:text-white/50 transition-colors uppercase tracking-widest"
            >
              Admin
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
