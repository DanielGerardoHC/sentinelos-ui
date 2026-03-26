import { useTranslation } from 'react-i18next';
import { Hammer, TerminalSquare } from 'lucide-react';

interface ComingSoonProps {
    title?: string;
    description?: string;
}

export function ComingSoon({ title, description }: ComingSoonProps) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 border border-zinc-800/50 bg-zinc-950/50 rounded-xl relative overflow-hidden group">

            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center space-y-8">

                <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse" />
                    <div className="w-24 h-24 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center relative z-10 shadow-2xl">
                        <Hammer className="w-12 h-12 text-emerald-500" />
                    </div>
                </div>

                <div className="space-y-3 text-center max-w-md">
                    <h2 className="text-2xl font-bold font-mono text-zinc-100 tracking-tight">
                        {title || t('coming_soon.title')}
                    </h2>
                    <p className="text-sm font-mono text-zinc-400 leading-relaxed">
                        {description || t('coming_soon.desc')}
                    </p>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/80 border border-zinc-800 rounded-lg text-zinc-400 font-mono text-xs shadow-inner">
                    <TerminalSquare className="w-4 h-4 text-emerald-500/70" />
                    <span>sys.status: <span className="text-amber-400 font-bold animate-pulse">IN_DEVELOPMENT</span></span>
                </div>

            </div>
        </div>
    );
}