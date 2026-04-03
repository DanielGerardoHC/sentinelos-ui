import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import dynamic from 'next/dynamic';

import { useNat, NatRuleInterface } from '@/hooks/useNat';
import { useZones } from '@/hooks/useZones';
import { useAddresses } from '@/hooks/useAddresses';
import { useServices } from '@/hooks/useServices';
import { useInterfaces } from '@/hooks/useInterfaces';
import { useVlans } from '@/hooks/useVlans';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Network, Save, Plus } from "lucide-react";
import { AlertModal } from './AlertModal';

const ZoneEditDrawer = dynamic(() => import('./ZoneEditDrawer').then(m => m.ZoneEditDrawer), { ssr: false });
const AddressEditDrawer = dynamic(() => import('./AddressDrawer').then(m => m.AddressEditDrawer), { ssr: false });
const ServiceEditDrawer = dynamic(() => import('./ServiceDrawer').then(m => m.ServiceEditDrawer), { ssr: false });

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

    const { zones, fetchZones } = useZones();
    const { addresses, fetchAddresses } = useAddresses();
    const { services, fetchServices } = useServices();
    const { interfaces, fetchInterfaces } = useInterfaces();
    const { vlans, fetchVlans } = useVlans();

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
    const [activeNestedDrawer, setActiveNestedDrawer] = useState<'zone' | 'address' | 'service' | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchZones();
            fetchAddresses();
            fetchServices();
            fetchInterfaces();
            fetchVlans();

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
    }, [isOpen, natData, fetchZones, fetchAddresses, fetchServices, fetchInterfaces, fetchVlans]);

    useEffect(() => {
        if (error && onError) onError(error);
    }, [error, onError]);

    const handleSave = async () => {
        if (!formOutIface) {
            setLocalAlert({ isOpen: true, msg: t('nat_drawer.error_no_egress', 'Egress Interface is required for SNAT.') });
            return;
        }

        if (translationMode === 'specified' && !formTranslatedIp) {
            setLocalAlert({ isOpen: true, msg: t('nat_drawer.error_no_translated_ip', 'Please specify the Translated IP.') });
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

    const combinedInterfaces = [
        ...interfaces.filter(i => !!i.ip).map(i => ({ name: i.name, label: `${i.name} (${i.ip})` })),
        ...vlans.filter(v => !!v.ip).map(v => ({ name: v.name, label: `${v.name} (${v.ip})` }))
    ];

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
                                <Network className="w-5 h-5 text-emerald-500" />
                                {isEditMode ? t('nat_drawer.edit_title_snat', { id: natData.id }) : t('nat_drawer.create_title_snat', 'Create SNAT Rule')}
                            </SheetTitle>
                            <SheetDescription className="text-zinc-400 font-mono text-xs">
                                {t('nat_drawer.desc_snat', 'Define Source Network Address Translation.')}
                            </SheetDescription>
                        </SheetHeader>
                    </div>

                    <div className="p-6 space-y-6 flex-1 overflow-y-auto">

                        <div className="grid grid-cols-2 gap-6 p-4 rounded-lg border border-zinc-800/50 bg-zinc-900/20">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <Label className="text-zinc-500 font-mono text-xs uppercase">{t('nat_drawer.src_zone')}</Label>
                                    <button onClick={() => setActiveNestedDrawer('zone')} className="text-emerald-500 hover:text-emerald-400 text-[10px] font-mono flex items-center gap-1"><Plus className="w-3 h-3"/> {t('nat_drawer.create_new', 'New')}</button>
                                </div>
                                <select value={formSrcZone} onChange={(e) => setFormSrcZone(e.target.value)} className="w-full h-11 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 font-mono focus:ring-1 focus:ring-emerald-500/50 outline-none">
                                    <option value="">{t('nat_drawer.any', 'ANY')}</option>
                                    {zones.map(z => <option key={z.name} value={z.name}>{z.name.toUpperCase()}</option>)}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <Label className="text-zinc-500 font-mono text-xs uppercase">{t('nat_drawer.dst_zone')}</Label>
                                    <button onClick={() => setActiveNestedDrawer('zone')} className="text-emerald-500 hover:text-emerald-400 text-[10px] font-mono flex items-center gap-1"><Plus className="w-3 h-3"/> {t('nat_drawer.create_new', 'New')}</button>
                                </div>
                                <select value={formDstZone} onChange={(e) => setFormDstZone(e.target.value)} className="w-full h-11 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 font-mono focus:ring-1 focus:ring-emerald-500/50 outline-none">
                                    <option value="">{t('nat_drawer.any', 'ANY')}</option>
                                    {zones.map(z => <option key={z.name} value={z.name}>{z.name.toUpperCase()}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 p-4 rounded-lg border border-zinc-800/50 bg-zinc-900/20">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <Label className="text-zinc-500 font-mono text-xs uppercase">{t('nat_drawer.src_addr', 'Source Address')}</Label>
                                    <button onClick={() => setActiveNestedDrawer('address')} className="text-emerald-500 hover:text-emerald-400 text-[10px] font-mono flex items-center gap-1"><Plus className="w-3 h-3"/> {t('nat_drawer.create_new', 'New')}</button>
                                </div>
                                <select value={formSrcAddr} onChange={(e) => setFormSrcAddr(e.target.value)} className="w-full h-11 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 font-mono focus:ring-1 focus:ring-emerald-500/50 outline-none">
                                    <option value="">{t('nat_drawer.any_address', 'Any (0.0.0.0/0)')}</option>
                                    {addresses.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <Label className="text-zinc-500 font-mono text-xs uppercase">{t('nat_drawer.dst_addr', 'Destination Address')}</Label>
                                    <button onClick={() => setActiveNestedDrawer('address')} className="text-emerald-500 hover:text-emerald-400 text-[10px] font-mono flex items-center gap-1"><Plus className="w-3 h-3"/> {t('nat_drawer.create_new', 'New')}</button>
                                </div>
                                <select value={formDstAddr} onChange={(e) => setFormDstAddr(e.target.value)} className="w-full h-11 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 font-mono focus:ring-1 focus:ring-emerald-500/50 outline-none">
                                    <option value="">{t('nat_drawer.any_address', 'Any (0.0.0.0/0)')}</option>
                                    {addresses.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 p-4 rounded-lg border border-zinc-800/50 bg-zinc-900/20">
                            <div className="space-y-3">
                                <Label className="text-emerald-500 font-mono text-xs uppercase font-bold">{t('nat_drawer.out_iface', 'Egress Interface')} *</Label>
                                <select value={formOutIface} onChange={(e) => setFormOutIface(e.target.value)} className="w-full h-11 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-emerald-400 font-mono focus:ring-1 focus:ring-emerald-500/50 outline-none">
                                    <option value="" disabled>{t('nat_drawer.select_iface', 'Select Interface...')}</option>
                                    {combinedInterfaces.map(i => <option key={i.name} value={i.name}>{i.label}</option>)}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <Label className="text-zinc-500 font-mono text-xs uppercase">{t('nat_drawer.service', 'Service')}</Label>
                                    <button onClick={() => setActiveNestedDrawer('service')} className="text-emerald-500 hover:text-emerald-400 text-[10px] font-mono flex items-center gap-1"><Plus className="w-3 h-3"/> {t('nat_drawer.create_new', 'New')}</button>
                                </div>
                                <select value={formService} onChange={(e) => setFormService(e.target.value)} className="w-full h-11 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 font-mono focus:ring-1 focus:ring-emerald-500/50 outline-none">
                                    <option value="">{t('nat_drawer.any', 'ANY')}</option>
                                    {services.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="pt-2 space-y-6">
                            <div className="space-y-3">
                                <Label className="text-blue-400 font-mono text-xs uppercase flex items-center justify-between">
                                    {t('nat_drawer.translated_to', 'Translated To')}
                                </Label>
                                <div className="flex gap-4">
                                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${translationMode === 'egress' ? 'border-blue-500 bg-blue-500/10 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'border-zinc-800 bg-zinc-900/30 text-zinc-500 hover:bg-zinc-800'}`}>
                                        <input type="radio" value="egress" checked={translationMode === 'egress'} onChange={() => setTranslationMode('egress')} className="hidden" />
                                        {t('nat_drawer.egress_ip', 'Egress IF IP (Masquerade)')}
                                    </label>
                                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${translationMode === 'specified' ? 'border-blue-500 bg-blue-500/10 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'border-zinc-800 bg-zinc-900/30 text-zinc-500 hover:bg-zinc-800'}`}>
                                        <input type="radio" value="specified" checked={translationMode === 'specified'} onChange={() => setTranslationMode('specified')} className="hidden" />
                                        {t('nat_drawer.specified_ip', 'Specified IP (Static)')}
                                    </label>
                                </div>
                            </div>

                            {translationMode === 'specified' && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 p-4 rounded-lg border border-zinc-800/50 bg-zinc-900/20">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-blue-400 font-mono text-xs uppercase">{t('nat_drawer.translated_ip_obj', 'Translated IP Object')} *</Label>
                                        <button onClick={() => setActiveNestedDrawer('address')} className="text-blue-400 hover:text-blue-300 text-[10px] font-mono flex items-center gap-1"><Plus className="w-3 h-3"/> {t('nat_drawer.create_new', 'New')}</button>
                                    </div>
                                    <select value={formTranslatedIp} onChange={(e) => setFormTranslatedIp(e.target.value)} className="w-full h-11 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-blue-400 font-mono focus:ring-1 focus:ring-blue-500/50 outline-none">
                                        <option value="" disabled>{t('nat_drawer.select_obj', 'Select Object...')}</option>
                                        {addresses.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
                                    </select>
                                </div>
                            )}

                            <div className="space-y-3">
                                <Label className="text-zinc-500 font-mono text-xs uppercase">{t('nat_drawer.description', 'Description')}</Label>
                                <Input value={formDesc} onChange={(e) => setFormDesc(e.target.value)} className="bg-zinc-950 border-zinc-800 text-zinc-300 font-mono h-11 focus-visible:ring-emerald-500/50" placeholder="(0 - 63) chars" />
                            </div>
                        </div>

                    </div>

                    <div className="p-6 border-t border-zinc-800 bg-zinc-950/50 flex justify-end gap-3">
                        <Button variant="outline" onClick={onClose} className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 font-mono uppercase text-xs w-24">
                            {t('nat_drawer.cancel', 'Cancel')}
                        </Button>
                        <Button onClick={handleSave} disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono uppercase text-xs w-36">
                            <Save className="w-4 h-4 mr-2" /> {isLoading ? t('nat_drawer.saving', 'Saving...') : t('nat_drawer.apply', 'Apply')}
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>

            <AlertModal isOpen={localAlert.isOpen} type="error" title={t('nat_drawer.error')} message={localAlert.msg} onCancel={() => setLocalAlert({ isOpen: false, msg: '' })} />

            {activeNestedDrawer === 'zone' && <ZoneEditDrawer isOpen={true} onClose={() => setActiveNestedDrawer(null)} zoneData={null} onSuccess={fetchZones} />}
            {activeNestedDrawer === 'address' && <AddressEditDrawer isOpen={true} onClose={() => setActiveNestedDrawer(null)} addressData={null} onSuccess={fetchAddresses} />}
            {activeNestedDrawer === 'service' && <ServiceEditDrawer isOpen={true} onClose={() => setActiveNestedDrawer(null)} serviceData={null} onSuccess={fetchServices} />}
        </>
    );
}