import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Camera, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CameraCapture } from './CameraCapture';
import { formatCPF, validateCPF } from '@/utils/cpf-validator';
import { CreateVisitorData } from '@/types/visitor';
import { toast } from '@/hooks/use-toast';

const visitorSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  cpf: z.string().refine(validateCPF, 'CPF inválido')
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

  const cpfValue = watch('cpf');

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setValue('cpf', formatted);
  };

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
      cpf: data.cpf,
      photo: photoBase64 || undefined
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
            <Label htmlFor="cpf">CPF *</Label>
            <Input
              id="cpf"
              value={cpfValue || ''}
              onChange={handleCPFChange}
              placeholder="000.000.000-00"
              maxLength={14}
              className="transition-smooth"
            />
            {errors.cpf && (
              <p className="text-sm text-destructive">{errors.cpf.message}</p>
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