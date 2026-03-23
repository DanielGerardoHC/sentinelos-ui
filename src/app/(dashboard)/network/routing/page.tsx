'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRoutes, RouteInterface } from '@/hooks/useRoutes';

import { PageHeader } from '@/components/firewall/PageHeader';
import { FirewallTable } from '@/components/firewall/FirewallTable';
import { RouteEditDrawer } from '@/components/firewall/RouteEditDrawer';
import { AlertModal } from '@/components/firewall/AlertModal';

import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, MapPin } from "lucide-react";

export default function RoutesPage() {
    const { t } = useTranslation();
    const { routes, fetchRoutes, deleteRoute, isLoading, error: fetchError } = useRoutes();

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState<RouteInterface | null>(null);

    const [backendError, setBackendError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, routeId: number, dest: string}>({
        isOpen: false, routeId: 0, dest: ''
    });

    useEffect(() => {
        fetchRoutes();
    }, [fetchRoutes]);

    const handleAddClick = () => {
        setBackendError('');
        setSelectedRoute(null);
        setIsDrawerOpen(true);
    };

    const handleEditClick = (route: RouteInterface) => {
        setBackendError('');
        setSelectedRoute(route);
        setIsDrawerOpen(true);
    };

    const initiateDelete = (routeId: number, dest: string) => {
        setBackendError('');
        setDeleteConfirm({ isOpen: true, routeId, dest });
    };

    const confirmDelete = async () => {
        const success = await deleteRoute(deleteConfirm.routeId);
        if (!success) setBackendError(t('routing.delete_fail'));
        setDeleteConfirm({ isOpen: false, routeId: 0, dest: '' });
    };

    const tableColumns = [
        { label: t('routing.col_dest'), className: "w-[200px]" },
        { label: t('routing.col_gw') },
        { label: t('routing.col_interface'), className: "w-[120px]" },
        { label: t('routing.col_metric'), className: "w-[80px]" },
        { label: t('routing.col_desc') },
        { label: t('routing.col_actions'), className: "text-right" }
    ];

    return (
        <div className="space-y-6 relative overflow-hidden">
            <PageHeader
                title={t('routing.title')}
                description={t('routing.desc')}
                isLoading={isLoading}
                onRefresh={fetchRoutes}
                onAdd={handleAddClick}
                addText={t('routing.add_btn')}
            />

            <FirewallTable columns={tableColumns} isEmpty={routes.length === 0} isLoading={isLoading} emptyMessage={t('routing.empty_msg')}>
                {routes.map((route) => (
                    <TableRow key={route.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors group">
                        <TableCell className="font-mono font-medium text-emerald-400">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-zinc-600 group-hover:text-emerald-500 transition-colors" />
                                {route.destination}
                            </div>
                        </TableCell>
                        <TableCell className="font-mono text-zinc-300">
                            {route.gateway || <span className="text-zinc-600 italic">{t('routing.directly_connected')}</span>}
                        </TableCell>
                        <TableCell className="font-mono text-zinc-400">
                            {route.interface || t('routing.any_iface')}
                        </TableCell>
                        <TableCell className="font-mono text-zinc-500">
                            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                                {route.metric}
                            </span>
                        </TableCell>
                        <TableCell className="text-xs text-zinc-500 max-w-[200px] truncate">
                            {route.description || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-1 opacity-50 group-hover:opacity-100 transition-all">
                                <Button
                                    variant="outline" size="icon" onClick={() => handleEditClick(route)}
                                    className="h-8 w-8 bg-transparent border-transparent text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="outline" size="icon" onClick={() => initiateDelete(route.id, route.destination)}
                                    className="h-8 w-8 bg-transparent border-transparent text-zinc-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </FirewallTable>

            <AlertModal
                isOpen={!!backendError || !!fetchError}
                type="error"
                title={t('routing.config_error')}
                message={backendError || fetchError}
                onCancel={() => setBackendError('')}
            />

            <AlertModal
                isOpen={deleteConfirm.isOpen}
                type="confirm"
                title={t('routing.delete_title')}
                message={t('routing.delete_msg', { dest: deleteConfirm.dest })}
                confirmText={t('routing.delete_confirm')}
                isLoading={isLoading}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirm({ isOpen: false, routeId: 0, dest: '' })}
            />

            {isDrawerOpen && (
                <RouteEditDrawer
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    routeData={selectedRoute}
                    onSuccess={fetchRoutes}
                    onError={(msg) => {
                        setIsDrawerOpen(false);
                        setBackendError(msg);
                    }}
                />
            )}
        </div>
    );
}