import { ShieldAlert, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

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
    const { t } = useTranslation();

    if (!isOpen) return null;

    // --- INTERCEPTOR DE ERRORES DEL BACKEND ---
    let finalMessage = message;
    let finalDetails = "";

    try {
        // Limpiamos los prefijos que nuestros Hooks a veces agregan
        const cleanMessage = message.replace(/^Validation Error:\s*/, '').trim();

        // Intentamos parsear el JSON que envía Go
        const parsed = JSON.parse(cleanMessage);

        if (parsed && parsed.code) {
            // Buscamos el código en nuestro i18n. Si no existe, usamos el mensaje en inglés que mandó Go.
            finalMessage = t(`errors.${parsed.code}`, { defaultValue: parsed.message });
            finalDetails = parsed.details || "";
        }
    } catch (e) {
        // Si no es un JSON válido (ej. un error de red o de sistema genérico), lo dejamos como string crudo
        finalMessage = message;
    }

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
            confirmBtn: "bg-emerald-600 hover:bg-emerald-500 text-white",
        }
    };

    const currentConfig = config[type];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className={`bg-[#09090b] border ${currentConfig.borderColor} rounded-xl w-full max-w-sm shadow-2xl shadow-black overflow-hidden flex flex-col scale-in-95 animate-in duration-200`}>

                <div className="p-6 flex flex-col items-center text-center space-y-4 pt-8">

                    <div className={`p-4 rounded-full ${currentConfig.bgIcon}`}>
                        {currentConfig.icon}
                    </div>

                    <div className="space-y-3 w-full">
                        <h3 className="text-xl font-bold font-mono text-zinc-100 tracking-tight">
                            {title}
                        </h3>
                        <p className="text-sm font-mono text-zinc-400 leading-relaxed">
                            {finalMessage}
                        </p>

                        {/* Cajita extra para los Detalles técnicos (si Go los envía) */}
                        {finalDetails && (
                            <div className="mt-3 p-2 bg-zinc-950/80 border border-zinc-800/50 rounded text-xs font-mono text-zinc-500 break-all text-left">
                                <span className="text-zinc-400 uppercase tracking-wider block mb-1">Details:</span>
                                {finalDetails}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-zinc-800/50 bg-zinc-950 flex justify-center gap-3">

                    {type === 'error' ? (
                        <Button
                            onClick={onCancel}
                            className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-mono uppercase tracking-wider text-xs"
                        >
                            {/* Podemos traducir el botón CLOSE si tienes un namespace 'common', por ahora lo dejamos estático o usamos t('common.close', 'CLOSE') */}
                            {t('common.close', 'CLOSE')}
                        </Button>
                    ) : (
                        <>
                            {type === 'confirm' && (
                                <Button
                                    variant="outline"
                                    onClick={onCancel}
                                    disabled={isLoading}
                                    className="flex-1 border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 font-mono uppercase tracking-wider text-xs"
                                >
                                    {t('common.cancel', cancelText)}
                                </Button>
                            )}

                            <Button
                                onClick={onConfirm}
                                disabled={isLoading}
                                className={`flex-1 font-mono uppercase tracking-wider text-xs ${currentConfig.confirmBtn}`}
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : t('common.confirm', confirmText)}
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}