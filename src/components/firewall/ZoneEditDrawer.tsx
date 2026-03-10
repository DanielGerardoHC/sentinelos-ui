// Ruta: src/components/firewall/ZoneEditDrawer.tsx
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

interface ZoneEditDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    zoneName: string;
}

export function ZoneEditDrawer({ isOpen, onClose, zoneName }: ZoneEditDrawerProps) {
    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="bg-zinc-950 border-l border-zinc-800 text-zinc-100 sm:max-w-md w-full p-0 flex flex-col h-full shadow-2xl shadow-black">
                <div className="p-6 border-b border-zinc-800 bg-zinc-900/30">
                    <SheetHeader>
                        <SheetTitle className="text-zinc-100 font-mono text-xl flex items-center gap-3">
                            <Shield className="w-5 h-5 text-emerald-500" />
                            Edit Zone: {zoneName ? zoneName.toUpperCase() : ''}
                        </SheetTitle>
                        <SheetDescription className="text-zinc-400 font-mono text-xs">
                            Configure firewall policies and behavior for this zone.
                        </SheetDescription>
                    </SheetHeader>
                </div>

                <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                    <p className="text-zinc-500 text-sm font-mono">
                        // Aquí cargaremos la interfaz completa para editar la zona (rutas, políticas, etc).
                        <br/><br/>
                        Este componente ahora es 100% reutilizable en todo SentinelOS.
                    </p>
                </div>

                <div className="p-6 border-t border-zinc-800 bg-zinc-900/30 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 font-mono text-xs uppercase">Back</Button>
                    <Button onClick={onClose} className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs uppercase">Save Zone</Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}