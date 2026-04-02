import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
import { DhcpDrawer } from './DhcpDrawer';
import { AlertModal } from './AlertModal';
import dynamic from 'next/dynamic';

const ZoneEditDrawer = dynamic(() => import('./ZoneEditDrawer').then((mod) => mod.ZoneEditDrawer), { ssr: false });
const InterfaceEditDrawer = dynamic(() => import('./InterfaceEditDrawer').then((mod) => mod.InterfaceEditDrawer), { ssr: false });

interface VlanEditDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    vlan: VlanInterface | null;
    onSuccess?: () => void;
    onError?: (msg: string) => void;
}

export function VlanEditDrawer({ isOpen, onClose, vlan, onSuccess, onError }: VlanEditDrawerProps) {
    const { t } = useTranslation();
    const { saveVlan, isLoading, error } = useVlans();
    const { interfaces: physicalInterfaces, fetchInterfaces: fetchPhysicalInterfaces } = useInterfaces();
    const { zones, fetchZones } = useZones();

    const isEditMode = !!vlan;

    const [formId, setFormId] = useState<number | ''>('');
    const [formParent, setFormParent] = useState('');
    const [formIp, setFormIp] = useState('');
    const [formZone, setFormZone] = useState('');
    const [formState, setFormState] = useState('up');
    const [formManagement, setFormManagement] = useState<string[]>([]);

    const [isZoneSheetOpen, setIsZoneSheetOpen] = useState(false);
    const [isParentSheetOpen, setIsParentSheetOpen] = useState(false);
    const [isDhcpModalOpen, setIsDhcpModalOpen] = useState(false);
    const selectedZoneObj = zones.find(z => z.name === formZone) || null;

    const [localAlert, setLocalAlert] = useState<{isOpen: boolean, msg: string}>({isOpen: false, msg: ''});

    useEffect(() => {
        if (isOpen) {
            fetchPhysicalInterfaces('2');
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

    useEffect(() => {
        if (error && onError) {
            onError(error);
        }
    }, [error, onError]);

    const handleSave = async () => {
        if (!formId || !formParent) {
            setLocalAlert({ isOpen: true, msg: t('vlan_drawer.req_fields') });
            return;
        }

        const parentInterface = physicalInterfaces.find(iface => iface.name === formParent);
        if (parentInterface && parentInterface.ip) {
            setLocalAlert({ isOpen: true, msg: t('vlan_drawer.invalid_parent', { parent: formParent }) });
            return;
        }

        const vlanName = `${formParent}.${formId}`;
        const payload: Partial<VlanInterface> = {
            id: Number(formId), name: vlanName, parent: formParent, ip: formIp,
            zone: formZone, state: formState, management: formManagement
        };

        const success = await saveVlan(isEditMode ? 'PUT' : 'POST', vlanName, payload);
        if (success) {
            if (onSuccess) onSuccess();
            onClose();
        }
    };

    const toggleManagement = (service: string) => {
        setFormManagement(prev => prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]);
    };


    const parentOptions = physicalInterfaces.map(iface => ({
        label: `${iface.name} ${t('vlan_drawer.l2_ready', '(L2 Ready)')}`,
        value: iface.name,
    }));

    const dynamicZoneOptions = zones.map(z => ({
        label: `${z.name.toUpperCase()} (${z.type})`,
        value: z.name
    }));

    const selectedParentInterfaceObj = physicalInterfaces.find(i => i.name === formParent) || null;

    const slideOffset = isParentSheetOpen || isZoneSheetOpen || isDhcpModalOpen ? '150px' : '0px';
    const isChildOpen = isParentSheetOpen || isZoneSheetOpen || isDhcpModalOpen || localAlert.isOpen;

    return (
        <>
            <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <SheetContent
                    style={{ right: slideOffset }}
                    className={`bg-[#09090b] border-l border-zinc-800 text-zinc-100 w-full sm:w-[650px] sm:!max-w-[650px] p-0 flex flex-col h-full transition-all duration-300 ease-in-out  ${isChildOpen ? 'blur-[2px] brightness-50 pointer-events-none' : ''}`}
                >
                    <div className="p-6 border-b border-zinc-800 bg-zinc-950/50">
                        <SheetHeader>
                            <SheetTitle className="text-zinc-100 font-mono text-2xl flex items-center gap-3">
                                <Layers className="w-5 h-5 text-emerald-500" />
                                {isEditMode ? t('vlan_drawer.edit_vlan', { id: formId }) : t('vlan_drawer.create_vlan')}
                            </SheetTitle>
                        </SheetHeader>
                    </div>

                    <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <Label className="text-zinc-500 font-mono text-xs uppercase">{t('vlan_drawer.vlan_id')}</Label>
                                <Input type="number" value={formId} onChange={(e) => setFormId(e.target.value ? Number(e.target.value) : '')} disabled={isEditMode} className="bg-zinc-950 border-zinc-800 text-emerald-400 font-mono h-11 focus-visible:ring-emerald-500/50" placeholder="e.g. 10" />
                            </div>

                            <ResourceSelector
                                label={t('vlan_drawer.parent_iface')}
                                value={formParent}
                                onChange={setFormParent}
                                options={parentOptions}
                                disabled={isEditMode}
                                onEditClick={() => setIsParentSheetOpen(true)}
                            />
                        </div>

                        <AdminStateSelector value={formState} onChange={setFormState} />

                        <div className="space-y-3">
                            <Label className="text-zinc-500 font-mono text-xs uppercase">{t('vlan_drawer.ipv4')}</Label>
                            <Input value={formIp} onChange={(e) => setFormIp(e.target.value)} className="bg-zinc-950 border-zinc-800 text-emerald-400 font-mono h-11 focus-visible:ring-emerald-500/50" placeholder="e.g. 10.21.0.1/24" />
                        </div>

                        <ResourceSelector
                            label={t('vlan_drawer.sec_zone')}
                            value={formZone}
                            onChange={setFormZone}
                            options={dynamicZoneOptions}
                            onEditClick={() => setIsZoneSheetOpen(true)}
                        />

                        {isEditMode && (
                            <div className="space-y-3 border-t border-zinc-800 pt-6">
                                <Label className="text-zinc-500 font-mono text-xs uppercase tracking-wider">{t('vlan_drawer.services')}</Label>
                                <Button variant="outline" onClick={() => setIsDhcpModalOpen(true)} className="w-full h-11 bg-zinc-950 border-zinc-700 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 font-mono">
                                    <Server className="w-4 h-4 mr-2" /> {t('vlan_drawer.config_dhcp')}
                                </Button>
                            </div>
                        )}

                        <ManagementSelector selectedServices={formManagement} onChange={toggleManagement} />
                    </div>

                    <div className="p-6 border-t border-zinc-800 bg-zinc-950/50 flex justify-end gap-3">
                        <Button variant="outline" onClick={onClose} className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 font-mono uppercase text-xs">{t('vlan_drawer.cancel')}</Button>
                        <Button onClick={handleSave} disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono uppercase text-xs"><Save className="w-4 h-4 mr-2" /> {isLoading ? t('vlan_drawer.committing') : t('vlan_drawer.apply')}</Button>
                    </div>
                </SheetContent>
            </Sheet>

            <AlertModal
                isOpen={localAlert.isOpen}
                type="error"
                title={t('vlan_drawer.val_error')}
                message={localAlert.msg}
                onCancel={() => setLocalAlert({ isOpen: false, msg: '' })}
            />

            {isZoneSheetOpen && (
                <ZoneEditDrawer
                    isOpen={isZoneSheetOpen}
                    onClose={() => setIsZoneSheetOpen(false)}
                    zoneData={selectedZoneObj}
                    onSuccess={fetchZones}
                />
            )}

            {isParentSheetOpen && (
                <InterfaceEditDrawer isOpen={isParentSheetOpen} onClose={() => setIsParentSheetOpen(false)} iface={selectedParentInterfaceObj} onSuccess={fetchPhysicalInterfaces} />
            )}

            {isDhcpModalOpen && (
                <DhcpDrawer isOpen={isDhcpModalOpen} onClose={() => setIsDhcpModalOpen(false)} interfaceName={`${formParent}.${formId}`} />
            )}
        </>
    );
}