import { Label } from "@/components/ui/label";

interface ManagementSelectorProps {
    selectedServices: string[];
    onChange: (service: string) => void;
}

export function ManagementSelector({ selectedServices, onChange }: ManagementSelectorProps) {
    const availableServices = ['ping', 'ssh', 'https', 'http'];

    return (
        <div className="space-y-4 pt-4 border-t border-zinc-800">
            <Label className="text-zinc-500 font-mono text-xs uppercase">Administrative Access</Label>
            <div className="grid grid-cols-2 gap-4">
                {availableServices.map(svc => (
                    <label key={svc} className="flex items-center gap-3 p-3 rounded-lg border border-zinc-800 bg-zinc-900/30 cursor-pointer hover:bg-zinc-800/50 transition-colors group">
                        <input
                            type="checkbox"
                            checked={selectedServices.includes(svc)}
                            onChange={() => onChange(svc)}
                            className="w-4 h-4 accent-emerald-500 rounded bg-zinc-900 border-zinc-700 focus:ring-emerald-500/50"
                        />
                        <span className="font-mono text-sm text-zinc-300 uppercase group-hover:text-emerald-400 transition-colors">{svc}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}