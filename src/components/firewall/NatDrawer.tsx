import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNat, NatRuleInterface } from '@/hooks/useNat';
import { useInterfaces } from '@/hooks/useInterfaces';
import { useZones } from '@/hooks/useZones';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Network, Save } from "lucide-react";

import { ResourceSelector } from './ResourceSelector';
import { AlertModal } from './AlertModal';

interface NatEditDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    natData: NatRuleInterface | null;
    defaultAction?: 'masquerade' | 'snat' | 'dnat';
    onSuccess?: () => void;
    onError?: (msg: string) => void;
}

export function NatEditDrawer({ isOpen, onClose, natData, defaultAction = 'masquerade', onSuccess, onError }: NatEditDrawerProps) {
    const { t } = useTranslation();
    const { saveNatRule, isLoading, error } = useNat();
    const { interfaces, fetchInterfaces } = useInterfaces();
    const { zones, fetchZones } = useZones();

    const isEditMode = !!natData;

    const [formAction, setFormAction] = useState<'masquerade' | 'snat' | 'dnat'>(defaultAction);
    const [formSrcZone, setFormSrcZone] = useState('');
    const [formDstZone, setFormDstZone] = useState('');
    const [formOutIface, setFormOutIface] = useState('');
    const [formDesc, setFormDesc] = useState('');

    const [localAlert, setLocalAlert] = useState({ isOpen: false, msg: '' });

    useEffect(() => {
        if (isOpen) {
            fetchInterfaces();
            fetchZones();

            if (natData) {
                setFormAction(natData.action);
                setFormSrcZone(natData['src-zone'] || '');
                setFormDstZone(natData['dst-zone'] || '');
                setFormOutIface(natData['out-interface'] || '');
                setFormDesc(natData.description || '');
            } else {
                setFormAction(defaultAction);
                setFormSrcZone('');
                setFormDstZone('');
                setFormOutIface('');
                setFormDesc('');
            }
        }
    }, [isOpen, natData, defaultAction, fetchInterfaces, fetchZones]);

    useEffect(() => {
        if (error && onError) onError(error);
    }, [error, onError]);

    const handleSave = async () => {
        if (!formAction) {
            setLocalAlert({ isOpen: true, msg: t('nat_drawer.req_action') });
            return;
        }

        const payload: Partial<NatRuleInterface> = {
            action: formAction,
            'src-zone': formSrcZone,
            'dst-zone': formDstZone,
            'out-interface': formOutIface,
            description: formDesc
        };

        const success = await saveNatRule(isEditMode ? 'PUT' : 'POST', isEditMode ? natData.id : null, payload);
        if (success) {
            if (onSuccess) onSuccess();
            onClose();
        }
    };

    const zoneOptions = zones.map(z => ({ label: z.name.toUpperCase(), value: z.name }));
    const ifaceOptions = interfaces.filter(i => !!i.ip).map(i => ({ label: `${i.name} (${i.ip})`, value: i.name }));

    return (
        <>
            <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <SheetContent className={`bg-[#09090b] border-l border-zinc-800 text-zinc-100 w-full sm:w-[600px] sm:!max-w-[600px] p-0 flex flex-col h-full shadow-2xl transition-all duration-300 ${localAlert.isOpen ? 'blur-[2px] brightness-50 pointer-events-none' : ''}`}>

                    <div className="p-6 border-b border-zinc-800 bg-zinc-950/50">
                        <SheetHeader>
                            <SheetTitle className="text-zinc-100 font-mono text-2xl flex items-center gap-3">
                                <Network className="w-5 h-5 text-emerald-500" />
                                {isEditMode ? t('nat_drawer.edit_title', { id: natData.id }) : t('nat_drawer.create_title')}
                            </SheetTitle>
                        </SheetHeader>
                    </div>

                    <div className="p-6 space-y-6 flex-1 overflow-y-auto">

                        <div className="space-y-3">
                            <Label className="text-zinc-500 font-mono text-xs uppercase">{t('nat_drawer.action')}</Label>
                            <select
                                value={formAction}
                                onChange={(e) => setFormAction(e.target.value as any)}
                                className="w-full h-11 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-emerald-400 font-mono focus:ring-1 focus:ring-emerald-500/50 outline-none"
                            >
                                <option value="masquerade">Masquerade (Dynamic IP)</option>
                                <option value="snat">SNAT (Static Source)</option>
                                <option value="dnat">DNAT (Port Forwarding)</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <ResourceSelector label={t('nat_drawer.src_zone')} value={formSrcZone} onChange={setFormSrcZone} options={[{label: t('nat_drawer.any'), value: ''}, ...zoneOptions]} />
                            <ResourceSelector label={t('nat_drawer.dst_zone')} value={formDstZone} onChange={setFormDstZone} options={[{label: t('nat_drawer.any'), value: ''}, ...zoneOptions]} />
                        </div>

                        <ResourceSelector label={t('nat_drawer.out_iface')} value={formOutIface} onChange={setFormOutIface} options={[{label: t('nat_drawer.any'), value: ''}, ...ifaceOptions]} />

                        <div className="space-y-3">
                            <Label className="text-zinc-500 font-mono text-xs uppercase">{t('nat_drawer.description')}</Label>
                            <Input value={formDesc} onChange={(e) => setFormDesc(e.target.value)} className="bg-zinc-950 border-zinc-800 text-zinc-300 font-mono h-11 focus-visible:ring-emerald-500/50" placeholder="e.g. Internet Access for LAN" />
                        </div>

                    </div>

                    <div className="p-6 border-t border-zinc-800 bg-zinc-950/50 flex justify-end gap-3">
                        <Button variant="outline" onClick={onClose} className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 font-mono uppercase text-xs w-24">
                            {t('nat_drawer.cancel')}
                        </Button>
                        <Button onClick={handleSave} disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono uppercase text-xs w-36">
                            <Save className="w-4 h-4 mr-2" /> {isLoading ? t('nat_drawer.saving') : t('nat_drawer.apply')}
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>

            <AlertModal isOpen={localAlert.isOpen} type="error" title={t('nat_drawer.error')} message={localAlert.msg} onCancel={() => setLocalAlert({ isOpen: false, msg: '' })} />
        </>
    );
}