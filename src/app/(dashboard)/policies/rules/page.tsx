'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePolicies, PolicyInterface } from '@/hooks/usePolicies';
import { useZones } from '@/hooks/useZones';

import { PageHeader } from '@/components/firewall/PageHeader';
import { FirewallTable } from '@/components/firewall/FirewallTable';
import { ZoneBadge } from '@/components/firewall/FirewallBadges';
import { AlertModal } from '@/components/firewall/AlertModal';
import { PolicyEditDrawer } from '@/components/firewall/PolicyEditDrawer';

import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, CheckCircle2, XCircle, FileText } from "lucide-react";

export default function SecurityPoliciesPage() {
    const { t } = useTranslation();
    const { policies, fetchPolicies, deletePolicy, isLoading: isLoadingPolicies, error: fetchError } = usePolicies();
    const { zones, fetchZones } = useZones();

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState<PolicyInterface | null>(null);

    const [backendError, setBackendError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, id: number}>({ isOpen: false, id: 0 });

    useEffect(() => {
        fetchPolicies();
        fetchZones();
    }, [fetchPolicies, fetchZones]);

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

            <FirewallTable columns={tableColumns} isEmpty={policies.length === 0} isLoading={isLoadingPolicies} emptyMessage={t('policies.empty_msg')}>
                {policies.map((policy) => (
                    <TableRow key={policy.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors group">

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

                        <TableCell className="text-right">
                            <div className="flex justify-end gap-1 opacity-50 group-hover:opacity-100 transition-all">
                                <Button variant="outline" size="icon" onClick={() => handleEditClick(policy)} className="h-8 w-8 bg-transparent border-transparent text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-colors">
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="icon" onClick={() => initiateDelete(policy.id)} className="h-8 w-8 bg-transparent border-transparent text-zinc-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </TableCell>

                    </TableRow>
                ))}
            </FirewallTable>

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