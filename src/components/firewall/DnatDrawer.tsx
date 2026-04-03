"use client";

import { useState, useEffect } from 'react';
import { useNat, NatRuleInterface } from '@/hooks/useNat';
import { useAddresses } from '@/hooks/useAddresses';
import { useServices } from '@/hooks/useServices';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRightLeft, Save } from "lucide-react";

import { ResourceSelector } from './ResourceSelector';
import { AlertModal } from './AlertModal';

interface DnatEditDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    natData: NatRuleInterface | null;
    onSuccess?: () => void;
    onError?: (msg: string) => void;
}

export function DnatEditDrawer({ isOpen, onClose, natData, onSuccess, onError }: DnatEditDrawerProps) {
    const { saveNatRule, isLoading, error } = useNat();
    const { addresses, fetchAddresses } = useAddresses();
    const { services, fetchServices } = useServices();

    const isEditMode = !!natData;

    const [dnatMode, setDnatMode] = useState<'dnat-ip' | 'dnat-port'>('dnat-ip');

    // Requirements
    const [formDstAddr, setFormDstAddr] = useState(''); // Public IP
    const [formService, setFormService] = useState(''); // Original Port

    // Mapping
    const [formTranslatedIp, setFormTranslatedIp] = useState(''); // Internal Server
    const [formTranslatedPort, setFormTranslatedPort] = useState(''); // Internal Port

    // Others
    const [formDesc, setFormDesc] = useState('');
    const [localAlert, setLocalAlert] = useState({ isOpen: false, msg: '' });

    useEffect(() => {
        if (isOpen) {
            fetchAddresses();
            fetchServices();

            if (natData) {
                setDnatMode(natData.type as 'dnat-ip' | 'dnat-port');
                setFormDstAddr(natData['dst-addr'] || '');
                setFormService(natData.service || '');
                setFormTranslatedIp(natData['translated-ip'] || '');
                setFormTranslatedPort(natData['translated-port'] || '');
                setFormDesc(natData.description || '');
            } else {
                setDnatMode('dnat-ip');
                setFormDstAddr('');
                setFormService('');
                setFormTranslatedIp('');
                setFormTranslatedPort('');
                setFormDesc('');
            }
        }
    }, [isOpen, natData, fetchAddresses, fetchServices]);

    useEffect(() => {
        if (error && onError) onError(error);
    }, [error, onError]);

    const handleSave = async () => {
        if (!formDstAddr || !formTranslatedIp) {
            setLocalAlert({ isOpen: true, msg: "Destination Address and Mapped To (Translated IP) are required." });
            return;
        }

        const payload: Partial<NatRuleInterface> = {
            type: dnatMode,
            'dst-addr': formDstAddr,
            'translated-ip': formTranslatedIp,
            description: formDesc,
            // Solo mandamos el puerto/servicio si es Port Mapping
            ...(dnatMode === 'dnat-port' ? { service: formService, 'translated-port': formTranslatedPort } : { service: '', 'translated-port': '' })
        };

        const success = await saveNatRule(isEditMode ? 'PUT' : 'POST', isEditMode ? natData.id : null, payload);
        if (success) {
            if (onSuccess) onSuccess();
            onClose();
        }
    };

    const addrOptions = addresses.map(a => ({ label: a.name, value: a.name }));
    const svcOptions = services.map(s => ({ label: s.name, value: s.name }));

    return (
        <>
            <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <SheetContent className={`bg-[#09090b] border-l border-zinc-800 text-zinc-100 w-full sm:w-[500px] sm:!max-w-[500px] p-0 flex flex-col h-full shadow-2xl transition-all duration-300 ${localAlert.isOpen ? 'blur-[2px] brightness-50 pointer-events-none' : ''}`}>

                    <div className="p-6 border-b border-zinc-800 bg-zinc-950/50">
                        <SheetHeader>
                            <SheetTitle className="text-zinc-100 font-mono text-2xl flex items-center gap-3">
                                <ArrowRightLeft className="w-5 h-5 text-blue-500" />
                                {isEditMode ? `Edit DNAT #${natData.id}` : `New DNAT Configuration`}
                            </SheetTitle>
                        </SheetHeader>
                    </div>

                    <div className="p-6 space-y-8 flex-1 overflow-y-auto">

                        {/* TYPE SELECTOR (Imitando el dropdown de Hillstone) */}
                        <div className="flex bg-zinc-900 border border-zinc-800 rounded-md p-1">
                            <button type="button" onClick={() => setDnatMode('dnat-ip')} className={`flex-1 py-2 text-xs font-mono rounded transition-colors ${dnatMode === 'dnat-ip' ? 'bg-[#1890ff] text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'}`}>IP Mapping</button>
                            <button type="button" onClick={() => setDnatMode('dnat-port')} className={`flex-1 py-2 text-xs font-mono rounded transition-colors ${dnatMode === 'dnat-port' ? 'bg-[#1890ff] text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'}`}>Port Mapping</button>
                        </div>

                        {/* --- REQUIREMENTS SECTION --- */}
                        <div className="space-y-4">
                            <h3 className="text-blue-500 font-mono text-sm font-bold tracking-widest border-b border-zinc-800 pb-2">Requirements</h3>

                            <ResourceSelector label="Destination Address (Public IP) *" value={formDstAddr} onChange={setFormDstAddr} options={[{label: 'Select Object...', value: '', disabled: true}, ...addrOptions]} />

                            {dnatMode === 'dnat-port' && (
                                <div className="animate-in fade-in slide-in-from-top-2">
                                    <ResourceSelector label="Service (Original Port)" value={formService} onChange={setFormService} options={[{label: 'Any', value: ''}, ...svcOptions]} />
                                </div>
                            )}
                        </div>

                        {/* --- MAPPING SECTION --- */}
                        <div className="space-y-4">
                            <h3 className="text-blue-500 font-mono text-sm font-bold tracking-widest border-b border-zinc-800 pb-2">Mapping</h3>

                            <ResourceSelector label="Mapped to (Internal Server IP) *" value={formTranslatedIp} onChange={setFormTranslatedIp} options={[{label: 'Select Object...', value: '', disabled: true}, ...addrOptions]} />

                            {dnatMode === 'dnat-port' && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                    <Label className="text-zinc-500 font-mono text-xs uppercase">Port Mapping (Internal Port)</Label>
                                    <Input type="number" value={formTranslatedPort} onChange={(e) => setFormTranslatedPort(e.target.value)} className="bg-zinc-950 border-zinc-800 text-zinc-300 font-mono h-11 focus-visible:ring-blue-500/50" placeholder="(1 - 65535)" />
                                </div>
                            )}
                        </div>

                        {/* --- OTHERS --- */}
                        <div className="space-y-4">
                            <h3 className="text-zinc-500 font-mono text-sm font-bold tracking-widest border-b border-zinc-800 pb-2">Others</h3>
                            <div className="space-y-3">
                                <Label className="text-zinc-500 font-mono text-xs uppercase">Description</Label>
                                <Input value={formDesc} onChange={(e) => setFormDesc(e.target.value)} className="bg-zinc-950 border-zinc-800 text-zinc-300 font-mono h-11 focus-visible:ring-blue-500/50" placeholder="(0 - 63) chars" />
                            </div>
                        </div>

                    </div>

                    <div className="p-6 border-t border-zinc-800 bg-zinc-950/50 flex justify-end gap-3">
                        <Button variant="outline" onClick={onClose} className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 font-mono uppercase text-xs w-24">Cancel</Button>
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