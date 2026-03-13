'use client';

import { useState, useEffect } from 'react';
import { useVlans, VlanInterface } from '@/hooks/useVlans';

import { PageHeader } from '@/components/firewall/PageHeader';
import { StatusBadge, ZoneBadge } from '@/components/firewall/FirewallBadges';
import { FirewallTable } from '@/components/firewall/FirewallTable';
import { VlanEditDrawer } from '@/components/firewall/VlanDrawer';
import { AlertModal } from '@/components/firewall/AlertModal';

import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Activity } from "lucide-react";

export default function VlansPage() {
    const { vlans, fetchVlans, deleteVlan, isLoading, error: fetchError } = useVlans();

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedVlan, setSelectedVlan] = useState<VlanInterface | null>(null);

    // Estados para alertas
    const [backendError, setBackendError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, vlanName: string}>({
        isOpen: false, vlanName: ''
    });

    useEffect(() => {
        fetchVlans();
    }, [fetchVlans]);

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
        if (!success) setBackendError("Failed to delete VLAN from backend.");
        setDeleteConfirm({ isOpen: false, vlanName: '' });
    };

    const tableColumns = [
        { label: "Interface", className: "w-[150px]" }, { label: "Parent", className: "w-[150px]" },
        { label: "State", className: "w-[120px]" }, { label: "IP / Netmask" },
        { label: "Zone" }, { label: "Management" }, { label: "Actions", className: "text-right" }
    ];

    const displayError = backendError || fetchError;

    return (
        <div className="space-y-6 relative overflow-hidden">
            <PageHeader
                title="Virtual LANs (802.1Q)"
                description="Create and manage VLAN sub-interfaces."
                isLoading={isLoading}
                onRefresh={fetchVlans}
                onAdd={handleAddClick}
                addText="+ Add VLAN"
            />

            <AlertModal
                isOpen={!!displayError}
                type="error"
                title="Configuration Error"
                message={displayError}
                onCancel={() => setBackendError('')}
            />

            <AlertModal
                isOpen={deleteConfirm.isOpen}
                type="confirm"
                title="Delete VLAN?"
                message={`Are you sure you want to delete VLAN ${deleteConfirm.vlanName}? This will instantly remove the interface and drop all active connections.`}
                confirmText="YES, DELETE"
                isLoading={isLoading}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirm({ isOpen: false, vlanName: '' })}
            />

            <FirewallTable columns={tableColumns} isEmpty={vlans.length === 0} isLoading={isLoading} emptyMessage="No VLANs found.">
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
                        <TableCell className="font-mono text-sm text-zinc-300">{vlan.ip || <span className="text-zinc-600 italic text-xs">Unassigned</span>}</TableCell>
                        <TableCell><ZoneBadge zone={vlan.zone} /></TableCell>
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
                        setIsDrawerOpen(false); // Cerramos el cajón para que la alerta gigante se luzca
                        setBackendError(msg);
                    }}
                />
            )}
        </div>
    );
}