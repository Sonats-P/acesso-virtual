import React from 'react';
import {
    User,
    Calendar,
    Clock,
    FileText,
    LogIn,
    LogOut,
    MessageSquare,
    Camera,
    Trash2,
    Edit,
    ArrowLeft,
    TrendingUp,
    History
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Visitor } from '@/types/visitor';
import { formatDateBR, formatTimeBR, formatDateOnlyBR } from '@/utils/date-formatter';

interface VisitorDetailsProps {
    visitor: Visitor;
    visitorHistory: Visitor[];
    onStatusChange?: (id: string, status: 'inside' | 'outside') => void;
    onDeleteVisitor?: (id: string) => void;
    onEditVisitor?: (visitor: Visitor) => void;
    onBack?: () => void;
}

export const VisitorDetails: React.FC<VisitorDetailsProps> = ({
    visitor,
    visitorHistory,
    onStatusChange,
    onDeleteVisitor,
    onEditVisitor,
    onBack
}) => {
    // Usar as funções de formatação com fuso horário de Brasília
    const formatDate = formatDateBR;
    const formatTime = formatTimeBR;
    const formatDateOnly = formatDateOnlyBR;

    const getStatusConfig = (status: 'inside' | 'outside') => {
        return status === 'inside'
            ? {
                text: 'No estabelecimento',
                variant: 'default' as const,
                bgColor: 'bg-green-500/20 text-green-400 border-green-500/50',
                icon: LogIn
            }
            : {
                text: 'Fora do estabelecimento',
                variant: 'secondary' as const,
                bgColor: 'bg-red-500/20 text-red-400 border-red-500/50',
                icon: LogOut
            };
    };

    const getTotalVisits = () => visitorHistory.length;
    const getCurrentVisit = () => visitorHistory[0]; // Mais recente
    const getCompletedVisits = () => visitorHistory.filter(v => v.status === 'outside').length;

    return (
        <div className="space-y-6">
            {/* Header com informações principais */}
            <Card className="bg-gradient-card shadow-card">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Avatar className="w-20 h-20">
                                {visitor.photo ? (
                                    <AvatarImage src={visitor.photo} alt={visitor.name} />
                                ) : (
                                    <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                                        {visitor.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                )}
                            </Avatar>
                            <div>
                                <CardTitle className="text-2xl">{visitor.name}</CardTitle>
                                <p className="text-muted-foreground">
                                    {visitor.document_type}: {visitor.document_number}
                                </p>
                                {visitor.cpf && visitor.document_type !== 'CPF' && (
                                    <p className="text-sm text-muted-foreground">
                                        CPF: {visitor.cpf}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge className={getStatusConfig(visitor.status).bgColor}>
                                {React.createElement(getStatusConfig(visitor.status).icon, { className: "w-4 h-4 mr-2" })}
                                {getStatusConfig(visitor.status).text}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-card">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total de Visitas</p>
                                <p className="text-2xl font-bold">{getTotalVisits()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-card">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                                <LogOut className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Visitas Concluídas</p>
                                <p className="text-2xl font-bold">{getCompletedVisits()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-card">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <Calendar className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Última Visita</p>
                                <p className="text-sm font-medium">
                                    {formatDate(getCurrentVisit()?.created_at || visitor.created_at)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Visita Atual */}
            {getCurrentVisit() && (
                <Card className="bg-gradient-card shadow-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Visita Atual
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Data:</span>
                                    <span className="text-sm">{formatDateOnly(getCurrentVisit().visit_date)}</span>
                                </div>
                                {getCurrentVisit().entry_time && (
                                    <div className="flex items-center gap-2">
                                        <LogIn className="w-4 h-4 text-green-400" />
                                        <span className="text-sm font-medium">Entrada:</span>
                                        <span className="text-sm">{formatTime(getCurrentVisit().entry_time)}</span>
                                    </div>
                                )}
                                {getCurrentVisit().exit_time && (
                                    <div className="flex items-center gap-2">
                                        <LogOut className="w-4 h-4 text-red-400" />
                                        <span className="text-sm font-medium">Saída:</span>
                                        <span className="text-sm">{formatTime(getCurrentVisit().exit_time)}</span>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                {getCurrentVisit().visit_reason && (
                                    <div className="flex items-start gap-2">
                                        <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" />
                                        <div>
                                            <span className="text-sm font-medium">Motivo:</span>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {getCurrentVisit().visit_reason}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Ações */}
                        <div className="flex gap-2 pt-4 border-t">
                            {onStatusChange && (
                                <>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => onStatusChange(visitor.id, 'inside')}
                                        disabled={visitor.status === 'inside'}
                                        className="flex-1"
                                    >
                                        <LogIn className="w-4 h-4 mr-2" />
                                        Registrar Entrada
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => onStatusChange(visitor.id, 'outside')}
                                        disabled={visitor.status === 'outside'}
                                        className="flex-1"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Registrar Saída
                                    </Button>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Histórico de Visitas */}
            <Card className="bg-gradient-card shadow-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="w-5 h-5" />
                        Histórico de Visitas ({getTotalVisits()})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {visitorHistory.map((visit, index) => (
                            <div
                                key={visit.id}
                                className={`p-4 rounded-lg border ${index === 0 ? 'bg-primary/5 border-primary/20' : 'bg-muted/30'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">
                                                {formatDateOnly(visit.visit_date)}
                                            </span>
                                        </div>
                                        {visit.entry_time && (
                                            <div className="flex items-center gap-1">
                                                <LogIn className="w-3 h-3 text-green-400" />
                                                <span className="text-xs">{formatTime(visit.entry_time)}</span>
                                            </div>
                                        )}
                                        {visit.exit_time && (
                                            <div className="flex items-center gap-1">
                                                <LogOut className="w-3 h-3 text-red-400" />
                                                <span className="text-xs">{formatTime(visit.exit_time)}</span>
                                            </div>
                                        )}
                                    </div>
                                    <Badge className={getStatusConfig(visit.status).bgColor}>
                                        {React.createElement(getStatusConfig(visit.status).icon, { className: "w-3 h-3 mr-1" })}
                                        {getStatusConfig(visit.status).text}
                                    </Badge>
                                </div>
                                {visit.visit_reason && (
                                    <p className="text-sm text-muted-foreground mt-2">
                                        {visit.visit_reason}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Ações do Visitante */}
            <Card className="bg-gradient-card shadow-card">
                <CardHeader>
                    <CardTitle>Ações</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-3">
                        {onEditVisitor && (
                            <Button
                                variant="outline"
                                onClick={() => onEditVisitor(visitor)}
                                className="flex-1"
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Editar Visitante
                            </Button>
                        )}
                        {onDeleteVisitor && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="flex-1 text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Deletar Visitante
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Remover Visitante</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Tem certeza que deseja remover {visitor.name}? Esta ação não pode ser desfeita e removerá todo o histórico de visitas.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => onDeleteVisitor(visitor.id)}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                            Remover
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                        {onBack && (
                            <Button
                                variant="outline"
                                onClick={onBack}
                                className="flex-1"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Voltar
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
