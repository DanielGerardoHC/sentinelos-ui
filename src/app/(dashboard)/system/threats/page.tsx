'use client';

import CyberGlobe from '@/components/CyberGlobe';
import { motion, Variants } from 'framer-motion';

import { ShieldAlert, MapPin, Radio, Wifi, Database } from 'lucide-react';
import { useState, useEffect } from 'react';

// --- DATOS SIMULADOS PARA PRUEBAS (Template) ---
const mockAttacks = [
    { id: 1, time: '14:02:11', src: '185.2.x.x (RU)', type: 'SSH Brute-force', severity: 'critical' },
    { id: 2, time: '14:02:09', src: '45.33.x.x (US)', type: 'SQL Injection', severity: 'high' },
    { id: 3, time: '14:02:01', src: '112.x.x.x (CN)', type: 'DDoS SYN Flood', severity: 'critical' },
    { id: 4, time: '14:01:55', src: 'Internal (LAN)', type: 'Port Scan detected', severity: 'medium' },
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
    // Simulación simple de flujo de logs (solo visual para el template)
    const [liveLogs, setLiveLogs] = useState(mockLogs);
    useEffect(() => {
        const interval = setInterval(() => {
            setLiveLogs(prev => [...prev.slice(1), prev[0]]); // Cicla los logs
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
    };

    const panelVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                // El 'as const' le dice a TS que es una tupla fija de 4 valores,
                // justo lo que Framer Motion exige.
                ease: [0.16, 1, 0.3, 1] as const
            }
        }
    };

    return (
        <div className="w-full h-[calc(100vh-10rem)] relative overflow-hidden flex items-center justify-center bg-zinc-950/30">

            {/* FONDO GRID SUTIL */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#09090b_1px,transparent_1px),linear-gradient(to_bottom,#09090b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] opacity-30" />

            {/* ENCABEZADO TÁCTICO */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute top-8 left-1/2 -translate-x-1/2 text-center z-10"
            >
                <div className="flex items-center gap-3 justify-center">
                    <div className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-zinc-950"></span>
                    </div>
                    <h2 className="text-4xl font-bold font-mono tracking-tighter text-zinc-100 uppercase">
                        Threat Monitor
                    </h2>
                </div>
                <p className="text-zinc-500 font-mono text-sm tracking-wider mt-2 bg-zinc-950/50 px-3 py-1 rounded-full border border-zinc-900 inline-block">
                    {">"} REAL-TIME GLOBAL INTRUSION VISUALIZER
                </p>
            </motion.div>

            {/* EL GLOBO FLOTANDO EN EL CENTRO */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-0"
            >
                {/* Brillo detrás del globo */}
                <div className="absolute inset-0 bg-emerald-950/30 rounded-full blur-[100px] transform scale-150" />
                <CyberGlobe />
            </motion.div>

            {/* --- CAPA HUD TÁCTICA (Cuadrantes flontantes) --- */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="absolute inset-0 w-full h-full p-10 grid grid-cols-4 grid-rows-4 z-10 pointer-events-none"
            >
                {/* CUADRANTE 1: PANEL SUPERIOR IZQUIERDO - Resumen de Estado */}
                <motion.div variants={panelVariants} className="col-start-1 row-start-1 pointer-events-auto">
                    <HudPanel className="space-y-3">
                        <div className="flex items-center gap-3 text-emerald-400 pb-2 border-b border-emerald-950/50">
                            <Wifi className="w-5 h-5" />
                            <h4 className="text-sm font-bold uppercase">System Status</h4>
                        </div>
                        <div className="space-y-1.5 text-sm text-zinc-300">
                            <p>Global Threat Level: <Tag text="Elevated" color="border-amber-500 text-amber-400" /></p>
                            <p>Active IDS Engines: <span className="text-emerald-400">14/14</span></p>
                            <p>WAN Traffic (enp0s8): <span className="text-zinc-500">235 Mbps</span></p>
                        </div>
                    </HudPanel>
                </motion.div>

                {/* CUADRANTE 2: PANEL SUPERIOR DERECHO - Top Fuentes de Ataque */}
                <motion.div variants={panelVariants} className="col-start-4 row-start-1 pointer-events-auto">
                    <HudPanel>
                        <div className="flex items-center gap-3 text-emerald-400 mb-4 pb-2 border-b border-emerald-950/50">
                            <MapPin className="w-5 h-5" />
                            <h4 className="text-sm font-bold uppercase">Top Attack Sources (24h)</h4>
                        </div>
                        <div className="space-y-2.5">
                            {mockSources.map((src, i) => (
                                <div key={i} className="flex justify-between items-center text-sm font-mono">
                                    <div className="flex items-center gap-2">
                                        <span className="text-zinc-600 text-xs">{i+1}.</span>
                                        <span className={`text-zinc-200 font-bold ${src.color}`}>{src.country}</span>
                                        <span className="text-zinc-400">{src.name}</span>
                                    </div>
                                    <span className={`font-bold ${src.color}`}>{src.count.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </HudPanel>
                </motion.div>

                {/* CUADRANTE 3: PANEL INFERIOR IZQUIERDO - Logs del Sistema (Simulado) */}
                <motion.div variants={panelVariants} className="col-start-1 col-span-2 row-start-4 pointer-events-auto self-end">
                    <HudPanel className="h-40 overflow-hidden relative">
                        {/* Degradado para efecto de 'viejos logs desapareciendo' */}
                        <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/80 via-transparent to-transparent pointer-events-none z-10" />
                        <div className="flex items-center gap-3 text-emerald-400 mb-3 pb-2 border-b border-emerald-950/50 relative z-20 bg-[#09090b]/20">
                            <Database className="w-5 h-5" />
                            <h4 className="text-sm font-bold uppercase">Live System Logs</h4>
                        </div>
                        <div className="space-y-1 relative z-0">
                            {liveLogs.map((log, i) => (
                                <motion.p
                                    key={i}
                                    layout
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1 - (i*0.2), x: 0 }} // Desvanecimiento progresivo
                                    className={`text-[11px] leading-tight truncate font-mono ${log.includes('[CRIT]') ? 'text-red-400' : log.includes('[ALERT]') ? 'text-amber-400' : 'text-zinc-500'}`}
                                >
                                    {"> "} {log}
                                </motion.p>
                            ))}
                        </div>
                    </HudPanel>
                </motion.div>

                <motion.div variants={panelVariants} className="col-start-3 col-span-2 row-start-3 row-span-2 pointer-events-auto self-end">
                    <HudPanel>
                        <div className="flex items-center gap-3 text-red-400 mb-3 pb-2 border-b border-red-950/50">
                            <ShieldAlert className="w-5 h-5 animate-pulse" />
                            <h4 className="text-sm font-bold uppercase">Active Intrusion Alerts</h4>
                        </div>
                        <div className="space-y-2 max-h-56 overflow-hidden">
                            {mockAttacks.map((atk, i) => (
                                <motion.div
                                    key={atk.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`p-2.5 rounded border ${atk.severity === 'critical' ? 'border-red-900 bg-red-950/30' : 'border-amber-900 bg-amber-950/20'}`}
                                >
                                    <div className="flex justify-between items-center font-bold">
                                        <span className={`${atk.severity === 'critical' ? 'text-red-300' : 'text-amber-300'} text-xs`}>{atk.type}</span>
                                        <span className="text-zinc-500 text-[10px]">{atk.time}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[11px] text-zinc-400 mt-1">
                                        <p>Source IP: <span className="text-zinc-100">{atk.src}</span></p>
                                        <Tag text={atk.severity} color={atk.severity === 'critical' ? 'border-red-600 text-red-400' : 'border-amber-600 text-amber-400'} />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </HudPanel>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.1 }}
                    transition={{ delay: 1, duration: 2 }}
                    className="absolute inset-0 z-0 pointer-events-none"
                >
                    <svg width="100%" height="100%" className="text-emerald-950">
                        <line x1="20%" y1="20%" x2="50%" y2="50%" stroke="currentColor" strokeWidth="1" strokeDasharray="5 5" />
                        <line x1="80%" y1="20%" x2="50%" y2="50%" stroke="currentColor" strokeWidth="1" strokeDasharray="5 5" />
                        <line x1="25%" y1="80%" x2="50%" y2="50%" stroke="currentColor" strokeWidth="1" strokeDasharray="5 5" />
                        <line x1="75%" y1="80%" x2="50%" y2="50%" stroke="currentColor" strokeWidth="1" strokeDasharray="5 5" />
                        <circle cx="20%" cy="20%" r="3" className="fill-emerald-950" />
                        <circle cx="80%" cy="20%" r="3" className="fill-emerald-950" />
                        <circle cx="25%" cy="80%" r="3" className="fill-emerald-950" />
                        <circle cx="75%" cy="80%" r="3" className="fill-emerald-950" />
                    </svg>
                </motion.div>

            </motion.div>
        </div>
    );
}