import { useState, useCallback } from 'react';

export interface Zone {
    name: string;
    type: string;
    interfaces: string[];
    networks: string[];
    color?: string;
}

export function useZones() {
    const [zones, setZones] = useState<Zone[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const getHeaders = () => {
        const token = localStorage.getItem('sentinel_token');
        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
    };

    const fetchZones = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/zones', { headers: getHeaders() });
            if (!res.ok) throw new Error('Error fetching zones');
            const data = await res.json();

            setZones(Array.isArray(data) ? data : Object.values(data || {}));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const saveZone = async (method: 'POST' | 'PUT', zoneName: string, payload: Partial<Zone>) => {
        setIsLoading(true);
        setError('');
        let sessionStarted = false;

        try {
            const resBegin = await fetch('/api/config/begin', { method: 'POST', headers: getHeaders() });
            if (!resBegin.ok) throw new Error(await resBegin.text());
            sessionStarted = true;

            const url = method === 'PUT' ? `/api/zones/${zoneName}` : '/api/zones';

            const resUpdate = await fetch(url, {
                method: method,
                headers: getHeaders(),
                body: JSON.stringify(payload),
            });

            let stepError = '';
            if (!resUpdate.ok) {
                stepError = await resUpdate.text();
            }

            const resCommit = await fetch('/api/config/commit', { method: 'POST', headers: getHeaders() });
            sessionStarted = false;

            if (!resCommit.ok) {
                throw new Error(`Validation Error: ${await resCommit.text()}`);
            }

            if (stepError) {
                throw new Error(stepError);
            }

            await fetchZones();
            return true;
        } catch (err: any) {
            setError(err.message || 'Error in zone transaction');
            if (sessionStarted) {
                try { await fetch('/api/config/commit', { method: 'POST', headers: getHeaders() }); }
                catch (e) { console.error("Failsafe unlock failed", e); }
            }
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteZone = async (zoneName: string) => {
        setIsLoading(true);
        setError('');
        let sessionStarted = false;

        try {
            const resBegin = await fetch('/api/config/begin', { method: 'POST', headers: getHeaders() });
            if (!resBegin.ok) throw new Error(await resBegin.text());
            sessionStarted = true;

            const resDelete = await fetch(`/api/zones/${zoneName}`, { method: 'DELETE', headers: getHeaders() });
            if (!resDelete.ok) throw new Error(await resDelete.text());

            const resCommit = await fetch('/api/config/commit', { method: 'POST', headers: getHeaders() });
            sessionStarted = false;

            if (!resCommit.ok) throw new Error(`Validation Error: ${await resCommit.text()}`);

            await fetchZones();
            return true;
        } catch (err: any) {
            setError(err.message || 'Error deleting zone');
            if (sessionStarted) {
                try { await fetch('/api/config/commit', { method: 'POST', headers: getHeaders() }); }
                catch (e) { console.error("Failsafe unlock failed", e); }
            }
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { zones, fetchZones, saveZone, deleteZone, isLoading, error };
}