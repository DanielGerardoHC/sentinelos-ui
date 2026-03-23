import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePolicies, PolicyInterface } from '@/hooks/usePolicies';
import { useZones } from '@/hooks/useZones';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Save } from "lucide-react";

import { AlertModal } from './AlertModal';

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

    const isEditMode = !!policyData;

    const [formSrcZone, setFormSrcZone] = useState('');
    const [formDstZone, setFormDstZone] = useState('');
    const [formSrcAddr, setFormSrcAddr] = useState('');
    const [formDstAddr, setFormDstAddr] = useState('');
    const [formServices, setFormServices] = useState('');
    const [formAction, setFormAction] = useState<'allow' | 'deny'>('allow');
    const [formLog, setFormLog] = useState(false);

    const [localAlert, setLocalAlert] = useState({ isOpen: false, msg: '' });

    useEffect(() => {
        if (isOpen) {
            fetchZones();
            if (policyData) {
                setFormSrcZone(policyData['src-zone'] || '');
                setFormDstZone(policyData['dst-zone'] || '');
                setFormSrcAddr(policyData['src-addr'] || '');
                setFormDstAddr(policyData['dst-addr'] || '');
                setFormServices(policyData.services ? policyData.services.join(', ') : '');
                setFormAction(policyData.action || 'allow');
                setFormLog(policyData.log || false);
            } else {
                setFormSrcZone('');
                setFormDstZone('');
                setFormSrcAddr('');
                setFormDstAddr('');
                setFormServices('');
                setFormAction('allow');
                setFormLog(true);
            }
        }
    }, [isOpen, policyData, fetchZones]);

    useEffect(() => {
        if (error && onError) onError(error);
    }, [error, onError]);

    const handleSave = async () => {
        const payload: Partial<PolicyInterface> = {
            'src-zone': formSrcZone,
            'dst-zone': formDstZone,
            'src-addr': formSrcAddr,
            'dst-addr': formDstAddr,
            services: formServices ? formServices.split(',').map(s => s.trim()).filter(Boolean) : [],
            action: formAction,
            log: formLog
        };

        const success = await savePolicy(isEditMode ? 'PUT' : 'POST', isEditMode ? policyData.id : null, payload);
        if (success) {
            if (onSuccess) onSuccess();
            onClose();
        }
    };

    return (
        <>
            <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <SheetContent
                    className="bg-[#09090b] border-l border-zinc-800 text-zinc-100 w-full sm:w-[650px] sm:!max-w-[650px] p-0 flex flex-col h-full shadow-2xl shadow-black transition-all duration-300 z-[50]"
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

                    <div className="p-6 space-y-6 flex-1 overflow-y-auto">

                        {/* ZONAS */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <Label className="text-zinc-500 font-mono text-xs uppercase">{t('policy_drawer.src_zone')}</Label>
                                <select value={formSrcZone} onChange={(e) => setFormSrcZone(e.target.value)} className="w-full h-11 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 font-mono">
                                    <option value="">{t('policies.any')}</option>
                                    {zones.map(z => <option key={z.name} value={z.name}>{z.name.toUpperCase()}</option>)}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-zinc-500 font-mono text-xs uppercase">{t('policy_drawer.dst_zone')}</Label>
                                <select value={formDstZone} onChange={(e) => setFormDstZone(e.target.value)} className="w-full h-11 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 font-mono">
                                    <option value="">{t('policies.any')}</option>
                                    {zones.map(z => <option key={z.name} value={z.name}>{z.name.toUpperCase()}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* DIRECCIONES */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <Label className="text-zinc-500 font-mono text-xs uppercase">{t('policy_drawer.src_addr')}</Label>
                                <Input value={formSrcAddr} onChange={(e) => setFormSrcAddr(e.target.value)} className="bg-zinc-950 border-zinc-800 text-emerald-400 font-mono h-11" placeholder={t('policy_drawer.addr_placeholder')} />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-zinc-500 font-mono text-xs uppercase">{t('policy_drawer.dst_addr')}</Label>
                                <Input value={formDstAddr} onChange={(e) => setFormDstAddr(e.target.value)} className="bg-zinc-950 border-zinc-800 text-emerald-400 font-mono h-11" placeholder={t('policy_drawer.addr_placeholder')} />
                            </div>
                        </div>

                        {/* SERVICIOS */}
                        <div className="space-y-3">
                            <Label className="text-zinc-500 font-mono text-xs uppercase">{t('policy_drawer.services')}</Label>
                            <Input value={formServices} onChange={(e) => setFormServices(e.target.value)} className="bg-zinc-950 border-zinc-800 text-emerald-400 font-mono h-11 uppercase" placeholder={t('policy_drawer.svc_placeholder')} />
                        </div>

                        {/* ACCION Y LOG */}
                        <div className="pt-4 border-t border-zinc-800 space-y-6">
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
                            {isLoading ? t('policy_drawer.committing') : t('policy_drawer.apply')}
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
        </>
    );
}