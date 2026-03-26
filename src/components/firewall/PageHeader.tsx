import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface PageHeaderProps {
    title: string;
    description: string;
    isLoading?: boolean;
    onRefresh?: () => void;
    onAdd?: () => void;
    addText?: string;
}

export function PageHeader({ title, description, isLoading, onRefresh, onAdd, addText }: PageHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold text-zinc-100 font-mono tracking-tight">{title}</h1>
                <p className="text-zinc-400 mt-1 text-sm">{description}</p>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={onRefresh} disabled={isLoading} className="border-zinc-800 bg-zinc-950 text-zinc-300 hover:text-white hover:bg-zinc-900">
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
                <Button onClick={onAdd} className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono uppercase tracking-wider text-xs shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                    {addText}
                </Button>
            </div>
        </div>
    );
}