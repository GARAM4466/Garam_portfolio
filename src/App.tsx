/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Navbar from "./components/Navbar";
import WorkGrid from "./components/WorkGrid";
import Reel from "./components/Reel";
import About from "./components/About";
import Contact from "./components/Contact";
import Login from "./components/Login";
import Admin from "./pages/Admin";
import { Project, SiteData } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState("Landing");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [siteData, setSiteData] = useState<SiteData | null>(null);

  useEffect(() => {
    fetchProjects();
    fetchSiteData();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data);
    } catch (error) {
      console.error("Failed to fetch projects", error);
    }
  };

  const fetchSiteData = async () => {
    try {
      const res = await fetch("/api/site-data");
      const data = await res.json();
      setSiteData(data);
    } catch (error) {
      console.error("Failed to fetch site data", error);
    }
  };

  const renderContent = () => {
    if (!siteData) return null;

    switch (activeTab) {
      case "Reel":
        return <Reel youtubeId={siteData.reelYoutubeId} reelTitle={siteData.reelTitle} />;
      case "Work":
        return <WorkGrid projects={projects} />;
      case "About":
        return <About text={siteData.aboutText} photo={siteData.aboutPhoto} />;
      case "Contact":
        return <Contact email={siteData.contact.email} kakaoLink={siteData.contact.kakaoLink} text={siteData.contactText} />;
      case "Admin":
        return <Admin siteData={siteData} onUpdate={fetchSiteData} />;
      default:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-black"
          >
            {/* Landing Video Background (Showreel highlight) */}
            <div className="absolute inset-0 z-0 opacity-40 grayscale blur-sm">
              <iframe
                src={`https://www.youtube.com/embed/${siteData.landingYoutubeId}?autoplay=1&mute=1&loop=1&playlist=${siteData.landingYoutubeId}&controls=0&showinfo=0&autohide=1`}
                className="w-[300%] h-[300%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                allow="autoplay; encrypted-media"
              />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center space-y-8 px-6">
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="space-y-2"
              >
                <h1 className="text-[15vw] font-black tracking-tighter leading-[0.8] uppercase select-none">
                  Visual<br />Designer
                </h1>
                <p className="text-sm md:text-lg uppercase tracking-[1em] text-white/40 ml-4">
                  Portfolio 2026
                </p>
              </motion.div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                onClick={() => setActiveTab("Work")}
                className="group relative px-12 py-4 bg-white text-black font-bold uppercase tracking-widest rounded-full hover:scale-105 transition-transform"
              >
                Explore Work
                <div className="absolute inset-0 bg-white rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-opacity" />
              </motion.button>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white selection:text-black">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isAdmin={isAdmin}
        onLoginClick={() => setIsLoginOpen(true)}
      />
      
      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      <Login 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onLogin={(success) => setIsAdmin(success)}
      />

      {/* Global Cursor or Custom Elements could go here */}
    </div>
  );
}
