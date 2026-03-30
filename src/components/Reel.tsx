import { motion } from "motion/react";

interface ReelProps {
  youtubeId: string;
  reelTitle: string;
}

export default function Reel({ youtubeId, reelTitle }: ReelProps) {
  return (
    <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto min-h-screen flex flex-col items-center justify-center space-y-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10"
      >
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
          title="Showreel"
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </motion.div>
      <div className="text-center space-y-4">
        <h2 className="text-6xl font-bold tracking-tighter uppercase">{reelTitle}</h2>
        <p className="text-white/40 uppercase tracking-widest text-sm">Visual Storytelling & Motion Design</p>
      </div>
    </div>
  );
}
