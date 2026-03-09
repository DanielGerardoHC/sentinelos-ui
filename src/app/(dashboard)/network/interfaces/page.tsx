'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, Eye, Shield, ShieldAlert, Activity, Save, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter
} from "@/components/ui/sheet";

const mockInterfaces = [
    { name: "enp0s8", ip: "10.20.10.1/24", zone: "trust", state: "up", management: ["ping"] },
    { name: "enp0s3", ip: "10.30.35.15/24", zone: "untrust", state: "up", management: ["ping"] },
    { name: "enp0s9", ip: "", zone: "trust", state: "up", management: ["ping"] }
];

type NetworkInterface = typeof mockInterfaces[0];

export default function InterfacesPage() {
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [selectedIface, setSelectedIface] = useState<NetworkInterface | null>(null);

    const handleEditClick = (iface: NetworkInterface) => {
        setSelectedIface(iface);
        setIsSheetOpen(true);
    };

    return (
        <div className="space-y-6 relative">

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-100 font-mono tracking-tight">Network Interfaces</h1>
                    <p className="text-zinc-400 mt-1 text-sm">
                        Manage physical and virtual interfaces, IP assignments, and security zones.
                    </p>
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono uppercase tracking-wider text-xs transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                    + Add Interface
                </Button>
            </div>

            {/* --- DATA TABLE --- */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 overflow-hidden shadow-xl shadow-black/50">
                <Table>
                    <TableHeader className="bg-zinc-900/80 border-b border-zinc-800">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="font-mono text-zinc-500 uppercase text-xs tracking-wider w-[150px]">Interface</TableHead>
                            <TableHead className="font-mono text-zinc-500 uppercase text-xs tracking-wider w-[120px]">State</TableHead>
                            <TableHead className="font-mono text-zinc-500 uppercase text-xs tracking-wider">IP / Netmask</TableHead>
                            <TableHead className="font-mono text-zinc-500 uppercase text-xs tracking-wider">Zone</TableHead>
                            <TableHead className="font-mono text-zinc-500 uppercase text-xs tracking-wider">Management</TableHead>
                            <TableHead className="font-mono text-zinc-500 uppercase text-xs tracking-wider text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockInterfaces.map((iface) => (
                            <TableRow key={iface.name} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors group">

                                <TableCell className="font-mono font-medium text-emerald-400">
                                    <div className="flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-zinc-600 group-hover:text-emerald-500 transition-colors" />
                                        {iface.name}
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${iface.state === 'up' ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`}></span>
                                        <span className="text-zinc-300 font-mono text-xs uppercase tracking-wider">{iface.state}</span>
                                    </div>
                                </TableCell>

                                <TableCell className="font-mono text-sm text-zinc-300">
                                    {iface.ip ? iface.ip : <span className="text-zinc-600 italic text-xs">Unassigned</span>}
                                </TableCell>

                                <TableCell>
                                    <Badge variant="outline" className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 ${iface.zone === 'trust' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-orange-500/30 text-orange-400 bg-orange-500/10'}`}>
                                        {iface.zone === 'trust' ? <Shield className="w-3 h-3 mr-1.5" /> : <ShieldAlert className="w-3 h-3 mr-1.5" />}
                                        {iface.zone}
                                    </Badge>
                                </TableCell>

                                <TableCell>
                                    <div className="flex gap-1">
                                        {iface.management.map(mgt => (
                                            <Badge key={mgt} variant="secondary" className="bg-zinc-800 text-zinc-400 font-mono text-[10px] uppercase tracking-wider">
                                                {mgt}
                                            </Badge>
                                        ))}
                                    </div>
                                </TableCell>

                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800">
                                            <Eye className="w-4 h-4" />
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEditClick(iface)}
                                            className="h-8 w-8 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </TableCell>

                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* --- PANEL LATERAL --- */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="bg-[#09090b] border-l border-zinc-800 text-zinc-100 sm:max-w-md w-full p-0 flex flex-col h-full">

                    <div className="p-6 border-b border-zinc-800 bg-zinc-950/50">
                        <SheetHeader>
                            <SheetTitle className="text-zinc-100 font-mono text-2xl flex items-center gap-3">
                                <Edit2 className="w-5 h-5 text-emerald-500" />
                                Edit {selectedIface?.name}
                            </SheetTitle>
                            <SheetDescription className="text-zinc-400 font-mono text-xs">
                                Modify routing parameters and security zones for this interfaces.
                            </SheetDescription>
                        </SheetHeader>
                    </div>

                    <div className="p-6 space-y-8 flex-1 overflow-y-auto">

                        <div className="space-y-3">
                            <Label className="text-zinc-500 font-mono text-xs uppercase tracking-wider flex items-center justify-between">
                                IPv4 Address / Netmask
                                <span className="text-emerald-500/50 text-[10px]">CIDR Format</span>
                            </Label>
                            <Input
                                defaultValue={selectedIface?.ip}
                                className="bg-zinc-900/50 border-zinc-800 text-emerald-400 font-mono text-sm focus-visible:ring-emerald-500/50 h-11"
                                placeholder="e.g. 192.168.1.1/24"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-zinc-500 font-mono text-xs uppercase tracking-wider">Security Zone</Label>
                            <div className="relative">
                                <select
                                    defaultValue={selectedIface?.zone}
                                    className="w-full h-11 appearance-none rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                >
                                    <option value="trust">Trust (LAN)</option>
                                    <option value="untrust">Untrust (WAN)</option>
                                    <option value="dmz">DMZ (Public Servers)</option>
                                </select>
                                {/* Flecha personalizada para el select */}
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
                                    <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-2">
                            <Label className="text-zinc-500 font-mono text-xs uppercase tracking-wider border-b border-zinc-800 pb-2 flex w-full">
                                Administrative Access
                            </Label>
                            <div className="grid grid-cols-2 gap-4">
                                {['ping', 'ssh', 'https', 'http'].map(svc => (
                                    <label key={svc} className="flex items-center gap-3 p-3 rounded-lg border border-zinc-800 bg-zinc-900/30 cursor-pointer hover:bg-zinc-800/50 transition-colors group">
                                        <input
                                            type="checkbox"
                                            defaultChecked={selectedIface?.management?.includes(svc)}
                                            className="w-4 h-4 accent-emerald-500 rounded bg-zinc-900 border-zinc-700 focus:ring-emerald-500/50"
                                        />
                                        <span className="font-mono text-sm text-zinc-300 uppercase group-hover:text-emerald-400 transition-colors">{svc}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                    </div>

                    <div className="p-6 border-t border-zinc-800 bg-zinc-950/50 flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setIsSheetOpen(false)}
                            className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white font-mono uppercase text-xs tracking-wider"
                        >
                            Cancel
                        </Button>
                        <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono uppercase text-xs tracking-wider gap-2">
                            <Save className="w-4 h-4" />
                            Apply Changes
                        </Button>
                    </div>

                </SheetContent>
            </Sheet>

        </div>
    );
}