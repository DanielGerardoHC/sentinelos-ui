'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useServices, ServiceInterface } from '@/hooks/useServices';

import { PageHeader } from '@/components/firewall/PageHeader';
import { FirewallTable } from '@/components/firewall/FirewallTable';
import { AlertModal } from '@/components/firewall/AlertModal';
import { ServiceEditDrawer } from '@/components/firewall/ServiceDrawer';

import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Zap } from "lucide-react";

export default function ServicesPage() {
    const { t } = useTranslation();
    const { services, fetchServices, deleteService, isLoading, error: fetchError } = useServices();

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<ServiceInterface | null>(null);

    const [backendError, setBackendError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, name: string}>({ isOpen: false, name: '' });

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    const handleAddClick = () => {
        setBackendError('');
        setSelectedService(null);
        setIsDrawerOpen(true);
    };

    const handleEditClick = (service: ServiceInterface) => {
        setBackendError('');
        setSelectedService(service);
        setIsDrawerOpen(true);
    };

    const initiateDelete = (name: string) => {
        setBackendError('');
        setDeleteConfirm({ isOpen: true, name });
    };

    const confirmDelete = async () => {
        const success = await deleteService(deleteConfirm.name);
        if (!success) setBackendError(t('services.delete_fail'));
        setDeleteConfirm({ isOpen: false, name: '' });
    };

    const tableColumns = [
        { label: t('services.col_name'), className: "w-[250px]" },
        { label: t('services.col_protocol'), className: "w-[120px]" },
        { label: t('services.col_ports') },
        { label: t('services.col_actions'), className: "text-right" }
    ];

    const displayError = backendError || fetchError;

    return (
        <div className="space-y-6 relative overflow-hidden">
            <PageHeader
                title={t('services.title')}
                description={t('services.desc')}
                isLoading={isLoading}
                onRefresh={fetchServices}
                onAdd={handleAddClick}
                addText={t('services.add_btn')}
            />

            <AlertModal
                isOpen={!!displayError}
                type="error"
                title={t('services.config_error')}
                message={displayError}
                onCancel={() => setBackendError('')}
            />

            <AlertModal
                isOpen={deleteConfirm.isOpen}
                type="confirm"
                title={t('services.delete_title')}
                message={t('services.delete_msg', { name: deleteConfirm.name })}
                confirmText={t('services.delete_confirm')}
                isLoading={isLoading}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirm({ isOpen: false, name: '' })}
            />

            <FirewallTable columns={tableColumns} isEmpty={services.length === 0} isLoading={isLoading} emptyMessage={t('services.empty_msg')}>
                {services.map((service) => (
                    <TableRow key={service.name} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors group">

                        <TableCell className="font-mono font-medium text-emerald-400">
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-zinc-600 group-hover:text-emerald-500 transition-colors" />
                                {service.name}
                            </div>
                        </TableCell>

                        <TableCell>
                            <span className={`px-2 py-0.5 rounded border font-mono text-[10px] uppercase font-bold tracking-wide ${
                                service.protocol === 'tcp'
                                    ? 'text-blue-400 border-blue-500/30 bg-blue-500/10'
                                    : 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                            }`}>
                                {service.protocol}
                            </span>
                        </TableCell>

                        <TableCell>
                            <div className="flex flex-wrap gap-1">
                                {service.ports?.map(port => (
                                    <span key={port} className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-xs">
                                        {port}
                                    </span>
                                ))}
                            </div>
                        </TableCell>

                        <TableCell className="text-right">
                            <div className="flex justify-end gap-1 opacity-50 group-hover:opacity-100 transition-all">
                                <Button variant="outline" size="icon" onClick={() => handleEditClick(service)} className="h-8 w-8 bg-transparent border-transparent text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-colors">
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="icon" onClick={() => initiateDelete(service.name)} className="h-8 w-8 bg-transparent border-transparent text-zinc-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </TableCell>

                    </TableRow>
                ))}
            </FirewallTable>

            {isDrawerOpen && (
                <ServiceEditDrawer
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    serviceData={selectedService}
                    onSuccess={fetchServices}
                    onError={(msg) => {
                        setIsDrawerOpen(false);
                        setBackendError(msg);
                    }}
                />
            )}
        </div>
    );
}