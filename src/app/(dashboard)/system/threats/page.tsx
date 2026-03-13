'use client';

import CyberGlobe from '@/components/CyberGlobe';
import { motion, Variants } from 'framer-motion';
import { ShieldAlert, MapPin, Wifi, Database } from 'lucide-react';
import { useState, useEffect } from 'react';

// --- DATOS SIMULADOS PARA PRUEBAS (Template) ---
const mockAttacks = [
    { id: 1, time: '14:02:11', src: '185.2.x.x (RU)', type: 'SSH Brute-force', severity: 'critical' },
    { id: 2, time: '14:02:09', src: '45.33.x.x (US)', type: 'SQL Injection', severity: 'high' },
    { id: 3, time: '14:02:01', src: '112.x.x.x (CN)', type: 'DDoS SYN Flood', severity: 'critical' },
];

const mockLogs = [
    "[INFO] Firewall Policy 'Block_Tor' reloaded successfully.",
    "[WARN] High latency detected on interface enp0s8 (WAN).",
    "[ALERT] IDS/IPS engine detected 50 connection attempts in 1s from 91.x.x.x.",
    "[INFO] New VLAN 50 (Guest) active on parent interface enp0s9.",
    "[CRIT] Admin user login failure lock applied to IP 203.x.x.x."
];

const mockSources = [
    { country: 'CN', name: 'China', count: 1450, color: 'text-red-400' },
    { country: 'US', name: 'USA', count: 892, color: 'text-amber-400' },
    { country: 'RU', name: 'Russia', count: 715, color: 'text-orange-400' },
    { country: 'NL', name: 'Netherlands', count: 310, color: 'text-zinc-400' },
];

// --- COMPONENTES AUXILIARES DE DISEÑO (HUD Panels) ---
const HudPanel = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={`border border-emerald-950/50 bg-[#09090b]/70 backdrop-blur-sm rounded-lg p-4 font-mono shadow-2xl shadow-emerald-950/10 ${className}`}>
        {children}
    </div>
);

const Tag = ({ text, color }: { text: string, color: string }) => (
    <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded border ${color}`}>
        {text}
    </span>
);

export default function DashboardGlobePage() {
    const [liveLogs, setLiveLogs] = useState(mockLogs);

    useEffect(() => {
        const interval = setInterval(() => {
            setLiveLogs(prev => [...prev.slice(1), prev[0]]);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    // FIX de TypeScript para Framer Motion
    const panelVariantsLeft: Variants = {
        hidden: { opacity: 0, x: -30 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } }
    };

    const panelVariantsRight: Variants = {
        hidden: { opacity: 0, x: 30 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } }
    };

    return (
        <div className="w-full h-[calc(100vh-10rem)] relative overflow-hidden flex items-center justify-center bg-zinc-950/30">

            {/* FONDO GRID SUTIL */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#09090b_1px,transparent_1px),linear-gradient(to_bottom,#09090b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] opacity-30 pointer-events-none" />

            {/* ENCABEZADO TÁCTICO */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute top-6 left-1/2 -translate-x-1/2 text-center z-20 pointer-events-none"
            >
                <div className="flex items-center gap-3 justify-center">
                    <div className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-zinc-950"></span>
                    </div>
                    <h2 className="text-4xl font-bold font-mono tracking-tighter text-zinc-100 uppercase drop-shadow-md">
                        Threat Monitor
                    </h2>
                </div>
                <p className="text-zinc-500 font-mono text-xs tracking-wider mt-2 bg-zinc-950/80 px-4 py-1.5 rounded-full border border-zinc-800 inline-block backdrop-blur-md">
                    {">"} REAL-TIME GLOBAL INTRUSION VISUALIZER
                </p>
            </motion.div>

            {/* EL GLOBO FLOTANDO EN EL CENTRO */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none"
            >
                <div className="absolute bg-emerald-950/20 rounded-full blur-[120px] w-96 h-96 transform scale-150" />
                <div className="scale-110">
                    <CyberGlobe />
                </div>
            </motion.div>

            {/* --- CAPA HUD TÁCTICA (Caja Flexible a los bordes) --- */}
            <div className="absolute inset-0 w-full h-full p-8 flex justify-between z-10 pointer-events-none">

                {/* COLUMNA IZQUIERDA */}
                <div className="flex flex-col justify-between h-full w-[400px]">
                    {/* PANEL SUPERIOR IZQUIERDO: System Status */}
                    <motion.div variants={panelVariantsLeft} initial="hidden" animate="visible" className="pointer-events-auto mt-20">
                        <HudPanel className="space-y-3">
                            <div className="flex items-center gap-3 text-emerald-400 pb-2 border-b border-emerald-950/50">
                                <Wifi className="w-5 h-5" />
                                <h4 className="text-sm font-bold uppercase tracking-wider">System Status</h4>
                            </div>
                            <div className="space-y-2 text-sm text-zinc-300">
                                <div className="flex justify-between items-center">
                                    <span>Global Threat Level:</span>
                                    <Tag text="Elevated" color="border-amber-500 text-amber-400 bg-amber-950/30" />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Active IDS Engines:</span>
                                    <span className="text-emerald-400 font-bold">14/14</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>WAN Traffic (enp0s8):</span>
                                    <span className="text-zinc-500">235 Mbps</span>
                                </div>
                            </div>
                        </HudPanel>
                    </motion.div>

                    {/* PANEL INFERIOR IZQUIERDO: Live System Logs */}
                    <motion.div variants={panelVariantsLeft} initial="hidden" animate="visible" transition={{ delay: 0.2 }} className="pointer-events-auto mb-2">
                        <HudPanel className="h-44 overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/90 via-transparent to-transparent pointer-events-none z-10" />
                            <div className="flex items-center gap-3 text-emerald-400 mb-3 pb-2 border-b border-emerald-950/50 relative z-20 bg-[#09090b]/40">
                                <Database className="w-5 h-5" />
                                <h4 className="text-sm font-bold uppercase tracking-wider">Live System Logs</h4>
                            </div>
                            <div className="space-y-1.5 relative z-0 mt-2">
                                {liveLogs.map((log, i) => (
                                    <motion.p
                                        key={i}
                                        layout
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1 - (i*0.25), x: 0 }}
                                        className={`text-[11px] leading-tight truncate font-mono ${log.includes('[CRIT]') ? 'text-red-400 font-bold' : log.includes('[ALERT]') ? 'text-amber-400' : 'text-zinc-500'}`}
                                    >
                                        {"> "} {log}
                                    </motion.p>
                                ))}
                            </div>
                        </HudPanel>
                    </motion.div>
                </div>

                {/* COLUMNA DERECHA */}
                <div className="flex flex-col justify-between h-full w-[420px]">
                    {/* PANEL SUPERIOR DERECHO: Top Fuentes */}
                    <motion.div variants={panelVariantsRight} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className="pointer-events-auto mt-20">
                        <HudPanel>
                            <div className="flex items-center gap-3 text-emerald-400 mb-4 pb-2 border-b border-emerald-950/50">
                                <MapPin className="w-5 h-5" />
                                <h4 className="text-sm font-bold uppercase tracking-wider">Top Attack Sources (24h)</h4>
                            </div>
                            <div className="space-y-3">
                                {mockSources.map((src, i) => (
                                    <div key={i} className="flex justify-between items-center text-sm font-mono bg-zinc-950/30 p-2 rounded border border-zinc-800/50">
                                        <div className="flex items-center gap-3">
                                            <span className="text-zinc-600 text-xs w-3">{i+1}.</span>
                                            <span className={`text-zinc-200 font-bold ${src.color}`}>{src.country}</span>
                                            <span className="text-zinc-400">{src.name}</span>
                                        </div>
                                        <span className={`font-bold ${src.color}`}>{src.count.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </HudPanel>
                    </motion.div>

                    {/* PANEL INFERIOR DERECHO: Alertas de Intrusión */}
                    <motion.div variants={panelVariantsRight} initial="hidden" animate="visible" transition={{ delay: 0.3 }} className="pointer-events-auto mb-2">
                        <HudPanel className="border-red-950/50 shadow-red-950/10">
                            <div className="flex items-center gap-3 text-red-500 mb-3 pb-2 border-b border-red-950/50 bg-red-950/10 -mx-4 -mt-4 p-4 rounded-t-lg">
                                <ShieldAlert className="w-5 h-5 animate-pulse" />
                                <h4 className="text-sm font-bold uppercase tracking-wider text-red-400">Active Intrusion Alerts</h4>
                            </div>
                            <div className="space-y-2 mt-4">
                                {mockAttacks.map((atk, i) => (
                                    <motion.div
                                        key={atk.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className={`p-3 rounded border ${atk.severity === 'critical' ? 'border-red-900/50 bg-red-950/20' : 'border-amber-900/50 bg-amber-950/10'}`}
                                    >
                                        <div className="flex justify-between items-center font-bold mb-1">
                                            <span className={`${atk.severity === 'critical' ? 'text-red-400' : 'text-amber-400'} text-xs tracking-wide`}>{atk.type}</span>
                                            <span className="text-zinc-500 text-[10px] bg-zinc-950 px-2 py-0.5 rounded">{atk.time}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[11px] text-zinc-400">
                                            <p>Source IP: <span className="text-zinc-200 font-mono">{atk.src}</span></p>
                                            <Tag text={atk.severity} color={atk.severity === 'critical' ? 'border-red-600 text-red-500' : 'border-amber-600 text-amber-500'} />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </HudPanel>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}