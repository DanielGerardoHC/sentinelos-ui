import { useState, useCallback } from 'react';

// Definimos la estructura exacta que nos devuelve tu API en Go
export interface NetworkInterface {
    name: string;
    ip: string;
    zone: string;
    state: string;
    management: string[];
}

export function useInterfaces() {
    const [interfaces, setInterfaces] = useState<NetworkInterface[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const getHeaders = () => {
        const token = localStorage.getItem('sentinel_token');
        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
    };

    // Función para LEER las interfaces
    const fetchInterfaces = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/interfaces', { headers: getHeaders() });
            if (!res.ok) throw new Error('Error al obtener interfaces');

            const data = await res.json();
            setInterfaces(data); // Guardamos la respuesta de Go en la memoria de React
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Función para ACTUALIZAR (El flujo transaccional que platicamos)
    const updateInterface = async (interfaceName: string, changes: Partial<NetworkInterface>) => {
        setIsLoading(true);
        setError('');

        try {
            // 1. BEGIN
            const resBegin = await fetch('/api/config/begin', { method: 'POST', headers: getHeaders() });
            if (!resBegin.ok) throw new Error(await resBegin.text());

            // 2. CANDIDATE UPDATE
            const resUpdate = await fetch(`/api/interfaces/${interfaceName}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(changes),
            });
            if (!resUpdate.ok) throw new Error(await resUpdate.text());

            // 3. COMMIT
            const resCommit = await fetch('/api/config/commit', { method: 'POST', headers: getHeaders() });
            if (!resCommit.ok) throw new Error(await resCommit.text());

            // Si todo sale bien, refrescamos la tabla para ver el cambio real
            await fetchInterfaces();
            return true;

        } catch (err: any) {
            setError(err.message || 'Error en la transacción');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { interfaces, fetchInterfaces, updateInterface, isLoading, error };
}