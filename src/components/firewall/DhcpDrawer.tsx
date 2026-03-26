import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDhcp } from '@/hooks/useDhcp';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Server, Loader2, ShieldAlert } from "lucide-react";

interface DhcpDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    interfaceName: string;
    onSuccess?: () => void;
}

export function DhcpDrawer({ isOpen, onClose, interfaceName, onSuccess }: DhcpDrawerProps) {
    const { t } = useTranslation();
    const { dhcpPools, fetchDhcpPools, saveDhcp, deleteDhcp, isLoading, error } = useDhcp();

    const [dhcpEnabled, setDhcpEnabled] = useState(false);
    const [existsInApi, setExistsInApi] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    const [startIp, setStartIp] = useState('');
    const [endIp, setEndIp] = useState('');
    const [gateway, setGateway] = useState('');
    const [dns1, setDns1] = useState('8.8.8.8');
    const [dns2, setDns2] = useState('1.1.1.1');
    const [leaseTime, setLeaseTime] = useState(1440);



    const [isFetchingLocal, setIsFetchingLocal] = useState(false);

    useEffect(() => {
        if (isOpen && interfaceName) {
            fetchDhcpPools();
        }
    }, [isOpen, interfaceName, fetchDhcpPools]);

    useEffect(() => {
        if (isOpen && interfaceName && !isLoading) {

            const existingConfig = dhcpPools.find(d => d.interface === interfaceName);

            if (existingConfig) {
                setExistsInApi(true);
                setDhcpEnabled(true);
                setStartIp(existingConfig.start_ip || '');
                setEndIp(existingConfig.end_ip || '');
                setGateway(existingConfig.gateway || '');
                setDns1(existingConfig.dns?.[0] || '8.8.8.8');
                setDns2(existingConfig.dns?.[1] || '');
                setLeaseTime(existingConfig.lease_time || 1440);
            } else {
                setExistsInApi(false);
                setDhcpEnabled(false);
                setStartIp('');
                setEndIp('');
                setGateway('');
                setDns1('8.8.8.8');
                setDns2('');
                setLeaseTime(1440);
            }
        }
    }, [isOpen, interfaceName, isLoading, dhcpPools]);

    const handleSave = async () => {
        if (!dhcpEnabled) {
            if (existsInApi) {
                const success = await deleteDhcp(interfaceName);
                if (success) {
                    if (onSuccess) onSuccess();
                    onClose();
                }
            } else {
                onClose();
            }
            return;
        }

        const payload = {
            interface: interfaceName,
            start_ip: startIp,
            end_ip: endIp,
            gateway: gateway,
            dns: [dns1, dns2].filter(Boolean),
            lease_time: Number(leaseTime)
        };

        const method = existsInApi ? 'PUT' : 'POST';
        const success = await saveDhcp(method, interfaceName, payload);

        if (success) {
            if (onSuccess) onSuccess();
            onClose();
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent
                className="bg-[#09090b] border-l border-zinc-800 text-zinc-100 w-full sm:w-[650px] sm:!max-w-[650px] p-0 flex flex-col h-full shadow-2xl shadow-black z-[80] transition-all duration-300"
            >
                <div className="p-6 border-b border-zinc-800 bg-zinc-950/50">
                    <SheetHeader>
                        <SheetTitle className="text-zinc-100 font-mono text-xl flex items-center gap-3">
                            <Server className="w-5 h-5 text-emerald-500" />
                            {t('dhcp_drawer.title', { interface: interfaceName })}
                        </SheetTitle>
                        <SheetDescription className="text-zinc-400 font-mono text-xs">
                            {t('dhcp_drawer.desc')}
                        </SheetDescription>
                    </SheetHeader>
                </div>

                {error && (
                    <div className="p-4 bg-red-950/50 border-b border-red-500/50 text-red-400 font-mono text-sm flex items-center gap-3">
                        <ShieldAlert className="w-5 h-5 flex-shrink-0" /> {error}
                    </div>
                )}

                <div className="p-6 space-y-8 flex-1 overflow-y-auto">

                    <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${dhcpEnabled ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800'}`}>
                        <input
                            type="checkbox"
                            checked={dhcpEnabled}
                            onChange={() => setDhcpEnabled(!dhcpEnabled)}
                            className="w-5 h-5 accent-emerald-500 bg-zinc-950 border-zinc-700"
                        />
                        <span className="font-mono text-sm text-emerald-400 font-bold uppercase tracking-wider">
                            {t('dhcp_drawer.enable_dhcp')}
                        </span>
                    </label>

                    <div className={`space-y-6 transition-opacity duration-300 ${dhcpEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <Label className="text-zinc-500 font-mono text-xs uppercase">{t('dhcp_drawer.start_ip')}</Label>
                                <Input value={startIp} onChange={e => setStartIp(e.target.value)} className="bg-zinc-950 border-zinc-800 font-mono text-emerald-400 h-11 focus-visible:ring-emerald-500/50" placeholder="e.g. 10.0.0.100" />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-zinc-500 font-mono text-xs uppercase">{t('dhcp_drawer.end_ip')}</Label>
                                <Input value={endIp} onChange={e => setEndIp(e.target.value)} className="bg-zinc-950 border-zinc-800 font-mono text-emerald-400 h-11 focus-visible:ring-emerald-500/50" placeholder="e.g. 10.0.0.200" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <Label className="text-zinc-500 font-mono text-xs uppercase">{t('dhcp_drawer.gateway')}</Label>
                                <Input value={gateway} onChange={e => setGateway(e.target.value)} className="bg-zinc-950 border-zinc-800 font-mono text-emerald-400 h-11 focus-visible:ring-emerald-500/50" placeholder="e.g. 10.0.0.1" />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-zinc-500 font-mono text-xs uppercase">{t('dhcp_drawer.lease_time')}</Label>
                                <Input type="number" value={leaseTime} onChange={e => setLeaseTime(Number(e.target.value))} className="bg-zinc-950 border-zinc-800 font-mono text-emerald-400 h-11 focus-visible:ring-emerald-500/50" placeholder="1440" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <Label className="text-zinc-500 font-mono text-xs uppercase">{t('dhcp_drawer.dns1')}</Label>
                                <Input value={dns1} onChange={e => setDns1(e.target.value)} className="bg-zinc-950 border-zinc-800 font-mono text-emerald-400 h-11 focus-visible:ring-emerald-500/50" placeholder="8.8.8.8" />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-zinc-500 font-mono text-xs uppercase">{t('dhcp_drawer.dns2')}</Label>
                                <Input value={dns2} onChange={e => setDns2(e.target.value)} className="bg-zinc-950 border-zinc-800 font-mono text-emerald-400 h-11 focus-visible:ring-emerald-500/50" placeholder="1.1.1.1" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-zinc-800 bg-zinc-950/50 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 font-mono uppercase text-xs">
                        {t('dhcp_drawer.cancel')}
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono uppercase text-xs w-36">
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : t('dhcp_drawer.save')}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}