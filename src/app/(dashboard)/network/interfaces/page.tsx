'use client';

import { useState, useEffect } from 'react';
import { useInterfaces, NetworkInterface } from '@/hooks/useInterfaces';

// 1. IMPORTAMOS NUESTROS COMPONENTES MAESTROS
import { PageHeader } from '@/components/firewall/PageHeader';
import { StatusBadge, ZoneBadge } from '@/components/firewall/FirewallBadges';
import { AdminStateSelector } from '@/components/firewall/AdminStateSelector';
import { ManagementSelector } from '@/components/firewall/ManagementSelector';
import DhcpModal from '@/components/DhcpModal';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {Edit2, ShieldAlert, Activity, Save, Server} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function InterfacesPage() {
    const { interfaces, fetchInterfaces, updateInterface, isLoading, error } = useInterfaces();

    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [selectedIface, setSelectedIface] = useState<NetworkInterface | null>(null);

    const [formIp, setFormIp] = useState('');
    const [formZone, setFormZone] = useState('');
    const [formState, setFormState] = useState('');
    const [formManagement, setFormManagement] = useState<string[]>([]);

    const [isDhcpModalOpen, setIsDhcpModalOpen] = useState(false);

    useEffect(() => {
        fetchInterfaces();
    }, [fetchInterfaces]);

    const handleEditClick = (iface: NetworkInterface) => {
        setSelectedIface(iface);
        setFormIp(iface.ip || '');
        setFormZone(iface.zone || 'trust');
        setFormState(iface.state || 'down');
        setFormManagement(iface.management || []);
        setIsSheetOpen(true);
    };

    const toggleManagement = (service: string) => {
        setFormManagement(prev =>
            prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
        );
    };

    const handleSave = async () => {
        if (!selectedIface) return;

        const payload = {
            ip: formIp,
            zone: formZone,
            state: formState,
            management: formManagement
        };

        const success = await updateInterface(selectedIface.name, payload);
        if (success) {
            setIsSheetOpen(false);
        }
    };

    return (
        <div className="space-y-6 relative">

            {/* COMPONENTE: Cabecera */}
            <PageHeader
                title="Network Interfaces"
                description="Manage physical and virtual interfaces, IP assignments, and security zones."
                isLoading={isLoading}
                onRefresh={fetchInterfaces}
                onAdd={() => alert("Función de agregar interfaz pendiente en Go")}
                addText="+ Add Interface"
            />

            {error && (
                <div className="p-4 bg-red-950/50 border border-red-500/50 text-red-400 font-mono flex items-center gap-3 rounded-lg">
                    <ShieldAlert className="w-5 h-5" /> {error}
                </div>
            )}

            <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 overflow-hidden shadow-xl shadow-black/50">
                <Table>
                    <TableHeader className="bg-zinc-900/80 border-b border-zinc-800">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="font-mono text-zinc-500 uppercase text-xs tracking-wider w-[150px]">Interface</TableHead>
                            <TableHead className="font-mono text-zinc-500 uppercase text-xs tracking-wider w-[120px]">State</TableHead>
                            <TableHead className="font-mono text-zinc-500 uppercase text-xs tracking-wider">IP / Netmask</TableHead>
                            <TableHead className="font-mono text-zinc-500 uppercase text-xs tracking-wider">Zone</TableHead>
                            <TableHead className="font-mono text-zinc-500 uppercase text-xs tracking-wider">Management</TableHead>
                            <TableHead className="font-mono text-zinc-500 uppercase text-xs tracking-wider text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {interfaces.length === 0 && !isLoading && (
                            <TableRow><TableCell colSpan={6} className="text-center py-8 text-zinc-500 font-mono">No interfaces found in engine.</TableCell></TableRow>
                        )}
                        {interfaces.map((iface) => (
                            <TableRow key={iface.name} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors group">
                                <TableCell className="font-mono font-medium text-emerald-400">
                                    <div className="flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-zinc-600 group-hover:text-emerald-500 transition-colors" />
                                        {iface.name}
                                    </div>
                                </TableCell>

                                {/* COMPONENTE: Badge de Estado */}
                                <TableCell>
                                    <StatusBadge state={iface.state} />
                                </TableCell>

                                <TableCell className="font-mono text-sm text-zinc-300">
                                    {iface.ip ? iface.ip : <span className="text-zinc-600 italic text-xs">Unassigned</span>}
                                </TableCell>

                                {/* COMPONENTE: Badge de Zona */}
                                <TableCell>
                                    <ZoneBadge zone={iface.zone} />
                                </TableCell>

                                <TableCell>
                                    <div className="flex gap-1">
                                        {iface.management?.map(mgt => (
                                            <Badge key={mgt} variant="secondary" className="bg-zinc-800 text-zinc-400 font-mono text-[10px] uppercase tracking-wider">{mgt}</Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(iface)} className="h-8 w-8 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10">
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="bg-[#09090b] border-l border-zinc-800 text-zinc-100 sm:max-w-md w-full p-0 flex flex-col h-full">
                    <div className="p-6 border-b border-zinc-800 bg-zinc-950/50">
                        <SheetHeader>
                            <SheetTitle className="text-zinc-100 font-mono text-2xl flex items-center gap-3">
                                <Edit2 className="w-5 h-5 text-emerald-500" />
                                Edit {selectedIface?.name}
                            </SheetTitle>
                            <SheetDescription className="text-zinc-400 font-mono text-xs">
                                Modify routing parameters, state, and security zones.
                            </SheetDescription>
                        </SheetHeader>
                    </div>

                    <div className="p-6 space-y-8 flex-1 overflow-y-auto">

                        {/* COMPONENTE: Selector UP/DOWN */}
                        <AdminStateSelector value={formState} onChange={setFormState} />

                        <div className="space-y-3">
                            <Label className="text-zinc-500 font-mono text-xs uppercase tracking-wider flex items-center justify-between">
                                IPv4 Address / Netmask <span className="text-emerald-500/50 text-[10px]">CIDR Format</span>
                            </Label>
                            {/* FIX DE ESTILO: bg-zinc-950 puro */}
                            <Input
                                value={formIp}
                                onChange={(e) => setFormIp(e.target.value)}
                                className="bg-zinc-950 border-zinc-800 text-emerald-400 font-mono text-sm focus-visible:ring-emerald-500/50 h-11"
                                placeholder="e.g. 192.168.1.1/24"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-zinc-500 font-mono text-xs uppercase tracking-wider">Security Zone</Label>
                            <div className="relative">
                                {/* FIX DE ESTILO: bg-zinc-950 puro */}
                                <select
                                    value={formZone}
                                    onChange={(e) => setFormZone(e.target.value)}
                                    className="w-full h-11 appearance-none rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                >
                                    <option value="trust" className="bg-zinc-950 text-zinc-300">Trust (LAN)</option>
                                    <option value="untrust" className="bg-zinc-950 text-zinc-300">Untrust (WAN)</option>
                                    <option value="dmz" className="bg-zinc-950 text-zinc-300">DMZ (Public Servers)</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
                                    <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 border-t border-zinc-800 pt-6">
                            <Label className="text-zinc-500 font-mono text-xs uppercase tracking-wider">Services</Label>
                            <Button
                                variant="outline"
                                onClick={() => setIsDhcpModalOpen(true)}
                                className="w-full h-11 bg-zinc-950 border-zinc-700 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 font-mono transition-colors"
                            >
                                <Server className="w-4 h-4 mr-2" />
                                Configure DHCP Server
                            </Button>
                        </div>

                        {/* COMPONENTE: Selector de Servicios (Ping, SSH, etc.) */}
                        <ManagementSelector selectedServices={formManagement} onChange={toggleManagement} />

                    </div>

                    <div className="p-6 border-t border-zinc-800 bg-zinc-950/50 flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsSheetOpen(false)} className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white font-mono uppercase text-xs tracking-wider">Cancel</Button>
                        <Button onClick={handleSave} disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono uppercase text-xs tracking-wider gap-2">
                            <Save className="w-4 h-4" />
                            {isLoading ? 'COMMITTING...' : 'APPLY CHANGES'}
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>

            <DhcpModal
                isOpen={isDhcpModalOpen}
                onClose={() => setIsDhcpModalOpen(false)}
                interfaceName={selectedIface?.name || ''}
            />
        </div>
    );
}