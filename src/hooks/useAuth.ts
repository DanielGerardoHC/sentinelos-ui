// Ruta: src/hooks/useAuth.ts
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const login = async (username: string, password: string) => {
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            // 1. Leemos la respuesta como texto crudo primero
            const textResponse = await response.text();
            let data;

            // 2. Intentamos ver si es un JSON válido
            try {
                data = JSON.parse(textResponse);
            } catch (e) {
                // Si no es JSON (como tu error de "Invalid credentials"), data queda undefined
            }

            // 3. Evaluamos si el backend tiró un error (Status 400, 401, 500)
            if (!response.ok) {
                // Mostramos el mensaje del JSON, o el texto plano, o un error genérico
                const errorMessage = data?.message || data?.error || textResponse || 'Authorization failed';
                throw new Error(errorMessage.toUpperCase()); // Lo pasamos a mayúsculas para que encaje con tu diseño
            }

            // Si todo sale bien, guardamos el token
            localStorage.setItem('sentinel_token', data.token);
            router.push('/system');

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return { login, error, isLoading };
}