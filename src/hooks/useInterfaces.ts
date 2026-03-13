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

        let lockAcquired = false;
        let stepError = '';

        try {
            const resBegin = await fetch('/api/config/begin', { method: 'POST', headers: getHeaders() });
            if (!resBegin.ok) throw new Error(await resBegin.text());
            lockAcquired = true;

            const resUpdate = await fetch(`/api/interfaces/${interfaceName}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(changes),
            });
            if (!resUpdate.ok) {
                stepError = await resUpdate.text();
            }

            const resCommit = await fetch('/api/config/commit', { method: 'POST', headers: getHeaders() });
            lockAcquired = false;

            if (!resCommit.ok) {
                const commitMsg = await resCommit.text();
                throw new Error(`Validation Error: ${commitMsg}`);
            }

            if (stepError) {
                throw new Error(stepError);
            }


            await fetchInterfaces();
            return true;

        } catch (err: any) {
            setError(err.message || 'Error en la transacción');

            if (lockAcquired) {
                try { await fetch('/api/config/commit', { method: 'POST', headers: getHeaders() }); }
                catch (e) { console.error("Failsafe unlock failed", e); }
            }
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { interfaces, fetchInterfaces, updateInterface, isLoading, error };
}