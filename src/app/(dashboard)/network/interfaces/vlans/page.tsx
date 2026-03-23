'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useVlans, VlanInterface } from '@/hooks/useVlans';
import { useZones } from '@/hooks/useZones';

import { PageHeader } from '@/components/firewall/PageHeader';
import { StatusBadge, ZoneBadge } from '@/components/firewall/FirewallBadges';
import { FirewallTable } from '@/components/firewall/FirewallTable';
import { VlanEditDrawer } from '@/components/firewall/VlanDrawer';
import { AlertModal } from '@/components/firewall/AlertModal';

import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Activity } from "lucide-react";

export default function VlansPage() {
    const { t } = useTranslation();
    const { vlans, fetchVlans, deleteVlan, isLoading: isLoadingVlans, error: fetchError } = useVlans();
    const { zones, fetchZones } = useZones();

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedVlan, setSelectedVlan] = useState<VlanInterface | null>(null);

    const [backendError, setBackendError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, vlanName: string}>({
        isOpen: false, vlanName: ''
    });

    useEffect(() => {
        fetchVlans();
        fetchZones();
    }, [fetchVlans, fetchZones]);

    const handleAddClick = () => {
        setBackendError('');
        setSelectedVlan(null);
        setIsDrawerOpen(true);
    };

    const handleEditClick = (vlan: VlanInterface) => {
        setBackendError('');
        setSelectedVlan(vlan);
        setIsDrawerOpen(true);
    };

    const initiateDelete = (vlanName: string) => {
        setBackendError('');
        setDeleteConfirm({ isOpen: true, vlanName });
    };

    const confirmDelete = async () => {
        const success = await deleteVlan(deleteConfirm.vlanName);
        if (!success) setBackendError(t('vlans.delete_fail'));
        setDeleteConfirm({ isOpen: false, vlanName: '' });
    };

    const getZoneColor = (zoneName?: string) => {
        if (!zoneName) return 'zinc';
        const found = zones.find(z => z.name.toLowerCase() === zoneName.toLowerCase());
        return found?.color || 'zinc';
    };

    const tableColumns = [
        { label: t('vlans.col_interface'), className: "w-[150px]" },
        { label: t('vlans.col_parent'), className: "w-[150px]" },
        { label: t('vlans.col_state'), className: "w-[120px]" },
        { label: t('vlans.col_ip') },
        { label: t('vlans.col_zone') },
        { label: t('vlans.col_mgmt') },
        { label: t('vlans.col_actions'), className: "text-right" }
    ];

    const displayError = backendError || fetchError;

    return (
        <div className="space-y-6 relative overflow-hidden">
            <PageHeader
                title={t('vlans.title')}
                description={t('vlans.desc')}
                isLoading={isLoadingVlans}
                onRefresh={() => {
                    fetchVlans();
                    fetchZones();
                }}
                onAdd={handleAddClick}
                addText={t('vlans.add_btn')}
            />

            <AlertModal
                isOpen={!!displayError}
                type="error"
                title={t('vlans.config_error')}
                message={displayError}
                onCancel={() => setBackendError('')}
            />

            <AlertModal
                isOpen={deleteConfirm.isOpen}
                type="confirm"
                title={t('vlans.delete_title')}
                message={t('vlans.delete_msg', { name: deleteConfirm.vlanName })}
                confirmText={t('vlans.delete_confirm')}
                isLoading={isLoadingVlans}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirm({ isOpen: false, vlanName: '' })}
            />

            <FirewallTable columns={tableColumns} isEmpty={vlans.length === 0} isLoading={isLoadingVlans} emptyMessage={t('vlans.empty_msg')}>
                {vlans.map((vlan) => (
                    <TableRow key={vlan.name} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors group">
                        <TableCell className="font-mono font-medium text-emerald-400">
                            <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-zinc-600 group-hover:text-emerald-500 transition-colors" />
                                {vlan.name}
                            </div>
                        </TableCell>
                        <TableCell className="font-mono text-zinc-400">{vlan.parent}</TableCell>
                        <TableCell><StatusBadge state={vlan.state} /></TableCell>
                        <TableCell className="font-mono text-sm text-zinc-300">
                            {vlan.ip || <span className="text-zinc-600 italic text-xs">{t('vlans.unassigned')}</span>}
                        </TableCell>
                        <TableCell>
                            <ZoneBadge zone={vlan.zone} color={getZoneColor(vlan.zone)} />
                        </TableCell>
                        <TableCell>
                            <div className="flex gap-1">
                                {vlan.management?.map(mgt => (
                                    <span key={mgt} className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono text-[10px] uppercase tracking-wider">{mgt}</span>
                                ))}
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-1 opacity-50 group-hover:opacity-100 transition-all">
                                <Button
                                    variant="outline" size="icon" onClick={() => handleEditClick(vlan)}
                                    className="h-8 w-8 bg-transparent border-transparent text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="outline" size="icon" onClick={() => initiateDelete(vlan.name)}
                                    className="h-8 w-8 bg-transparent border-transparent text-zinc-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </FirewallTable>

            {isDrawerOpen && (
                <VlanEditDrawer
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    vlan={selectedVlan}
                    onSuccess={fetchVlans}
                    onError={(msg) => {
                        setIsDrawerOpen(false);
                        setBackendError(msg);
                    }}
                />
            )}
        </div>
    );
}