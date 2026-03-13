import { useState, useEffect } from 'react';
import { useVlans, VlanInterface } from '@/hooks/useVlans';
import { useInterfaces } from '@/hooks/useInterfaces';
import { useZones } from '@/hooks/useZones';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Layers, Save, Server } from "lucide-react";

import { AdminStateSelector } from './AdminStateSelector';
import { ResourceSelector } from './ResourceSelector';
import { ManagementSelector } from './ManagementSelector';
import { ZoneEditDrawer } from './ZoneEditDrawer';
import { InterfaceEditDrawer } from './InterfaceEditDrawer';
import DhcpModal from '../DhcpModal';

interface VlanEditDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    vlan: VlanInterface | null; // Si es null, estamos creando una nueva
    onSuccess?: () => void;
}

export function VlanEditDrawer({ isOpen, onClose, vlan, onSuccess }: VlanEditDrawerProps) {
    const { saveVlan, isLoading } = useVlans();
    const { interfaces: physicalInterfaces, fetchInterfaces: fetchPhysicalInterfaces } = useInterfaces();
    const { zones, fetchZones } = useZones();

    const isEditMode = !!vlan; // Booleano: ¿hay datos o es nuevo?

    const [formId, setFormId] = useState<number | ''>('');
    const [formParent, setFormParent] = useState('');
    const [formIp, setFormIp] = useState('');
    const [formZone, setFormZone] = useState('');
    const [formState, setFormState] = useState('up');
    const [formManagement, setFormManagement] = useState<string[]>([]);

    // Estados de los sub-paneles
    const [isZoneSheetOpen, setIsZoneSheetOpen] = useState(false);
    const [isParentSheetOpen, setIsParentSheetOpen] = useState(false);
    const [isDhcpModalOpen, setIsDhcpModalOpen] = useState(false);

    // Cargar dependencias y rellenar formulario al abrir el Drawer
    useEffect(() => {
        if (isOpen) {
            fetchPhysicalInterfaces();
            fetchZones();

            if (vlan) {
                setFormId(vlan.id);
                setFormParent(vlan.parent);
                setFormIp(vlan.ip || '');
                setFormZone(vlan.zone || '');
                setFormState(vlan.state || 'down');
                setFormManagement(vlan.management || []);
            } else {
                setFormId('');
                setFormParent('');
                setFormIp('');
                setFormZone('');
                setFormState('up');
                setFormManagement([]);
            }
        }
    }, [isOpen, vlan, fetchPhysicalInterfaces, fetchZones]);

    const handleSave = async () => {
        if (!formId || !formParent) return alert("VLAN ID and Parent Interface are required.");

        // Validación L3: El padre no puede tener IP
        const parentInterface = physicalInterfaces.find(iface => iface.name === formParent);
        if (parentInterface && parentInterface.ip) {
            return alert(`Cannot use ${formParent} as parent. It has an IP assigned (Layer 3 active). Remove its IP first.`);
        }

        const vlanName = `${formParent}.${formId}`;
        const payload: Partial<VlanInterface> = {
            id: Number(formId), name: vlanName, parent: formParent, ip: formIp,
            zone: formZone, state: formState, management: formManagement
        };

        // Pasamos el vlanName como ajustamos en el Hook anterior
        const success = await saveVlan(isEditMode ? 'PUT' : 'POST', vlanName, payload);
        if (success) {
            if (onSuccess) onSuccess();
            onClose();
        }
    };

    const toggleManagement = (service: string) => {
        setFormManagement(prev => prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]);
    };

    // Preparamos opciones para los dropdowns
    const parentOptions = physicalInterfaces.map(iface => ({
        label: `${iface.name} ${iface.ip ? '(L3 Active - Invalid)' : '(L2 Ready)'}`,
        value: iface.name,
        disabled: !!iface.ip
    }));

    const dynamicZoneOptions = zones.map(z => ({
        label: `${z.name.toUpperCase()} (${z.type})`,
        value: z.name
    }));

    const selectedParentInterfaceObj = physicalInterfaces.find(i => i.name === formParent) || null;
    const slideOffset = isParentSheetOpen || isZoneSheetOpen ? '200px' : '0px';

    return (
        <>
            <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <SheetContent
                    style={{ right: slideOffset }}
                    className="bg-[#09090b] border-l border-zinc-800 text-zinc-100 w-full sm:w-[650px] sm:!max-w-[650px] p-0 flex flex-col h-full transition-all duration-300 ease-in-out z-[50]"
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
                                <Input type="number" value={formId} onChange={(e) => setFormId(e.target.value ? Number(e.target.value) : '')} disabled={isEditMode} className="bg-zinc-950 border-zinc-800 text-emerald-400 font-mono h-11 focus-visible:ring-emerald-500/50" placeholder="e.g. 10" />
                            </div>

                            <ResourceSelector
                                label="Parent Interface"
                                value={formParent}
                                onChange={setFormParent}
                                options={parentOptions}
                                disabled={isEditMode}
                                onEditClick={() => setIsParentSheetOpen(true)}
                            />
                        </div>

                        <AdminStateSelector value={formState} onChange={setFormState} />

                        <div className="space-y-3">
                            <Label className="text-zinc-500 font-mono text-xs uppercase">IPv4 Address (CIDR)</Label>
                            <Input value={formIp} onChange={(e) => setFormIp(e.target.value)} className="bg-zinc-950 border-zinc-800 text-emerald-400 font-mono h-11 focus-visible:ring-emerald-500/50" placeholder="e.g. 10.21.0.1/24" />
                        </div>

                        <ResourceSelector
                            label="Security Zone"
                            value={formZone}
                            onChange={setFormZone}
                            options={dynamicZoneOptions}
                            onEditClick={() => setIsZoneSheetOpen(true)}
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
                        <Button variant="outline" onClick={onClose} className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 font-mono uppercase text-xs">Cancel</Button>
                        <Button onClick={handleSave} disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono uppercase text-xs"><Save className="w-4 h-4 mr-2" /> {isLoading ? 'COMMITTING...' : 'APPLY CHANGES'}</Button>
                    </div>
                </SheetContent>
            </Sheet>

            {/* LOS PANELES EN CASCADA (Protegidos con renderizado condicional &&) */}
            {isZoneSheetOpen && (
                <ZoneEditDrawer isOpen={isZoneSheetOpen} onClose={() => setIsZoneSheetOpen(false)} zoneName={formZone} />
            )}

            {isParentSheetOpen && (
                <InterfaceEditDrawer isOpen={isParentSheetOpen} onClose={() => setIsParentSheetOpen(false)} iface={selectedParentInterfaceObj} onSuccess={fetchPhysicalInterfaces} />
            )}

            {isDhcpModalOpen && (
                <DhcpModal isOpen={isDhcpModalOpen} onClose={() => setIsDhcpModalOpen(false)} interfaceName={`${formParent}.${formId}`} />
            )}
        </>
    );
}