'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAddresses, AddressInterface } from '@/hooks/useAddresses';

import { PageHeader } from '@/components/firewall/PageHeader';
import { FirewallTable } from '@/components/firewall/FirewallTable';
import { AlertModal } from '@/components/firewall/AlertModal';
import { AddressEditDrawer } from '@/components/firewall/AddressDrawer';

import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Globe } from "lucide-react";

export default function AddressesPage() {
    const { t } = useTranslation();
    const { addresses, fetchAddresses, deleteAddress, isLoading, error: fetchError } = useAddresses();

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<AddressInterface | null>(null);

    const [backendError, setBackendError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, name: string}>({ isOpen: false, name: '' });

    useEffect(() => {
        fetchAddresses();
    }, [fetchAddresses]);

    const handleAddClick = () => {
        setBackendError('');
        setSelectedAddress(null);
        setIsDrawerOpen(true);
    };

    const handleEditClick = (address: AddressInterface) => {
        setBackendError('');
        setSelectedAddress(address);
        setIsDrawerOpen(true);
    };

    const initiateDelete = (name: string) => {
        setBackendError('');
        setDeleteConfirm({ isOpen: true, name });
    };

    const confirmDelete = async () => {
        const success = await deleteAddress(deleteConfirm.name);
        if (!success) setBackendError(t('addresses.delete_fail'));
        setDeleteConfirm({ isOpen: false, name: '' });
    };

    const tableColumns = [
        { label: t('addresses.col_name'), className: "w-[250px]" },
        { label: t('addresses.col_ips') },
        { label: t('addresses.col_actions'), className: "text-right" }
    ];

    const displayError = backendError || fetchError;

    return (
        <div className="space-y-6 relative overflow-hidden">
            <PageHeader
                title={t('addresses.title')}
                description={t('addresses.desc')}
                isLoading={isLoading}
                onRefresh={fetchAddresses}
                onAdd={handleAddClick}
                addText={t('addresses.add_btn')}
            />

            <AlertModal
                isOpen={!!displayError}
                type="error"
                title={t('addresses.config_error')}
                message={displayError}
                onCancel={() => setBackendError('')}
            />

            <AlertModal
                isOpen={deleteConfirm.isOpen}
                type="confirm"
                title={t('addresses.delete_title')}
                message={t('addresses.delete_msg', { name: deleteConfirm.name })}
                confirmText={t('addresses.delete_confirm')}
                isLoading={isLoading}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirm({ isOpen: false, name: '' })}
            />

            <FirewallTable columns={tableColumns} isEmpty={addresses.length === 0} isLoading={isLoading} emptyMessage={t('addresses.empty_msg')}>
                {addresses.map((address) => (
                    <TableRow key={address.name} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors group">

                        <TableCell className="font-mono font-medium text-emerald-400">
                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-zinc-600 group-hover:text-emerald-500 transition-colors" />
                                {address.name}
                            </div>
                        </TableCell>

                        <TableCell>
                            <div className="flex flex-wrap gap-1">
                                {address.ips?.map(ip => (
                                    <span key={ip} className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-xs">
                                        {ip}
                                    </span>
                                ))}
                            </div>
                        </TableCell>

                        <TableCell className="text-right">
                            <div className="flex justify-end gap-1 opacity-50 group-hover:opacity-100 transition-all">
                                <Button variant="outline" size="icon" onClick={() => handleEditClick(address)} className="h-8 w-8 bg-transparent border-transparent text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-colors">
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="icon" onClick={() => initiateDelete(address.name)} className="h-8 w-8 bg-transparent border-transparent text-zinc-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </TableCell>

                    </TableRow>
                ))}
            </FirewallTable>

            {isDrawerOpen && (
                <AddressEditDrawer
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    addressData={selectedAddress}
                    onSuccess={fetchAddresses}
                    onError={(msg) => {
                        setIsDrawerOpen(false);
                        setBackendError(msg);
                    }}
                />
            )}
        </div>
    );
}