"use client";
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNat, NatRuleInterface } from '@/hooks/useNat';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { PageHeader } from '@/components/firewall/PageHeader';
import { AlertModal } from '@/components/firewall/AlertModal';
import { FirewallTable } from '@/components/firewall/FirewallTable';
import { TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2 } from 'lucide-react';

import { NatEditDrawer } from './NatDrawer';
import { SortableNatRow } from './SortableNatRow';


import { ZoneBadge } from '@/components/firewall/FirewallBadges';

interface NatBaseViewProps {
    actionType: 'snat' | 'dnat' | 'masquerade';
    titleKey: string;
    descKey: string;
    addBtnKey: string;
}

export function NatBaseView({ actionType, titleKey, descKey, addBtnKey }: NatBaseViewProps) {
    const { t } = useTranslation();
    const { natRules, fetchNatRules, deleteNatRule, moveNatRule, isLoading } = useNat();

    const [localRules, setLocalRules] = useState<NatRuleInterface[]>([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedRule, setSelectedRule] = useState<NatRuleInterface | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: 0 });
    const [backendError, setBackendError] = useState('');

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        fetchNatRules(actionType);
    }, [actionType, fetchNatRules]);

    useEffect(() => {
        setLocalRules(natRules);
    }, [natRules]);

    const handleAddClick = () => {
        setSelectedRule(null);
        setIsDrawerOpen(true);
    };

    const handleEditClick = (rule: NatRuleInterface) => {
        setSelectedRule(rule);
        setIsDrawerOpen(true);
    };

    const initiateDelete = (id: number) => {
        setDeleteConfirm({ isOpen: true, id });
    };

    const confirmDelete = async () => {
        const success = await deleteNatRule(deleteConfirm.id);
        if (success) {
            fetchNatRules(actionType);
        } else {
            setBackendError(t('nat.config_error'));
        }
        setDeleteConfirm({ isOpen: false, id: 0 });
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = localRules.findIndex((r) => r.id === active.id);
        const newIndex = localRules.findIndex((r) => r.id === over.id);


        const newArr = arrayMove(localRules, oldIndex, newIndex);
        setLocalRules(newArr);


        const position = newIndex > oldIndex ? 'after' : 'before';
        const referenceId = over.id as number;

        const success = await moveNatRule(active.id as number, position, referenceId);
        if (!success) {
            setBackendError(t('nat.config_error'));
            fetchNatRules(actionType);
        }
    };

    const tableColumns = [
        { label: "ID", className: "w-[80px] text-center" },
        { label: t('nat_drawer.src_zone') },
        { label: t('nat_drawer.dst_zone') },
        { label: t('nat_drawer.out_iface') },
        { label: t('nat_drawer.description') },
        { label: "", className: "text-right" }
    ];

    return (
        <div className="space-y-6 relative overflow-hidden">
            <PageHeader
                title={t(titleKey)}
                description={t(descKey)}
                isLoading={isLoading}
                onRefresh={() => fetchNatRules(actionType)}
                onAdd={handleAddClick}
                addText={t(addBtnKey)}
            />

            <AlertModal
                isOpen={!!backendError}
                type="error"
                title={t('nat.config_error')}
                message={backendError}
                onCancel={() => setBackendError('')}
            />

            <AlertModal
                isOpen={deleteConfirm.isOpen}
                type="confirm"
                title={t('nat.delete_title')}
                message={t('nat.delete_msg', { id: deleteConfirm.id })}
                confirmText={t('nat.delete_confirm')}
                isLoading={isLoading}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirm({ isOpen: false, id: 0 })}
            />

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <FirewallTable columns={tableColumns} isEmpty={localRules.length === 0} isLoading={isLoading} emptyMessage={t('nat.empty_msg')}>
                    <SortableContext items={localRules.map(r => r.id)} strategy={verticalListSortingStrategy}>
                        {localRules.map((rule) => (
                            <SortableNatRow key={rule.id} id={rule.id}>

                                <TableCell className="font-mono text-zinc-500 text-center text-xs">
                                    #{rule.id}
                                </TableCell>

                                <TableCell>
                                    {rule['src-zone'] ? <ZoneBadge zone={rule['src-zone']} /> : <span className="font-mono text-xs text-zinc-500">{t('nat_drawer.any')}</span>}
                                </TableCell>

                                <TableCell>
                                    {rule['dst-zone'] ? <ZoneBadge zone={rule['dst-zone']} /> : <span className="font-mono text-xs text-zinc-500">{t('nat_drawer.any')}</span>}
                                </TableCell>

                                <TableCell>
                                    <span className="font-mono text-xs text-emerald-400">
                                        {rule['out-interface'] || <span className="text-zinc-500">{t('nat_drawer.any')}</span>}
                                    </span>
                                </TableCell>

                                <TableCell>
                                    <span className="font-mono text-xs text-zinc-400">
                                        {rule.description || '-'}
                                    </span>
                                </TableCell>

                                <TableCell className="text-right relative z-20">
                                    <div className="flex justify-end gap-1 opacity-50 group-hover:opacity-100 transition-all">
                                        <Button variant="outline" size="icon" onClick={() => handleEditClick(rule)} className="h-8 w-8 bg-transparent border-transparent text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors">
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button variant="outline" size="icon" onClick={() => initiateDelete(rule.id)} className="h-8 w-8 bg-transparent border-transparent text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </TableCell>

                            </SortableNatRow>
                        ))}
                    </SortableContext>
                </FirewallTable>
            </DndContext>

            {isDrawerOpen && (
                <NatEditDrawer
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    natData={selectedRule}
                    defaultAction={actionType}
                    onSuccess={() => fetchNatRules(actionType)}
                    onError={(msg) => {
                        setIsDrawerOpen(false);
                        setBackendError(msg);
                    }}
                />
            )}
        </div>
    );
}