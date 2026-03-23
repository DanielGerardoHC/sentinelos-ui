import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRoutes, RouteInterface } from '@/hooks/useRoutes';
import { useInterfaces } from '@/hooks/useInterfaces';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Route, Save } from "lucide-react";

import { ResourceSelector } from './ResourceSelector';
import { InterfaceEditDrawer } from './InterfaceEditDrawer';
import { AlertModal } from './AlertModal';

interface RouteEditDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    routeData: RouteInterface | null;
    onSuccess?: () => void;
    onError?: (msg: string) => void;
}

export function RouteEditDrawer({ isOpen, onClose, routeData, onSuccess, onError }: RouteEditDrawerProps) {
    const { t } = useTranslation();
    const { saveRoute, isLoading, error } = useRoutes();
    const { interfaces, fetchInterfaces } = useInterfaces();

    const isEditMode = !!routeData;

    const [formDestination, setFormDestination] = useState('');
    const [formGateway, setFormGateway] = useState('');
    const [formInterface, setFormInterface] = useState('');
    const [formMetric, setFormMetric] = useState<number | ''>(10);
    const [formDescription, setFormDescription] = useState('');

    const [isInterfaceDrawerOpen, setIsInterfaceDrawerOpen] = useState(false);
    const [localAlert, setLocalAlert] = useState<{isOpen: boolean, msg: string}>({isOpen: false, msg: ''});

    useEffect(() => {
        if (isOpen) {
            fetchInterfaces();
            if (routeData) {
                setFormDestination(routeData.destination || '');
                setFormGateway(routeData.gateway || '');
                setFormInterface(routeData.interface || '');
                setFormMetric(routeData.metric || 10);
                setFormDescription(routeData.description || '');
            } else {
                setFormDestination('');
                setFormGateway('');
                setFormInterface('');
                setFormMetric(10);
                setFormDescription('');
            }
        }
    }, [isOpen, routeData, fetchInterfaces]);

    useEffect(() => {
        if (error && onError) {
            onError(error);
        }
    }, [error, onError]);

    const handleSave = async () => {
        if (!formDestination) {
            setLocalAlert({ isOpen: true, msg: t('route_drawer.dest_req') });
            return;
        }

        const payload: Partial<RouteInterface> = {
            destination: formDestination,
            gateway: formGateway,
            interface: formInterface,
            metric: Number(formMetric) || 10,
            description: formDescription
        };

        const success = await saveRoute(isEditMode ? 'PUT' : 'POST', isEditMode ? routeData.id : null, payload);
        if (success) {
            if (onSuccess) onSuccess();
            onClose();
        }
    };

    const interfaceOptions = interfaces.map(iface => ({
        label: `${iface.name} ${iface.ip ? `(${iface.ip})` : ''}`,
        value: iface.name
    }));

    const selectedInterfaceObj = interfaces.find(i => i.name === formInterface) || null;
    const slideOffset = isInterfaceDrawerOpen ? '150px' : '0px';
    const isChildOpen = isInterfaceDrawerOpen || localAlert.isOpen;

    return (
        <>
            <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <SheetContent
                    style={{ right: slideOffset }}
                    className={`bg-[#09090b] border-l border-zinc-800 text-zinc-100 w-full sm:w-[650px] sm:!max-w-[650px] p-0 flex flex-col h-full transition-all duration-300 ease-in-out z-[50] ${isChildOpen ? 'blur-[2px] brightness-50 pointer-events-none' : ''}`}
                >
                    <div className="p-6 border-b border-zinc-800 bg-zinc-950/50">
                        <SheetHeader>
                            <SheetTitle className="text-zinc-100 font-mono text-2xl flex items-center gap-3">
                                <Route className="w-5 h-5 text-emerald-500" />
                                {isEditMode ? t('route_drawer.edit_route') : t('route_drawer.create_route')}
                            </SheetTitle>
                            <SheetDescription className="text-zinc-400 font-mono text-xs">
                                {t('route_drawer.drawer_desc')}
                            </SheetDescription>
                        </SheetHeader>
                    </div>

                    <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                        <div className="space-y-3">
                            <Label className="text-zinc-500 font-mono text-xs uppercase">{t('route_drawer.dest_network')}</Label>
                            <Input value={formDestination} onChange={(e) => setFormDestination(e.target.value)} className="bg-zinc-950 border-zinc-800 text-emerald-400 font-mono h-11 focus-visible:ring-emerald-500/50" placeholder={t('route_drawer.dest_placeholder')} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <Label className="text-zinc-500 font-mono text-xs uppercase">{t('route_drawer.next_hop')}</Label>
                                <Input value={formGateway} onChange={(e) => setFormGateway(e.target.value)} className="bg-zinc-950 border-zinc-800 text-emerald-400 font-mono h-11 focus-visible:ring-emerald-500/50" placeholder="e.g. 192.168.1.1" />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-zinc-500 font-mono text-xs uppercase">{t('route_drawer.admin_dist')}</Label>
                                <Input type="number" value={formMetric} onChange={(e) => setFormMetric(e.target.value ? Number(e.target.value) : '')} className="bg-zinc-950 border-zinc-800 text-emerald-400 font-mono h-11 focus-visible:ring-emerald-500/50" placeholder="10" />
                            </div>
                        </div>

                        <ResourceSelector label={t('route_drawer.egress_iface')} value={formInterface} onChange={setFormInterface} options={interfaceOptions} onEditClick={() => setIsInterfaceDrawerOpen(true)} />

                        <div className="space-y-3">
                            <Label className="text-zinc-500 font-mono text-xs uppercase">{t('route_drawer.desc_optional')}</Label>
                            <Input value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="bg-zinc-950 border-zinc-800 text-zinc-300 font-mono h-11 focus-visible:ring-emerald-500/50" placeholder={t('route_drawer.desc_placeholder')} />
                        </div>
                    </div>

                    <div className="p-6 border-t border-zinc-800 bg-zinc-950/50 flex justify-end gap-3">
                        <Button variant="outline" onClick={onClose} className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 font-mono uppercase text-xs">{t('route_drawer.cancel')}</Button>
                        <Button onClick={handleSave} disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono uppercase text-xs"><Save className="w-4 h-4 mr-2" /> {isLoading ? t('route_drawer.committing') : t('route_drawer.apply')}</Button>
                    </div>
                </SheetContent>
            </Sheet>

            <AlertModal
                isOpen={localAlert.isOpen}
                type="error"
                title={t('route_drawer.val_error')}
                message={localAlert.msg}
                onCancel={() => setLocalAlert({ isOpen: false, msg: '' })}
            />

            {isInterfaceDrawerOpen && (
                <InterfaceEditDrawer isOpen={isInterfaceDrawerOpen} onClose={() => setIsInterfaceDrawerOpen(false)} iface={selectedInterfaceObj} onSuccess={fetchInterfaces} />
            )}
        </>
    );
}