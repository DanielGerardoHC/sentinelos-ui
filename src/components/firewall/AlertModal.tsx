import { ShieldAlert, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export type AlertType = 'success' | 'error' | 'confirm';

interface AlertModalProps {
    isOpen: boolean;
    type: AlertType;
    title: string;
    message: string;
    onConfirm?: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
}

export function AlertModal({
                               isOpen,
                               type,
                               title,
                               message,
                               onConfirm,
                               onCancel,
                               confirmText = "OK",
                               cancelText = "CANCEL",
                               isLoading = false
                           }: AlertModalProps) {

    if (!isOpen) return null;

    // Configuraciones visuales dependiendo del tipo de alerta
    const config = {
        success: {
            icon: <CheckCircle2 className="w-10 h-10 text-emerald-500" />,
            borderColor: "border-emerald-500/50",
            bgIcon: "bg-emerald-500/10",
            confirmBtn: "bg-emerald-600 hover:bg-emerald-500 text-white",
        },
        error: {
            icon: <ShieldAlert className="w-10 h-10 text-red-500" />,
            borderColor: "border-red-500/50",
            bgIcon: "bg-red-500/10",
            confirmBtn: "bg-red-600 hover:bg-red-500 text-white",
        },
        confirm: {
            icon: <AlertTriangle className="w-10 h-10 text-amber-500" />,
            borderColor: "border-amber-500/50",
            bgIcon: "bg-amber-500/10",
            confirmBtn: "bg-emerald-600 hover:bg-emerald-500 text-white", // Confirmar suele ser la acción deseada
        }
    };

    const currentConfig = config[type];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className={`bg-[#09090b] border ${currentConfig.borderColor} rounded-xl w-full max-w-sm shadow-2xl shadow-black overflow-hidden flex flex-col scale-in-95 animate-in duration-200`}>

                <div className="p-6 flex flex-col items-center text-center space-y-4 pt-8">
                    {/* Icono Redondeado */}
                    <div className={`p-4 rounded-full ${currentConfig.bgIcon}`}>
                        {currentConfig.icon}
                    </div>

                    {/* Textos */}
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold font-mono text-zinc-100 tracking-tight">
                            {title}
                        </h3>
                        <p className="text-sm font-mono text-zinc-400 leading-relaxed">
                            {message}
                        </p>
                    </div>
                </div>

                {/* Botones */}
                <div className="p-4 border-t border-zinc-800/50 bg-zinc-950 flex justify-center gap-3">

                    {/* En tipo 'error', el botón de cancelar suele actuar como "Cerrar" y no mostramos confirmar */}
                    {type === 'error' ? (
                        <Button
                            onClick={onCancel}
                            className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-mono uppercase tracking-wider text-xs"
                        >
                            CLOSE
                        </Button>
                    ) : (
                        <>
                            {/* Mostrar botón de Cancelar solo en confirmaciones */}
                            {type === 'confirm' && (
                                <Button
                                    variant="outline"
                                    onClick={onCancel}
                                    disabled={isLoading}
                                    className="flex-1 border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 font-mono uppercase tracking-wider text-xs"
                                >
                                    {cancelText}
                                </Button>
                            )}

                            {/* Botón de Confirmar / OK */}
                            <Button
                                onClick={onConfirm}
                                disabled={isLoading}
                                className={`flex-1 font-mono uppercase tracking-wider text-xs ${currentConfig.confirmBtn}`}
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : confirmText}
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}