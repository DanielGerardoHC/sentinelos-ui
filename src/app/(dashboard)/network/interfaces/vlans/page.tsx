'use client';

import { useState, useEffect } from 'react';
import { useVlans, VlanInterface } from '@/hooks/useVlans';
// 1. IMPORTAMOS EL HOOK DE INTERFACES FÍSICAS
import { useInterfaces } from '@/hooks/useInterfaces';
import DhcpModal from '@/components/DhcpModal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Edit2, Shield, ShieldAlert, Layers, Save, RefreshCw, Activity, X, Server, Trash2 } from "lucide-react";

export default function VlansPage() {
    const { vlans, fetchVlans, saveVlan, deleteVlan, isLoading, error } = useVlans();

    // 2. EXTRAEMOS LAS INTERFACES FÍSICAS PARA EL DROPDOWN
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
        // 3. CARGAMOS LAS INTERFACES FÍSICAS AL ENTRAR A LA PÁGINA
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

        // Validación extra de seguridad (Capa 3) por si el usuario burla el frontend
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

    return (
        <div className="space-y-6 relative">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-100 font-mono tracking-tight">Virtual LANs (802.1Q)</h1>
                    <p className="text-zinc-400 mt-1 text-sm">Create and manage VLAN sub-interfaces.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchVlans} disabled={isLoading} className="border-zinc-800 bg-zinc-950 text-zinc-300 hover:text-white hover:bg-zinc-900">
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button onClick={handleAddClick} className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono uppercase tracking-wider text-xs shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                        + Add VLAN
                    </Button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-950/50 border border-red-500/50 text-red-400 font-mono flex items-center gap-3 rounded-lg">
                    <ShieldAlert className="w-5 h-5" /> {error}
                </div>
            )}

            <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 overflow-hidden shadow-xl shadow-black/50">
                <Table>
                    <TableHeader className="bg-zinc-900/80 border-b border-zinc-800">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="font-mono text-zinc-500 uppercase text-xs w-[80px]">VLAN ID</TableHead>
                            <TableHead className="font-mono text-zinc-500 uppercase text-xs">Name</TableHead>
                            <TableHead className="font-mono text-zinc-500 uppercase text-xs w-[120px]">State</TableHead>
                            <TableHead className="font-mono text-zinc-500 uppercase text-xs">IP / Netmask</TableHead>
                            <TableHead className="font-mono text-zinc-500 uppercase text-xs">Zone</TableHead>
                            <TableHead className="font-mono text-zinc-500 uppercase text-xs text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {vlans.length === 0 && !isLoading && (
                            <TableRow><TableCell colSpan={6} className="text-center py-8 text-zinc-500 font-mono">No VLANs configured.</TableCell></TableRow>
                        )}
                        {vlans.map((vlan) => (
                            <TableRow key={vlan.name} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 group">
                                <TableCell className="font-mono font-bold text-emerald-500 text-center">{vlan.id}</TableCell>
                                <TableCell className="font-mono text-zinc-300">
                                    <div className="flex flex-col">
                                        <span>{vlan.name}</span>
                                        <span className="text-[10px] text-zinc-500">on {vlan.parent}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${vlan.state === 'up' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                                        <span className="text-zinc-300 font-mono text-xs uppercase">{vlan.state}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="font-mono text-sm text-zinc-300">{vlan.ip || 'Unassigned'}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={`font-mono text-[10px] uppercase px-2 py-0.5 ${vlan.zone === 'trust' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-orange-500/30 text-orange-400 bg-orange-500/10'}`}>
                                        {vlan.zone}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(vlan)} className="h-8 w-8 text-zinc-400 hover:text-emerald-400">
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(vlan.name)} className="h-8 w-8 text-zinc-400 hover:text-red-400">
                                            <Trash2 className="w-4 h-4" />
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
                                <Layers className="w-5 h-5 text-emerald-500" />
                                {isEditMode ? `Edit VLAN ${formId}` : 'Create New VLAN'}
                            </SheetTitle>
                        </SheetHeader>
                    </div>

                    <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <Label className="text-zinc-500 font-mono text-xs uppercase">VLAN ID (Tag)</Label>
                                <Input type="number" value={formId} onChange={(e) => setFormId(e.target.value ? Number(e.target.value) : '')} disabled={isEditMode} className="bg-zinc-900/50 border-zinc-800 text-emerald-400 font-mono focus-visible:ring-emerald-500/50 h-11" placeholder="e.g. 10" />
                            </div>

                            {/* 4. EL SELECTOR MÁGICO DE INTERFAZ PADRE */}
                            <div className="space-y-3">
                                <Label className="text-zinc-500 font-mono text-xs uppercase">Parent Interface</Label>
                                <div className="relative">
                                    <select
                                        value={formParent}
                                        onChange={(e) => setFormParent(e.target.value)}
                                        disabled={isEditMode}
                                        className="w-full h-11 appearance-none rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50"
                                    >
                                        <option value="" disabled>Select parent...</option>
                                        {physicalInterfaces.map(iface => {
                                            const hasIp = !!iface.ip; // Verificamos si tiene IP
                                            return (
                                                <option key={iface.name} value={iface.name} disabled={hasIp}>
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

                        {/* ... (El resto del formulario se mantiene idéntico) ... */}

                        <div className="space-y-3">
                            <Label className="text-zinc-500 font-mono text-xs uppercase">Administrative Status</Label>
                            <div className="flex gap-4">
                                <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer ${formState === 'up' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-zinc-800 bg-zinc-900/30 text-zinc-500'}`}>
                                    <input type="radio" value="up" checked={formState === 'up'} onChange={() => setFormState('up')} className="hidden" />
                                    <Activity className="w-4 h-4" /> UP
                                </label>
                                <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer ${formState === 'down' ? 'border-red-500 bg-red-500/10 text-red-400' : 'border-zinc-800 bg-zinc-900/30 text-zinc-500'}`}>
                                    <input type="radio" value="down" checked={formState === 'down'} onChange={() => setFormState('down')} className="hidden" />
                                    <X className="w-4 h-4" /> DOWN
                                </label>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-zinc-500 font-mono text-xs uppercase">IPv4 Address (CIDR)</Label>
                            <Input value={formIp} onChange={(e) => setFormIp(e.target.value)} className="bg-zinc-900/50 border-zinc-800 text-emerald-400 font-mono h-11" placeholder="e.g. 10.21.0.1/24" />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-zinc-500 font-mono text-xs uppercase">Security Zone</Label>
                            <select value={formZone} onChange={(e) => setFormZone(e.target.value)} className="w-full h-11 rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-zinc-100 font-mono">
                                <option value="trust">Trust (LAN)</option>
                                <option value="untrust">Untrust (WAN)</option>
                                <option value="dmz">DMZ (Servers)</option>
                            </select>
                        </div>

                        {isEditMode && (
                            <div className="space-y-3 border-t border-zinc-800 pt-6">
                                <Label className="text-zinc-500 font-mono text-xs uppercase tracking-wider">Services</Label>
                                <Button variant="outline" onClick={() => setIsDhcpModalOpen(true)} className="w-full h-11 bg-zinc-900/50 border-zinc-700 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 font-mono">
                                    <Server className="w-4 h-4 mr-2" /> Configure DHCP Server
                                </Button>
                            </div>
                        )}

                        <div className="space-y-4 pt-4 border-t border-zinc-800">
                            <Label className="text-zinc-500 font-mono text-xs uppercase">Administrative Access</Label>
                            <div className="grid grid-cols-2 gap-4">
                                {['ping', 'ssh', 'https'].map(svc => (
                                    <label key={svc} className="flex items-center gap-3 p-3 rounded-lg border border-zinc-800 bg-zinc-900/30 cursor-pointer hover:bg-zinc-800/50">
                                        <input type="checkbox" checked={formManagement.includes(svc)} onChange={() => toggleManagement(svc)} className="w-4 h-4 accent-emerald-500 bg-zinc-900 border-zinc-700" />
                                        <span className="font-mono text-sm text-zinc-300 uppercase">{svc}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
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