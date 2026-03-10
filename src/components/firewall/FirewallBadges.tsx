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

export function ZoneBadge({ zone }: { zone: string }) {
    const isTrust = zone === 'trust';
    return (
        <Badge variant="outline" className={`font-mono text-[10px] uppercase px-2 py-0.5 ${isTrust ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-orange-500/30 text-orange-400 bg-orange-500/10'}`}>
            {isTrust ? <Shield className="w-3 h-3 mr-1.5" /> : <ShieldAlert className="w-3 h-3 mr-1.5" />}
            {zone}
        </Badge>
    );
}