// Ruta: src/components/DhcpModal.tsx
import { useState, useEffect } from 'react';
import { useDhcp } from '@/hooks/useDhcp';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Server, X, Loader2 } from "lucide-react";

interface DhcpModalProps {
    isOpen: boolean;
    onClose: () => void;
    interfaceName: string;
}

export default function DhcpModal({ isOpen, onClose, interfaceName }: DhcpModalProps) {
    const { dhcpPools, fetchDhcpPools, saveDhcp, deleteDhcp, isLoading } = useDhcp();

    const [dhcpEnabled, setDhcpEnabled] = useState(false);
    const [existsInApi, setExistsInApi] = useState(false);
    const [startIp, setStartIp] = useState('');
    const [endIp, setEndIp] = useState('');
    const [gateway, setGateway] = useState('');
    const [dns1, setDns1] = useState('8.8.8.8');
    const [dns2, setDns2] = useState('1.1.1.1');
    const [leaseTime, setLeaseTime] = useState(1440); // 24 horas por defecto

    // Buscar configuración al abrir el modal
    useEffect(() => {
        if (isOpen) {
            fetchDhcpPools().then(() => {
                const existingConfig = dhcpPools.find(d => d.interface === interfaceName);
                if (existingConfig) {
                    setExistsInApi(true);
                    setDhcpEnabled(true);
                    setStartIp(existingConfig.start_ip);
                    setEndIp(existingConfig.end_ip);
                    setGateway(existingConfig.gateway);
                    setDns1(existingConfig.dns?.[0] || '');
                    setDns2(existingConfig.dns?.[1] || '');
                    setLeaseTime(existingConfig.lease_time || 1440);
                } else {
                    setExistsInApi(false);
                    setDhcpEnabled(false);
                    setStartIp(''); setEndIp(''); setGateway('');
                }
            });
        }
    }, [isOpen, interfaceName]);

    const handleSave = async () => {
        if (!dhcpEnabled) {
            if (existsInApi) await deleteDhcp(interfaceName);
            onClose();
            return;
        }

        const payload = {
            interface: interfaceName,
            start_ip: startIp,
            end_ip: endIp,
            gateway: gateway,
            dns: [dns1, dns2].filter(Boolean), // Quita vacíos
            lease_time: Number(leaseTime)
        };

        // Si ya existía hacemos PUT, si es nuevo hacemos POST
        const method = existsInApi ? 'PUT' : 'POST';
        const success = await saveDhcp(method, interfaceName, payload);
        if (success) onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[#09090b] border border-zinc-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-zinc-800 bg-zinc-950/50 flex items-center justify-between">
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
                    <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${dhcpEnabled ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-zinc-800 bg-zinc-950 hover:bg-zinc-900/50'}`}>
                        <input type="checkbox" checked={dhcpEnabled} onChange={() => setDhcpEnabled(!dhcpEnabled)} className="w-5 h-5 accent-emerald-500 bg-zinc-950 border-zinc-700" />
                        <span className="font-mono text-sm text-emerald-400 font-bold uppercase tracking-wider">Enable DHCP Server</span>
                    </label>

                    <div className={`space-y-4 transition-opacity ${dhcpEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-zinc-500 font-mono text-xs uppercase">Range Start</Label>
                                <Input value={startIp} onChange={e => setStartIp(e.target.value)} className="bg-zinc-950 border-zinc-800 font-mono text-sm text-emerald-400" placeholder="10.0.0.100" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-500 font-mono text-xs uppercase">Range End</Label>
                                <Input value={endIp} onChange={e => setEndIp(e.target.value)} className="bg-zinc-950 border-zinc-800 font-mono text-sm text-emerald-400" placeholder="10.0.0.200" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-zinc-500 font-mono text-xs uppercase">Default Gateway</Label>
                                <Input value={gateway} onChange={e => setGateway(e.target.value)} className="bg-zinc-950 border-zinc-800 font-mono text-sm text-emerald-400" placeholder="10.0.0.1" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-500 font-mono text-xs uppercase">Lease Time (Mins)</Label>
                                <Input type="number" value={leaseTime} onChange={e => setLeaseTime(Number(e.target.value))} className="bg-zinc-950 border-zinc-800 font-mono text-sm text-emerald-400" placeholder="1440" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-zinc-500 font-mono text-xs uppercase">Primary DNS</Label>
                                <Input value={dns1} onChange={e => setDns1(e.target.value)} className="bg-zinc-950 border-zinc-800 font-mono text-sm text-emerald-400" placeholder="8.8.8.8" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-500 font-mono text-xs uppercase">Secondary DNS</Label>
                                <Input value={dns2} onChange={e => setDns2(e.target.value)} className="bg-zinc-950 border-zinc-800 font-mono text-sm text-emerald-400" placeholder="1.1.1.1" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-zinc-800 bg-zinc-950/50 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 font-mono uppercase text-xs">Cancel</Button>
                    <Button onClick={handleSave} disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono uppercase text-xs w-36">
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'SAVE SETTINGS'}
                    </Button>
                </div>
            </div>
        </div>
    );
}