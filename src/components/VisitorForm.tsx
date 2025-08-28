import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Camera, Save, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CameraCapture } from './CameraCapture';

import { CreateVisitorData, DocumentType } from '@/types/visitor';
import { toast } from '@/hooks/use-toast';

const visitorSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  document_type: z.string().min(1, 'Tipo de documento é obrigatório'),
  document_number: z.string().min(1, 'Número do documento é obrigatório'),
  visit_reason: z.string().min(3, 'Motivo da visita deve ter pelo menos 3 caracteres')
});

type VisitorFormData = z.infer<typeof visitorSchema>;

interface VisitorFormProps {
  onSubmit: (data: CreateVisitorData) => void;
  onCancel?: () => void;
}

export const VisitorForm: React.FC<VisitorFormProps> = ({ onSubmit, onCancel }) => {
  const [showCamera, setShowCamera] = useState(false);
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch
  } = useForm<VisitorFormData>({
    resolver: zodResolver(visitorSchema)
  });

  const handlePhotoCapture = (blob: Blob) => {
    setPhotoBlob(blob);
    const url = URL.createObjectURL(blob);
    setPhotoPreview(url);
    setShowCamera(false);
    toast({
      title: "Foto capturada!",
      description: "Foto do visitante salva com sucesso."
    });
  };

  const handleFormSubmit = async (data: VisitorFormData) => {
    let photoBase64 = '';

    if (photoBlob) {
      const reader = new FileReader();
      photoBase64 = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(photoBlob);
      });
    }

    const submitData: CreateVisitorData = {
      name: data.name,
      cpf: data.document_type === 'CPF' ? data.document_number : undefined, // CPF apenas se for CPF
      document_type: data.document_type as DocumentType,
      document_number: data.document_number,
      visit_reason: data.visit_reason,
      photo: photoBase64 || undefined,
      status: 'inside' // Visitante entra automaticamente ao ser cadastrado
    };

    onSubmit(submitData);
  };

  if (showCamera) {
    return (
      <CameraCapture
        onCapture={handlePhotoCapture}
        onCancel={() => setShowCamera(false)}
      />
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-card shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-center">
          <User className="w-5 h-5" />
          Cadastrar Visitante
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Digite o nome completo"
              className="transition-smooth"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>



          <div className="space-y-2">
            <Label htmlFor="document_type">Tipo de Documento *</Label>
            <Select onValueChange={(value) => setValue('document_type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de documento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CPF">CPF</SelectItem>
                <SelectItem value="RG">RG</SelectItem>
                <SelectItem value="CNH">CNH</SelectItem>
                <SelectItem value="Passaporte">Passaporte</SelectItem>
                <SelectItem value="Outro">Outro</SelectItem>
              </SelectContent>
            </Select>
            {errors.document_type && (
              <p className="text-sm text-destructive">{errors.document_type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="document_number">Número do Documento *</Label>
            <Input
              id="document_number"
              {...register('document_number')}
              placeholder="Digite o número do documento"
              className="transition-smooth"
            />
            {errors.document_number && (
              <p className="text-sm text-destructive">{errors.document_number.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="visit_reason">Motivo da Visita *</Label>
            <Textarea
              id="visit_reason"
              {...register('visit_reason')}
              placeholder="Descreva o motivo da visita..."
              className="transition-smooth min-h-[80px]"
            />
            {errors.visit_reason && (
              <p className="text-sm text-destructive">{errors.visit_reason.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label>Foto do Visitante</Label>
            {photoPreview ? (
              <div className="space-y-3">
                <div className="w-32 h-32 mx-auto">
                  <img
                    src={photoPreview}
                    alt="Preview da foto"
                    className="w-full h-full object-cover rounded-lg border"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCamera(true)}
                  className="w-full"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Alterar Foto
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCamera(true)}
                className="w-full"
              >
                <Camera className="w-4 h-4 mr-2" />
                Capturar Foto
              </Button>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 shadow-button"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};