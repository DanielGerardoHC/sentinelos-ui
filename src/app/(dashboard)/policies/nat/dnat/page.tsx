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
import { Edit2, Trash2, ArrowRight } from 'lucide-react';

import { DnatEditDrawer } from '@/components/firewall/DnatDrawer';
import { SortableNatRow } from '@/components/firewall/SortableNatRow';

export default function DnatPage() {
    const { t } = useTranslation();
    const { natRules, fetchNatRules, deleteNatRule, moveNatRule, isLoading } = useNat();

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
        fetchNatRules('dnat');
    }, [fetchNatRules]);

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
            fetchNatRules('dnat');
        }
    };

    const tableColumns = [
        { label: "", className: "w-[40px]" },
        { label: "ID", className: "w-[60px] text-center" },
        { label: t('dnat.type_col') },
        { label: t('dnat.public_addr_col') },
        { label: t('dnat.internal_svr_col'), className: "text-blue-400" },
        { label: t('dnat.port_svc_col') },
        { label: t('nat_drawer.description') },
        { label: "", className: "text-right" }
    ];

    return (
        <div className="space-y-6 relative overflow-hidden">
            <PageHeader
                title={t('dnat.title')}
                description={t('dnat.desc')}
                isLoading={isLoading}
                onRefresh={() => fetchNatRules('dnat')}
                onAdd={() => { setSelectedRule(null); setIsDrawerOpen(true); }}
                addText={t('dnat.add_btn')}
            />

            <AlertModal isOpen={!!backendError} type="error" title={t('nat.config_error')} message={backendError} onCancel={() => setBackendError('')} />
            <AlertModal isOpen={deleteConfirm.isOpen} type="confirm" title={t('nat.delete_title')} message={t('nat.delete_msg', { id: deleteConfirm.id })} isLoading={isLoading} onConfirm={async () => { await deleteNatRule(deleteConfirm.id); fetchNatRules('dnat'); setDeleteConfirm({ isOpen: false, id: 0 }); }} onCancel={() => setDeleteConfirm({ isOpen: false, id: 0 })} />

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <FirewallTable columns={tableColumns} isEmpty={localRules.length === 0} isLoading={isLoading} emptyMessage={t('nat.empty_msg')}>
                    <SortableContext items={localRules.map(r => r.id)} strategy={verticalListSortingStrategy}>
                        {localRules.map((rule) => (
                            <SortableNatRow key={rule.id} id={rule.id}>

                                <TableCell className="font-mono text-zinc-500 text-center font-bold text-xs">#{rule.id}</TableCell>

                                {/* Tipo */}
                                <TableCell>
                                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase tracking-wider ${rule.type === 'dnat-port' ? 'bg-purple-500/10 border border-purple-500/30 text-purple-400' : 'bg-blue-500/10 border border-blue-500/30 text-blue-400'}`}>
                                        {rule.type === 'dnat-port' ? t('dnat.port_mapping') : t('dnat.ip_mapping')}
                                    </span>
                                </TableCell>

                                {/* IP Pública Original */}
                                <TableCell>
                                    <span className="font-mono text-xs text-zinc-300">{rule['dst-addr']}</span>
                                </TableCell>

                                {/* IP Interna Mapeada */}
                                <TableCell>
                                    <div className="flex items-center gap-2 font-mono text-xs text-blue-400">
                                        <ArrowRight className="w-3 h-3 text-zinc-600" />
                                        {rule['translated-ip']}
                                    </div>
                                </TableCell>

                                {/* Puertos / Servicios */}
                                <TableCell>
                                    {rule.type === 'dnat-port' ? (
                                        <div className="font-mono text-xs">
                                            <span className="text-zinc-400">{rule.service || 'Any'}</span>
                                            <ArrowRight className="w-3 h-3 mx-1 inline text-zinc-600" />
                                            <span className="text-purple-400">{rule['translated-port'] || rule.service || 'Any'}</span>
                                        </div>
                                    ) : (
                                        <span className="font-mono text-[10px] text-zinc-600">{t('dnat.all_traffic')}</span>
                                    )}
                                </TableCell>

                                <TableCell><span className="font-mono text-xs text-zinc-400">{rule.description || '-'}</span></TableCell>

                                <TableCell className="text-right relative z-20">
                                    <div className="flex justify-end gap-1 opacity-50 group-hover:opacity-100 transition-all">
                                        <Button variant="outline" size="icon" onClick={() => { setSelectedRule(rule); setIsDrawerOpen(true); }} className="h-8 w-8 bg-transparent border-transparent text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"><Edit2 className="w-4 h-4" /></Button>
                                        <Button variant="outline" size="icon" onClick={() => setDeleteConfirm({ isOpen: true, id: rule.id })} className="h-8 w-8 bg-transparent border-transparent text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 className="w-4 h-4" /></Button>
                                    </div>
                                </TableCell>

                            </SortableNatRow>
                        ))}
                    </SortableContext>
                </FirewallTable>
            </DndContext>

            {isDrawerOpen && <DnatEditDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} natData={selectedRule} onSuccess={() => fetchNatRules('dnat')} onError={(msg) => { setIsDrawerOpen(false); setBackendError(msg); }} />}
        </div>
    );
}