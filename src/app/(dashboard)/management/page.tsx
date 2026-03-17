'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSystemInfo } from '@/hooks/useSystemInfo';
import { PageHeader } from '@/components/firewall/PageHeader';
import { Globe, User, Activity, CheckCircle2, ShieldCheck, Server, Network, Route, Loader2 } from "lucide-react";

export default function ManagementPage() {
    const { t, i18n } = useTranslation();
    const [mounted, setMounted] = useState(false);
    const [activeLang, setActiveLang] = useState('en');
    const { user, status, fetchAllInfo, isLoading } = useSystemInfo();

    useEffect(() => {
        setMounted(true);
        fetchAllInfo();

        const savedLang = localStorage.getItem('i18nextLng') || i18n.language || 'en';
        const shortLang = savedLang.substring(0, 2);
        setActiveLang(['en', 'es', 'fr', 'zh'].includes(shortLang) ? shortLang : 'en');
    }, [fetchAllInfo, i18n.language]);

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('i18nextLng', lng);
        setActiveLang(lng);
    };

    if (!mounted) return null;

    const formatExpiration = (unixTime: number) => {
        return new Date(unixTime * 1000).toLocaleString(activeLang, {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6 relative overflow-hidden">
            <PageHeader
                title={t('mgmt.title')}
                description={t('mgmt.desc')}
                onRefresh={fetchAllInfo}
                isLoading={isLoading}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-6 col-span-1">
                    <div className="border border-zinc-800/50 bg-[#09090b]/50 backdrop-blur-sm rounded-xl p-6 shadow-xl">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800/50">
                            <div className="p-2 bg-emerald-500/10 rounded-lg">
                                <Globe className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold font-mono text-zinc-100 uppercase tracking-wider">
                                    {t('mgmt.lang_title')}
                                </h3>
                                <p className="text-xs font-mono text-zinc-500 mt-1">
                                    {t('mgmt.lang_desc')}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {[
                                { code: 'en', label: 'English' },
                                { code: 'es', label: 'Español' },
                                { code: 'fr', label: 'Français' },
                                { code: 'zh', label: '中文 (Chino)' }
                            ].map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => changeLanguage(lang.code)}
                                    className={`flex items-center justify-between p-3 rounded-lg border font-mono text-sm transition-all duration-200 ${
                                        activeLang === lang.code
                                            ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                                            : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                                    }`}
                                >
                                    <span>{lang.label}</span>
                                    {activeLang === lang.code && <CheckCircle2 className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="col-span-1 lg:col-span-2 space-y-6">
                    <div className="border border-zinc-800/50 bg-[#09090b]/50 backdrop-blur-sm rounded-xl p-6 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-opacity group-hover:bg-emerald-500/10" />

                        <div className="flex items-start gap-4 relative z-10">
                            <div className="p-4 bg-zinc-950 rounded-full border border-zinc-800">
                                <User className="w-8 h-8 text-zinc-300" />
                            </div>
                            <div className="flex-1 w-full">
                                <h3 className="text-lg font-bold font-mono text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                                    {t('mgmt.admin_title')} <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                </h3>

                                {isLoading && !user ? (
                                    <div className="mt-4 flex items-center justify-center p-6 text-emerald-500"><Loader2 className="w-6 h-6 animate-spin" /></div>
                                ) : user ? (
                                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="p-3 bg-zinc-950/50 border border-zinc-800/50 rounded-lg">
                                            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mb-1">{t('mgmt.username')}</p>
                                            <p className="text-sm text-zinc-200 font-mono">{user.username}</p>
                                        </div>
                                        <div className="p-3 bg-zinc-950/50 border border-zinc-800/50 rounded-lg">
                                            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mb-1">{t('mgmt.role')}</p>
                                            <p className={`text-sm font-mono uppercase tracking-wider ${user.role === 'superadmin' ? 'text-emerald-400 font-bold' : 'text-zinc-300'}`}>
                                                {user.role}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-zinc-950/50 border border-zinc-800/50 rounded-lg">
                                            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mb-1">{t('mgmt.expires')}</p>
                                            <p className="text-xs text-zinc-400 font-mono mt-1">{formatExpiration(user.expires)}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-4 p-4 text-sm font-mono text-zinc-500 border border-zinc-800 border-dashed rounded bg-zinc-950/30">{t('mgmt.data_unavailable')}</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="border border-zinc-800/50 bg-[#09090b]/50 backdrop-blur-sm rounded-xl p-6 shadow-xl flex items-start gap-4">
                        <div className="p-4 bg-zinc-950 rounded-full border border-zinc-800">
                            <Activity className="w-8 h-8 text-zinc-300" />
                        </div>
                        <div className="flex-1 w-full">
                            <h3 className="text-lg font-bold font-mono text-zinc-100 uppercase tracking-wider mb-4">
                                {t('mgmt.status_title')}
                            </h3>

                            {isLoading && !status ? (
                                <div className="flex items-center justify-center p-6 text-emerald-500"><Loader2 className="w-6 h-6 animate-spin" /></div>
                            ) : status ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-4 bg-zinc-950/80 border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center text-center gap-2 relative overflow-hidden">
                                        <ShieldCheck className={`w-6 h-6 ${status.firewall ? 'text-emerald-500' : 'text-red-500'}`} />
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">{t('mgmt.firewall_engine')}</p>
                                            <div className="flex items-center justify-center gap-2">
                                                {status.firewall && <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>}
                                                <p className={`text-xs font-bold font-mono uppercase ${status.firewall ? 'text-emerald-400' : 'text-red-400'}`}>{status.firewall ? t('mgmt.active') : t('mgmt.disabled')}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-zinc-950/80 border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center text-center gap-2">
                                        <Server className={`w-6 h-6 ${status.dhcp ? 'text-emerald-500' : 'text-zinc-600'}`} />
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">{t('mgmt.dhcp_service')}</p>
                                            <div className="flex items-center justify-center gap-2">
                                                {status.dhcp && <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>}
                                                <p className={`text-xs font-bold font-mono uppercase ${status.dhcp ? 'text-emerald-400' : 'text-zinc-500'}`}>{status.dhcp ? t('mgmt.running') : t('mgmt.stopped')}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-zinc-950/80 border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center text-center gap-2">
                                        <Network className="w-6 h-6 text-zinc-400" />
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">{t('mgmt.interfaces')}</p>
                                            <p className="text-xl font-bold font-mono text-zinc-100">{status.interfaces}</p>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-zinc-950/80 border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center text-center gap-2">
                                        <Route className="w-6 h-6 text-zinc-400" />
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">{t('mgmt.routing_table')}</p>
                                            <p className="text-xl font-bold font-mono text-zinc-100">{status.routes}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-4 p-4 text-sm font-mono text-zinc-500 border border-zinc-800 border-dashed rounded bg-zinc-950/30">{t('mgmt.data_unavailable')}</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}