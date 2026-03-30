import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, Edit2, Save, X, Upload, Loader2, Link as LinkIcon, Mail, User, Film } from "lucide-react";
import { Project, SiteData } from "../types";

type AdminTab = "Reel" | "Work" | "About" | "Contact";

interface AdminProps {
  siteData: SiteData | null;
  onUpdate: () => void;
}

export default function Admin({ siteData: initialSiteData, onUpdate }: AdminProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("Work");
  const [projects, setProjects] = useState<Project[]>([]);
  const [siteData, setSiteData] = useState<SiteData | null>(initialSiteData);
  const [isEditing, setIsEditing] = useState<string | null>(null); // project id or 'new'
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Project>>({
    title: "",
    client: "",
    role: "",
    youtubeId: "",
    thumbnail: "",
    stills: [],
    tags: [],
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    setSiteData(initialSiteData);
  }, [initialSiteData]);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data.sort((a: Project, b: Project) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      console.error("Failed to fetch projects", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProject = async () => {
    setIsLoading(true);
    try {
      let updatedProjects = [...projects];
      if (isEditing === "new") {
        const newProject = {
          ...formData,
          id: `project-${Date.now()}`,
        } as Project;
        updatedProjects = [newProject, ...updatedProjects];
      } else {
        updatedProjects = updatedProjects.map((p) =>
          p.id === isEditing ? { ...p, ...formData } as Project : p
        );
      }

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProjects),
      });

      if (res.ok) {
        setProjects(updatedProjects);
        setIsEditing(null);
        setFormData({});
      }
    } catch (error) {
      console.error("Failed to save project", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSiteData = async () => {
    if (!siteData) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/site-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(siteData),
      });
      if (res.ok) {
        onUpdate();
        alert("Site data saved successfully!");
      }
    } catch (error) {
      console.error("Failed to save site data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    setIsLoading(true);
    try {
      const updatedProjects = projects.filter((p) => p.id !== id);
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProjects),
      });
      if (res.ok) {
        setProjects(updatedProjects);
      }
    } catch (error) {
      console.error("Failed to delete project", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "thumbnail" | "stills" | "aboutPhoto") => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formDataUpload = new FormData();
    for (let i = 0; i < files.length; i++) {
      formDataUpload.append("files", files[i]);
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });
      const data = await res.json();
      if (field === "thumbnail") {
        setFormData((prev) => ({ ...prev, thumbnail: data.urls[0] }));
      } else if (field === "aboutPhoto") {
        setSiteData((prev) => prev ? { ...prev, aboutPhoto: data.urls[0] } : null);
      } else {
        setFormData((prev) => ({ ...prev, stills: [...(prev.stills || []), ...data.urls] }));
      }
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeStill = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      stills: (prev.stills || []).filter((_, i) => i !== index),
    }));
  };

  const tabs: AdminTab[] = ["Reel", "Work", "About", "Contact"];

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-8 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <h1 className="text-5xl font-black tracking-tighter uppercase">Admin Panel</h1>
            <button 
              onClick={() => window.location.reload()} 
              className="text-[10px] text-white/20 hover:text-white/50 uppercase tracking-widest border border-white/10 px-2 py-1 rounded"
            >
              Logout
            </button>
          </div>
          
          <div className="flex gap-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-xs uppercase tracking-widest px-4 py-2 rounded-full transition-all ${
                  activeTab === tab 
                    ? "bg-white text-black font-bold" 
                    : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "Work" && (
          <button
            onClick={() => {
              setIsEditing("new");
              setFormData({
                title: "",
                client: "",
                role: "",
                youtubeId: "",
                thumbnail: "",
                stills: [],
                tags: [],
                date: new Date().toISOString().split("T")[0],
              });
            }}
            className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-transform"
          >
            <Plus className="w-5 h-5" />
            Add Project
          </button>
        )}
      </div>

      <div className="space-y-12">
        {activeTab === "Work" && (
          <>
            {isLoading && !isEditing && (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="w-12 h-12 animate-spin text-white/20" />
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div key={project.id} className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 transition-colors">
                  <div className="aspect-video relative overflow-hidden">
                    <img src={project.thumbnail} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <button
                        onClick={() => {
                          setIsEditing(project.id);
                          setFormData(project);
                        }}
                        className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="p-3 bg-red-500 text-white rounded-full hover:scale-110 transition-transform"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-6 space-y-2">
                    <div className="flex gap-2">
                      {project.tags.map(tag => (
                        <span key={tag} className="text-[8px] bg-white/10 px-1.5 py-0.5 rounded uppercase tracking-widest">{tag}</span>
                      ))}
                    </div>
                    <h3 className="text-xl font-bold uppercase tracking-tight">{project.title}</h3>
                    <p className="text-white/40 text-[10px] uppercase tracking-widest">{project.client} — {project.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "Reel" && siteData && (
          <div className="max-w-2xl space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold uppercase tracking-tight">Reel Settings</h2>
              <p className="text-white/40 text-xs uppercase tracking-widest">Update your showreel title and video</p>
            </div>
            <div className="space-y-6 bg-white/5 p-8 rounded-3xl border border-white/10">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 ml-2">Landing Page YouTube ID</label>
                <input
                  type="text"
                  value={siteData.landingYoutubeId || ""}
                  onChange={(e) => setSiteData({ ...siteData, landingYoutubeId: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 ml-2">Reel Title</label>
                <input
                  type="text"
                  value={siteData.reelTitle}
                  onChange={(e) => setSiteData({ ...siteData, reelTitle: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 ml-2">Reel YouTube ID</label>
                <input
                  type="text"
                  value={siteData.reelYoutubeId}
                  onChange={(e) => setSiteData({ ...siteData, reelYoutubeId: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
              <button
                onClick={handleSaveSiteData}
                disabled={isLoading}
                className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-white/90 transition-colors flex items-center justify-center gap-2 uppercase tracking-widest"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save Reel Settings
              </button>
            </div>
          </div>
        )}

        {activeTab === "About" && siteData && (
          <div className="max-w-4xl grid md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold uppercase tracking-tight">About Settings</h2>
                <p className="text-white/40 text-xs uppercase tracking-widest">Update your profile photo and bio</p>
              </div>
              <div className="space-y-6 bg-white/5 p-8 rounded-3xl border border-white/10">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 ml-2">Bio Text</label>
                  <textarea
                    value={siteData.aboutText}
                    onChange={(e) => setSiteData({ ...siteData, aboutText: e.target.value })}
                    rows={8}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 focus:outline-none focus:border-white/30 transition-colors resize-none"
                  />
                </div>
                <button
                  onClick={handleSaveSiteData}
                  disabled={isLoading}
                  className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-white/90 transition-colors flex items-center justify-center gap-2 uppercase tracking-widest"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save About Settings
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest text-white/40 ml-2 block">Profile Photo</label>
              <div className="aspect-[3/4] relative bg-white/5 rounded-3xl border border-dashed border-white/20 flex items-center justify-center overflow-hidden group">
                {siteData.aboutPhoto ? (
                  <>
                    <img src={siteData.aboutPhoto} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="cursor-pointer p-4 bg-white text-black rounded-full">
                        <Upload className="w-6 h-6" />
                        <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, "aboutPhoto")} accept="image/*" />
                      </label>
                    </div>
                  </>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center gap-2 text-white/20 hover:text-white/40 transition-colors">
                    <Upload className="w-8 h-8" />
                    <span className="text-[10px] uppercase tracking-widest">Upload Photo</span>
                    <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, "aboutPhoto")} accept="image/*" />
                  </label>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "Contact" && siteData && (
          <div className="max-w-2xl space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold uppercase tracking-tight">Contact Settings</h2>
              <p className="text-white/40 text-xs uppercase tracking-widest">Update your contact info and links</p>
            </div>
            <div className="space-y-6 bg-white/5 p-8 rounded-3xl border border-white/10">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 ml-2">Contact Text</label>
                <input
                  type="text"
                  value={siteData.contactText}
                  onChange={(e) => setSiteData({ ...siteData, contactText: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 ml-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input
                      type="email"
                      value={siteData.contact.email}
                      onChange={(e) => setSiteData({ ...siteData, contact: { ...siteData.contact, email: e.target.value } })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-6 focus:outline-none focus:border-white/30 transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 ml-2">Kakao Link</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input
                      type="text"
                      value={siteData.contact.kakaoLink}
                      onChange={(e) => setSiteData({ ...siteData, contact: { ...siteData.contact, kakaoLink: e.target.value } })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-6 focus:outline-none focus:border-white/30 transition-colors"
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={handleSaveSiteData}
                disabled={isLoading}
                className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-white/90 transition-colors flex items-center justify-center gap-2 uppercase tracking-widest"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save Contact Settings
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit/Add Modal for Work */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-4xl bg-[#0a0a0a] rounded-3xl border border-white/10 shadow-2xl p-8 md:p-12 relative my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsEditing(null)}
                className="absolute top-8 right-8 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="space-y-12">
                <div className="space-y-2">
                  <h2 className="text-4xl font-black tracking-tighter uppercase">
                    {isEditing === "new" ? "Add New Project" : "Edit Project"}
                  </h2>
                  <p className="text-white/40 uppercase tracking-widest text-[10px]">Fill in the details below</p>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-white/40 ml-2">Title</label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 focus:outline-none focus:border-white/30 transition-colors"
                          placeholder="Project Title"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-white/40 ml-2">Client</label>
                          <input
                            type="text"
                            value={formData.client}
                            onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 focus:outline-none focus:border-white/30 transition-colors"
                            placeholder="Client Name"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-white/40 ml-2">Role</label>
                          <input
                            type="text"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 focus:outline-none focus:border-white/30 transition-colors"
                            placeholder="Your Role"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-white/40 ml-2">YouTube ID</label>
                        <input
                          type="text"
                          value={formData.youtubeId}
                          onChange={(e) => setFormData({ ...formData, youtubeId: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 focus:outline-none focus:border-white/30 transition-colors"
                          placeholder="e.g. dQw4w9WgXcQ"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-white/40 ml-2">Date</label>
                        <input
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 focus:outline-none focus:border-white/30 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-white/40 ml-2">Tags (comma separated)</label>
                        <input
                          type="text"
                          value={formData.tags?.join(", ")}
                          onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(",").map(t => t.trim()).filter(t => t) })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 focus:outline-none focus:border-white/30 transition-colors"
                          placeholder="DI, 모션그래픽, 홍보영상"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-4">
                      <label className="text-[10px] uppercase tracking-widest text-white/40 ml-2 block">Thumbnail</label>
                      <div className="aspect-video relative bg-white/5 rounded-2xl border border-dashed border-white/20 flex items-center justify-center overflow-hidden group">
                        {formData.thumbnail ? (
                          <>
                            <img src={formData.thumbnail} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <label className="cursor-pointer p-4 bg-white text-black rounded-full">
                                <Upload className="w-6 h-6" />
                                <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, "thumbnail")} accept="image/*" />
                              </label>
                            </div>
                          </>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center gap-2 text-white/20 hover:text-white/40 transition-colors">
                            <Upload className="w-8 h-8" />
                            <span className="text-[10px] uppercase tracking-widest">Upload Thumbnail</span>
                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, "thumbnail")} accept="image/*" />
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] uppercase tracking-widest text-white/40 ml-2 block">Still Cuts ({formData.stills?.length || 0})</label>
                      <div className="grid grid-cols-3 gap-2">
                        {formData.stills?.map((still, idx) => (
                          <div key={idx} className="aspect-video relative rounded-lg overflow-hidden group">
                            <img src={still} className="w-full h-full object-cover" />
                            <button
                              onClick={() => removeStill(idx)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        <label className="aspect-video bg-white/5 rounded-lg border border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors">
                          <Plus className="w-5 h-5 text-white/20" />
                          <input type="file" className="hidden" multiple onChange={(e) => handleFileUpload(e, "stills")} accept="image/*" />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-8 border-t border-white/10">
                  <button
                    onClick={handleSaveProject}
                    disabled={isLoading}
                    className="flex-1 bg-white text-black font-bold py-5 rounded-2xl uppercase tracking-widest hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Save Project
                  </button>
                  <button
                    onClick={() => setIsEditing(null)}
                    className="flex-1 bg-white/5 text-white font-bold py-5 rounded-2xl uppercase tracking-widest hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
