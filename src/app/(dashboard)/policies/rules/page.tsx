'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePolicies, PolicyInterface } from '@/hooks/usePolicies';
import { useZones } from '@/hooks/useZones';

// DND Kit Imports
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { PageHeader } from '@/components/firewall/PageHeader';
import { FirewallTable } from '@/components/firewall/FirewallTable';
import { ZoneBadge } from '@/components/firewall/FirewallBadges';
import { AlertModal } from '@/components/firewall/AlertModal';
import { PolicyEditDrawer } from '@/components/firewall/PolicyEditDrawer';
import { SortablePolicyRow } from '@/components/firewall/SortablePolicyRow';

import { TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, CheckCircle2, XCircle, FileText } from "lucide-react";

export default function SecurityPoliciesPage() {
    const { t } = useTranslation();
    const { policies, fetchPolicies, deletePolicy, movePolicy, isLoading: isLoadingPolicies, error: fetchError } = usePolicies();
    const { zones, fetchZones } = useZones();


    const [localPolicies, setLocalPolicies] = useState<PolicyInterface[]>([]);

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState<PolicyInterface | null>(null);

    const [backendError, setBackendError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, id: number}>({ isOpen: false, id: 0 });

    // Configuración de los sensores de DND (Mouse/Touch + Teclado)
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // Evita clics accidentales
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        fetchPolicies();
        fetchZones();
    }, [fetchPolicies, fetchZones]);


    useEffect(() => {
        setLocalPolicies(policies);
    }, [policies]);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id && over) {
            const oldIndex = localPolicies.findIndex((p) => p.id === active.id);
            const newIndex = localPolicies.findIndex((p) => p.id === over.id);


            setLocalPolicies((items) => arrayMove(items, oldIndex, newIndex));


            const position = oldIndex > newIndex ? 'before' : 'after';
            const targetId = over.id as number;
            const draggedId = active.id as number;


            const success = await movePolicy(draggedId, position, targetId);
            if (!success) {
                setBackendError("Failed to reorder policies on the firewall.");
                fetchPolicies();
            }
        }
    };

    const handleAddClick = () => {
        setBackendError('');
        setSelectedPolicy(null);
        setIsDrawerOpen(true);
    };

    const handleEditClick = (policy: PolicyInterface) => {
        setBackendError('');
        setSelectedPolicy(policy);
        setIsDrawerOpen(true);
    };

    const initiateDelete = (id: number) => {
        setBackendError('');
        setDeleteConfirm({ isOpen: true, id });
    };

    const confirmDelete = async () => {
        const success = await deletePolicy(deleteConfirm.id);
        if (!success) setBackendError(t('policies.delete_fail'));
        setDeleteConfirm({ isOpen: false, id: 0 });
    };

    const getZoneColor = (zoneName?: string) => {
        if (!zoneName) return 'zinc';
        const found = zones.find(z => z.name.toLowerCase() === zoneName.toLowerCase());
        return found?.color || 'zinc';
    };

    const tableColumns = [
        { label: "", className: "w-[40px]" },
        { label: t('policies.col_id'), className: "w-[60px] text-center" },
        { label: t('policies.col_src') },
        { label: t('policies.col_dst') },
        { label: t('policies.col_services') },
        { label: t('policies.col_action'), className: "w-[120px]" },
        { label: t('policies.col_log'), className: "w-[80px] text-center" },
        { label: t('policies.col_actions'), className: "text-right" }
    ];

    const displayError = backendError || fetchError;

    return (
        <div className="space-y-6 relative overflow-hidden">
            <PageHeader
                title={t('policies.title')}
                description={t('policies.desc')}
                isLoading={isLoadingPolicies}
                onRefresh={() => { fetchPolicies(); fetchZones(); }}
                onAdd={handleAddClick}
                addText={t('policies.add_btn')}
            />

            <AlertModal
                isOpen={!!displayError}
                type="error"
                title={t('policies.config_error')}
                message={displayError}
                onCancel={() => setBackendError('')}
            />

            <AlertModal
                isOpen={deleteConfirm.isOpen}
                type="confirm"
                title={t('policies.delete_title')}
                message={t('policies.delete_msg', { id: deleteConfirm.id })}
                confirmText={t('policies.delete_confirm')}
                isLoading={isLoadingPolicies}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirm({ isOpen: false, id: 0 })}
            />

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <FirewallTable columns={tableColumns} isEmpty={localPolicies.length === 0} isLoading={isLoadingPolicies} emptyMessage={t('policies.empty_msg')}>
                    <SortableContext items={localPolicies.map(p => p.id)} strategy={verticalListSortingStrategy}>
                        {localPolicies.map((policy) => (
                            <SortablePolicyRow key={policy.id} id={policy.id}>

                                <TableCell className="font-mono text-zinc-500 text-center text-xs">
                                    #{policy.id}
                                </TableCell>

                                <TableCell>
                                    <div className="flex flex-col gap-1.5 items-start">
                                        <ZoneBadge zone={policy['src-zone']} color={getZoneColor(policy['src-zone'])} />
                                        <span className="font-mono text-xs text-zinc-400">
                                            {policy['src-addr'] || t('policies.any')}
                                        </span>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <div className="flex flex-col gap-1.5 items-start">
                                        <ZoneBadge zone={policy['dst-zone']} color={getZoneColor(policy['dst-zone'])} />
                                        <span className="font-mono text-xs text-zinc-400">
                                            {policy['dst-addr'] || t('policies.any')}
                                        </span>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {policy.services && policy.services.length > 0 ? (
                                            policy.services.map(svc => (
                                                <span key={svc} className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-emerald-400 font-mono text-[10px] uppercase tracking-wider">
                                                    {svc}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-zinc-500 font-mono text-xs">{t('policies.any')}</span>
                                        )}
                                    </div>
                                </TableCell>

                                <TableCell>
                                    {policy.action === 'allow' ? (
                                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] uppercase tracking-wider font-bold">
                                            <CheckCircle2 className="w-3 h-3" /> {t('policies.allow')}
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-[10px] uppercase tracking-wider font-bold">
                                            <XCircle className="w-3 h-3" /> {t('policies.deny')}
                                        </div>
                                    )}
                                </TableCell>

                                <TableCell className="text-center">
                                    {policy.log ? (
                                        <FileText className="w-4 h-4 text-emerald-500 inline-block" />
                                    ) : (
                                        <span className="text-zinc-600 font-mono text-xs">-</span>
                                    )}
                                </TableCell>

                                <TableCell className="text-right relative z-20">
                                    <div className="flex justify-end gap-1 opacity-50 group-hover:opacity-100 transition-all">
                                        <Button variant="outline" size="icon" onClick={() => handleEditClick(policy)} className="h-8 w-8 bg-transparent border-transparent text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-colors">
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button variant="outline" size="icon" onClick={() => initiateDelete(policy.id)} className="h-8 w-8 bg-transparent border-transparent text-zinc-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </TableCell>

                            </SortablePolicyRow>
                        ))}
                    </SortableContext>
                </FirewallTable>
            </DndContext>

            {isDrawerOpen && (
                <PolicyEditDrawer
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    policyData={selectedPolicy}
                    onSuccess={fetchPolicies}
                    onError={(msg) => {
                        setIsDrawerOpen(false);
                        setBackendError(msg);
                    }}
                />
            )}
        </div>
    );
}