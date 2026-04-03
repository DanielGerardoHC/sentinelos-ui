import { useState, useCallback } from 'react';

export interface NatRuleInterface {
    id: number;
    'src-zone'?: string;
    'dst-zone'?: string;
    'out-interface'?: string;
    action: 'masquerade' | 'snat' | 'dnat';
    description?: string;
}

export function useNat() {
    const [natRules, setNatRules] = useState<NatRuleInterface[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const getHeaders = () => {
        const token = localStorage.getItem('sentinel_token');
        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
    };

    const fetchNatRules = useCallback(async (actionFilter?: 'masquerade' | 'snat' | 'dnat') => {
        setIsLoading(true);
        try {
            const url = actionFilter ? `/api/nat?action=${actionFilter}` : '/api/nat';
            const res = await fetch(url, { headers: getHeaders() });
            if (!res.ok) throw new Error('Error fetching NAT rules');
            const data = await res.json();

            setNatRules(data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const saveNatRule = async (method: 'POST' | 'PUT', id: number | null, payload: Partial<NatRuleInterface>) => {
        setIsLoading(true);
        setError('');
        let sessionStarted = false;

        try {
            const resBegin = await fetch('/api/config/begin', { method: 'POST', headers: getHeaders() });
            if (!resBegin.ok) throw new Error(await resBegin.text());
            sessionStarted = true;

            const url = method === 'PUT' ? `/api/nat/${id}` : '/api/nat';
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

            return true;
        } catch (err: any) {
            setError(err.message || 'Error saving NAT rule');
            if (sessionStarted) {
                try { await fetch('/api/config/commit', { method: 'POST', headers: getHeaders() }); }
                catch (e) { console.error("Failsafe unlock failed", e); }
            }
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteNatRule = async (id: number) => {
        setIsLoading(true);
        setError('');
        let sessionStarted = false;

        try {
            const resBegin = await fetch('/api/config/begin', { method: 'POST', headers: getHeaders() });
            if (!resBegin.ok) throw new Error(await resBegin.text());
            sessionStarted = true;

            const resDelete = await fetch(`/api/nat/${id}`, { method: 'DELETE', headers: getHeaders() });
            if (!resDelete.ok) throw new Error(await resDelete.text());

            const resCommit = await fetch('/api/config/commit', { method: 'POST', headers: getHeaders() });
            sessionStarted = false;

            if (!resCommit.ok) throw new Error(`Validation Error: ${await resCommit.text()}`);

            return true;
        } catch (err: any) {
            setError(err.message || 'Error deleting NAT rule');
            if (sessionStarted) {
                try { await fetch('/api/config/commit', { method: 'POST', headers: getHeaders() }); }
                catch (e) { console.error("Failsafe unlock failed", e); }
            }
            return false;
        } finally {
            setIsLoading(false);
        }
    };


    const moveNatRule = async (id: number, position: 'top' | 'bottom' | 'before' | 'after', referenceId?: number) => {
        setIsLoading(true);
        setError('');
        let sessionStarted = false;

        try {
            const resBegin = await fetch('/api/config/begin', { method: 'POST', headers: getHeaders() });
            if (!resBegin.ok) throw new Error(await resBegin.text());
            sessionStarted = true;

            const payload: any = { position };
            if (referenceId !== undefined) payload.reference_id = referenceId;

            const resMove = await fetch(`/api/nat/${id}/move`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(payload),
            });

            if (!resMove.ok) throw new Error(await resMove.text());

            const resCommit = await fetch('/api/config/commit', { method: 'POST', headers: getHeaders() });
            sessionStarted = false;

            if (!resCommit.ok) throw new Error(`Validation Error: ${await resCommit.text()}`);
            return true;
        } catch (err: any) {
            setError(err.message || 'Error moving NAT rule');
            if (sessionStarted) {
                try { await fetch('/api/config/commit', { method: 'POST', headers: getHeaders() }); }
                catch (e) { console.error("Failsafe unlock failed", e); }
            }
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { natRules, fetchNatRules, saveNatRule, deleteNatRule, moveNatRule, isLoading, error };
}