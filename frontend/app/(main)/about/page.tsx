"use client";

import { motion } from "framer-motion";

export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Page Title */}
            <div className="mb-12 border-b border-white/5 pb-6">
                <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter mb-2">
                    Neural <span className="text-primary text-shadow-neon">Assets</span>
                </h1>
                <p className="text-white/60 font-mono text-sm max-w-2xl">
          // SYSTEM_ID: ARCHITECT_01 <br />
          // DECRYPTING PERSONAL DATA...
                </p>
            </div>

            <div className="bg-obsidian w-full min-h-[80vh] grid grid-cols-1 md:grid-cols-4 gap-4 p-4 md:p-8">

                {/* Row 1, Cols 1-3: Avatar & Bio */}
                <div className="md:col-span-3 glass-panel rounded-xl p-8 flex flex-col md:flex-row items-center gap-10 group border-l-4 border-l-primary/40 relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                    <div className="relative flex-shrink-0 z-10">
                        {/* Hexagonal Holographic Avatar */}
                        <div className="size-44 bg-primary/20 hex-clip flex items-center justify-center relative overflow-hidden group-hover:bg-primary/30 transition-all duration-500">
                            <div className="absolute inset-1 bg-black hex-clip z-10 flex items-center justify-center">
                                <img src="/avatar.jpg" alt="Avatar" className="opacity-80 hover:opacity-100 transition-opacity w-full h-full object-cover" />
                            </div>
                            {/* Rotating Rings (Simulated with CSS borders or similar if needed, kept simple for now) */}
                        </div>
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black border border-primary text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest z-20">
                            Status: Active
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 text-center md:text-left z-10">
                        <div className="inline-flex items-center justify-center md:justify-start gap-2 text-primary font-mono text-xs tracking-widest uppercase">
                            <span className="flex h-2 w-2 rounded-full bg-primary animate-ping"></span>
                            Mission_Manifest.exe
                        </div>
                        <h2 className="text-3xl font-bold uppercase leading-none">
                            Building Digital <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">Cognitive Systems</span>
                        </h2>
                        <p className="text-white/60 text-sm leading-relaxed max-w-lg">
                            Full-stack developed obsessed with bridging the gap between organic intent and silicon execution.
                            Specializing in high-performance web applications and AI agent orchestration.
                        </p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2">
                            <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded border border-white/10">
                                <span className="material-symbols-outlined text-sm text-cyber-blue">terminal</span>
                                <span className="text-xs uppercase tracking-tighter text-white/70">ZSH / Neovim</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Row 1, Col 4: Level Stat Box */}
                <div className="md:col-span-1 grid grid-rows-2 gap-4">
                    {/* Stat 1 */}
                    <div className="glass-card rounded-xl p-6 flex flex-col justify-between relative overflow-hidden">
                        <span className="material-symbols-outlined absolute top-4 right-4 text-white/10 text-6xl">bolt</span>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Energy Output</p>
                            <h3 className="text-3xl font-bold text-cyber-blue">98%</h3>
                        </div>
                        <div className="w-full bg-white/10 h-1 rounded-full mt-4 overflow-hidden">
                            <div className="bg-cyber-blue w-[98%] h-full"></div>
                        </div>
                    </div>

                    {/* Stat Grid */}
                    <div className="glass-card rounded-xl p-6 grid grid-cols-2 gap-2">
                        <div className="bg-white/5 p-2 rounded border border-white/5 hover:border-primary/20 transition-colors">
                            <p className="text-[9px] uppercase text-white/40 mb-1">Total XP</p>
                            <p className="text-sm font-bold font-mono">12,450</p>
                        </div>
                        <div className="bg-white/5 p-2 rounded border border-white/5 hover:border-primary/20 transition-colors">
                            <p className="text-[9px] uppercase text-white/40 mb-1">Rank</p>
                            <p className="text-sm font-bold font-mono text-cyber-blue">Archmage</p>
                        </div>
                    </div>
                </div>

                {/* Row 2: Skill Radar & Timeline */}

                {/* Col 1: Radar Chart (Simulated with SVG from HTML) */}
                <div className="md:col-span-1 glass-card rounded-xl p-6 flex flex-col items-center justify-center relative">
                    <h3 className="absolute top-6 left-6 text-[10px] font-bold uppercase tracking-widest text-white/50">Skill_Matrix</h3>

                    <svg viewBox="0 0 100 100" className="w-full max-w-[200px] drop-shadow-[0_0_10px_rgba(10,132,255,0.3)]">
                        <polygon points="50,10 90,35 90,80 50,100 10,80 10,35" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"></polygon>
                        <line x1="50" y1="50" x2="50" y2="10" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"></line>
                        <line x1="50" y1="50" x2="90" y2="35" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"></line>
                        <line x1="50" y1="50" x2="90" y2="80" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"></line>
                        <line x1="50" y1="50" x2="50" y2="100" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"></line>
                        <line x1="50" y1="50" x2="10" y2="80" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"></line>
                        <line x1="50" y1="50" x2="10" y2="35" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"></line>

                        {/* Skill Shape */}
                        <polygon fill="rgba(89, 242, 13, 0.2)" points="50,10 85,35 70,85 30,85 15,35" stroke="#59f20d" strokeWidth="1.5"></polygon>
                        <circle cx="50" cy="10" fill="#59f20d" r="1.5"></circle>
                        <circle cx="85" cy="35" fill="#59f20d" r="1.5"></circle>
                        <circle cx="70" cy="85" fill="#59f20d" r="1.5"></circle>
                        <circle cx="30" cy="85" fill="#59f20d" r="1.5"></circle>
                        <circle cx="15" cy="35" fill="#59f20d" r="1.5"></circle>
                    </svg>

                    <div className="flex justify-between w-full mt-4 px-2 text-[8px] font-mono text-white/40 uppercase">
                        <span>Frontend</span>
                        <span>Backend</span>
                        <span>AI/ML</span>
                    </div>
                </div>

                {/* Col 2-4: Timeline */}
                <div className="md:col-span-3 glass-card rounded-xl p-8 flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="font-bold text-sm tracking-widest uppercase">Career Timeline_</h3>
                        <div className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">Scale: Linear [2018 - Present]</div>
                    </div>

                    <div className="relative flex-1 flex items-center mt-4 overflow-x-auto pb-4">
                        {/* Connecting Line */}
                        <div className="absolute h-[1px] w-[90%] bg-gradient-to-r from-primary/10 via-primary/50 to-primary/10 top-1/2 -translate-y-1/2 left-[5%]"></div>

                        <div className="flex justify-between w-full min-w-[600px] px-8">
                            {/* Node 1 */}
                            <TimelineNode year="2018" role="Junior Dev" company="StartUp Inc" />
                            {/* Node 2 */}
                            <TimelineNode year="2020" role="Full Stack" company="Synthetix" active />
                            {/* Node 3 */}
                            <TimelineNode year="2023" role="Lead Architect" company="Nexus Core" />
                            {/* Node 4 */}
                            <TimelineNode year="NOW" role="Independent" company="Freelance" />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

function TimelineNode({ year, role, company, active = false }: { year: string, role: string, company: string, active?: boolean }) {
    return (
        <div className="flex flex-col items-center gap-3 group/node cursor-pointer relative z-10">
            <div className={`text-[10px] font-mono transition-colors ${active ? 'text-primary' : 'text-white/40 group-hover/node:text-white'}`}>
                {year}
            </div>

            <div className={`size-4 rounded-full border-2 transition-all duration-300 relative
                ${active
                    ? 'bg-black border-primary shadow-[0_0_10px_#59f20d]'
                    : 'bg-black border-white/20 group-hover/node:border-primary group-hover/node:scale-125'
                }`}
            >
                {active && <div className="absolute inset-0 bg-primary opacity-50 animate-ping rounded-full"></div>}
            </div>

            <div className="text-center absolute top-10 w-32 left-1/2 -translate-x-1/2 opacity-0 group-hover/node:opacity-100 transition-all duration-300 transform translate-y-2 group-hover/node:translate-y-0">
                <p className="text-xs font-bold whitespace-nowrap uppercase text-white">{role}</p>
                <p className="text-[9px] text-white/40 uppercase">{company}</p>
            </div>
        </div>
    )
}
