"use client";

export default function NodesPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="flex flex-col min-h-screen">

                {/* Header Section */}
                <section className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div>

                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
                            Neural <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">Nodes</span>
                        </h1>
                    </div>
                    <div className="h-10 w-10 rounded-full border border-primary/30 p-0.5">
                        <div className="h-full w-full rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-sm">grid_view</span>
                        </div>
                    </div>
                </section>

                {/* Filter Bar */}
                <div className="flex flex-wrap items-center gap-3 mb-12 border-y border-white/5 py-6">
                    <FilterButton active label="All_Nodes" />
                    <FilterButton label="Web_Core" />
                    <FilterButton label="AI_Models" />
                    <FilterButton label="Hardware" />

                    <div className="ml-auto text-white/30 text-xs font-mono hidden md:flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">search</span>
                        <span>Filter active: 0x01</span>
                    </div>
                </div>

                {/* Masonry Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)]">

                    {/* Card 1: Features Project */}
                    <div className="glass-card rounded-xl p-6 flex flex-col gap-4 row-span-2 col-span-1 lg:col-span-1">
                        <div className="h-40 rounded-lg overflow-hidden relative group bg-white/5">
                            <div className="absolute inset-0 bg-gradient-to-t from-background-dark to-transparent opacity-60 z-10"></div>
                            {/* Placeholder for project image */}
                            <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors"></div>
                            <div className="absolute bottom-3 left-3 z-20">
                                <h3 className="text-lg font-bold uppercase tracking-tight text-white group-hover:text-primary transition-colors">Moltbot_AI</h3>
                            </div>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed mb-2">
                            A distributed neural mesh network designed for high-concurrency synthetic reasoning tasks.
                        </p>
                        <div className="mt-auto space-y-4">
                            <div className="flex flex-wrap gap-2">
                                <TechTag name="PYTORCH" />
                                <TechTag name="CUDA" />
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary w-3/4 shadow-[0_0_10px_rgba(89,242,13,0.5)]"></div>
                                </div>
                                <span className="text-[10px] font-mono text-primary">75% Load</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Featured Project Large */}
                    <div className="glass-card rounded-xl p-0 overflow-hidden flex flex-col col-span-1 lg:col-span-2 row-span-2 bg-gradient-to-br from-[#121212] to-background-dark relative group">
                        <div className="absolute inset-0 bg-[url('/grid.png')] opacity-20"></div>
                        <div className="p-8 flex flex-col justify-center relative z-10 h-full">
                            <span className="text-primary text-[10px] font-bold tracking-[0.4em] uppercase mb-4">Core Research</span>
                            <h3 className="text-3xl font-black tracking-tighter mb-4 uppercase leading-none text-white group-hover:text-primary transition-colors">Project: AEON</h3>
                            <p className="text-white/60 max-w-md text-sm leading-relaxed mb-8">
                                An attempt to digitize human memory fragments using vector embeddings and graph databases.
                                Establishing a permanent bridge between biological retention and silicon storage.
                            </p>
                            <button className="w-fit px-6 py-3 bg-primary text-black font-bold uppercase text-xs tracking-widest hover:bg-white transition-colors">
                                Access_Data
                            </button>
                        </div>
                        {/* Decorative gradient overlay */}
                        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-primary/10 to-transparent pointer-events-none"></div>
                    </div>

                    {/* Card 3: Small Stats */}
                    <div className="glass-card rounded-xl p-6 flex flex-col justify-between">
                        <span className="material-symbols-outlined text-4xl text-white/20">memory</span>
                        <div>
                            <p className="text-[10px] uppercase text-white/40 mb-1">Total Nodes</p>
                            <p className="text-2xl font-bold font-mono text-white">1,024</p>
                        </div>
                    </div>

                    {/* Card 4: Action */}
                    <div className="glass-card rounded-xl p-6 flex flex-col justify-center items-center text-center">
                        <span className="material-symbols-outlined text-3xl text-primary mb-2">add_circle</span>
                        <p className="text-xs uppercase font-bold text-white/80">Deploy Node</p>
                        <p className="text-[10px] text-white/40 mt-1">Initiate new project</p>
                    </div>

                </div>
            </div>
        </div>
    );
}

function FilterButton({ label, active = false }: { label: string, active?: boolean }) {
    if (active) {
        return (
            <button className="px-6 py-2 rounded-lg bg-primary text-background-dark font-bold text-xs tracking-widest uppercase shadow-[0_0_20px_rgba(89,242,13,0.3)] transition-all">
                {label}
            </button>
        )
    }
    return (
        <button className="px-6 py-2 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-primary/50 font-bold text-xs tracking-widest uppercase transition-all">
            {label}
        </button>
    )
}

function TechTag({ name }: { name: string }) {
    return (
        <span className="text-[10px] font-mono text-primary bg-primary/5 px-2 py-1 rounded border border-primary/10">
            {name}
        </span>
    )
}
