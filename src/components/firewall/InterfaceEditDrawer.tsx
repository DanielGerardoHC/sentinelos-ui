import { useState, useEffect } from 'react';
import { NetworkInterface, useInterfaces } from '@/hooks/useInterfaces';
import { useZones } from '@/hooks/useZones';

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, Save, Server } from "lucide-react";

import { AdminStateSelector } from './AdminStateSelector';
import { ResourceSelector } from './ResourceSelector';
import { ManagementSelector } from './ManagementSelector';
import { ZoneEditDrawer } from './ZoneEditDrawer';
import { DhcpDrawer } from './DhcpDrawer';

interface InterfaceEditDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    iface: NetworkInterface | null;
    onSuccess?: () => void;
    onError?: (msg: string) => void;
}

export function InterfaceEditDrawer({ isOpen, onClose, iface, onSuccess, onError }: InterfaceEditDrawerProps) {
    const { updateInterface, isLoading, error } = useInterfaces();
    const { zones, fetchZones } = useZones();

    const [formIp, setFormIp] = useState('');
    const [formZone, setFormZone] = useState('');
    const [formState, setFormState] = useState('up');
    const [formManagement, setFormManagement] = useState<string[]>([]);

    const [isZoneDrawerOpen, setIsZoneDrawerOpen] = useState(false);
    const [isDhcpModalOpen, setIsDhcpModalOpen] = useState(false);

    useEffect(() => { if (isOpen) fetchZones(); }, [isOpen, fetchZones]);

    useEffect(() => {
        if (iface) {
            setFormIp(iface.ip || '');
            setFormZone(iface.zone || '');
            setFormState(iface.state || 'down');
            setFormManagement(iface.management || []);
        }
    }, [iface]);

    useEffect(() => {
        if (error && onError) onError(error);
    }, [error, onError]);

    const handleSave = async () => {
        if (!iface) return;
        const payload = { ip: formIp, zone: formZone, state: formState, management: formManagement };
        const success = await updateInterface(iface.name, payload);
        if (success) {
            if (onSuccess) onSuccess();
            onClose();
        }
    };

    const toggleManagement = (service: string) => {
        setFormManagement(prev => prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]);
    };

    const zoneOptions = zones.map(z => ({ label: `${z.name.toUpperCase()} (${z.type})`, value: z.name }));

    const slideOffset = isZoneDrawerOpen || isDhcpModalOpen ? '150px' : '0px';
    const isChildOpen = isZoneDrawerOpen || isDhcpModalOpen;

    return (
        <>
            <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <SheetContent
                    style={{ right: slideOffset }}
                    className={`bg-[#09090b] border-l border-zinc-800 text-zinc-100 w-full sm:w-[650px] sm:!max-w-[650px] p-0 flex flex-col h-full transition-all duration-300 shadow-2xl shadow-black z-[60] ${isChildOpen ? 'blur-[2px] brightness-50 pointer-events-none' : ''}`}
                >
                    <div className="p-6 border-b border-zinc-800 bg-zinc-950/50">
                        <SheetHeader>
                            <SheetTitle className="text-zinc-100 font-mono text-2xl flex items-center gap-3">
                                <Activity className="w-5 h-5 text-emerald-500" />
                                Edit Interface: {iface?.name}
                            </SheetTitle>
                            <SheetDescription className="text-zinc-400 font-mono text-xs">
                                Configure physical interface parameters directly.
                            </SheetDescription>
                        </SheetHeader>
                    </div>

                    <div className="p-6 space-y-8 flex-1 overflow-y-auto">
                        <AdminStateSelector value={formState} onChange={setFormState} />

                        <div className="space-y-3">
                            <Label className="text-zinc-500 font-mono text-xs uppercase">IPv4 Address (CIDR)</Label>
                            <Input value={formIp} onChange={(e) => setFormIp(e.target.value)} className="bg-zinc-950 border-zinc-800 text-emerald-400 font-mono h-11 focus-visible:ring-emerald-500/50" placeholder="e.g. 192.168.1.1/24" />
                        </div>

                        <ResourceSelector label="Security Zone" value={formZone} onChange={setFormZone} options={zoneOptions} onEditClick={() => setIsZoneDrawerOpen(true)} />

                        <div className="space-y-3 border-t border-zinc-800 pt-6">
                            <Label className="text-zinc-500 font-mono text-xs uppercase tracking-wider">Services</Label>
                            <Button variant="outline" onClick={() => setIsDhcpModalOpen(true)} className="w-full h-11 bg-zinc-950 border-zinc-700 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 font-mono">
                                <Server className="w-4 h-4 mr-2" /> Configure DHCP Server
                            </Button>
                        </div>

                        <ManagementSelector selectedServices={formManagement} onChange={toggleManagement} />
                    </div>

                    <div className="p-6 border-t border-zinc-800 bg-zinc-950/50 flex justify-end gap-3">
                        <Button variant="outline" onClick={onClose} className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 font-mono text-xs uppercase">Back</Button>
                        <Button onClick={handleSave} disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs uppercase">
                            <Save className="w-4 h-4 mr-2" /> {isLoading ? 'SAVING...' : 'APPLY CHANGES'}
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>

            {isZoneDrawerOpen && (
                <ZoneEditDrawer isOpen={isZoneDrawerOpen} onClose={() => setIsZoneDrawerOpen(false)} zoneName={formZone} />
            )}

            {isDhcpModalOpen && (
                <DhcpDrawer isOpen={isDhcpModalOpen} onClose={() => setIsDhcpModalOpen(false)} interfaceName={iface?.name || ''} />
            )}
        </>
    );
}