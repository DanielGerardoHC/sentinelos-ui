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

    const fetchInterfaces = useCallback(async (layer?: '2' | '3') => {
            setIsLoading(true);
            try {
                const url = layer ? `/api/interfaces?layer=${layer}` : '/api/interfaces';

                const res = await fetch(url, { headers: getHeaders() });
                if (!res.ok) throw new Error('Error fetching interfaces');
                const data = await res.json();

                setInterfaces(data || []);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }, []);

        const editInterface = async (name: string, payload: Partial<NetworkInterface>) => {
            setIsLoading(true);
            setError('');
            let sessionStarted = false;

            try {
                const resBegin = await fetch('/api/config/begin', { method: 'POST', headers: getHeaders() });
                if (!resBegin.ok) throw new Error(await resBegin.text());
                sessionStarted = true;

                const resUpdate = await fetch(`/api/interfaces/${name}`, {
                    method: 'PUT',
                    headers: getHeaders(),
                    body: JSON.stringify(payload),
                });

                let stepError = '';
                if (!resUpdate.ok) stepError = await resUpdate.text();

                const resCommit = await fetch('/api/config/commit', { method: 'POST', headers: getHeaders() });
                sessionStarted = false;

                if (!resCommit.ok) throw new Error(`Validation Error: ${await resCommit.text()}`);
                if (stepError) throw new Error(stepError);

                await fetchInterfaces();
                return true;
            } catch (err: any) {
                setError(err.message || 'Error updating interface');
                if (sessionStarted) {
                    try { await fetch('/api/config/commit', { method: 'POST', headers: getHeaders() }); }
                    catch (e) { console.error("Failsafe unlock failed", e); }
                }
                return false;
            } finally {
                setIsLoading(false);
            }
        };

        return { interfaces, fetchInterfaces, editInterface, isLoading, error };
    }