import { useState, useCallback } from 'react';

export interface PolicyInterface {
    id: number;
    'src-zone': string;
    'dst-zone': string;
    'src-addr': string;
    'dst-addr': string;
    services: string[];
    action: 'allow' | 'deny';
    log: boolean;
}

export function usePolicies() {
    const [policies, setPolicies] = useState<PolicyInterface[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const getHeaders = () => {
        const token = localStorage.getItem('sentinel_token');
        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
    };

    const fetchPolicies = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/policies', { headers: getHeaders() });
            if (!res.ok) throw new Error('Error fetching policies');
            const data = await res.json();

            // Si la API devuelve null o undefined, seteamos un array vacío
            setPolicies(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const savePolicy = async (method: 'POST' | 'PUT', policyId: number | null, payload: Partial<PolicyInterface>) => {
        setIsLoading(true);
        setError('');
        let sessionStarted = false;

        try {
            const resBegin = await fetch('/api/config/begin', { method: 'POST', headers: getHeaders() });
            if (!resBegin.ok) throw new Error(await resBegin.text());
            sessionStarted = true;

            const url = method === 'PUT' ? `/api/policies/${policyId}` : '/api/policies';
            const resUpdate = await fetch(url, {
                method: method,
                headers: getHeaders(),
                body: JSON.stringify(payload),
            });

            let stepError = '';
            if (!resUpdate.ok) stepError = await resUpdate.text();

            const resCommit = await fetch('/api/config/commit', { method: 'POST', headers: getHeaders() });
            sessionStarted = false;

            if (!resCommit.ok) throw new Error(`Validation Error: ${await resCommit.text()}`);
            if (stepError) throw new Error(stepError);

            await fetchPolicies();
            return true;
        } catch (err: any) {
            setError(err.message || 'Error in policy transaction');
            if (sessionStarted) {
                try { await fetch('/api/config/commit', { method: 'POST', headers: getHeaders() }); }
                catch (e) { console.error("Failsafe unlock failed", e); }
            }
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const deletePolicy = async (policyId: number) => {
        setIsLoading(true);
        setError('');
        let sessionStarted = false;

        try {
            const resBegin = await fetch('/api/config/begin', { method: 'POST', headers: getHeaders() });
            if (!resBegin.ok) throw new Error(await resBegin.text());
            sessionStarted = true;

            const resDelete = await fetch(`/api/policies/${policyId}`, { method: 'DELETE', headers: getHeaders() });
            if (!resDelete.ok) throw new Error(await resDelete.text());

            const resCommit = await fetch('/api/config/commit', { method: 'POST', headers: getHeaders() });
            sessionStarted = false;

            if (!resCommit.ok) throw new Error(`Validation Error: ${await resCommit.text()}`);

            await fetchPolicies();
            return true;
        } catch (err: any) {
            setError(err.message || 'Error deleting policy');
            if (sessionStarted) {
                try { await fetch('/api/config/commit', { method: 'POST', headers: getHeaders() }); }
                catch (e) { console.error("Failsafe unlock failed", e); }
            }
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const movePolicy = async (id: number, position: 'top' | 'bottom' | 'before' | 'after', referenceId?: number) => {
        setIsLoading(true);
        setError('');
        let sessionStarted = false;

        try {
            const resBegin = await fetch('/api/config/begin', { method: 'POST', headers: getHeaders() });
            if (!resBegin.ok) throw new Error(await resBegin.text());
            sessionStarted = true;

            const resMove = await fetch(`/api/policies/${id}/move`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ position, reference_id: referenceId })
            });

            let stepError = '';
            if (!resMove.ok) stepError = await resMove.text();

            const resCommit = await fetch('/api/config/commit', { method: 'POST', headers: getHeaders() });
            sessionStarted = false;

            if (!resCommit.ok) throw new Error(`Validation Error: ${await resCommit.text()}`);
            if (stepError) throw new Error(stepError);

            await fetchPolicies();
            return true;
        } catch (err: any) {
            setError(err.message || 'Error moving policy');
            if (sessionStarted) {
                try { await fetch('/api/config/commit', { method: 'POST', headers: getHeaders() }); }
                catch (e) { console.error("Failsafe unlock failed", e); }
            }
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { policies, fetchPolicies, savePolicy, deletePolicy, movePolicy, isLoading, error };

}


