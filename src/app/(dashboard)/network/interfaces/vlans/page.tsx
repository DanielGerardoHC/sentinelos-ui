'use client';

import { useState, useEffect } from 'react';
import { useVlans, VlanInterface } from '@/hooks/useVlans';
import { useInterfaces } from '@/hooks/useInterfaces';
import { useZones } from '@/hooks/useZones';
import { ZoneEditDrawer } from '@/components/firewall/ZoneEditDrawer'; // <-- COMPONENTE DE CASCADA

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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {Edit2, ShieldAlert, Layers, Save, Server, Trash2, Activity} from "lucide-react";
import { FirewallTable } from '@/components/firewall/FirewallTable';

export default function VlansPage() {
    const { vlans, fetchVlans, saveVlan, deleteVlan, isLoading, error } = useVlans();
    const { interfaces: physicalInterfaces, fetchInterfaces: fetchPhysicalInterfaces } = useInterfaces();

    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedVlan, setSelectedVlan] = useState<VlanInterface | null>(null);

    const [formId, setFormId] = useState<number | ''>('');
    const [formParent, setFormParent] = useState('');
    const [formIp, setFormIp] = useState('');
    const [formZone, setFormZone] = useState('trust');
    const [formState, setFormState] = useState('up');
    const [formManagement, setFormManagement] = useState<string[]>([]);

    const [isDhcpModalOpen, setIsDhcpModalOpen] = useState(false);

    useEffect(() => {
        fetchVlans();
        fetchPhysicalInterfaces();
    }, [fetchVlans, fetchPhysicalInterfaces]);

    const handleAddClick = () => {
        setIsEditMode(false);
        setSelectedVlan(null);
        setFormId('');
        setFormParent('');
        setFormIp('');
        setFormZone('trust');
        setFormState('up');
        setFormManagement([]);
        setIsSheetOpen(true);
    };

    const handleEditClick = (vlan: VlanInterface) => {
        setIsEditMode(true);
        setSelectedVlan(vlan);
        setFormId(vlan.id);
        setFormParent(vlan.parent);
        setFormIp(vlan.ip || '');
        setFormZone(vlan.zone || 'trust');
        setFormState(vlan.state || 'down');
        setFormManagement(vlan.management || []);
        setIsSheetOpen(true);
    };

    const handleDelete = async (vlanName: string) => {
        if(confirm(`Are you sure you want to delete VLAN ${vlanName}?`)) {
            await deleteVlan(vlanName);
        }
    };

    const handleSave = async () => {
        if (!formId || !formParent) return alert("VLAN ID and Parent Interface are required.");

        const parentInterface = physicalInterfaces.find(iface => iface.name === formParent);
        if (parentInterface && parentInterface.ip) {
            return alert(`Cannot use ${formParent} as parent. It has an IP assigned (Layer 3 active). Remove its IP first.`);
        }

        const vlanName = `${formParent}.${formId}`;
        const payload: Partial<VlanInterface> = {
            id: Number(formId),
            name: vlanName,
            parent: formParent,
            ip: formIp,
            zone: formZone,
            state: formState,
            management: formManagement
        };

        const success = await saveVlan(isEditMode ? 'PUT' : 'POST', payload);
        if (success) setIsSheetOpen(false);
    };

    const toggleManagement = (service: string) => {
        setFormManagement(prev => prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]);
    };

    const tableColumns = [
        { label: "Interface", className: "w-[150px]" },{ label: "Parent", className: "w-[150px]" }, { label: "State", className: "w-[120px]" },
        { label: "IP / Netmask" }, { label: "Zone" }, { label: "Management" }, { label: "Actions", className: "text-right" }
    ];

    return (
        <div className="space-y-6 relative">

            {/* COMPONENTE: Cabecera */}
            <PageHeader
                title="Virtual LANs (802.1Q)"
                description="Create and manage VLAN sub-interfaces."
                isLoading={isLoading}
                onRefresh={fetchVlans}
                onAdd={handleAddClick}
                addText="+ Add VLAN"
            />

            {error && (
                <div className="p-4 bg-red-950/50 border border-red-500/50 text-red-400 font-mono flex items-center gap-3 rounded-lg">
                    <ShieldAlert className="w-5 h-5" /> {error}
                </div>
            )}

                <FirewallTable columns={tableColumns} isEmpty={vlans.length === 0} isLoading={isLoading} emptyMessage="No interfaces found.">
                    {vlans.map((vlan) => (
                        <TableRow key={vlan.name} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 group">
                            <TableCell key={vlan.parent} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 group"></TableCell>
                            <TableCell className="font-mono font-medium text-emerald-400"><div className="flex items-center gap-2"><Activity className="w-4 h-4 text-zinc-600 group-hover:text-emerald-500" />{vlan.name}</div></TableCell>
                            <TableCell><StatusBadge state={vlan.state} /></TableCell>
                            <TableCell className="font-mono text-sm text-zinc-300">{vlan.ip || <span className="text-zinc-600 italic text-xs">Unassigned</span>}</TableCell>
                            <TableCell><ZoneBadge zone={vlan.zone} /></TableCell>
                            <TableCell><div className="flex gap-1">{vlan.management?.map(mgt => (<span key={mgt} className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono text-[10px] uppercase tracking-wider">{mgt}</span>))}</div></TableCell>
                            <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleEditClick(vlan)} className="h-8 w-8 text-zinc-400 hover:text-emerald-400 opacity-50 group-hover:opacity-100 transition-all"><Edit2 className="w-4 h-4" /></Button></TableCell>
                        </TableRow>
                    ))}
                </FirewallTable>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="bg-[#09090b] border-l border-zinc-800 text-zinc-100 sm:max-w-md w-full p-0 flex flex-col h-full">
                    <div className="p-6 border-b border-zinc-800 bg-zinc-950/50">
                        <SheetHeader>
                            <SheetTitle className="text-zinc-100 font-mono text-2xl flex items-center gap-3">
                                <Layers className="w-5 h-5 text-emerald-500" />
                                {isEditMode ? `Edit VLAN ${formId}` : 'Create New VLAN'}
                            </SheetTitle>
                        </SheetHeader>
                    </div>

                    <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <Label className="text-zinc-500 font-mono text-xs uppercase">VLAN ID (Tag)</Label>
                                <Input type="number" value={formId} onChange={(e) => setFormId(e.target.value ? Number(e.target.value) : '')} disabled={isEditMode} className="bg-zinc-950 border-zinc-800 text-emerald-400 font-mono focus-visible:ring-emerald-500/50 h-11" placeholder="e.g. 10" />
                            </div>

                            <div className="space-y-3">
                                {/* FIX DE ESTILO: Color corregido a text-zinc-500 */}
                                <Label className="text-zinc-500 font-mono text-xs uppercase">Parent Interface</Label>
                                <div className="relative">
                                    {/* FIX DE ESTILO: bg-zinc-950 para contraste puro */}
                                    <select
                                        value={formParent}
                                        onChange={(e) => setFormParent(e.target.value)}
                                        disabled={isEditMode}
                                        className="w-full h-11 appearance-none rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50"
                                    >
                                        <option value="" disabled className="bg-zinc-950 text-zinc-500">Select parent...</option>
                                        {physicalInterfaces.map(iface => {
                                            const hasIp = !!iface.ip;
                                            return (
                                                <option key={iface.name} value={iface.name} disabled={hasIp} className="bg-zinc-950 text-zinc-300 disabled:text-zinc-600">
                                                    {iface.name} {hasIp ? '(L3 Active - Invalid)' : '(L2 Ready)'}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
                                        <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* COMPONENTE: Selector UP/DOWN */}
                        <AdminStateSelector value={formState} onChange={setFormState} />

                        <div className="space-y-3">
                            <Label className="text-zinc-500 font-mono text-xs uppercase">IPv4 Address (CIDR)</Label>
                            <Input value={formIp} onChange={(e) => setFormIp(e.target.value)} className="bg-zinc-950 border-zinc-800 text-emerald-400 font-mono h-11" placeholder="e.g. 10.21.0.1/24" />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-zinc-500 font-mono text-xs uppercase">Security Zone</Label>
                            <div className="relative">
                                {/* FIX DE ESTILO: bg-zinc-950 y flechita añadida para consistencia visual */}
                                <select
                                    value={formZone}
                                    onChange={(e) => setFormZone(e.target.value)}
                                    className="w-full h-11 appearance-none rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                >
                                    <option value="trust" className="bg-zinc-950 text-zinc-300">Trust (LAN)</option>
                                    <option value="untrust" className="bg-zinc-950 text-zinc-300">Untrust (WAN)</option>
                                    <option value="dmz" className="bg-zinc-950 text-zinc-300">DMZ (Servers)</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
                                    <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                </div>
                            </div>
                        </div>

                        {isEditMode && (
                            <div className="space-y-3 border-t border-zinc-800 pt-6">
                                <Label className="text-zinc-500 font-mono text-xs uppercase tracking-wider">Services</Label>
                                <Button variant="outline" onClick={() => setIsDhcpModalOpen(true)} className="w-full h-11 bg-zinc-900/50 border-zinc-700 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 font-mono">
                                    <Server className="w-4 h-4 mr-2" /> Configure DHCP Server
                                </Button>
                            </div>
                        )}

                        {/* COMPONENTE: Selector de Servicios (Ping, SSH, etc.) */}
                        <ManagementSelector selectedServices={formManagement} onChange={toggleManagement} />

                    </div>

                    <div className="p-6 border-t border-zinc-800 bg-zinc-950/50 flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsSheetOpen(false)} className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 font-mono uppercase text-xs">Cancel</Button>
                        <Button onClick={handleSave} disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono uppercase text-xs">
                            <Save className="w-4 h-4 mr-2" /> {isLoading ? 'COMMITTING...' : 'APPLY CHANGES'}
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>

            <DhcpModal isOpen={isDhcpModalOpen} onClose={() => setIsDhcpModalOpen(false)} interfaceName={`${formParent}.${formId}`} />
        </div>
    );
}