"use client";

import { useState, useEffect } from "react";

export default function ContactPage() {
   const [encryptionStream, setEncryptionStream] = useState<string[]>([]);

   useEffect(() => {
      // Matrix/Encryption animation effect
      const interval = setInterval(() => {
         const hex = Array(5).fill(0).map(() => "0x" + Math.floor(Math.random() * 255).toString(16).toUpperCase().padStart(2, '0')).join(" ");
         setEncryptionStream(prev => [hex, ...prev.slice(0, 15)]);
      }, 100);
      return () => clearInterval(interval);
   }, []);

   return (
      <div className="container mx-auto px-4 py-8 max-w-6xl min-h-[85vh] flex items-center justify-center">
         <div className="w-full grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* Left Panel: Status */}
            <div className="lg:col-span-2 space-y-6">
               <div className="glass-card p-6 rounded-lg relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 text-white/10 group-hover:text-primary/20 transition-colors">
                     <span className="material-symbols-outlined text-6xl">lock</span>
                  </div>
                  <h4 className="text-primary text-[10px] font-bold tracking-widest mb-3">SECURITY_CLEARANCE</h4>
                  <div className="flex items-center gap-3 mb-6">
                     <span className="material-symbols-outlined text-primary">verified_user</span>
                     <span className="text-xs text-white/60">END-TO-END ENCRYPTION ENABLED</span>
                  </div>
                  <p className="text-white/40 text-sm font-mono leading-relaxed">
                     Channel is open. All transmissions are encrypted using standard chaotic algorithms.
                     Please identify yourself before proceeding.
                  </p>
               </div>

               <div className="glass-card p-6 rounded-lg">
                  <h4 className="text-primary text-[10px] font-bold tracking-widest mb-4 uppercase">Encryption_Stream</h4>
                  <div className="font-mono text-[9px] text-primary/40 leading-tight space-y-1 h-32 overflow-hidden">
                     {encryptionStream.map((line, i) => (
                        <p key={i} className={i === 0 ? "text-primary" : ""}>{line}</p>
                     ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-[10px] text-primary">
                     <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                     SIGNAL_STRENGTH: 100%
                  </div>
               </div>
            </div>

            {/* Right Panel: Form */}
            <div className="lg:col-span-3 glass-card p-8 md:p-12 rounded-xl border-l-4 border-l-primary relative">
               <h2 className="text-2xl font-bold uppercase tracking-tight mb-8 flex items-center gap-2">
                  <span className="animate-pulse text-primary">_</span> Initialize_Transmission
               </h2>

               <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                  <div className="group relative">
                     <label className="block text-primary text-[10px] font-bold tracking-widest mb-2 px-1">IDENTITY &gt;</label>
                     <input
                        type="text"
                        className="w-full bg-transparent border-b border-white/20 py-2 px-1 text-white font-mono focus:outline-none focus:border-primary transition-colors placeholder-white/10"
                        placeholder="ENTER_NAME"
                     />
                  </div>

                  <div className="group relative">
                     <label className="block text-primary text-[10px] font-bold tracking-widest mb-2 px-1">FREQUENCY &gt;</label>
                     <input
                        type="email"
                        className="w-full bg-transparent border-b border-white/20 py-2 px-1 text-white font-mono focus:outline-none focus:border-primary transition-colors placeholder-white/10"
                        placeholder="ENTER_EMAIL_ADDRESS"
                     />
                  </div>

                  <div className="group relative">
                     <label className="block text-primary text-[10px] font-bold tracking-widest mb-2 px-1">PAYLOAD &gt;</label>
                     <textarea
                        rows={4}
                        className="w-full bg-transparent border-b border-white/20 py-2 px-1 text-white font-mono focus:outline-none focus:border-primary transition-colors placeholder-white/10 resize-none"
                        placeholder="ENTER_MESSAGE_DATA..."
                     ></textarea>
                  </div>

                  <div className="pt-4">
                     <button className="group relative w-full overflow-hidden bg-primary px-6 py-4 text-background-dark font-bold tracking-widest uppercase transition-all hover:bg-white">
                        <span className="relative z-10">Transmit_Data</span>
                        {/* Hover effect can be simpler here since Tailwind group-hover on parent button works well */}
                        <div className="absolute inset-0 bg-white translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 mix-blend-difference"></div>
                     </button>
                  </div>
               </form>
            </div>

         </div>
      </div>
   );
}
