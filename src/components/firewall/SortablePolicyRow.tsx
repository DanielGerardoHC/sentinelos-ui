import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TableRow, TableCell } from "@/components/ui/table";
import { GripVertical } from "lucide-react";
import { ReactNode } from "react";

interface SortablePolicyRowProps {
    id: number;
    children: ReactNode;
}

export function SortablePolicyRow({ id, children }: SortablePolicyRowProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        position: isDragging ? "relative" as const : "static" as const,
    };

    return (
        <TableRow
            ref={setNodeRef}
            style={style}
            className={`border-b border-zinc-800/50 transition-colors group ${
                isDragging ? "bg-zinc-800/80 shadow-2xl shadow-black ring-1 ring-emerald-500/50" : "hover:bg-zinc-900/50"
            }`}
        >
            <TableCell className="w-[40px] px-2 text-center">
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-zinc-800 text-zinc-600 hover:text-emerald-500 transition-colors inline-flex"
                    title="Drag to reorder"
                >
                    <GripVertical className="w-4 h-4" />
                </div>
            </TableCell>
            {children}
        </TableRow>
    );
}