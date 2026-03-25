import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAddresses, AddressInterface } from '@/hooks/useAddresses';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, Save } from "lucide-react";

import { AlertModal } from './AlertModal';

interface AddressEditDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    addressData: AddressInterface | null;
    onSuccess?: () => void;
    onError?: (msg: string) => void;
}

export function AddressEditDrawer({ isOpen, onClose, addressData, onSuccess, onError }: AddressEditDrawerProps) {
    const { t } = useTranslation();
    const { saveAddress, isLoading, error } = useAddresses();

    const isEditMode = !!addressData;

    const [formName, setFormName] = useState('');
    const [formIpsStr, setFormIpsStr] = useState('');

    const [localAlert, setLocalAlert] = useState({ isOpen: false, msg: '' });

    useEffect(() => {
        if (isOpen) {
            if (addressData) {
                setFormName(addressData.name || '');
                setFormIpsStr(addressData.ips ? addressData.ips.join(', ') : '');
            } else {
                setFormName('');
                setFormIpsStr('');
            }
        }
    }, [isOpen, addressData]);

    useEffect(() => {
        if (error && onError) onError(error);
    }, [error, onError]);

    const handleSave = async () => {
        // Limpiamos y convertimos el string a array
        const ipArray = formIpsStr.split(',').map(s => s.trim()).filter(Boolean);

        if (!formName || ipArray.length === 0) {
            setLocalAlert({ isOpen: true, msg: t('address_drawer.req_fields') });
            return;
        }

        const payload: Partial<AddressInterface> = {
            name: formName,
            ips: ipArray
        };

        const success = await saveAddress(isEditMode ? 'PUT' : 'POST', isEditMode ? addressData.name : formName, payload);
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
                                <Globe className="w-5 h-5 text-emerald-500" />
                                {isEditMode ? t('address_drawer.edit_title', { name: formName }) : t('address_drawer.create_title')}
                            </SheetTitle>
                            <SheetDescription className="text-zinc-400 font-mono text-xs">
                                {t('address_drawer.drawer_desc')}
                            </SheetDescription>
                        </SheetHeader>
                    </div>

                    <div className="p-6 space-y-8 flex-1 overflow-y-auto">

                        <div className="space-y-3">
                            <Label className="text-zinc-500 font-mono text-xs uppercase">{t('address_drawer.name')}</Label>
                            <Input
                                value={formName}
                                onChange={(e) => setFormName(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
                                disabled={isEditMode}
                                className="bg-zinc-950 border-zinc-800 text-emerald-400 font-mono h-11 uppercase"
                                placeholder="e.g. LAN_ADMINS"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-zinc-500 font-mono text-xs uppercase flex justify-between">
                                <span>{t('address_drawer.ips')}</span>
                                <span className="text-[10px] text-zinc-600 lowercase">{t('address_drawer.ips_desc')}</span>
                            </Label>
                            <textarea
                                value={formIpsStr}
                                onChange={(e) => setFormIpsStr(e.target.value)}
                                className="w-full h-32 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm text-emerald-400 font-mono resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500/50"
                                placeholder="192.168.1.0/24, 10.0.0.5/32"
                            />
                        </div>

                    </div>

                    <div className="p-6 border-t border-zinc-800 bg-zinc-950/50 flex justify-end gap-3">
                        <Button variant="outline" onClick={onClose} className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 font-mono uppercase text-xs">
                            {t('address_drawer.cancel')}
                        </Button>
                        <Button onClick={handleSave} disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono uppercase text-xs w-36">
                            <Save className="w-4 h-4 mr-2" /> {isLoading ? t('address_drawer.committing') : t('address_drawer.apply')}
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>

            <AlertModal
                isOpen={localAlert.isOpen}
                type="error"
                title={t('address_drawer.val_error')}
                message={localAlert.msg}
                onCancel={() => setLocalAlert({ isOpen: false, msg: '' })}
            />
        </>
    );
}