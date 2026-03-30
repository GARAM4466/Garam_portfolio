import { motion } from "motion/react";

interface AboutProps {
  text: string;
  photo: string;
}

export default function About({ text, photo }: AboutProps) {
  return (
    <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto min-h-screen flex flex-col items-center justify-center space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid md:grid-cols-2 gap-24 items-center"
      >
        <div className="aspect-[3/4] bg-white/5 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
          <img
            src={photo}
            alt="Designer"
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-6xl font-bold tracking-tighter uppercase">About Me</h2>
            <p className="text-white/40 uppercase tracking-widest text-sm">Video Designer / Motion Graphics</p>
          </div>
          <p className="text-2xl leading-relaxed text-white/80 font-light italic">
            "{text}"
          </p>
          <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-12">
            <div>
              <h4 className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Experience</h4>
              <p className="text-lg font-bold uppercase">8+ Years</p>
            </div>
            <div>
              <h4 className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Location</h4>
              <p className="text-lg font-bold uppercase">Seoul, Korea</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
