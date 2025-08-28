import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

const loginSchema = z.object({
    username: z.string().min(1, 'Usuário é obrigatório'),
    password: z.string().min(1, 'Senha é obrigatória')
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
    onLogin: (username: string, password: string) => Promise<boolean>;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema)
    });

    const handleFormSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        try {
            const success = await onLogin(data.username, data.password);
            if (!success) {
                toast({
                    title: "Erro no login",
                    description: "Usuário ou senha incorretos.",
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                title: "Erro no login",
                description: "Ocorreu um erro inesperado. Tente novamente.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-secondary flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-gradient-card shadow-card">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                        <User className="w-6 h-6" />
                        Controle de Acesso - Portaria
                    </CardTitle>
                    <p className="text-muted-foreground">
                        Faça login para acessar o sistema
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Usuário</Label>
                            <Input
                                id="username"
                                {...register('username')}
                                placeholder="Digite seu usuário"
                                className="transition-smooth"
                                disabled={isLoading}
                            />
                            {errors.username && (
                                <p className="text-sm text-destructive">{errors.username.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    {...register('password')}
                                    placeholder="Digite sua senha"
                                    className="transition-smooth pr-10"
                                    disabled={isLoading}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={isLoading}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                            {errors.password && (
                                <p className="text-sm text-destructive">{errors.password.message}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full shadow-button"
                            disabled={isLoading}
                        >
                            <Lock className="w-4 h-4 mr-2" />
                            {isLoading ? 'Entrando...' : 'Entrar'}
                        </Button>
                    </form>


                </CardContent>
            </Card>
        </div>
    );
};
