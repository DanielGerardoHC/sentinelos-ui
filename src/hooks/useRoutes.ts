// Ruta: src/hooks/useRoutes.ts
import { useState, useCallback } from 'react';

export interface RouteInterface {
    id: number;
    destination: string;
    gateway: string;
    interface: string;
    metric: number;
    description: string;
}

export function useRoutes() {
    const [routes, setRoutes] = useState<RouteInterface[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const getHeaders = () => {
        const token = localStorage.getItem('sentinel_token');
        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
    };

    const fetchRoutes = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/routes', { headers: getHeaders() });
            if (!res.ok) throw new Error('Error fetching routes');
            const data = await res.json();
            setRoutes(data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const saveRoute = async (method: 'POST' | 'PUT', routeId: number | null, payload: Partial<RouteInterface>) => {
        setIsLoading(true);
        setError('');
        try {
            const resBegin = await fetch('/api/config/begin', { method: 'POST', headers: getHeaders() });
            if (!resBegin.ok) throw new Error(await resBegin.text());

            const url = method === 'PUT' ? `/api/routes/${routeId}` : '/api/routes';

            const resUpdate = await fetch(url, {
                method: method,
                headers: getHeaders(),
                body: JSON.stringify(payload),
            });
            if (!resUpdate.ok) throw new Error(await resUpdate.text());

            const resCommit = await fetch('/api/config/commit', { method: 'POST', headers: getHeaders() });
            if (!resCommit.ok) throw new Error(await resCommit.text());

            await fetchRoutes();
            return true;
        } catch (err: any) {
            setError(err.message || 'Error in route transaction');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteRoute = async (routeId: number) => {
        setIsLoading(true);
        setError('');
        try {
            const resBegin = await fetch('/api/config/begin', { method: 'POST', headers: getHeaders() });
            if (!resBegin.ok) throw new Error(await resBegin.text());

            const resDelete = await fetch(`/api/routes/${routeId}`, { method: 'DELETE', headers: getHeaders() });
            if (!resDelete.ok) throw new Error(await resDelete.text());

            const resCommit = await fetch('/api/config/commit', { method: 'POST', headers: getHeaders() });
            if (!resCommit.ok) throw new Error(await resCommit.text());

            await fetchRoutes();
            return true;
        } catch (err: any) {
            setError(err.message || 'Error deleting route');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { routes, fetchRoutes, saveRoute, deleteRoute, isLoading, error };
}