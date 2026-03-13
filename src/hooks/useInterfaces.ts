import { useState, useCallback } from 'react';

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

    const fetchInterfaces = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/interfaces', { headers: getHeaders() });
            if (!res.ok) throw new Error('Error al obtener interfaces');
            const data = await res.json();
            setInterfaces(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateInterface = async (interfaceName: string, changes: Partial<NetworkInterface>) => {
        setIsLoading(true);
        setError('');
        let sessionStarted = false; // Candado Anti-Deadlock

        try {
            // 1. BEGIN
            const resBegin = await fetch('/api/config/begin', { method: 'POST', headers: getHeaders() });
            if (!resBegin.ok) throw new Error(await resBegin.text());
            sessionStarted = true;

            // 2. CANDIDATE UPDATE
            const resUpdate = await fetch(`/api/interfaces/${interfaceName}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(changes),
            });
            if (!resUpdate.ok) throw new Error(await resUpdate.text());

            // 3. COMMIT
            const resCommit = await fetch('/api/config/commit', { method: 'POST', headers: getHeaders() });
            sessionStarted = false; // Liberamos la sesión

            if (!resCommit.ok) throw new Error(`Validation Error: ${await resCommit.text()}`);

            await fetchInterfaces();
            return true;

        } catch (err: any) {
            setError(err.message || 'Error en la transacción');

            // CATCH DE SEGURIDAD
            if (sessionStarted) {
                try { await fetch('/api/config/commit', { method: 'POST', headers: getHeaders() }); }
                catch (e) { console.error("Cleanup commit failed:", e); }
            }
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { interfaces, fetchInterfaces, updateInterface, isLoading, error };
}