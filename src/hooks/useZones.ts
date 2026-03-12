// Ruta: src/hooks/useZones.ts
import { useState, useCallback } from 'react';

export interface Zone {
    name: string;
    type: string;
    interfaces: string[];
    networks: string[];
}

export function useZones() {
    const [zones, setZones] = useState<Zone[]>([]);
    const [isLoadingZones, setIsLoadingZones] = useState(false);

    const getHeaders = () => {
        const token = localStorage.getItem('sentinel_token');
        return { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) };
    };

    const fetchZones = useCallback(async () => {
        setIsLoadingZones(true);
        try {
            const res = await fetch('/api/zones', { headers: getHeaders() });
            if (!res.ok) throw new Error('Error al obtener Zonas');
            const data = await res.json();
            setZones(data || []);
        } catch (err: any) {
            console.error(err.message);
        } finally {
            setIsLoadingZones(false);
        }
    }, []);

    const saveZone = async (zoneName: string, payload: Partial<Zone>) => {
        setIsLoadingZones(true);
        try {
            const resBegin = await fetch('/api/config/begin', { method: 'POST', headers: getHeaders() });
            if (!resBegin.ok) throw new Error(await resBegin.text());

            const resUpdate = await fetch(`/api/zones/${zoneName}`, {
                method: 'PUT', headers: getHeaders(), body: JSON.stringify(payload)
            });
            if (!resUpdate.ok) throw new Error(await resUpdate.text());

            const resCommit = await fetch('/api/config/commit', { method: 'POST', headers: getHeaders() });
            if (!resCommit.ok) throw new Error(await resCommit.text());

            await fetchZones();
            return true;
        } catch (err: any) {
            alert(err.message || 'Error saving zone');
            return false;
        } finally {
            setIsLoadingZones(false);
        }
    };

    return { zones, fetchZones, saveZone, isLoadingZones };
}