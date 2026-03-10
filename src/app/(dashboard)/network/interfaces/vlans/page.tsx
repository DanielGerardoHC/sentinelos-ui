'use client';

import { useState, useEffect } from 'react';
import { useVlans, VlanInterface } from '@/hooks/useVlans';
import { useInterfaces } from '@/hooks/useInterfaces';
import { useZones } from '@/hooks/useZones'; // <-- 1. IMPORTAMOS EL HOOK DE ZONAS

// COMPONENTES MAESTROS
import { PageHeader } from '@/components/firewall/PageHeader';
import { StatusBadge, ZoneBadge } from '@/components/firewall/FirewallBadges';
import { AdminStateSelector } from '@/components/firewall/AdminStateSelector';
import { ManagementSelector } from '@/components/firewall/ManagementSelector';
import { FirewallTable } from '@/components/firewall/FirewallTable';
import { ResourceSelector } from '@/components/firewall/ResourceSelector'; // <-- 2. SELECTOR CON LÁPIZ
import { ZoneEditDrawer } from '@/components/firewall/ZoneEditDrawer';
import DhcpModal from '@/components/DhcpModal';

import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Edit2, ShieldAlert, Layers, Save, Server, Trash2, Activity } from "lucide-react";

export default function VlansPage() {
    const { vlans, fetchVlans, saveVlan, deleteVlan, isLoading, error } = useVlans();
    const { interfaces: physicalInterfaces, fetchInterfaces: fetchPhysicalInterfaces } = useInterfaces();
    const { zones, fetchZones } = useZones(); // <-- 3. EXTRAEMOS LAS ZONAS DE LA API

    // ESTADOS DE LOS PANELES
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isZoneSheetOpen, setIsZoneSheetOpen] = useState(false); // Cascada para Zona
    const [isParentSheetOpen, setIsParentSheetOpen] = useState(false); // Cascada para Interfaz Padre

    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedVlan, setSelectedVlan] = useState<VlanInterface | null>(null);

    // ESTADOS DEL FORMULARIO
    const [formId, setFormId] = useState<number | ''>('');
    const [formParent, setFormParent] = useState('');
    const [formIp, setFormIp] = useState('');
    const [formZone, setFormZone] = useState('');
    const [formState, setFormState] = useState('up');
    const [formManagement, setFormManagement] = useState<string[]>([]);
    const [isDhcpModalOpen, setIsDhcpModalOpen] = useState(false);

    useEffect(() => {
        fetchVlans();
        fetchPhysicalInterfaces();
        fetchZones(); // Cargamos zonas al iniciar
    }, [fetchVlans, fetchPhysicalInterfaces, fetchZones]);

    const handleAddClick = () => {
        setIsEditMode(false);
        setSelectedVlan(null);
        setFormId('');
        setFormParent('');
        setFormIp('');
        setFormZone('');
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
        setFormZone(vlan.zone || '');
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

        // Validación L3
        const parentInterface = physicalInterfaces.find(iface => iface.name === formParent);
        if (parentInterface && parentInterface.ip) {
            return alert(`Cannot use ${formParent} as parent. It has an IP assigned (Layer 3 active). Remove its IP first.`);
        }

        const vlanName = `${formParent}.${formId}`;
        const payload: Partial<VlanInterface> = {
            id: Number(formId), name: vlanName, parent: formParent, ip: formIp,
            zone: formZone, state: formState, management: formManagement
        };

        const success = await saveVlan(isEditMode ? 'PUT' : 'POST', payload);
        if (success) setIsSheetOpen(false);
    };

    const toggleManagement = (service: string) => {
        setFormManagement(prev => prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]);
    };

    const tableColumns = [
        { label: "Interface", className: "w-[150px]" }, { label: "Parent", className: "w-[150px]" },
        { label: "State", className: "w-[120px]" }, { label: "IP / Netmask" },
        { label: "Zone" }, { label: "Management" }, { label: "Actions", className: "text-right" }
    ];

    // 4. PREPARAMOS LAS OPCIONES PARA LOS RESOURCE SELECTORS
    const parentOptions = physicalInterfaces.map(iface => ({
        label: `${iface.name} ${iface.ip ? '(L3 Active - Invalid)' : '(L2 Ready)'}`,
        value: iface.name,
        disabled: !!iface.ip
    }));

    const dynamicZoneOptions = zones.map(z => ({
        label: `${z.name.toUpperCase()} (${z.type})`,
        value: z.name
    }));

    // Determina si el panel principal debe moverse a la izquierda
    const isAnySubSheetOpen = isZoneSheetOpen || isParentSheetOpen;

    return (
        <div className="space-y-6 relative overflow-hidden">

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

            {/* TABLA CORREGIDA Y ALINEADA */}
            <FirewallTable columns={tableColumns} isEmpty={vlans.length === 0} isLoading={isLoading} emptyMessage="No VLANs found.">
                {vlans.map((vlan) => (
                    <TableRow key={vlan.name} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors group">
                        <TableCell className="font-mono font-medium text-emerald-400">
                            <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-zinc-600 group-hover:text-emerald-500 transition-colors" />
                                {vlan.name}
                            </div>
                        </TableCell>
                        <TableCell className="font-mono text-zinc-400">{vlan.parent}</TableCell>
                        <TableCell><StatusBadge state={vlan.state} /></TableCell>
                        <TableCell className="font-mono text-sm text-zinc-300">{vlan.ip || <span className="text-zinc-600 italic text-xs">Unassigned</span>}</TableCell>
                        <TableCell><ZoneBadge zone={vlan.zone} /></TableCell>
                        <TableCell>
                            <div className="flex gap-1">
                                {vlan.management?.map(mgt => (
                                    <span key={mgt} className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono text-[10px] uppercase tracking-wider">{mgt}</span>
                                ))}
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-1 opacity-50 group-hover:opacity-100 transition-all">
                                <Button variant="ghost" size="icon" onClick={() => handleEditClick(vlan)} className="h-8 w-8 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10"><Edit2 className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(vlan.name)} className="h-8 w-8 text-zinc-400 hover:text-red-400 hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </FirewallTable>

            {/* PANEL PRINCIPAL (NIVEL 1) */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent
                    style={{ right: isAnySubSheetOpen ? '448px' : '0px' }} // LA MAGIA DEL DESLIZAMIENTO
                    className="bg-[#09090b] border-l border-zinc-800 text-zinc-100 sm:max-w-md w-full p-0 flex flex-col h-full transition-all duration-300 ease-in-out"
                >
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

                            {/* SELECTOR DE INTERFAZ PADRE CON LÁPIZ */}
                            <ResourceSelector
                                label="Parent Interface"
                                value={formParent}
                                onChange={setFormParent}
                                options={parentOptions}
                                disabled={isEditMode} // En Fortinet, no puedes cambiar el padre tras crearlo
                                onEditClick={() => setIsParentSheetOpen(true)} // Abre el Panel de Padre
                            />
                        </div>

                        <AdminStateSelector value={formState} onChange={setFormState} />

                        <div className="space-y-3">
                            <Label className="text-zinc-500 font-mono text-xs uppercase">IPv4 Address (CIDR)</Label>
                            <Input value={formIp} onChange={(e) => setFormIp(e.target.value)} className="bg-zinc-950 border-zinc-800 text-emerald-400 font-mono h-11" placeholder="e.g. 10.21.0.1/24" />
                        </div>

                        {/* SELECTOR DE ZONA CON LÁPIZ */}
                        <ResourceSelector
                            label="Security Zone"
                            value={formZone}
                            onChange={setFormZone}
                            options={dynamicZoneOptions}
                            onEditClick={() => setIsZoneSheetOpen(true)} // Abre el Panel de Zona
                        />

                        {isEditMode && (
                            <div className="space-y-3 border-t border-zinc-800 pt-6">
                                <Label className="text-zinc-500 font-mono text-xs uppercase tracking-wider">Services</Label>
                                <Button variant="outline" onClick={() => setIsDhcpModalOpen(true)} className="w-full h-11 bg-zinc-950 border-zinc-700 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 font-mono">
                                    <Server className="w-4 h-4 mr-2" /> Configure DHCP Server
                                </Button>
                            </div>
                        )}

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

            {/* PANEL LATERAL SECUNDARIO (ZONA) */}
            <ZoneEditDrawer isOpen={isZoneSheetOpen} onClose={() => setIsZoneSheetOpen(false)} zoneName={formZone} />

            {/* PANEL LATERAL SECUNDARIO (INTERFAZ PADRE - PLACEHOLDER) */}
            <Sheet open={isParentSheetOpen} onOpenChange={setIsParentSheetOpen}>
                <SheetContent className="bg-zinc-950 border-l border-zinc-800 text-zinc-100 sm:max-w-md w-full p-0 flex flex-col h-full shadow-2xl shadow-black">
                    <div className="p-6 border-b border-zinc-800 bg-zinc-900/30">
                        <SheetHeader>
                            <SheetTitle className="text-zinc-100 font-mono text-xl flex items-center gap-3">
                                <Activity className="w-5 h-5 text-emerald-500" />
                                Edit Parent: {formParent || 'None'}
                            </SheetTitle>
                            <SheetDescription className="text-zinc-400 font-mono text-xs">
                                Configure physical interface parameters directly from here.
                            </SheetDescription>
                        </SheetHeader>
                    </div>
                    <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                        <p className="text-zinc-500 text-sm font-mono">
                            // Aquí cargaremos el componente de edición de interfaces físicas en el futuro.<br/><br/>
                            This allows configuring the parent interface without losing your VLAN context.
                        </p>
                    </div>
                    <div className="p-6 border-t border-zinc-800 bg-zinc-900/30 flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsParentSheetOpen(false)} className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 font-mono text-xs uppercase">Back</Button>
                    </div>
                </SheetContent>
            </Sheet>

            {/* MODAL SUPERPUESTO */}
            <DhcpModal isOpen={isDhcpModalOpen} onClose={() => setIsDhcpModalOpen(false)} interfaceName={`${formParent}.${formId}`} />
        </div>
    );
}