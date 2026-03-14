'use client';

import { useState, useEffect } from 'react';
import { useZones, Zone } from '@/hooks/useZones';

import { PageHeader } from '@/components/firewall/PageHeader';
import { FirewallTable } from '@/components/firewall/FirewallTable';
import { ZoneEditDrawer } from '@/components/firewall/ZoneEditDrawer';
import { AlertModal } from '@/components/firewall/AlertModal';

import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Shield, Network } from "lucide-react";

const ColorMap: Record<string, string> = {
    emerald: "border-emerald-500/50 bg-emerald-500/10 text-emerald-400",
    red: "border-red-500/50 bg-red-500/10 text-red-400",
    amber: "border-amber-500/50 bg-amber-500/10 text-amber-400",
    blue: "border-blue-500/50 bg-blue-500/10 text-blue-400",
    purple: "border-purple-500/50 bg-purple-500/10 text-purple-400",
    zinc: "border-zinc-500/50 bg-zinc-500/10 text-zinc-400",
};

export default function ZonesPage() {
    const { zones, fetchZones, deleteZone, isLoading, error: fetchError } = useZones();

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

    const [backendError, setBackendError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, name: string}>({ isOpen: false, name: '' });

    useEffect(() => {
        fetchZones();
    }, [fetchZones]);

    const handleAddClick = () => {
        setBackendError('');
        setSelectedZone(null);
        setIsDrawerOpen(true);
    };

    const handleEditClick = (zone: Zone) => {
        setBackendError('');
        setSelectedZone(zone);
        setIsDrawerOpen(true);
    };

    const initiateDelete = (name: string) => {
        setBackendError('');
        setDeleteConfirm({ isOpen: true, name });
    };

    const confirmDelete = async () => {
        const success = await deleteZone(deleteConfirm.name);
        if (!success) setBackendError("Failed to delete zone from backend.");
        setDeleteConfirm({ isOpen: false, name: '' });
    };

    const tableColumns = [
        { label: "Zone Name", className: "w-[200px]" },
        { label: "Type", className: "w-[120px]" },
        { label: "Interfaces" },
        { label: "Subnets" },
        { label: "Actions", className: "text-right" }
    ];

    const displayError = backendError || fetchError;

    return (
        <div className="space-y-6 relative overflow-hidden">
            <PageHeader
                title="Security Zones"
                description="Logical isolation and grouping of network interfaces."
                isLoading={isLoading}
                onRefresh={fetchZones}
                onAdd={handleAddClick}
                addText="+ Add Zone"
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
                title="Delete Zone?"
                message={`Are you sure you want to delete the zone '${deleteConfirm.name.toUpperCase()}'? This will remove all associated interface bindings.`}
                confirmText="YES, DELETE"
                isLoading={isLoading}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirm({ isOpen: false, name: '' })}
            />

            <FirewallTable columns={tableColumns} isEmpty={zones.length === 0} isLoading={isLoading} emptyMessage="No zones configured.">
                {zones.map((zone) => {
                    const colorClasses = ColorMap[zone.color || 'zinc'];

                    return (
                        <TableRow key={zone.name} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors group">
                            <TableCell className="font-mono font-medium">
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded border ${colorClasses}`}>
                                    <Shield className="w-4 h-4" />
                                    {zone.name.toUpperCase()}
                                </div>
                            </TableCell>

                            <TableCell className="font-mono text-zinc-400 uppercase text-xs">
                                {zone.type === 'l3' ? 'Layer 3' : 'Layer 2'}
                            </TableCell>

                            <TableCell>
                                <div className="flex flex-wrap gap-1">
                                    {zone.interfaces?.length ? zone.interfaces.map(i => (
                                        <span key={i} className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-[10px]">
                                            <Network className="w-3 h-3 inline-block mr-1 opacity-50" /> {i}
                                        </span>
                                    )) : <span className="text-zinc-600 text-xs italic">Empty</span>}
                                </div>
                            </TableCell>

                            <TableCell className="font-mono text-zinc-500 text-xs truncate max-w-[200px]">
                                {zone.networks?.length ? zone.networks.join(', ') : 'Any'}
                            </TableCell>

                            <TableCell className="text-right">
                                <div className="flex justify-end gap-1 opacity-50 group-hover:opacity-100 transition-all">
                                    <Button variant="outline" size="icon" onClick={() => handleEditClick(zone)} className="h-8 w-8 bg-transparent border-transparent text-zinc-400 hover:text-emerald-400">
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" onClick={() => initiateDelete(zone.name)} className="h-8 w-8 bg-transparent border-transparent text-zinc-400 hover:text-red-400">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </FirewallTable>

            {isDrawerOpen && (
                <ZoneEditDrawer
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    zoneData={selectedZone}
                    onSuccess={fetchZones}
                    onError={(msg) => {
                        setIsDrawerOpen(false);
                        setBackendError(msg);
                    }}
                />
            )}
        </div>
    );
}