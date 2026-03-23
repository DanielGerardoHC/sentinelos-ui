'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useInterfaces, NetworkInterface } from '@/hooks/useInterfaces';
import { useZones } from '@/hooks/useZones';

import { PageHeader } from '@/components/firewall/PageHeader';
import { StatusBadge, ZoneBadge } from '@/components/firewall/FirewallBadges';
import { FirewallTable } from '@/components/firewall/FirewallTable';
import { InterfaceEditDrawer } from '@/components/firewall/InterfaceEditDrawer';
import { AlertModal } from '@/components/firewall/AlertModal';

import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Activity } from "lucide-react";

export default function InterfacesPage() {
    const { t } = useTranslation();
    const { interfaces, fetchInterfaces, isLoading: isLoadingIfaces, error: fetchError } = useInterfaces();
    const { zones, fetchZones } = useZones();

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedIface, setSelectedIface] = useState<NetworkInterface | null>(null);
    const [transactionError, setTransactionError] = useState('');

    useEffect(() => {
        fetchInterfaces();
        fetchZones();
    }, [fetchInterfaces, fetchZones]);

    const handleEditClick = (iface: NetworkInterface) => {
        setTransactionError('');
        setSelectedIface(iface);
        setIsDrawerOpen(true);
    };

    const getZoneColor = (zoneName?: string) => {
        if (!zoneName) return 'zinc';
        const found = zones.find(z => z.name.toLowerCase() === zoneName.toLowerCase());
        return found?.color || 'zinc';
    };

    const tableColumns = [
        { label: t('interfaces.col_interface'), className: "w-[150px]" },
        { label: t('interfaces.col_state'), className: "w-[120px]" },
        { label: t('interfaces.col_ip') },
        { label: t('interfaces.col_zone') },
        { label: t('interfaces.col_mgmt') },
        { label: t('interfaces.col_actions'), className: "text-right" }
    ];

    const displayError = transactionError || fetchError;

    return (
        <div className="space-y-6 relative overflow-hidden">
            <PageHeader
                title={t('interfaces.title')}
                description={t('interfaces.desc')}
                isLoading={isLoadingIfaces}
                onRefresh={() => {
                    fetchInterfaces();
                    fetchZones();
                }}
                onAdd={() => {}}
                addText={t('interfaces.add_btn')}
            />

            <AlertModal
                isOpen={!!displayError}
                type="error"
                title={t('interfaces.config_error')}
                message={displayError}
                onCancel={() => setTransactionError('')}
            />

            <FirewallTable
                columns={tableColumns}
                isEmpty={interfaces.length === 0}
                isLoading={isLoadingIfaces}
                emptyMessage={t('interfaces.empty_msg')}
            >
                {interfaces.map((iface) => (
                    <TableRow key={iface.name} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 group">
                        <TableCell className="font-mono font-medium text-emerald-400">
                            <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-zinc-600 group-hover:text-emerald-500" />
                                {iface.name}
                            </div>
                        </TableCell>
                        <TableCell><StatusBadge state={iface.state} /></TableCell>
                        <TableCell className="font-mono text-sm text-zinc-300">
                            {iface.ip || <span className="text-zinc-600 italic text-xs">{t('interfaces.unassigned')}</span>}
                        </TableCell>
                        <TableCell>
                            <ZoneBadge zone={iface.zone} color={getZoneColor(iface.zone)} />
                        </TableCell>
                        <TableCell>
                            <div className="flex gap-1">
                                {iface.management?.map(mgt => (
                                    <span key={mgt} className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono text-[10px] uppercase tracking-wider">
                                        {mgt}
                                    </span>
                                ))}
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-1 opacity-50 group-hover:opacity-100 transition-all">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleEditClick(iface)}
                                    className="h-8 w-8 bg-transparent border-transparent text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-colors">
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </FirewallTable>

            {isDrawerOpen && (
                <InterfaceEditDrawer
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    iface={selectedIface}
                    onSuccess={fetchInterfaces}
                    onError={(msg) => {
                        setIsDrawerOpen(false);
                        setTransactionError(msg);
                    }}
                />
            )}
        </div>
    );
}