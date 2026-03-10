import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Column {
    label: string;
    className?: string;
}

interface FirewallTableProps {
    columns: Column[];
    isEmpty: boolean;
    isLoading: boolean;
    emptyMessage: string;
    children: React.ReactNode; // inyeccion de tr
}

export function FirewallTable({ columns, isEmpty, isLoading, emptyMessage, children }: FirewallTableProps) {
    return (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 overflow-hidden shadow-xl shadow-black/50">
            <Table>
                <TableHeader className="bg-zinc-900/80 border-b border-zinc-800">
                    <TableRow className="hover:bg-transparent border-none">
                        {columns.map((col, index) => (
                            <TableHead key={index} className={`font-mono text-zinc-500 uppercase text-xs tracking-wider ${col.className || ''}`}>
                                {col.label}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isEmpty && !isLoading && (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="text-center py-8 text-zinc-500 font-mono">
                                {emptyMessage}
                            </TableCell>
                        </TableRow>
                    )}
                    {children}
                </TableBody>
            </Table>
        </div>
    );
}