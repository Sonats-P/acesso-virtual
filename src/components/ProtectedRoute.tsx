import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from './LoginForm';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, isLoading, login } = useAuth();

    // Monitorar mudanças de estado de autenticação
    useEffect(() => {
        // Este useEffect garante que o componente reaja às mudanças de estado
    }, [isAuthenticated, isLoading]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-secondary flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Carregando...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <LoginForm onLogin={login} />;
    }

    return <>{children}</>;
};
