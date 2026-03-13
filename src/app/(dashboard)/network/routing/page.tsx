'use client';

import { useState, useEffect } from 'react';
import { useRoutes, RouteInterface } from '@/hooks/useRoutes';

import { PageHeader } from '@/components/firewall/PageHeader';
import { FirewallTable } from '@/components/firewall/FirewallTable';
import { RouteEditDrawer } from '@/components/firewall/RouteEditDrawer';

import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, ShieldAlert, Trash2, Route as RouteIcon, MapPin } from "lucide-react";

export default function RoutesPage() {
    const { routes, fetchRoutes, deleteRoute, isLoading, error } = useRoutes();

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState<RouteInterface | null>(null);

    useEffect(() => {
        fetchRoutes();
    }, [fetchRoutes]);

    const handleAddClick = () => {
        setSelectedRoute(null);
        setIsDrawerOpen(true);
    };

    const handleEditClick = (route: RouteInterface) => {
        setSelectedRoute(route);
        setIsDrawerOpen(true);
    };

    const handleDelete = async (routeId: number, dest: string) => {
        if(confirm(`Are you sure you want to delete route for ${dest}?`)) {
            await deleteRoute(routeId);
        }
    };

    const tableColumns = [
        { label: "Destination", className: "w-[200px]" },
        { label: "Next-Hop / Gateway" },
        { label: "Interface", className: "w-[120px]" },
        { label: "Metric", className: "w-[80px]" },
        { label: "Description" },
        { label: "Actions", className: "text-right" }
    ];

    return (
        <div className="space-y-6 relative overflow-hidden">
            <PageHeader
                title="Static Routing"
                description="Manage global routing table and next-hop metrics."
                isLoading={isLoading}
                onRefresh={fetchRoutes}
                onAdd={handleAddClick}
                addText="+ Add Route"
            />

            {error && (
                <div className="p-4 bg-red-950/50 border border-red-500/50 text-red-400 font-mono flex items-center gap-3 rounded-lg">
                    <ShieldAlert className="w-5 h-5" /> {error}
                </div>
            )}

            <FirewallTable columns={tableColumns} isEmpty={routes.length === 0} isLoading={isLoading} emptyMessage="No static routes configured.">
                {routes.map((route) => (
                    <TableRow key={route.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors group">

                        <TableCell className="font-mono font-medium text-emerald-400">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-zinc-600 group-hover:text-emerald-500 transition-colors" />
                                {route.destination}
                            </div>
                        </TableCell>

                        <TableCell className="font-mono text-zinc-300">
                            {route.gateway || <span className="text-zinc-600 italic">Directly Connected</span>}
                        </TableCell>

                        <TableCell className="font-mono text-zinc-400">
                            {route.interface || 'Any'}
                        </TableCell>

                        <TableCell className="font-mono text-zinc-500">
                            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                                {route.metric}
                            </span>
                        </TableCell>

                        <TableCell className="text-xs text-zinc-500 max-w-[200px] truncate">
                            {route.description || '-'}
                        </TableCell>

                        <TableCell className="text-right">
                            <div className="flex justify-end gap-1 opacity-50 group-hover:opacity-100 transition-all">
                                <Button
                                    variant="outline" size="icon" onClick={() => handleEditClick(route)}
                                    className="h-8 w-8 bg-transparent border-transparent text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="outline" size="icon" onClick={() => handleDelete(route.id, route.destination)}
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
                <RouteEditDrawer
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    routeData={selectedRoute}
                    onSuccess={fetchRoutes}
                />
            )}
        </div>
    );
}