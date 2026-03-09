'use client';

import CyberGlobe from '@/components/CyberGlobe';
import { motion } from 'framer-motion';

export default function DashboardGlobePage() {
    return (
        // h-[calc(100vh-10rem)] restamos el tamaño del header y padding para centrar verticalmente perfecto
        <div className="w-full h-[calc(100vh-10rem)] flex flex-col items-center justify-center relative overflow-hidden">

            {/* Encabezado sutil */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute top-0 text-center space-y-2 z-10"
            >
                <h2 className="text-4xl font-bold font-mono tracking-tighter text-zinc-100 uppercase">
                    Threat Monitor
                </h2>
                <p className="text-zinc-500 font-mono text-sm tracking-wider">
                    {">"} Intrusions and traffic sources visualize platform
                </p>
            </motion.div>

            {/* EL GLOBO FLOTANDO EN EL CENTRO */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }} // Mismo ease del menú push
                className="relative"
            >
                <CyberGlobe />
            </motion.div>

        </div>
    );
}