import { useTranslation } from 'react-i18next';
import { Label } from "@/components/ui/label";
import { Activity, X } from "lucide-react";

interface AdminStateSelectorProps {
    value: string;
    onChange: (state: string) => void;
}

export function AdminStateSelector({ value, onChange }: AdminStateSelectorProps) {
    const { t } = useTranslation();

    return (
        <div className="space-y-3">
            <Label className="text-zinc-500 font-mono text-xs uppercase flex items-center justify-between">
                {t('admin_state.title')}
            </Label>
            <div className="flex gap-4">
                <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${value === 'up' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-zinc-800 bg-zinc-900/30 text-zinc-500 hover:bg-zinc-800'}`}>
                    <input type="radio" value="up" checked={value === 'up'} onChange={() => onChange('up')} className="hidden" />
                    <Activity className="w-4 h-4" /> {t('admin_state.up')}
                </label>
                <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${value === 'down' ? 'border-red-500 bg-red-500/10 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-zinc-800 bg-zinc-900/30 text-zinc-500 hover:bg-zinc-800'}`}>
                    <input type="radio" value="down" checked={value === 'down'} onChange={() => onChange('down')} className="hidden" />
                    <X className="w-4 h-4" /> {t('admin_state.down')}
                </label>
            </div>
        </div>
    );
}