// Ruta: src/hooks/useZones.ts
import { useState, useCallback } from 'react';

export interface Zone {
    name: string;
    networks: string[];
    interfaces: string[];
    type: string;
}

export function useZones() {
    const [zones, setZones] = useState<Zone[]>([]);
    const [isLoadingZones, setIsLoadingZones] = useState(false);

    const getHeaders = () => {
        const token = localStorage.getItem('sentinel_token');
        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
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

    return { zones, fetchZones, isLoadingZones };
}