import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import dynamic from 'next/dynamic';

import { usePolicies, PolicyInterface } from '@/hooks/usePolicies';
import { useZones } from '@/hooks/useZones';
import { useAddresses } from '@/hooks/useAddresses';
import { useServices } from '@/hooks/useServices';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Save, Plus, ChevronDown, X } from "lucide-react"; // Añadimos ChevronDown y X
import { AlertModal } from './AlertModal';

const ZoneEditDrawer = dynamic(() => import('./ZoneEditDrawer').then(m => m.ZoneEditDrawer), { ssr: false });
const AddressEditDrawer = dynamic(() => import('./AddressDrawer').then(m => m.AddressEditDrawer), { ssr: false });
const ServiceEditDrawer = dynamic(() => import('./ServiceDrawer').then(m => m.ServiceEditDrawer), { ssr: false });

interface PolicyEditDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    policyData: PolicyInterface | null;
    onSuccess?: () => void;
    onError?: (msg: string) => void;
}

export function PolicyEditDrawer({ isOpen, onClose, policyData, onSuccess, onError }: PolicyEditDrawerProps) {
    const { t } = useTranslation();
    const { savePolicy, isLoading, error } = usePolicies();

    const { zones, fetchZones } = useZones();
    const { addresses, fetchAddresses } = useAddresses();
    const { services, fetchServices } = useServices();

    const isEditMode = !!policyData;

    const [formSrcZone, setFormSrcZone] = useState('');
    const [formDstZone, setFormDstZone] = useState('');
    const [formSrcAddr, setFormSrcAddr] = useState('');
    const [formDstAddr, setFormDstAddr] = useState('');
    const [formServices, setFormServices] = useState<string[]>([]);
    const [formAction, setFormAction] = useState<'allow' | 'deny'>('allow');
    const [formLog, setFormLog] = useState(false);

    // Estado para nuestro Dropdown de Servicios
    const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);

    const [localAlert, setLocalAlert] = useState({ isOpen: false, msg: '' });
    const [activeNestedDrawer, setActiveNestedDrawer] = useState<'zone' | 'address' | 'service' | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchZones();
            fetchAddresses();
            fetchServices();

            if (policyData) {
                setFormSrcZone(policyData['src-zone'] || '');
                setFormDstZone(policyData['dst-zone'] || '');
                setFormSrcAddr(policyData['src-addr'] || '');
                setFormDstAddr(policyData['dst-addr'] || '');
                setFormServices(policyData.services || []);
                setFormAction(policyData.action || 'allow');
                setFormLog(policyData.log || false);
            } else {
                setFormSrcZone('');
                setFormDstZone('');
                setFormSrcAddr('');
                setFormDstAddr('');
                setFormServices([]);
                setFormAction('allow');
                setFormLog(true);
            }
        }
    }, [isOpen, policyData, fetchZones, fetchAddresses, fetchServices]);

    useEffect(() => {
        if (error && onError) onError(error);
    }, [error, onError]);

    const handleSave = async () => {
        const payload: Partial<PolicyInterface> = {
            'src-zone': formSrcZone,
            'dst-zone': formDstZone,
            'src-addr': formSrcAddr,
            'dst-addr': formDstAddr,
            services: formServices,
            action: formAction,
            log: formLog
        };

        const success = await savePolicy(isEditMode ? 'PUT' : 'POST', isEditMode ? policyData.id : null, payload);
        if (success) {
            if (onSuccess) onSuccess();
            onClose();
        }
    };

    const toggleService = (svcName: string) => {
        setFormServices(prev =>
            prev.includes(svcName) ? prev.filter(s => s !== svcName) : [...prev, svcName]
        );
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
                                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                {isEditMode ? t('policy_drawer.edit_title', { id: policyData.id }) : t('policy_drawer.create_title')}
                            </SheetTitle>
                            <SheetDescription className="text-zinc-400 font-mono text-xs">
                                {t('policy_drawer.drawer_desc')}
                            </SheetDescription>
                        </SheetHeader>
                    </div>

                    <div className="p-6 space-y-6 flex-1 overflow-y-auto relative">


                        <div className="grid grid-cols-2 gap-6 p-4 rounded-lg border border-zinc-800/50 bg-zinc-900/20">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <Label className="text-zinc-500 font-mono text-xs uppercase">{t('policy_drawer.src_zone')}</Label>
                                    <button onClick={() => setActiveNestedDrawer('zone')} className="text-emerald-500 hover:text-emerald-400 text-[10px] font-mono flex items-center gap-1"><Plus className="w-3 h-3"/> {t('policy_drawer.create_new')}</button>
                                </div>
                                <select value={formSrcZone} onChange={(e) => setFormSrcZone(e.target.value)} className="w-full h-11 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 font-mono focus:ring-1 focus:ring-emerald-500/50 outline-none">
                                    <option value="">{t('policies.any')}</option>
                                    {zones.map(z => <option key={z.name} value={z.name}>{z.name.toUpperCase()}</option>)}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <Label className="text-zinc-500 font-mono text-xs uppercase">{t('policy_drawer.dst_zone')}</Label>
                                    <button onClick={() => setActiveNestedDrawer('zone')} className="text-emerald-500 hover:text-emerald-400 text-[10px] font-mono flex items-center gap-1"><Plus className="w-3 h-3"/> {t('policy_drawer.create_new')}</button>
                                </div>
                                <select value={formDstZone} onChange={(e) => setFormDstZone(e.target.value)} className="w-full h-11 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 font-mono focus:ring-1 focus:ring-emerald-500/50 outline-none">
                                    <option value="">{t('policies.any')}</option>
                                    {zones.map(z => <option key={z.name} value={z.name}>{z.name.toUpperCase()}</option>)}
                                </select>
                            </div>
                        </div>


                        <div className="grid grid-cols-2 gap-6 p-4 rounded-lg border border-zinc-800/50 bg-zinc-900/20">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <Label className="text-zinc-500 font-mono text-xs uppercase">{t('policy_drawer.src_addr')}</Label>
                                    <button onClick={() => setActiveNestedDrawer('address')} className="text-emerald-500 hover:text-emerald-400 text-[10px] font-mono flex items-center gap-1"><Plus className="w-3 h-3"/> {t('policy_drawer.create_new')}</button>
                                </div>
                                <select value={formSrcAddr} onChange={(e) => setFormSrcAddr(e.target.value)} className="w-full h-11 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 font-mono focus:ring-1 focus:ring-emerald-500/50 outline-none">
                                    <option value="">{t('policy_drawer.any_address', 'Any (0.0.0.0/0)')}</option>
                                    {addresses.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <Label className="text-zinc-500 font-mono text-xs uppercase">{t('policy_drawer.dst_addr')}</Label>
                                    <button onClick={() => setActiveNestedDrawer('address')} className="text-emerald-500 hover:text-emerald-400 text-[10px] font-mono flex items-center gap-1"><Plus className="w-3 h-3"/> {t('policy_drawer.create_new')}</button>
                                </div>
                                <select value={formDstAddr} onChange={(e) => setFormDstAddr(e.target.value)} className="w-full h-11 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 font-mono focus:ring-1 focus:ring-emerald-500/50 outline-none">
                                    <option value="">{t('policy_drawer.any_address', 'Any (0.0.0.0/0)')}</option>
                                    {addresses.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
                                </select>
                            </div>
                        </div>


                        <div className="space-y-3 p-4 rounded-lg border border-zinc-800/50 bg-zinc-900/20 relative">
                            <div className="flex justify-between items-center mb-2">
                                <Label className="text-zinc-500 font-mono text-xs uppercase">{t('policy_drawer.services')}</Label>
                                <button onClick={() => setActiveNestedDrawer('service')} className="text-emerald-500 hover:text-emerald-400 text-[10px] font-mono flex items-center gap-1"><Plus className="w-3 h-3"/> {t('policy_drawer.create_new')}</button>
                            </div>

                            <div className="relative">
                                {/* Componente Visual del Select */}
                                <div
                                    className="w-full min-h-[44px] rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 font-mono cursor-pointer flex flex-wrap gap-2 items-center transition-colors hover:border-zinc-700 focus-within:ring-1 focus-within:ring-emerald-500/50"
                                    onClick={() => setIsServiceDropdownOpen(!isServiceDropdownOpen)}
                                >
                                    {formServices.length === 0 ? (
                                        <span className="text-emerald-500 font-bold">{t('policies.any', 'ANY')}</span>
                                    ) : (
                                        formServices.map(svcName => (
                                            <span key={svcName} className="bg-zinc-800 border border-zinc-700 text-emerald-400 px-2 py-1 rounded text-xs flex items-center gap-1">
                                                {svcName}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleService(svcName);
                                                    }}
                                                    className="hover:text-red-400 transition-colors ml-1"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))
                                    )}
                                    <ChevronDown className={`w-4 h-4 text-zinc-500 ml-auto transition-transform ${isServiceDropdownOpen ? 'rotate-180' : ''}`} />
                                </div>


                                {isServiceDropdownOpen && (
                                    <div className="fixed inset-0 z-10" onClick={() => setIsServiceDropdownOpen(false)}></div>
                                )}


                                {isServiceDropdownOpen && (
                                    <div className="absolute z-20 top-full mt-2 w-full bg-[#09090b] border border-zinc-800 rounded-md shadow-2xl max-h-60 overflow-y-auto">
                                        <div className="p-2 flex flex-col gap-1">

                                            {/* Opción ANY */}
                                            <label className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${formServices.length === 0 ? 'bg-emerald-500/10 text-emerald-400' : 'hover:bg-zinc-900 text-zinc-300'}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={formServices.length === 0}
                                                    onChange={() => setFormServices([])}
                                                    className="w-4 h-4 accent-emerald-500 bg-zinc-950 border-zinc-700 rounded"
                                                />
                                                <span className="font-mono text-sm">{t('policies.any', 'ANY')}</span>
                                            </label>


                                            {services.map(svc => {
                                                const isSelected = formServices.includes(svc.name);
                                                return (
                                                    <label key={svc.name} className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${isSelected ? 'bg-zinc-900/50 text-emerald-400' : 'hover:bg-zinc-900 text-zinc-300'}`}>
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => toggleService(svc.name)}
                                                            className="w-4 h-4 accent-emerald-500 bg-zinc-950 border-zinc-700 rounded"
                                                        />
                                                        <span className="font-mono text-sm">{svc.name}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>


                        <div className="pt-2 space-y-6">
                            <div className="space-y-3">
                                <Label className="text-zinc-500 font-mono text-xs uppercase flex items-center justify-between">
                                    {t('policy_drawer.action')}
                                </Label>
                                <div className="flex gap-4">
                                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${formAction === 'allow' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-zinc-800 bg-zinc-900/30 text-zinc-500 hover:bg-zinc-800'}`}>
                                        <input type="radio" value="allow" checked={formAction === 'allow'} onChange={() => setFormAction('allow')} className="hidden" />
                                        {t('policy_drawer.action_allow')}
                                    </label>
                                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${formAction === 'deny' ? 'border-red-500 bg-red-500/10 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-zinc-800 bg-zinc-900/30 text-zinc-500 hover:bg-zinc-800'}`}>
                                        <input type="radio" value="deny" checked={formAction === 'deny'} onChange={() => setFormAction('deny')} className="hidden" />
                                        {t('policy_drawer.action_deny')}
                                    </label>
                                </div>
                            </div>

                            <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${formLog ? 'border-zinc-600 bg-zinc-800/50' : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800'}`}>
                                <input type="checkbox" checked={formLog} onChange={() => setFormLog(!formLog)} className="w-5 h-5 accent-emerald-500 bg-zinc-950 border-zinc-700" />
                                <span className="font-mono text-sm text-zinc-300 uppercase tracking-wider">
                                    {t('policy_drawer.logging')}
                                </span>
                            </label>
                        </div>
                    </div>

                    <div className="p-6 border-t border-zinc-800 bg-zinc-950/50 flex justify-end gap-3">
                        <Button variant="outline" onClick={onClose} className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 font-mono uppercase text-xs">
                            {t('policy_drawer.cancel')}
                        </Button>
                        <Button onClick={handleSave} disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono uppercase text-xs w-36">
                            <Save className="w-4 h-4 mr-2" /> {isLoading ? t('policy_drawer.committing') : t('policy_drawer.apply')}
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>


            <AlertModal
                isOpen={localAlert.isOpen}
                type="error"
                title={t('policy_drawer.val_error')}
                message={localAlert.msg}
                onCancel={() => setLocalAlert({ isOpen: false, msg: '' })}
            />

            {activeNestedDrawer === 'zone' && (
                <ZoneEditDrawer isOpen={true} onClose={() => setActiveNestedDrawer(null)} zoneData={null} onSuccess={fetchZones} />
            )}

            {activeNestedDrawer === 'address' && (
                <AddressEditDrawer isOpen={true} onClose={() => setActiveNestedDrawer(null)} addressData={null} onSuccess={fetchAddresses} />
            )}

            {activeNestedDrawer === 'service' && (
                <ServiceEditDrawer isOpen={true} onClose={() => setActiveNestedDrawer(null)} serviceData={null} onSuccess={fetchServices} />
            )}
        </>
    );
}