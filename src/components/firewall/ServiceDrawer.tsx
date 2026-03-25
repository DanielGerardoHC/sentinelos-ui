import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useServices, ServiceInterface } from '@/hooks/useServices';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Save } from "lucide-react";

import { AlertModal } from './AlertModal';

interface ServiceEditDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    serviceData: ServiceInterface | null;
    onSuccess?: () => void;
    onError?: (msg: string) => void;
}

export function ServiceEditDrawer({ isOpen, onClose, serviceData, onSuccess, onError }: ServiceEditDrawerProps) {
    const { t } = useTranslation();
    const { saveService, isLoading, error } = useServices();

    const isEditMode = !!serviceData;

    const [formName, setFormName] = useState('');
    const [formProtocol, setFormProtocol] = useState<'tcp' | 'udp'>('tcp');
    const [formPortsStr, setFormPortsStr] = useState('');

    const [localAlert, setLocalAlert] = useState({ isOpen: false, msg: '' });

    useEffect(() => {
        if (isOpen) {
            if (serviceData) {
                setFormName(serviceData.name || '');
                setFormProtocol(serviceData.protocol || 'tcp');
                setFormPortsStr(serviceData.ports ? serviceData.ports.join(', ') : '');
            } else {
                setFormName('');
                setFormProtocol('tcp');
                setFormPortsStr('');
            }
        }
    }, [isOpen, serviceData]);

    useEffect(() => {
        if (error && onError) onError(error);
    }, [error, onError]);

    const handleSave = async () => {
        // Limpiamos y convertimos el string a array de enteros
        const portStrings = formPortsStr.split(',').map(s => s.trim()).filter(Boolean);
        const portNumbers = portStrings.map(s => Number(s)).filter(n => !isNaN(n) && n > 0 && n <= 65535);

        if (!formName || portNumbers.length === 0) {
            setLocalAlert({ isOpen: true, msg: t('service_drawer.req_fields') });
            return;
        }

        if (portStrings.length !== portNumbers.length) {
            setLocalAlert({ isOpen: true, msg: t('service_drawer.invalid_ports') });
            return;
        }

        const payload: Partial<ServiceInterface> = {
            name: formName,
            protocol: formProtocol,
            ports: portNumbers
        };

        const success = await saveService(isEditMode ? 'PUT' : 'POST', isEditMode ? serviceData.name : formName, payload);
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
                                <Zap className="w-5 h-5 text-emerald-500" />
                                {isEditMode ? t('service_drawer.edit_title', { name: formName }) : t('service_drawer.create_title')}
                            </SheetTitle>
                            <SheetDescription className="text-zinc-400 font-mono text-xs">
                                {t('service_drawer.drawer_desc')}
                            </SheetDescription>
                        </SheetHeader>
                    </div>

                    <div className="p-6 space-y-8 flex-1 overflow-y-auto">

                        <div className="space-y-3">
                            <Label className="text-zinc-500 font-mono text-xs uppercase">{t('service_drawer.name')}</Label>
                            <Input
                                value={formName}
                                onChange={(e) => setFormName(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
                                disabled={isEditMode}
                                className="bg-zinc-950 border-zinc-800 text-emerald-400 font-mono h-11 uppercase"
                                placeholder="e.g. WEB_TRAFFIC"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-zinc-500 font-mono text-xs uppercase flex items-center justify-between">
                                {t('service_drawer.protocol')}
                            </Label>
                            <div className="flex gap-4">
                                <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${formProtocol === 'tcp' ? 'border-blue-500 bg-blue-500/10 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'border-zinc-800 bg-zinc-900/30 text-zinc-500 hover:bg-zinc-800'}`}>
                                    <input type="radio" value="tcp" checked={formProtocol === 'tcp'} onChange={() => setFormProtocol('tcp')} className="hidden" />
                                    TCP
                                </label>
                                <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${formProtocol === 'udp' ? 'border-amber-500 bg-amber-500/10 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-zinc-800 bg-zinc-900/30 text-zinc-500 hover:bg-zinc-800'}`}>
                                    <input type="radio" value="udp" checked={formProtocol === 'udp'} onChange={() => setFormProtocol('udp')} className="hidden" />
                                    UDP
                                </label>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-zinc-500 font-mono text-xs uppercase flex justify-between">
                                <span>{t('service_drawer.ports')}</span>
                                <span className="text-[10px] text-zinc-600 lowercase">{t('service_drawer.ports_desc')}</span>
                            </Label>
                            <Input
                                value={formPortsStr}
                                onChange={(e) => setFormPortsStr(e.target.value)}
                                className="bg-zinc-950 border-zinc-800 text-emerald-400 font-mono h-11"
                                placeholder="80, 443"
                            />
                        </div>

                    </div>

                    <div className="p-6 border-t border-zinc-800 bg-zinc-950/50 flex justify-end gap-3">
                        <Button variant="outline" onClick={onClose} className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 font-mono uppercase text-xs">
                            {t('service_drawer.cancel')}
                        </Button>
                        <Button onClick={handleSave} disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono uppercase text-xs w-36">
                            <Save className="w-4 h-4 mr-2" /> {isLoading ? t('service_drawer.committing') : t('service_drawer.apply')}
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>

            <AlertModal
                isOpen={localAlert.isOpen}
                type="error"
                title={t('service_drawer.val_error')}
                message={localAlert.msg}
                onCancel={() => setLocalAlert({ isOpen: false, msg: '' })}
            />
        </>
    );
}