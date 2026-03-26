// Ruta: src/hooks/useDhcp.ts
import { useState, useCallback } from 'react';

export interface DhcpConfig {
    interface: string;
    start_ip: string;
    end_ip: string;
    gateway: string;
    dns: string[];
    lease_time: number;
}

export function useDhcp() {
    const [dhcpPools, setDhcpPools] = useState<DhcpConfig[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const getHeaders = () => {
        const token = localStorage.getItem('sentinel_token');
        return { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) };
    };

    const fetchDhcpPools = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/dhcp', { headers: getHeaders() });
            if (!res.ok) throw new Error('Error fetching DHCP pools');
            const data = await res.json();
            const poolsArray = data ? Object.values(data) as DhcpConfig[] : [];
            setDhcpPools(poolsArray);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const saveDhcp = async (method: 'POST' | 'PUT', ifaceName: string, payload: Partial<DhcpConfig>) => {
        setIsLoading(true); setError('');
        try {
            const resBegin = await fetch('/api/config/begin', { method: 'POST', headers: getHeaders() });
            if (!resBegin.ok) throw new Error(await resBegin.text());

            const url = method === 'POST' ? '/api/dhcp' : `/api/dhcp/${ifaceName}`;
            const resUpdate = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(payload) });
            if (!resUpdate.ok) throw new Error(await resUpdate.text());

            const resCommit = await fetch('/api/config/commit', { method: 'POST', headers: getHeaders() });
            if (!resCommit.ok) throw new Error(await resCommit.text());

            await fetchDhcpPools();
            return true;
        } catch (err: any) {
            setError(err.message || 'DHCP transaction failed');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteDhcp = async (ifaceName: string) => {
        setIsLoading(true); setError('');
        try {
            const resBegin = await fetch('/api/config/begin', { method: 'POST', headers: getHeaders() });
            if (!resBegin.ok) throw new Error(await resBegin.text());

            const resDelete = await fetch(`/api/dhcp/${ifaceName}`, { method: 'DELETE', headers: getHeaders() });
            if (!resDelete.ok) throw new Error(await resDelete.text());

            const resCommit = await fetch('/api/config/commit', { method: 'POST', headers: getHeaders() });
            if (!resCommit.ok) throw new Error(await resCommit.text());

            await fetchDhcpPools();
            return true;
        } catch (err: any) {
            setError(err.message || 'DHCP deletion failed');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { dhcpPools, fetchDhcpPools, saveDhcp, deleteDhcp, isLoading, error };
}