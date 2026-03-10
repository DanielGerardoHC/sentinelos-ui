// Ruta: src/components/DhcpModal.tsx
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Server, X } from "lucide-react";

interface DhcpModalProps {
    isOpen: boolean;
    onClose: () => void;
    interfaceName: string;
}

export default function DhcpModal({ isOpen, onClose, interfaceName }: DhcpModalProps) {
    const [dhcpEnabled, setDhcpEnabled] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-zinc-800 bg-zinc-900/30 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold font-mono text-zinc-100 flex items-center gap-2">
                            <Server className="w-5 h-5 text-emerald-500" />
                            DHCP Configuration
                        </h3>
                        <p className="text-zinc-500 text-xs font-mono mt-1">Target: {interfaceName}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="text-zinc-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="p-6 space-y-6">
                    <label className="flex items-center gap-3 p-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 cursor-pointer hover:bg-emerald-500/10 transition-colors">
                        <input
                            type="checkbox"
                            checked={dhcpEnabled}
                            onChange={() => setDhcpEnabled(!dhcpEnabled)}
                            className="w-5 h-5 accent-emerald-500 bg-zinc-900 border-zinc-700"
                        />
                        <span className="font-mono text-sm text-emerald-400 font-bold uppercase tracking-wider">Enable DHCP Server</span>
                    </label>

                    <div className={`space-y-4 transition-opacity ${dhcpEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-zinc-500 font-mono text-xs uppercase">Range Start</Label>
                                <Input className="bg-zinc-900 border-zinc-800 font-mono text-sm text-zinc-300" placeholder="10.x.x.100" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-500 font-mono text-xs uppercase">Range End</Label>
                                <Input className="bg-zinc-900 border-zinc-800 font-mono text-sm text-zinc-300" placeholder="10.x.x.200" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-500 font-mono text-xs uppercase">Default Gateway</Label>
                            <Input className="bg-zinc-900 border-zinc-800 font-mono text-sm text-zinc-300" placeholder="10.x.x.1" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-zinc-500 font-mono text-xs uppercase">Primary DNS</Label>
                                <Input className="bg-zinc-900 border-zinc-800 font-mono text-sm text-zinc-300" placeholder="8.8.8.8" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-500 font-mono text-xs uppercase">Secondary DNS</Label>
                                <Input className="bg-zinc-900 border-zinc-800 font-mono text-sm text-zinc-300" placeholder="1.1.1.1" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-zinc-800 bg-zinc-900/30 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 font-mono uppercase text-xs">Close</Button>
                    <Button onClick={onClose} className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono uppercase text-xs">Save Settings</Button>
                </div>
            </div>
        </div>
    );
}