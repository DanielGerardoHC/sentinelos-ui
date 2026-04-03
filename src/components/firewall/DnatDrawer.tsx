import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import dynamic from 'next/dynamic';

import { useNat, NatRuleInterface } from '@/hooks/useNat';
import { useAddresses } from '@/hooks/useAddresses';
import { useServices } from '@/hooks/useServices';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowRightLeft, Save, Plus } from "lucide-react";
import { AlertModal } from './AlertModal';

const AddressEditDrawer = dynamic(() => import('./AddressDrawer').then(m => m.AddressEditDrawer), { ssr: false });
const ServiceEditDrawer = dynamic(() => import('./ServiceDrawer').then(m => m.ServiceEditDrawer), { ssr: false });

interface DnatEditDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    natData: NatRuleInterface | null;
    onSuccess?: () => void;
    onError?: (msg: string) => void;
}

export function DnatEditDrawer({ isOpen, onClose, natData, onSuccess, onError }: DnatEditDrawerProps) {
    const { t } = useTranslation();
    const { saveNatRule, isLoading, error } = useNat();

    const { addresses, fetchAddresses } = useAddresses();
    const { services, fetchServices } = useServices();

    const isEditMode = !!natData;

    const [dnatMode, setDnatMode] = useState<'dnat-ip' | 'dnat-port'>('dnat-ip');
    const [formDstAddr, setFormDstAddr] = useState('');
    const [formService, setFormService] = useState('');
    const [formTranslatedIp, setFormTranslatedIp] = useState('');
    const [formTranslatedPort, setFormTranslatedPort] = useState('');
    const [formDesc, setFormDesc] = useState('');

    const [localAlert, setLocalAlert] = useState({ isOpen: false, msg: '' });
    const [activeNestedDrawer, setActiveNestedDrawer] = useState<'address' | 'service' | null>(null);

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
            setLocalAlert({ isOpen: true, msg: t('nat_drawer.error_missing_dnat', 'Destination Address and Translated IP are required.') });
            return;
        }

        const payload: Partial<NatRuleInterface> = {
            type: dnatMode,
            'dst-addr': formDstAddr,
            'translated-ip': formTranslatedIp,
            description: formDesc,
            ...(dnatMode === 'dnat-port' ? { service: formService, 'translated-port': formTranslatedPort } : { service: '', 'translated-port': '' })
        };

        const success = await saveNatRule(isEditMode ? 'PUT' : 'POST', isEditMode ? natData.id : null, payload);
        if (success) {
            if (onSuccess) onSuccess();
            onClose();
        }
    };

    const slideOffset = activeNestedDrawer ? '150px' : '0px';
    const isChildOpen = activeNestedDrawer !== null;

    return (
        <>
            <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <SheetContent
                    style={{ right: slideOffset }}
                    className={`bg-[#09090b] border-l border-zinc-800 text-zinc-100 w-full sm:w-[700px] sm:!max-w-[700px] p-0 flex flex-col h-full shadow-2xl shadow-black transition-all duration-300 z-[50] ${isChildOpen ? 'blur-[2px] brightness-50 pointer-events-none' : ''}`}
                >
                    <div className="p-6 border-b border-zinc-800 bg-zinc-950/50">
                        <SheetHeader>
                            <SheetTitle className="text-zinc-100 font-mono text-2xl flex items-center gap-3">
                                <ArrowRightLeft className="w-5 h-5 text-blue-500" />
                                {isEditMode ? t('nat_drawer.edit_title_dnat', { id: natData.id }) : t('nat_drawer.create_title_dnat', 'Create DNAT Rule')}
                            </SheetTitle>
                            <SheetDescription className="text-zinc-400 font-mono text-xs">
                                {t('nat_drawer.desc_dnat', 'Define Destination Network Address Translation.')}
                            </SheetDescription>
                        </SheetHeader>
                    </div>

                    <div className="p-6 space-y-6 flex-1 overflow-y-auto">

                        <div className="space-y-3">
                            <Label className="text-blue-400 font-mono text-xs uppercase flex items-center justify-between">
                                {t('nat_drawer.mapping_type', 'Mapping Type')}
                            </Label>
                            <div className="flex gap-4">
                                <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${dnatMode === 'dnat-ip' ? 'border-blue-500 bg-blue-500/10 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'border-zinc-800 bg-zinc-900/30 text-zinc-500 hover:bg-zinc-800'}`}>
                                    <input type="radio" value="dnat-ip" checked={dnatMode === 'dnat-ip'} onChange={() => setDnatMode('dnat-ip')} className="hidden" />
                                    {t('nat_drawer.ip_mapping', 'IP Mapping (1-to-1)')}
                                </label>
                                <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${dnatMode === 'dnat-port' ? 'border-purple-500 bg-purple-500/10 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.1)]' : 'border-zinc-800 bg-zinc-900/30 text-zinc-500 hover:bg-zinc-800'}`}>
                                    <input type="radio" value="dnat-port" checked={dnatMode === 'dnat-port'} onChange={() => setDnatMode('dnat-port')} className="hidden" />
                                    {t('nat_drawer.port_mapping', 'Port Mapping')}
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 p-4 rounded-lg border border-zinc-800/50 bg-zinc-900/20">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <Label className="text-zinc-500 font-mono text-xs uppercase">{t('nat_drawer.dst_addr_public', 'Dest. Address (Public IP)')} *</Label>
                                    <button onClick={() => setActiveNestedDrawer('address')} className="text-blue-400 hover:text-blue-300 text-[10px] font-mono flex items-center gap-1"><Plus className="w-3 h-3"/> {t('nat_drawer.create_new', 'New')}</button>
                                </div>
                                <select value={formDstAddr} onChange={(e) => setFormDstAddr(e.target.value)} className="w-full h-11 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 font-mono focus:ring-1 focus:ring-blue-500/50 outline-none">
                                    <option value="" disabled>{t('nat_drawer.select_obj', 'Select Object...')}</option>
                                    {addresses.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
                                </select>
                            </div>

                            {dnatMode === 'dnat-port' ? (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-zinc-500 font-mono text-xs uppercase">{t('nat_drawer.service_orig', 'Service (Original Port)')}</Label>
                                        <button onClick={() => setActiveNestedDrawer('service')} className="text-blue-400 hover:text-blue-300 text-[10px] font-mono flex items-center gap-1"><Plus className="w-3 h-3"/> {t('nat_drawer.create_new', 'New')}</button>
                                    </div>
                                    <select value={formService} onChange={(e) => setFormService(e.target.value)} className="w-full h-11 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 font-mono focus:ring-1 focus:ring-purple-500/50 outline-none">
                                        <option value="">{t('nat_drawer.any', 'ANY')}</option>
                                        {services.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                                    </select>
                                </div>
                            ) : <div />}
                        </div>

                        <div className="grid grid-cols-2 gap-6 p-4 rounded-lg border border-blue-900/30 bg-blue-950/10">
                            <div className="space-y-3">
                                <Label className="text-blue-400 font-mono text-xs uppercase">
                                    {t('nat_drawer.mapped_to', 'Mapped To (Internal IPv4)')} *
                                </Label>
                                <Input
                                    value={formTranslatedIp}
                                    onChange={(e) => setFormTranslatedIp(e.target.value.replace(/[^0-9.]/g, ''))}
                                    className="bg-zinc-950 border-zinc-800 text-blue-400 font-mono h-11 focus-visible:ring-blue-500/50"
                                    placeholder="e.g. 10.20.10.50"
                                />
                            </div>

                            {dnatMode === 'dnat-port' ? (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                    <Label className="text-purple-400 font-mono text-xs uppercase">{t('nat_drawer.mapped_port', 'Mapped Port (Internal Port)')}</Label>
                                    <Input type="number" value={formTranslatedPort} onChange={(e) => setFormTranslatedPort(e.target.value)} className="bg-zinc-950 border-zinc-800 text-purple-400 font-mono h-11 focus-visible:ring-purple-500/50" placeholder="(1 - 65535)" />
                                </div>
                            ) : <div />}
                        </div>

                        <div className="space-y-3">
                            <Label className="text-zinc-500 font-mono text-xs uppercase">{t('nat_drawer.description', 'Description')}</Label>
                            <Input value={formDesc} onChange={(e) => setFormDesc(e.target.value)} className="bg-zinc-950 border-zinc-800 text-zinc-300 font-mono h-11 focus-visible:ring-blue-500/50" placeholder="(0 - 63) chars" />
                        </div>

                    </div>

                    <div className="p-6 border-t border-zinc-800 bg-zinc-950/50 flex justify-end gap-3">
                        <Button variant="outline" onClick={onClose} className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 font-mono uppercase text-xs w-24">
                            {t('nat_drawer.cancel', 'Cancel')}
                        </Button>
                        <Button onClick={handleSave} disabled={isLoading} className="bg-blue-600 hover:bg-blue-500 text-white font-mono uppercase text-xs w-36 border-none">
                            <Save className="w-4 h-4 mr-2" /> {isLoading ? t('nat_drawer.saving', 'Saving...') : t('nat_drawer.apply', 'Apply')}
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>

            <AlertModal isOpen={localAlert.isOpen} type="error" title={t('nat_drawer.error')} message={localAlert.msg} onCancel={() => setLocalAlert({ isOpen: false, msg: '' })} />

            {activeNestedDrawer === 'address' && <AddressEditDrawer isOpen={true} onClose={() => setActiveNestedDrawer(null)} addressData={null} onSuccess={fetchAddresses} />}
            {activeNestedDrawer === 'service' && <ServiceEditDrawer isOpen={true} onClose={() => setActiveNestedDrawer(null)} serviceData={null} onSuccess={fetchServices} />}
        </>
    );
}