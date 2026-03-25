import { useState, useCallback } from 'react';

export interface AddressInterface {
    name: string;
    ips: string[];
}

export function useAddresses() {
    const [addresses, setAddresses] = useState<AddressInterface[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const getHeaders = () => {
        const token = localStorage.getItem('sentinel_token');
        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
    };

    const fetchAddresses = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/addresses', { headers: getHeaders() });
            if (!res.ok) throw new Error('Error fetching addresses');
            const data = await res.json();
            
            const addressesArray = data ? Object.values(data) as AddressInterface[] : [];
            setAddresses(addressesArray);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const saveAddress = async (method: 'POST' | 'PUT', name: string, payload: Partial<AddressInterface>) => {
        setIsLoading(true);
        setError('');
        let sessionStarted = false;

        try {
            const resBegin = await fetch('/api/config/begin', { method: 'POST', headers: getHeaders() });
            if (!resBegin.ok) throw new Error(await resBegin.text());
            sessionStarted = true;

            const url = method === 'PUT' ? `/api/addresses/${name}` : '/api/addresses';
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

            await fetchAddresses();
            return true;
        } catch (err: any) {
            setError(err.message || 'Error saving address');
            if (sessionStarted) {
                try { await fetch('/api/config/commit', { method: 'POST', headers: getHeaders() }); }
                catch (e) { console.error("Failsafe unlock failed", e); }
            }
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteAddress = async (name: string) => {
        setIsLoading(true);
        setError('');
        let sessionStarted = false;

        try {
            const resBegin = await fetch('/api/config/begin', { method: 'POST', headers: getHeaders() });
            if (!resBegin.ok) throw new Error(await resBegin.text());
            sessionStarted = true;

            const resDelete = await fetch(`/api/addresses/${name}`, { method: 'DELETE', headers: getHeaders() });
            if (!resDelete.ok) throw new Error(await resDelete.text());

            const resCommit = await fetch('/api/config/commit', { method: 'POST', headers: getHeaders() });
            sessionStarted = false;

            if (!resCommit.ok) throw new Error(`Validation Error: ${await resCommit.text()}`);

            await fetchAddresses();
            return true;
        } catch (err: any) {
            setError(err.message || 'Error deleting address');
            if (sessionStarted) {
                try { await fetch('/api/config/commit', { method: 'POST', headers: getHeaders() }); }
                catch (e) { console.error("Failsafe unlock failed", e); }
            }
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { addresses, fetchAddresses, saveAddress, deleteAddress, isLoading, error };
}