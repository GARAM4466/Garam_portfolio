import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Project } from "../types";
import ProjectModal from "./ProjectModal";

interface WorkGridProps {
  projects: Project[];
}

export default function WorkGrid({ projects }: WorkGridProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");

  const filters = ["ALL", "DI", "모션그래픽", "홍보영상"];

  const filteredProjects = (activeFilter === "ALL" 
    ? projects 
    : projects.filter(p => p.tags.includes(activeFilter)))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="pt-24 pb-12 px-4 max-w-[2000px] mx-auto min-h-screen">
      {/* Tag Filters */}
      <div className="flex justify-center gap-4 mb-12">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-6 py-2 rounded-full text-[10px] uppercase tracking-widest border transition-all ${
              activeFilter === filter 
                ? "bg-white text-black border-white font-bold" 
                : "bg-transparent text-white/40 border-white/10 hover:border-white/30 hover:text-white"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <motion.div 
        layout
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
      >
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project, index) => (
            <motion.div
              layout
              key={project.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
              className="relative aspect-square bg-white/5 overflow-hidden cursor-pointer group rounded-lg shadow-xl"
              onClick={() => setSelectedProject(project)}
            >
              <img
                src={project.thumbnail}
                alt={project.title}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <div className="flex gap-2 mb-2">
                  {project.tags.map(tag => (
                    <span key={tag} className="text-[8px] bg-white text-black px-1.5 py-0.5 rounded font-bold uppercase">{tag}</span>
                  ))}
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest">{project.title}</h3>
                <p className="text-[10px] text-white/60 uppercase tracking-widest mt-1">{project.client}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
