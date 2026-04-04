"use client";

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNat, NatRuleInterface } from '@/hooks/useNat';
import { useZones } from '@/hooks/useZones';

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { PageHeader } from '@/components/firewall/PageHeader';
import { AlertModal } from '@/components/firewall/AlertModal';
import { FirewallTable } from '@/components/firewall/FirewallTable';
import { TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2 } from 'lucide-react';

import { SnatEditDrawer } from '@/components/firewall/SnatDrawer';
import { SortableNatRow } from '@/components/firewall/SortableNatRow';
import { ZoneBadge } from '@/components/firewall/FirewallBadges';

export default function SnatPage() {
    const { t } = useTranslation();
    const { natRules, fetchNatRules, deleteNatRule, moveNatRule, isLoading } = useNat();
    const { zones, fetchZones } = useZones(); // Traemos las zonas y su función fetch

    const [localRules, setLocalRules] = useState<NatRuleInterface[]>([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedRule, setSelectedRule] = useState<NatRuleInterface | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: 0 });
    const [backendError, setBackendError] = useState('');

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        fetchNatRules('snat');
        fetchZones();
    }, [fetchNatRules, fetchZones]);

    useEffect(() => {
        setLocalRules(natRules);
    }, [natRules]);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = localRules.findIndex((r) => r.id === active.id);
        const newIndex = localRules.findIndex((r) => r.id === over.id);

        setLocalRules((items) => arrayMove(items, oldIndex, newIndex));

        const position = newIndex > oldIndex ? 'after' : 'before';
        const success = await moveNatRule(active.id as number, position, over.id as number);
        if (!success) {
            setBackendError(t('nat.config_error'));
            fetchNatRules('snat');
        }
    };

    const getZoneColor = (zoneName?: string) => {
        if (!zoneName) return 'zinc';
        const found = zones.find(z => z.name.toLowerCase() === zoneName.toLowerCase());
        return found?.color || 'zinc';
    };

    const tableColumns: { label: string; className?: string }[] = [
        { label: "", className: "w-[40px]" },
        { label: "ID", className: "w-[60px] text-center" },
        { label: t('nat_drawer.src_zone') },
        { label: t('nat_drawer.dst_zone') },
        { label: t('snat.translation_col'), className: "text-emerald-400" },
        { label: t('nat_drawer.description') },
        { label: "", className: "text-right" }
    ];

    return (
        <div className="space-y-6 relative overflow-hidden">
            <PageHeader
                title={t('snat.title')}
                description={t('snat.desc')}
                isLoading={isLoading}
                onRefresh={() => { fetchNatRules('snat'); fetchZones(); }}
                onAdd={() => { setSelectedRule(null); setIsDrawerOpen(true); }}
                addText={t('snat.add_btn')}
            />

            <AlertModal isOpen={!!backendError} type="error" title={t('nat.config_error')} message={backendError} onCancel={() => setBackendError('')} />
            <AlertModal isOpen={deleteConfirm.isOpen} type="confirm" title={t('nat.delete_title')} message={t('nat.delete_msg', { id: deleteConfirm.id })} isLoading={isLoading} onConfirm={async () => { await deleteNatRule(deleteConfirm.id); fetchNatRules('snat'); setDeleteConfirm({ isOpen: false, id: 0 }); }} onCancel={() => setDeleteConfirm({ isOpen: false, id: 0 })} />

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <FirewallTable columns={tableColumns} isEmpty={localRules.length === 0} isLoading={isLoading} emptyMessage={t('nat.empty_msg')}>
                    <SortableContext items={localRules.map(r => r.id)} strategy={verticalListSortingStrategy}>
                        {localRules.map((rule) => (
                            <SortableNatRow key={rule.id} id={rule.id}>

                                <TableCell className="font-mono text-zinc-500 text-center font-bold text-xs">#{rule.id}</TableCell>

                                <TableCell>
                                    <div className="flex flex-col gap-1.5 items-start">
                                        <ZoneBadge zone={rule['src-zone']} color={getZoneColor(rule['src-zone'])} />
                                        <span className="font-mono text-xs text-zinc-400">{rule['src-addr'] || t('snat.any_ip')}</span>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <div className="flex flex-col gap-1.5 items-start">
                                        <ZoneBadge zone={rule['dst-zone']} color={getZoneColor(rule['dst-zone'])} />
                                        <span className="font-mono text-xs text-zinc-400">{rule['dst-addr'] || t('snat.any_ip')}</span>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <div className="flex flex-col gap-1 font-mono text-xs">
                                        {rule['translated-ip'] ? (
                                            <span className="text-emerald-400">{rule['translated-ip']} </span>
                                        ) : (
                                            <span className="text-emerald-400">{t('snat.masq_lbl')} <span className="text-zinc-500 text-[10px]">({rule['out-interface']})</span></span>
                                        )}
                                    </div>
                                </TableCell>

                                <TableCell><span className="font-mono text-xs text-zinc-400">{rule.description || '-'}</span></TableCell>

                                <TableCell className="text-right relative z-20">
                                    <div className="flex justify-end gap-1 opacity-50 group-hover:opacity-100 transition-all">
                                        <Button variant="outline" size="icon" onClick={() => { setSelectedRule(rule); setIsDrawerOpen(true); }} className="h-8 w-8 bg-transparent border-transparent text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"><Edit2 className="w-4 h-4" /></Button>
                                        <Button variant="outline" size="icon" onClick={() => setDeleteConfirm({ isOpen: true, id: rule.id })} className="h-8 w-8 bg-transparent border-transparent text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 className="w-4 h-4" /></Button>
                                    </div>
                                </TableCell>

                            </SortableNatRow>
                        ))}
                    </SortableContext>
                </FirewallTable>
            </DndContext>

            {isDrawerOpen && <SnatEditDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} natData={selectedRule} onSuccess={() => fetchNatRules('snat')} onError={(msg) => { setIsDrawerOpen(false); setBackendError(msg); }} />}
        </div>
    );
}