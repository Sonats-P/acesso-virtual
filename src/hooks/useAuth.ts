import { useState, useEffect, useCallback } from 'react';

interface User {
    username: string;
    email: string;
}

interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    isLoading: boolean;
}

// Credenciais fixas para o sistema
const VALID_CREDENTIALS = {
    username: 'Portaria',
    email: 'p.sonats@gmail.com',
    password: '123@Portaria'
};

export const useAuth = () => {
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        user: null,
        isLoading: true
    });

    // Verificar se há sessão salva no localStorage
    useEffect(() => {
        const savedAuth = localStorage.getItem('portaria_auth');
        if (savedAuth) {
            try {
                const { user, timestamp } = JSON.parse(savedAuth);
                // Verificar se a sessão não expirou (24 horas)
                const isExpired = Date.now() - timestamp > 24 * 60 * 60 * 1000;

                if (!isExpired) {
                    setAuthState({
                        isAuthenticated: true,
                        user,
                        isLoading: false
                    });
                } else {
                    localStorage.removeItem('portaria_auth');
                    setAuthState({
                        isAuthenticated: false,
                        user: null,
                        isLoading: false
                    });
                }
            } catch (error) {
                localStorage.removeItem('portaria_auth');
                setAuthState({
                    isAuthenticated: false,
                    user: null,
                    isLoading: false
                });
            }
        } else {
            setAuthState({
                isAuthenticated: false,
                user: null,
                isLoading: false
            });
        }
    }, []);

    const login = useCallback(async (username: string, password: string): Promise<boolean> => {
        // Simular delay de autenticação
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Verificar credenciais
        if (username === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password) {
            const user: User = {
                username: VALID_CREDENTIALS.username,
                email: VALID_CREDENTIALS.email
            };

            // Salvar sessão no localStorage
            const authData = {
                user,
                timestamp: Date.now()
            };
            localStorage.setItem('portaria_auth', JSON.stringify(authData));

            setAuthState({
                isAuthenticated: true,
                user,
                isLoading: false
            });

            return true;
        }

        return false;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('portaria_auth');
        setAuthState({
            isAuthenticated: false,
            user: null,
            isLoading: false
        });
    }, []);

    return {
        ...authState,
        login,
        logout
    };
};
