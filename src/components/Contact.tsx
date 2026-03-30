import { motion } from "motion/react";
import { Mail, MessageCircle, Instagram, Linkedin, ArrowUpRight } from "lucide-react";

interface ContactProps {
  email: string;
  kakaoLink: string;
  text: string;
}

export default function Contact({ email, kakaoLink, text }: ContactProps) {
  const socialLinks = [
    { name: "Email", icon: Mail, href: `mailto:${email}`, value: email },
    { name: "KakaoTalk", icon: MessageCircle, href: kakaoLink, value: "Open Chat" },
    { name: "Instagram", icon: Instagram, href: "https://instagram.com", value: "@designer" },
    { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com", value: "Designer Name" },
  ];

  return (
    <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto min-h-screen flex flex-col items-center justify-center space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-8xl font-bold tracking-tighter uppercase">{text}</h2>
        <p className="text-white/40 uppercase tracking-widest text-sm">Open for new projects and collaborations</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full mt-12">
        {socialLinks.map((link, index) => (
          <motion.a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -10 }}
            className="group relative p-8 bg-white/5 rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowUpRight className="w-6 h-6 text-white/40" />
            </div>
            <link.icon className="w-12 h-12 mb-8 text-white/60 group-hover:text-white transition-colors" />
            <div className="space-y-2">
              <h4 className="text-[10px] uppercase tracking-widest text-white/40">{link.name}</h4>
              <p className="text-xl font-bold uppercase truncate">{link.value}</p>
            </div>
          </motion.a>
        ))}
      </div>
      <div className="mt-24 pt-12 border-t border-white/10 w-full text-center">
        <p className="text-[10px] uppercase tracking-widest text-white/20">© 2026 Portfolio. All Rights Reserved.</p>
      </div>
    </div>
  );
}
