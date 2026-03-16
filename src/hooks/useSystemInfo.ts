import { useState, useCallback } from 'react';

export interface UserInfo {
    username: string;
    role: string;
    expires: number;
}

export interface SystemStatus {
    dhcp: boolean;
    firewall: boolean;
    interfaces: number;
    routes: number;
}

export function useSystemInfo() {
    const [user, setUser] = useState<UserInfo | null>(null);
    const [status, setStatus] = useState<SystemStatus | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const getHeaders = () => {
        const token = localStorage.getItem('sentinel_token');
        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
    };

    const fetchAllInfo = useCallback(async () => {
        setIsLoading(true);
        setError('');

        try {
            const [meRes, statusRes] = await Promise.all([
                fetch('/api/me', { headers: getHeaders() }),
                fetch('/api/status', { headers: getHeaders() })
            ]);

            if (!meRes.ok) throw new Error('Failed to fetch user info');
            if (!statusRes.ok) throw new Error('Failed to fetch system status');

            const userData = await meRes.json();
            const statusData = await statusRes.json();

            setUser(userData);
            setStatus(statusData);
        } catch (err: any) {
            setError(err.message || 'Error loading system information');
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { user, status, fetchAllInfo, isLoading, error };
}