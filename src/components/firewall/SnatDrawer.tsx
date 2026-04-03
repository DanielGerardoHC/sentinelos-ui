"use client";

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNat, NatRuleInterface } from '@/hooks/useNat';
import { useInterfaces } from '@/hooks/useInterfaces';
import { useZones } from '@/hooks/useZones';
import { useAddresses } from '@/hooks/useAddresses';
import { useServices } from '@/hooks/useServices';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Network, Save } from "lucide-react";

import { ResourceSelector } from './ResourceSelector';
import { AlertModal } from './AlertModal';

interface SnatEditDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    natData: NatRuleInterface | null;
    onSuccess?: () => void;
    onError?: (msg: string) => void;
}

export function SnatEditDrawer({ isOpen, onClose, natData, onSuccess, onError }: SnatEditDrawerProps) {
    const { t } = useTranslation();
    const { saveNatRule, isLoading, error } = useNat();


    const { interfaces, fetchInterfaces } = useInterfaces();
    const { zones, fetchZones } = useZones();
    const { addresses, fetchAddresses } = useAddresses();
    const { services, fetchServices } = useServices();

    const isEditMode = !!natData;


    const [formSrcZone, setFormSrcZone] = useState('');
    const [formDstZone, setFormDstZone] = useState('');
    const [formSrcAddr, setFormSrcAddr] = useState('');
    const [formDstAddr, setFormDstAddr] = useState('');
    const [formOutIface, setFormOutIface] = useState('');
    const [formService, setFormService] = useState('');


    const [translationMode, setTranslationMode] = useState<'egress' | 'specified'>('egress');
    const [formTranslatedIp, setFormTranslatedIp] = useState('');

    const [formDesc, setFormDesc] = useState('');
    const [localAlert, setLocalAlert] = useState({ isOpen: false, msg: '' });

    useEffect(() => {
        if (isOpen) {
            fetchInterfaces();
            fetchZones();
            fetchAddresses();
            fetchServices();

            if (natData) {
                setFormSrcZone(natData['src-zone'] || '');
                setFormDstZone(natData['dst-zone'] || '');
                setFormSrcAddr(natData['src-addr'] || '');
                setFormDstAddr(natData['dst-addr'] || '');
                setFormOutIface(natData['out-interface'] || '');
                setFormService(natData.service || '');
                setFormDesc(natData.description || '');

                if (natData['translated-ip'] && natData['translated-ip'].trim() !== '') {
                    setTranslationMode('specified');
                    setFormTranslatedIp(natData['translated-ip']);
                } else {
                    setTranslationMode('egress');
                    setFormTranslatedIp('');
                }

            } else {
                setFormSrcZone('');
                setFormDstZone('');
                setFormSrcAddr('');
                setFormDstAddr('');
                setFormOutIface('');
                setFormService('');
                setTranslationMode('egress');
                setFormTranslatedIp('');
                setFormDesc('');
            }
        }
    }, [isOpen, natData, fetchInterfaces, fetchZones, fetchAddresses, fetchServices]);

    useEffect(() => {
        if (error && onError) onError(error);
    }, [error, onError]);

    const handleSave = async () => {
        if (!formOutIface) {
            setLocalAlert({ isOpen: true, msg: "Egress Interface is required for SNAT." });
            return;
        }

        if (translationMode === 'specified' && !formTranslatedIp) {
            setLocalAlert({ isOpen: true, msg: "Please specify the Translated IP." });
            return;
        }

        const payload: Partial<NatRuleInterface> = {
            type: 'snat',
            'src-zone': formSrcZone,
            'dst-zone': formDstZone,
            'src-addr': formSrcAddr,
            'dst-addr': formDstAddr,
            service: formService,
            'out-interface': formOutIface,

            'translated-ip': translationMode === 'specified' ? formTranslatedIp : '',
            description: formDesc
        };

        const success = await saveNatRule(isEditMode ? 'PUT' : 'POST', isEditMode ? natData.id : null, payload);
        if (success) {
            if (onSuccess) onSuccess();
            onClose();
        }
    };

    const zoneOptions = zones.map(z => ({ label: z.name.toUpperCase(), value: z.name }));
    const addrOptions = addresses.map(a => ({ label: a.name, value: a.name }));
    const svcOptions = services.map(s => ({ label: s.name, value: s.name }));
    const ifaceOptions = interfaces.filter(i => !!i.ip).map(i => ({ label: `${i.name} (${i.ip})`, value: i.name }));

    return (
        <>
            <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <SheetContent className={`bg-[#09090b] border-l border-zinc-800 text-zinc-100 w-full sm:w-[650px] sm:!max-w-[650px] p-0 flex flex-col h-full shadow-2xl transition-all duration-300 ${localAlert.isOpen ? 'blur-[2px] brightness-50 pointer-events-none' : ''}`}>

                    <div className="p-6 border-b border-zinc-800 bg-zinc-950/50">
                        <SheetHeader>
                            <SheetTitle className="text-zinc-100 font-mono text-2xl flex items-center gap-3">
                                <Network className="w-5 h-5 text-emerald-500" />
                                {isEditMode ? `Edit SNAT Configuration #${natData.id}` : `New SNAT Configuration`}
                            </SheetTitle>
                        </SheetHeader>
                    </div>

                    <div className="p-6 space-y-8 flex-1 overflow-y-auto">

                        <div className="space-y-4">
                            <h3 className="text-emerald-500 font-mono text-sm font-bold tracking-widest border-b border-zinc-800 pb-2">Requirements</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <ResourceSelector label="Source Zone" value={formSrcZone} onChange={setFormSrcZone} options={[{label: 'Any', value: ''}, ...zoneOptions]} />
                                <ResourceSelector label="Destination Zone" value={formDstZone} onChange={setFormDstZone} options={[{label: 'Any', value: ''}, ...zoneOptions]} />

                                <ResourceSelector label="Source Address" value={formSrcAddr} onChange={setFormSrcAddr} options={[{label: 'Any (0.0.0.0/0)', value: ''}, ...addrOptions]} />
                                <ResourceSelector label="Destination Address" value={formDstAddr} onChange={setFormDstAddr} options={[{label: 'Any (0.0.0.0/0)', value: ''}, ...addrOptions]} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <ResourceSelector label="Egress Interface *" value={formOutIface} onChange={setFormOutIface} options={[{label: 'Select Interface...', value: '', disabled: true}, ...ifaceOptions]} />
                                <ResourceSelector label="Service" value={formService} onChange={setFormService} options={[{label: 'Any', value: ''}, ...svcOptions]} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-emerald-500 font-mono text-sm font-bold tracking-widest border-b border-zinc-800 pb-2">Translated to</h3>

                            <div className="space-y-3">
                                <Label className="text-zinc-500 font-mono text-xs uppercase">Translated</Label>
                                <div className="flex gap-2 p-1 bg-zinc-900 border border-zinc-800 rounded-md inline-flex">
                                    <button
                                        type="button"
                                        onClick={() => setTranslationMode('egress')}
                                        className={`px-4 py-2 text-xs font-mono rounded transition-colors ${translationMode === 'egress' ? 'bg-[#1890ff] text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'}`}
                                    >
                                        Egress IF IP(IPv4)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTranslationMode('specified')}
                                        className={`px-4 py-2 text-xs font-mono rounded transition-colors ${translationMode === 'specified' ? 'bg-[#1890ff] text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'}`}
                                    >
                                        Specified IP
                                    </button>
                                </div>
                            </div>

                            {translationMode === 'specified' && (
                                <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2">
                                    <Label className="text-zinc-500 font-mono text-xs uppercase text-emerald-400">Translated IP Object *</Label>
                                    <ResourceSelector label="" value={formTranslatedIp} onChange={setFormTranslatedIp} options={[{label: 'Select Object...', value: '', disabled: true}, ...addrOptions]} />
                                </div>
                            )}
                        </div>


                        <div className="space-y-4">
                            <h3 className="text-zinc-500 font-mono text-sm font-bold tracking-widest border-b border-zinc-800 pb-2">Others</h3>
                            <div className="space-y-3">
                                <Label className="text-zinc-500 font-mono text-xs uppercase">Description</Label>
                                <Input value={formDesc} onChange={(e) => setFormDesc(e.target.value)} className="bg-zinc-950 border-zinc-800 text-zinc-300 font-mono h-11 focus-visible:ring-emerald-500/50" placeholder="(0 - 63) chars" />
                            </div>
                        </div>

                    </div>

                    <div className="p-6 border-t border-zinc-800 bg-zinc-950/50 flex justify-end gap-3">
                        <Button variant="outline" onClick={onClose} className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 font-mono uppercase text-xs w-24">
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isLoading} className="bg-[#1890ff] hover:bg-blue-500 text-white font-mono uppercase text-xs w-36 border-none">
                            <Save className="w-4 h-4 mr-2" /> {isLoading ? 'Saving...' : 'OK'}
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>

            <AlertModal isOpen={localAlert.isOpen} type="error" title="Validation Error" message={localAlert.msg} onCancel={() => setLocalAlert({ isOpen: false, msg: '' })} />
        </>
    );
}