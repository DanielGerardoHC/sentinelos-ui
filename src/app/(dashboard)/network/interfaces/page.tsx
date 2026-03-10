'use client';

import { useState, useEffect } from 'react';
import { useInterfaces, NetworkInterface } from '@/hooks/useInterfaces';
import { useZones } from '@/hooks/useZones'; // <-- IMPORTAMOS EL HOOK DE ZONAS

import { PageHeader } from '@/components/firewall/PageHeader';
import { StatusBadge, ZoneBadge } from '@/components/firewall/FirewallBadges';
import { AdminStateSelector } from '@/components/firewall/AdminStateSelector';
import { ManagementSelector } from '@/components/firewall/ManagementSelector';
import { FirewallTable } from '@/components/firewall/FirewallTable';
import { ResourceSelector } from '@/components/firewall/ResourceSelector';
import { ZoneEditDrawer } from '@/components/firewall/ZoneEditDrawer'; // <-- COMPONENTE DE CASCADA
import DhcpModal from '@/components/DhcpModal';

import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Edit2, ShieldAlert, Activity, Save, Server } from "lucide-react";

export default function InterfacesPage() {
    const { interfaces, fetchInterfaces, updateInterface, isLoading, error } = useInterfaces();
    const { zones, fetchZones } = useZones(); // Extraemos las zonas

    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isZoneSheetOpen, setIsZoneSheetOpen] = useState(false); // Estado para la cascada
    const [selectedIface, setSelectedIface] = useState<NetworkInterface | null>(null);

    const [formIp, setFormIp] = useState('');
    const [formZone, setFormZone] = useState('');
    const [formState, setFormState] = useState('');
    const [formManagement, setFormManagement] = useState<string[]>([]);
    const [isDhcpModalOpen, setIsDhcpModalOpen] = useState(false);

    useEffect(() => {
        fetchInterfaces();
        fetchZones(); // Cargamos las zonas al entrar a la vista
    }, [fetchInterfaces, fetchZones]);

    const handleEditClick = (iface: NetworkInterface) => {
        setSelectedIface(iface);
        setFormIp(iface.ip || '');
        setFormZone(iface.zone || ''); // Ya no forzamos 'trust' quemado
        setFormState(iface.state || 'down');
        setFormManagement(iface.management || []);
        setIsSheetOpen(true);
    };

    const toggleManagement = (service: string) => {
        setFormManagement(prev => prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]);
    };

    const handleSave = async () => {
        if (!selectedIface) return;
        const payload = { ip: formIp, zone: formZone, state: formState, management: formManagement };
        const success = await updateInterface(selectedIface.name, payload);
        if (success) setIsSheetOpen(false);
    };

    const tableColumns = [
        { label: "Interface", className: "w-[150px]" }, { label: "State", className: "w-[120px]" },
        { label: "IP / Netmask" }, { label: "Zone" }, { label: "Management" }, { label: "Actions", className: "text-right" }
    ];

    // Convertimos las zonas de la API al formato {label, value} que espera nuestro ResourceSelector
    const dynamicZoneOptions = zones.map(z => ({
        label: `${z.name.toUpperCase()} (${z.type})`,
        value: z.name
    }));

    return (
        <div className="space-y-6 relative overflow-hidden">
            <PageHeader title="Network Interfaces" description="Manage physical and virtual interfaces, IP assignments, and security zones." isLoading={isLoading} onRefresh={fetchInterfaces} onAdd={() => {}} addText="+ Add Interface" />

            {error && (<div className="p-4 bg-red-950/50 border border-red-500/50 text-red-400 font-mono flex items-center gap-3 rounded-lg"><ShieldAlert className="w-5 h-5" /> {error}</div>)}

            <FirewallTable columns={tableColumns} isEmpty={interfaces.length === 0} isLoading={isLoading} emptyMessage="No interfaces found.">
                {interfaces.map((iface) => (
                    <TableRow key={iface.name} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 group">
                        <TableCell className="font-mono font-medium text-emerald-400"><div className="flex items-center gap-2"><Activity className="w-4 h-4 text-zinc-600 group-hover:text-emerald-500" />{iface.name}</div></TableCell>
                        <TableCell><StatusBadge state={iface.state} /></TableCell>
                        <TableCell className="font-mono text-sm text-zinc-300">{iface.ip || <span className="text-zinc-600 italic text-xs">Unassigned</span>}</TableCell>
                        <TableCell><ZoneBadge zone={iface.zone} /></TableCell>
                        <TableCell><div className="flex gap-1">{iface.management?.map(mgt => (<span key={mgt} className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono text-[10px] uppercase tracking-wider">{mgt}</span>))}</div></TableCell>
                        <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleEditClick(iface)} className="h-8 w-8 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10"><Edit2 className="w-4 h-4" /></Button></TableCell>
                    </TableRow>
                ))}
            </FirewallTable>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent
                    style={{ right: isZoneSheetOpen ? '448px' : '0px' }} // EFECTO CASCADA
                    className="bg-[#09090b] border-l border-zinc-800 text-zinc-100 sm:max-w-md w-full p-0 flex flex-col h-full transition-all duration-300 ease-in-out"
                >
                    <div className="p-6 border-b border-zinc-800 bg-zinc-950/50">
                        <SheetHeader><SheetTitle className="text-zinc-100 font-mono text-2xl flex items-center gap-3"><Edit2 className="w-5 h-5 text-emerald-500" /> Edit {selectedIface?.name}</SheetTitle></SheetHeader>
                    </div>

                    <div className="p-6 space-y-8 flex-1 overflow-y-auto">
                        <AdminStateSelector value={formState} onChange={setFormState} />

                        <div className="space-y-3">
                            <Label className="text-zinc-500 font-mono text-xs uppercase tracking-wider">IPv4 Address (CIDR)</Label>
                            <Input value={formIp} onChange={(e) => setFormIp(e.target.value)} className="bg-zinc-950 border-zinc-800 text-emerald-400 font-mono h-11" placeholder="e.g. 192.168.1.1/24" />
                        </div>

                        {/* SELECTOR DINÁMICO DE ZONAS */}
                        <ResourceSelector
                            label="Security Zone"
                            value={formZone}
                            onChange={setFormZone}
                            options={dynamicZoneOptions} // Datos desde Go
                            onEditClick={() => setIsZoneSheetOpen(true)} // Abre el Panel Nivel 2
                        />

                        <div className="space-y-3 border-t border-zinc-800 pt-6">
                            <Label className="text-zinc-500 font-mono text-xs uppercase tracking-wider">Services</Label>
                            <Button variant="outline" onClick={() => setIsDhcpModalOpen(true)} className="w-full h-11 bg-zinc-950 border-zinc-700 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 font-mono"><Server className="w-4 h-4 mr-2" /> Configure DHCP Server</Button>
                        </div>
                        <ManagementSelector selectedServices={formManagement} onChange={toggleManagement} />
                    </div>

                    <div className="p-6 border-t border-zinc-800 bg-zinc-950/50 flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsSheetOpen(false)} className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 font-mono text-xs uppercase">Cancel</Button>
                        <Button onClick={handleSave} disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs uppercase"><Save className="w-4 h-4 mr-2" /> {isLoading ? 'COMMITTING...' : 'APPLY CHANGES'}</Button>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Inyectamos el componente de cascada y el modal de DHCP */}
            <ZoneEditDrawer isOpen={isZoneSheetOpen} onClose={() => setIsZoneSheetOpen(false)} zoneName={formZone} />
            <DhcpModal isOpen={isDhcpModalOpen} onClose={() => setIsDhcpModalOpen(false)} interfaceName={selectedIface?.name || ''} />
        </div>
    );
}