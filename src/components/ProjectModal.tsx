import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Project } from "../types";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [currentStillIndex, setCurrentStillIndex] = useState<number | null>(null);

  const handlePrev = useCallback((e?: React.MouseEvent | KeyboardEvent) => {
    e?.stopPropagation();
    if (currentStillIndex !== null) {
      setCurrentStillIndex((prev) => (prev === 0 ? project.stills.length - 1 : (prev ?? 0) - 1));
    }
  }, [currentStillIndex, project.stills.length]);

  const handleNext = useCallback((e?: React.MouseEvent | KeyboardEvent) => {
    e?.stopPropagation();
    if (currentStillIndex !== null) {
      setCurrentStillIndex((prev) => (prev === project.stills.length - 1 ? 0 : (prev ?? 0) + 1));
    }
  }, [currentStillIndex, project.stills.length]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (currentStillIndex !== null) {
          setCurrentStillIndex(null);
        } else {
          onClose();
        }
        return;
      }

      if (currentStillIndex === null) return;
      
      if (e.key === "ArrowLeft") {
        handlePrev(e);
      } else if (e.key === "ArrowRight") {
        handleNext(e);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStillIndex, handlePrev, handleNext, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100]"
    >
      {/* Scrolling Modal Container */}
      <div
        className={`absolute inset-0 flex items-start justify-center p-4 bg-black/90 backdrop-blur-xl ${currentStillIndex !== null ? 'overflow-hidden' : 'overflow-y-auto'}`}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="w-full max-w-5xl bg-[#0a0a0a] rounded-2xl shadow-2xl border border-white/10 overflow-hidden relative my-8 md:my-16"
          onClick={(e) => e.stopPropagation()}
        >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8 md:p-12 space-y-12">
          {/* YouTube Embed */}
          <div className="aspect-video w-full bg-black rounded-xl overflow-hidden shadow-2xl">
            <iframe
              src={`https://www.youtube.com/embed/${project.youtubeId}?autoplay=1`}
              title={project.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Project Info */}
          <div className="grid md:grid-cols-3 gap-12">
            <div className="md:col-span-2 space-y-6">
              <div className="flex gap-2">
                {project.tags.map(tag => (
                  <span key={tag} className="text-[10px] bg-white text-black px-2 py-0.5 rounded font-bold uppercase tracking-widest">{tag}</span>
                ))}
              </div>
              <h2 className="text-4xl font-bold tracking-tighter uppercase">{project.title}</h2>
            </div>
            <div className="space-y-6 border-l border-white/10 pl-12">
              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Client</h4>
                <p className="text-xl font-bold uppercase">{project.client}</p>
              </div>
              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Role</h4>
                <p className="text-xl font-bold uppercase">{project.role}</p>
              </div>
            </div>
          </div>

          {/* 3x3 Still Cuts */}
          <div className="space-y-6">
            <h3 className="text-[10px] uppercase tracking-widest text-white/40 border-b border-white/10 pb-4">Still Cuts</h3>
            <div className="grid grid-cols-3 gap-4">
              {project.stills.map((still, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="aspect-video bg-white/5 rounded-lg overflow-hidden cursor-pointer shadow-lg"
                  onClick={() => setCurrentStillIndex(index)}
                >
                  <img
                    src={still}
                    alt={`${project.title} still ${index + 1}`}
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
      </div>

      {/* Lightbox for Stills with Slider */}
      <AnimatePresence>
        {currentStillIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[110] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl"
            onClick={() => setCurrentStillIndex(null)}
          >
            {/* Close Button */}
            <button 
              className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full z-[120] transition-colors"
              onClick={() => setCurrentStillIndex(null)}
            >
              <X className="w-8 h-8" />
            </button>

            {/* Navigation Arrows */}
            <button
              className="absolute left-8 top-1/2 -translate-y-1/2 p-4 bg-white/5 hover:bg-white/20 rounded-full z-[120] transition-all hover:scale-110"
              onClick={(e) => handlePrev(e)}
            >
              <ChevronLeft className="w-10 h-10" />
            </button>
            <button
              className="absolute right-8 top-1/2 -translate-y-1/2 p-4 bg-white/5 hover:bg-white/20 rounded-full z-[120] transition-all hover:scale-110"
              onClick={(e) => handleNext(e)}
            >
              <ChevronRight className="w-10 h-10" />
            </button>

            {/* Stacked Slider Container */}
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="popLayout">
                {project.stills.map((still, index) => {
                  const offset = index - currentStillIndex;
                  const isVisible = Math.abs(offset) <= 2;
                  
                  if (!isVisible) return null;

                  return (
                    <motion.div
                      key={index}
                      drag={offset === 0 ? "x" : false}
                      dragConstraints={{ left: 0, right: 0 }}
                      onDragEnd={(_, info) => {
                        if (offset !== 0) return;
                        const swipeThreshold = 50;
                        if (info.offset.x > swipeThreshold) {
                          handlePrev();
                        } else if (info.offset.x < -swipeThreshold) {
                          handleNext();
                        }
                      }}
                      initial={{ opacity: 0, x: offset > 0 ? 1000 : -1000, scale: 0.5 }}
                      animate={{ 
                        opacity: 1 - Math.abs(offset) * 0.3, 
                        x: offset * 300, 
                        scale: 1 - Math.abs(offset) * 0.1,
                        zIndex: 100 - Math.abs(offset),
                        filter: offset === 0 ? "blur(0px)" : "blur(8px)"
                      }}
                      exit={{ opacity: 0, scale: 0.5, x: offset > 0 ? 1000 : -1000 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className={`absolute w-[80vw] max-w-6xl aspect-video rounded-2xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.7)] border border-white/10 ${offset === 0 ? 'cursor-grab active:cursor-grabbing' : ''}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <img
                        src={still}
                        className="w-full h-full object-cover pointer-events-none"
                        referrerPolicy="no-referrer"
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Counter */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/40 uppercase tracking-[0.5em] text-xs font-bold">
              {currentStillIndex + 1} / {project.stills.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
