import { useState, useCallback } from 'react';

export interface ServiceInterface {
    name: string;
    protocol: 'tcp' | 'udp';
    ports: number[];
}

export function useServices() {
    const [services, setServices] = useState<ServiceInterface[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const getHeaders = () => {
        const token = localStorage.getItem('sentinel_token');
        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
    };

    const fetchServices = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/services', { headers: getHeaders() });
            if (!res.ok) throw new Error('Error fetching services');
            const data = await res.json();

            // La API de Go devuelve un mapa, lo convertimos a array para iterarlo fácil en React
            const servicesArray = data ? Object.values(data) as ServiceInterface[] : [];
            setServices(servicesArray);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const saveService = async (method: 'POST' | 'PUT', name: string, payload: Partial<ServiceInterface>) => {
        setIsLoading(true);
        setError('');
        let sessionStarted = false;

        try {
            const resBegin = await fetch('/api/config/begin', { method: 'POST', headers: getHeaders() });
            if (!resBegin.ok) throw new Error(await resBegin.text());
            sessionStarted = true;

            const url = method === 'PUT' ? `/api/services/${name}` : '/api/services';
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

            await fetchServices();
            return true;
        } catch (err: any) {
            setError(err.message || 'Error saving service');
            if (sessionStarted) {
                try { await fetch('/api/config/commit', { method: 'POST', headers: getHeaders() }); }
                catch (e) { console.error("Failsafe unlock failed", e); }
            }
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteService = async (name: string) => {
        setIsLoading(true);
        setError('');
        let sessionStarted = false;

        try {
            const resBegin = await fetch('/api/config/begin', { method: 'POST', headers: getHeaders() });
            if (!resBegin.ok) throw new Error(await resBegin.text());
            sessionStarted = true;

            const resDelete = await fetch(`/api/services/${name}`, { method: 'DELETE', headers: getHeaders() });
            if (!resDelete.ok) throw new Error(await resDelete.text());

            const resCommit = await fetch('/api/config/commit', { method: 'POST', headers: getHeaders() });
            sessionStarted = false;

            if (!resCommit.ok) throw new Error(`Validation Error: ${await resCommit.text()}`);

            await fetchServices();
            return true;
        } catch (err: any) {
            setError(err.message || 'Error deleting service');
            if (sessionStarted) {
                try { await fetch('/api/config/commit', { method: 'POST', headers: getHeaders() }); }
                catch (e) { console.error("Failsafe unlock failed", e); }
            }
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { services, fetchServices, saveService, deleteService, isLoading, error };
}