'use client';

import { useState, useEffect } from 'react';
import { useInterfaces, NetworkInterface } from '@/hooks/useInterfaces';

import { PageHeader } from '@/components/firewall/PageHeader';
import { StatusBadge, ZoneBadge } from '@/components/firewall/FirewallBadges';
import { FirewallTable } from '@/components/firewall/FirewallTable';
import { InterfaceEditDrawer } from '@/components/firewall/InterfaceEditDrawer';
import { AlertModal } from '@/components/firewall/AlertModal'; // <-- IMPORTAMOS ALERTA

import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Activity } from "lucide-react"; // Quitamos ShieldAlert

export default function InterfacesPage() {
    const { interfaces, fetchInterfaces, isLoading, error: fetchError } = useInterfaces();

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedIface, setSelectedIface] = useState<NetworkInterface | null>(null);

    // Estado para manejar el error que nos escupa el Drawer
    const [transactionError, setTransactionError] = useState('');

    useEffect(() => {
        fetchInterfaces();
    }, [fetchInterfaces]);

    const handleEditClick = (iface: NetworkInterface) => {
        setTransactionError(''); // Limpiar errores anteriores
        setSelectedIface(iface);
        setIsDrawerOpen(true);
    };

    const tableColumns = [
        { label: "Interface", className: "w-[150px]" }, { label: "State", className: "w-[120px]" },
        { label: "IP / Netmask" }, { label: "Zone" }, { label: "Management" }, { label: "Actions", className: "text-right" }
    ];

    const displayError = transactionError || fetchError;

    return (
        <div className="space-y-6 relative overflow-hidden">
            <PageHeader
                title="Network Interfaces"
                description="Manage physical and virtual interfaces, IP assignments, and security zones."
                isLoading={isLoading}
                onRefresh={fetchInterfaces}
                onAdd={() => alert("Función no disponible en API.")}
                addText="+ Add Interface"
            />

            {/* ALERTA VISUAL TIPO MODAL PARA ERRORES DE BACKEND */}
            <AlertModal
                isOpen={!!displayError}
                type="error"
                title="Configuration Error"
                message={displayError}
                onCancel={() => {
                    setTransactionError('');
                    // No podemos limpiar fetchError aquí porque viene del hook,
                    // pero el usuario puede darle "Refresh" a la página.
                }}
            />

            <FirewallTable columns={tableColumns} isEmpty={interfaces.length === 0} isLoading={isLoading} emptyMessage="No interfaces found.">
                {interfaces.map((iface) => (
                    <TableRow key={iface.name} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 group">
                        <TableCell className="font-mono font-medium text-emerald-400"><div className="flex items-center gap-2"><Activity className="w-4 h-4 text-zinc-600 group-hover:text-emerald-500" />{iface.name}</div></TableCell>
                        <TableCell><StatusBadge state={iface.state} /></TableCell>
                        <TableCell className="font-mono text-sm text-zinc-300">{iface.ip || <span className="text-zinc-600 italic text-xs">Unassigned</span>}</TableCell>
                        <TableCell><ZoneBadge zone={iface.zone} /></TableCell>
                        <TableCell><div className="flex gap-1">{iface.management?.map(mgt => (<span key={mgt} className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono text-[10px] uppercase tracking-wider">{mgt}</span>))}</div></TableCell>
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
                        setIsDrawerOpen(false); // Cierra el cajón para mostrar la alerta gigante
                        setTransactionError(msg);
                    }}
                />
            )}
        </div>
    );
}