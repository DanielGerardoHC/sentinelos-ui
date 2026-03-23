import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";

interface Option {
    label: string;
    value: string;
    disabled?: boolean;
}

interface ResourceSelectorProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    onEditClick?: () => void; // Función que abrirá el segundo panel
    disabled?: boolean;
}

export function ResourceSelector({ label, value, onChange, options, onEditClick, disabled }: ResourceSelectorProps) {
    return (
        <div className="space-y-3">
            <Label className="text-zinc-500 font-mono text-xs uppercase tracking-wider">{label}</Label>
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <select
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        disabled={disabled}
                        className="w-full h-11 appearance-none rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50"
                    >
                        <option value="" disabled className="bg-zinc-950 text-zinc-500">Select...</option>
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value} disabled={opt.disabled} className="bg-zinc-950 text-zinc-300 disabled:text-zinc-600">
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
                        <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                </div>

                {onEditClick && (
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onEditClick}
                        className="h-11 w-11 shrink-0 border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-colors"
                    >
                        <Edit2 className="w-4 h-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}