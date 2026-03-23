import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useZones, Zone } from '@/hooks/useZones';
import { useInterfaces, NetworkInterface } from '@/hooks/useInterfaces';
import { AlertModal } from './AlertModal';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Save, Edit2, X, Plus, Palette } from "lucide-react";
import dynamic from 'next/dynamic';

const InterfaceEditDrawer = dynamic(
    () => import('./InterfaceEditDrawer').then((mod) => mod.InterfaceEditDrawer),
    { ssr: false }
);

interface ZoneEditDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    zoneData: Zone | null;
    onSuccess?: () => void;
    onError?: (msg: string) => void;
}

const COLOR_TOKENS = [
    { value: 'emerald', bg: 'bg-emerald-500' },
    { value: 'red', bg: 'bg-red-500' },
    { value: 'amber', bg: 'bg-amber-500' },
    { value: 'blue', bg: 'bg-blue-500' },
    { value: 'purple', bg: 'bg-purple-500' },
    { value: 'zinc', bg: 'bg-zinc-500' },
];

export function ZoneEditDrawer({ isOpen, onClose, zoneData, onSuccess, onError}: ZoneEditDrawerProps) {
    const { t } = useTranslation();
    const { saveZone, isLoading, error } = useZones();
    const { interfaces: physicalInterfaces, fetchInterfaces } = useInterfaces();

    const isEditMode = !!zoneData;

    const [formName, setFormName] = useState('');
    const [formType, setFormType] = useState('l3');
    const [formColor, setFormColor] = useState('zinc');
    const [formInterfaces, setFormInterfaces] = useState<string[]>([]);
    const [formNetworks, setFormNetworks] = useState('');
    const [selectedToAdd, setSelectedToAdd] = useState('');

    const [isInterfaceDrawerOpen, setIsInterfaceDrawerOpen] = useState(false);
    const [selectedInterfaceObj, setSelectedInterfaceObj] = useState<NetworkInterface | null>(null);

    const [localAlert, setLocalAlert] = useState({ isOpen: false, msg: '' });
    const [typeChangeConfirm, setTypeChangeConfirm] = useState({ isOpen: false, pendingType: '' });

    useEffect(() => {
        if (isOpen) {
            fetchInterfaces();
            if (zoneData) {
                setFormName(zoneData.name || '');
                setFormType(zoneData.type || 'l3');
                setFormColor(zoneData.color || 'zinc');
                setFormInterfaces(zoneData.interfaces || []);
                setFormNetworks(zoneData.networks?.join(', ') || '');
            } else {
                setFormName('');
                setFormType('l3');
                setFormColor('zinc');
                setFormInterfaces([]);
                setFormNetworks('');
            }
        }
    }, [isOpen, zoneData, fetchInterfaces]);

    useEffect(() => {
        if (error && onError) onError(error);
    }, [error, onError]);

    const availableInterfaces = physicalInterfaces.filter(iface => {
        const hasIp = !!iface.ip && iface.ip.trim() !== '';
        const isL3Zone = formType === 'l3';
        const typeMatches = isL3Zone ? hasIp : !hasIp;
        return typeMatches && !formInterfaces.includes(iface.name);
    });

    const handleTypeChange = (newType: string) => {
        if (formInterfaces.length > 0) {
            setTypeChangeConfirm({ isOpen: true, pendingType: newType });
        } else {
            setFormType(newType);
            setSelectedToAdd('');
        }
    };

    const confirmTypeChange = () => {
        setFormType(typeChangeConfirm.pendingType);
        setFormInterfaces([]);
        setSelectedToAdd('');
        setTypeChangeConfirm({ isOpen: false, pendingType: '' });
    };

    const handleSave = async () => {
        if (!formName) {
            setLocalAlert({ isOpen: true, msg: t('zones.name_req') });
            return;
        }

        const payload: Partial<Zone> = {
            name: formName,
            type: formType,
            color: formColor,
            interfaces: formInterfaces,
            networks: formNetworks.split(',').map(s => s.trim()).filter(Boolean)
        };

        const success = await saveZone(isEditMode ? 'PUT' : 'POST', isEditMode ? zoneData.name : formName, payload);
        if (success) {
            if (onSuccess) onSuccess();
            onClose();
        }
    };

    const slideOffset = isInterfaceDrawerOpen ? '150px' : '0px';
    const isChildOpen = isInterfaceDrawerOpen || localAlert.isOpen || typeChangeConfirm.isOpen;

    return (
        <>
            <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <SheetContent
                    style={{ right: slideOffset }}
                    className={`bg-[#09090b] border-l border-zinc-800 text-zinc-100 w-full sm:w-[650px] sm:!max-w-[650px] p-0 flex flex-col h-full shadow-2xl shadow-black transition-all duration-300 ${isChildOpen ? 'blur-[2px] brightness-50 pointer-events-none' : ''}`}
                >
                    <div className="p-6 border-b border-zinc-800 bg-zinc-950/50">
                        <SheetHeader>
                            <SheetTitle className="text-zinc-100 font-mono text-2xl flex items-center gap-3">
                                <Shield className="w-5 h-5 text-emerald-500" />
                                {isEditMode ? `${t('zones.edit_zone')} ${zoneData.name.toUpperCase()}` : t('zones.create_zone')}
                            </SheetTitle>
                            <SheetDescription className="text-zinc-400 font-mono text-xs">
                                {t('zones.drawer_desc')}
                            </SheetDescription>
                        </SheetHeader>
                    </div>

                    <div className="p-6 space-y-8 flex-1 overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <Label className="text-zinc-500 font-mono text-xs uppercase">{t('zones.zone_name')}</Label>
                                <Input
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                                    disabled={isEditMode}
                                    className="bg-zinc-950 border-zinc-800 text-emerald-400 font-mono h-11 uppercase"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-zinc-500 font-mono text-xs uppercase">{t('zones.op_mode')}</Label>
                                <select value={formType} onChange={e => handleTypeChange(e.target.value)} className="w-full h-11 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-emerald-400 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                                    <option value="l3" className="bg-zinc-950 text-zinc-300">{t('zones.l3_routed')}</option>
                                    <option value="l2" className="bg-zinc-950 text-zinc-300">{t('zones.l2_switched')}</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-3 p-4 rounded-lg border border-zinc-800 bg-zinc-900/30">
                            <Label className="text-zinc-500 font-mono text-xs uppercase flex items-center gap-2">
                                <Palette className="w-4 h-4" /> {t('zones.visual_id')}
                            </Label>
                            <div className="flex gap-3 pt-2">
                                {COLOR_TOKENS.map(token => (
                                    <button
                                        key={token.value}
                                        type="button"
                                        onClick={() => setFormColor(token.value)}
                                        className={`w-8 h-8 rounded-full ${token.bg} transition-all duration-200 ${formColor === token.value ? 'ring-4 ring-offset-2 ring-offset-[#09090b] ring-white scale-110' : 'opacity-50 hover:opacity-100 hover:scale-105'}`}
                                        title={token.value}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-zinc-500 font-mono text-xs uppercase flex justify-between">
                                {t('zones.assigned_ifaces')} <span className="text-[10px] text-emerald-500/50">{t('zones.l3_filter')}</span>
                            </Label>
                            <div className="space-y-2">
                                {formInterfaces.length === 0 && (<div className="text-zinc-600 text-xs font-mono p-3 border border-zinc-800 border-dashed rounded bg-zinc-950/50 text-center">{t('zones.no_ifaces')}</div>)}
                                {formInterfaces.map(ifaceName => (
                                    <div key={ifaceName} className="flex justify-between p-2 rounded-md border border-zinc-800 bg-zinc-950">
                                        <span className="font-mono text-sm text-emerald-400 font-bold">{ifaceName}</span>
                                        <div className="flex gap-1">
                                            <Button type="button" variant="outline" size="icon" onClick={() => {
                                                setSelectedInterfaceObj(physicalInterfaces.find(i => i.name === ifaceName) || null);
                                                setIsInterfaceDrawerOpen(true);
                                            }} className="h-7 w-7 bg-transparent border-transparent text-zinc-400 hover:text-emerald-400"><Edit2 className="w-3 h-3" /></Button>
                                            <Button type="button" variant="outline" size="icon" onClick={() => setFormInterfaces(prev => prev.filter(i => i !== ifaceName))} className="h-7 w-7 bg-transparent border-transparent text-zinc-400 hover:text-red-400"><X className="w-3 h-3" /></Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2 pt-2">
                                <select value={selectedToAdd} onChange={(e) => setSelectedToAdd(e.target.value)} className="flex-1 h-11 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 font-mono">
                                    <option value="" disabled>{t('zones.add_iface')}</option>
                                    {availableInterfaces.map(iface => (<option key={iface.name} value={iface.name}>{iface.name}</option>))}
                                </select>
                                <Button type="button" onClick={() => { if (selectedToAdd) { setFormInterfaces([...formInterfaces, selectedToAdd]); setSelectedToAdd(''); } }} disabled={!selectedToAdd} className="h-11 px-4 bg-zinc-800 hover:bg-emerald-600 text-white font-mono"><Plus className="w-4 h-4" /></Button>
                            </div>
                        </div>

                        {formType === 'l3' && (
                            <div className="space-y-3">
                                <Label className="text-zinc-500 font-mono text-xs uppercase">{t('zones.networks_cidr')}</Label>
                                <textarea value={formNetworks} onChange={e => setFormNetworks(e.target.value)} className="w-full h-24 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm text-emerald-400 font-mono resize-none" />
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t border-zinc-800 bg-zinc-950/50 flex justify-end gap-3">
                        <Button variant="outline" onClick={onClose} className="border-zinc-700 bg-transparent text-zinc-300 font-mono text-xs uppercase">{t('zones.cancel')}</Button>
                        <Button onClick={handleSave} disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs uppercase w-32">
                            <Save className="w-4 h-4 mr-2" /> {isLoading ? t('zones.saving') : t('zones.apply')}
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>

            <AlertModal isOpen={localAlert.isOpen} type="error" title={t('zones.val_error')} message={localAlert.msg} onCancel={() => setLocalAlert({ isOpen: false, msg: '' })} />

            <AlertModal
                isOpen={typeChangeConfirm.isOpen}
                type="confirm"
                title={t('zones.type_change_title')}
                message={t('zones.type_warn')}
                confirmText={t('zones.type_change_confirm')}
                onConfirm={confirmTypeChange}
                onCancel={() => setTypeChangeConfirm({ isOpen: false, pendingType: '' })}
            />

            {isInterfaceDrawerOpen && (
                <InterfaceEditDrawer
                    isOpen={isInterfaceDrawerOpen}
                    onClose={() => setIsInterfaceDrawerOpen(false)}
                    iface={selectedInterfaceObj}
                    onSuccess={fetchInterfaces}
                />
            )}
        </>
    );
}