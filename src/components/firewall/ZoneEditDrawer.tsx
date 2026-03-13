import { useState, useEffect } from 'react';
import { useZones } from '@/hooks/useZones';
import { useInterfaces, NetworkInterface } from '@/hooks/useInterfaces';

import { InterfaceEditDrawer } from './InterfaceEditDrawer';

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Loader2, Edit2, X, Plus } from "lucide-react";

interface ZoneEditDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    zoneName: string;
}

export function ZoneEditDrawer({ isOpen, onClose, zoneName }: ZoneEditDrawerProps) {
    const { zones, fetchZones, saveZone, isLoadingZones } = useZones();
    const { interfaces: physicalInterfaces, fetchInterfaces } = useInterfaces();

    const [formType, setFormType] = useState('l3');
    const [formInterfaces, setFormInterfaces] = useState<string[]>([]);
    const [formNetworks, setFormNetworks] = useState('');
    const [selectedToAdd, setSelectedToAdd] = useState('');

    const [isInterfaceDrawerOpen, setIsInterfaceDrawerOpen] = useState(false);
    const [selectedInterfaceObj, setSelectedInterfaceObj] = useState<NetworkInterface | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchInterfaces();
            if (zoneName) {
                const currentZone = zones.find(z => z.name === zoneName);
                if (currentZone) {
                    setFormType(currentZone.type || 'l3');
                    setFormInterfaces(currentZone.interfaces || []);
                    setFormNetworks(currentZone.networks?.join(', ') || '');
                }
            }
        }
    }, [isOpen, zoneName, zones, fetchInterfaces]);

    const availableInterfaces = physicalInterfaces.filter(iface => {
        const hasIp = !!iface.ip && iface.ip.trim() !== '';
        const isL3Zone = formType === 'l3';
        const typeMatches = isL3Zone ? hasIp : !hasIp;
        const notAlreadySelected = !formInterfaces.includes(iface.name);
        return typeMatches && notAlreadySelected;
    });

    const handleTypeChange = (newType: string) => {
        setFormType(newType);
        setFormInterfaces([]);
        setSelectedToAdd('');
    };

    const handleSave = async () => {
        if (!zoneName) return;
        const payload = {
            type: formType,
            interfaces: formInterfaces,
            networks: formNetworks.split(',').map(s => s.trim()).filter(Boolean)
        };
        const success = await saveZone(zoneName, payload);
        if (success) onClose();
    };

    const openInterfaceEditor = (ifaceName: string) => {
        const obj = physicalInterfaces.find(i => i.name === ifaceName) || null;
        setSelectedInterfaceObj(obj);
        setIsInterfaceDrawerOpen(true);
    };

    // --- LÓGICA DE EFECTOS VISUALES ---
    const slideOffset = isInterfaceDrawerOpen ? '150px' : '0px';
    const isChildOpen = isInterfaceDrawerOpen;

    return (
        <>
            <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <SheetContent
                    style={{ right: slideOffset }}
                    // FIX: Ancho 650px y efecto blur/oscuro dinámico
                    className={`bg-[#09090b] border-l border-zinc-800 text-zinc-100 w-full sm:w-[650px] sm:!max-w-[650px] p-0 flex flex-col h-full shadow-2xl shadow-black z-[70] transition-all duration-300 ${isChildOpen ? 'blur-[2px] brightness-50 pointer-events-none' : ''}`}
                >

                    <div className="p-6 border-b border-zinc-800 bg-zinc-950/50">
                        <SheetHeader>
                            <SheetTitle className="text-zinc-100 font-mono text-xl flex items-center gap-3">
                                <Shield className="w-5 h-5 text-emerald-500" />
                                Edit Zone: {zoneName ? zoneName.toUpperCase() : ''}
                            </SheetTitle>
                            <SheetDescription className="text-zinc-400 font-mono text-xs">
                                Configure zone type, assigned interfaces and subnets.
                            </SheetDescription>
                        </SheetHeader>
                    </div>

                    <div className="p-6 space-y-8 flex-1 overflow-y-auto">
                        <div className="space-y-3">
                            <Label className="text-zinc-500 font-mono text-xs uppercase">Zone Operation Mode</Label>
                            <div className="relative">
                                <select value={formType} onChange={e => handleTypeChange(e.target.value)} className="w-full h-11 appearance-none rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-emerald-400 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                                    <option value="l3" className="bg-zinc-950 text-zinc-300">Layer 3 (Routed)</option>
                                    <option value="l2" className="bg-zinc-950 text-zinc-300">Layer 2 (Switched)</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
                                    <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 p-4 rounded-lg border border-zinc-800 bg-zinc-900/30">
                            <Label className="text-zinc-500 font-mono text-xs uppercase flex items-center justify-between">
                                Assigned Interfaces <span className="text-[10px] text-emerald-500/50">Filtered by {formType.toUpperCase()}</span>
                            </Label>

                            <div className="space-y-2">
                                {formInterfaces.length === 0 && (<div className="text-zinc-600 text-xs font-mono p-3 border border-zinc-800 border-dashed rounded bg-zinc-950/50 text-center">No interfaces assigned to this zone</div>)}
                                {formInterfaces.map(ifaceName => (
                                    <div key={ifaceName} className="flex items-center justify-between p-2 rounded-md border border-zinc-800 bg-zinc-950">
                                        <span className="font-mono text-sm text-emerald-400 font-bold">{ifaceName}</span>
                                        <div className="flex gap-1">
                                            <Button type="button" variant="outline" size="icon" onClick={() => openInterfaceEditor(ifaceName)} className="h-7 w-7 bg-transparent border-transparent text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"><Edit2 className="w-3 h-3" /></Button>
                                            <Button type="button" variant="outline" size="icon" onClick={() => setFormInterfaces(prev => prev.filter(i => i !== ifaceName))} className="h-7 w-7 bg-transparent border-transparent text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"><X className="w-3 h-3" /></Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-2 pt-2 border-t border-zinc-800/50">
                                <div className="relative flex-1">
                                    <select value={selectedToAdd} onChange={(e) => setSelectedToAdd(e.target.value)} className="w-full h-11 appearance-none rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                                        <option value="" disabled className="bg-zinc-950 text-zinc-500">Select interface to add...</option>
                                        {availableInterfaces.map(iface => (<option key={iface.name} value={iface.name} className="bg-zinc-950 text-zinc-300">{iface.name} {iface.ip ? `(${iface.ip})` : ''}</option>))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500"><svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg></div>
                                </div>
                                <Button type="button" onClick={() => { if (selectedToAdd) { setFormInterfaces([...formInterfaces, selectedToAdd]); setSelectedToAdd(''); } }} disabled={!selectedToAdd} className="h-11 px-4 bg-zinc-800 hover:bg-emerald-600 text-white font-mono uppercase text-xs transition-colors"><Plus className="w-4 h-4" /></Button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-zinc-500 font-mono text-xs uppercase flex items-center justify-between">Permitted Networks <span className="text-[10px] text-zinc-600">Comma separated CIDR</span></Label>
                            <textarea value={formNetworks} onChange={e => setFormNetworks(e.target.value)} className="w-full min-h-[100px] rounded-md border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm text-emerald-400 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none" placeholder="10.0.0.0/24, 192.168.1.0/24" />
                        </div>
                    </div>

                    <div className="p-6 border-t border-zinc-800 bg-zinc-950/50 flex justify-end gap-3">
                        <Button variant="outline" onClick={onClose} className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 font-mono text-xs uppercase">Back</Button>
                        <Button onClick={handleSave} disabled={isLoadingZones} className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs uppercase w-32">{isLoadingZones ? <Loader2 className="w-4 h-4 animate-spin" /> : 'SAVE ZONE'}</Button>
                    </div>
                </SheetContent>
            </Sheet>

            {isInterfaceDrawerOpen && (
                <InterfaceEditDrawer isOpen={isInterfaceDrawerOpen} onClose={() => setIsInterfaceDrawerOpen(false)} iface={selectedInterfaceObj} onSuccess={fetchInterfaces} />
            )}
        </>
    );
}