// Ruta: src/hooks/useVlans.ts
import { useState, useCallback } from 'react';

export interface VlanInterface {
    id: number;
    name: string;
    parent: string;
    ip: string;
    zone: string;
    state: string;
    management: string[];
}

export function useVlans() {
    const [vlans, setVlans] = useState<VlanInterface[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const getHeaders = () => {
        const token = localStorage.getItem('sentinel_token');
        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
    };

    const fetchVlans = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/vlans', { headers: getHeaders() });
            if (!res.ok) throw new Error('Error al obtener VLANs');
            const data = await res.json();
            setVlans(data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const saveVlan = async (method: 'POST' | 'PUT', payload: Partial<VlanInterface>) => {
        setIsLoading(true);
        setError('');
        try {
            const resBegin = await fetch('/api/config/begin', { method: 'POST', headers: getHeaders() });
            if (!resBegin.ok) throw new Error(await resBegin.text());

            const resUpdate = await fetch('/api/vlans', {
                method: method,
                headers: getHeaders(),
                body: JSON.stringify(payload),
            });
            if (!resUpdate.ok) throw new Error(await resUpdate.text());

            const resCommit = await fetch('/api/config/commit', { method: 'POST', headers: getHeaders() });
            if (!resCommit.ok) throw new Error(await resCommit.text());

            await fetchVlans();
            return true;
        } catch (err: any) {
            setError(err.message || 'Error en la transacción de VLAN');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteVlan = async (vlanName: string) => {
        setIsLoading(true);
        setError('');
        try {
            const resBegin = await fetch('/api/config/begin', { method: 'POST', headers: getHeaders() });
            if (!resBegin.ok) throw new Error(await resBegin.text());

            // Cuando programes el DELETE en Go, asegúrate de que reciba el nombre por URL o body
            const resDelete = await fetch(`/api/vlans/${vlanName}`, { method: 'DELETE', headers: getHeaders() });
            if (!resDelete.ok) throw new Error(await resDelete.text());

            const resCommit = await fetch('/api/config/commit', { method: 'POST', headers: getHeaders() });
            if (!resCommit.ok) throw new Error(await resCommit.text());

            await fetchVlans();
            return true;
        } catch (err: any) {
            setError(err.message || 'Error al eliminar VLAN');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { vlans, fetchVlans, saveVlan, deleteVlan, isLoading, error };
}