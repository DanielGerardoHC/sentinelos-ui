import { Badge } from "@/components/ui/badge";
import { Shield, ShieldAlert } from "lucide-react";

export function StatusBadge({ state }: { state: string }) {
    const isUp = state === 'up';
    return (
        <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isUp ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`}></span>
            <span className="text-zinc-300 font-mono text-xs uppercase tracking-wider">{state}</span>
        </div>
    );
}

export function ZoneBadge({ zone, color = 'zinc' }: { zone?: string; color?: string }) {
    if (!zone) return <span className="text-zinc-600 italic font-mono text-xs">-</span>;

    const colors: Record<string, string> = {
        emerald: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
        red: 'text-red-400 border-red-500/30 bg-red-500/10',
        amber: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
        blue: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
        purple: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
        zinc: 'text-zinc-400 border-zinc-500/30 bg-zinc-500/10',
    };

    const style = colors[color] || colors.zinc;

    return (
        <span className={`px-2 py-0.5 rounded border font-mono text-xs tracking-wide uppercase ${style}`}>
            {zone}
        </span>
    );
}