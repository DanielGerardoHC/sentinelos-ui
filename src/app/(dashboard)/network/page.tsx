'use client';

import { useTranslation } from 'react-i18next';
import CyberGlobe from '@/components/CyberGlobe';

export default function DashboardHomePage() {
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-zinc-100 font-mono">{t('dashboard.title')}</h1>
                <p className="text-zinc-400 mt-1">
                    {t('dashboard.subtitle')}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="h-32 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-lg shadow-emerald-900/5 flex flex-col justify-between hover:border-emerald-500/30 transition-colors">
                    <h3 className="text-zinc-400 text-sm font-mono uppercase tracking-wider">{t('dashboard.cpu_load')}</h3>
                    <p className="text-4xl font-bold text-emerald-500">12%</p>
                </div>
                <div className="h-32 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-lg shadow-emerald-900/5 flex flex-col justify-between hover:border-emerald-500/30 transition-colors">
                    <h3 className="text-zinc-400 text-sm font-mono uppercase tracking-wider">{t('dashboard.active_vpns')}</h3>
                    <p className="text-4xl font-bold text-emerald-500">4</p>
                </div>
                <div className="h-32 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-lg shadow-emerald-900/5 flex flex-col justify-between hover:border-emerald-500/30 transition-colors">
                    <h3 className="text-zinc-400 text-sm font-mono uppercase tracking-wider">{t('dashboard.threats_blocked')}</h3>
                    <p className="text-4xl font-bold text-emerald-500">1,024</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-[400px] rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 flex items-center justify-center border-dashed">
                   <span className="text-zinc-600 font-mono">
                     {t('dashboard.chart_placeholder')}
                   </span>
                </div>

                <div className="lg:col-span-1 h-[400px] rounded-xl border border-zinc-800 bg-black overflow-hidden relative flex items-center justify-center group shadow-lg">
                    <div className="absolute top-4 left-4 z-10">
                        <h3 className="text-zinc-300 text-sm font-mono uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            {t('dashboard.live_nodes')}
                        </h3>
                    </div>

                    <div className="absolute top-8">
                        <CyberGlobe widgetSize={380} />
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 pointer-events-none"></div>
                </div>
            </div>
        </div>
    );
}