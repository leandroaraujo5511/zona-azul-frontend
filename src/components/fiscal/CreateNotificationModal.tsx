import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { notificationService } from '@/services/notification.service';
import { CreateNotificationInput } from '@/types/notification';
import { useToast } from '@/hooks/use-toast';

interface CreateNotificationModalProps {
  open: boolean;
  onClose: () => void;
  defaultPlate?: string;
  onSuccess?: () => void;
}

export function CreateNotificationModal({
  open,
  onClose,
  defaultPlate,
  onSuccess,
}: CreateNotificationModalProps) {
  const [plate, setPlate] = useState(defaultPlate || '');
  const [observations, setObservations] = useState('');
  const [location, setLocation] = useState({ address: '' });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate: createNotification, isPending } = useMutation({
    mutationFn: (data: CreateNotificationInput) => notificationService.createNotification(data),
    onSuccess: (data) => {
      toast({
        title: 'Notificação criada',
        description: `Notificação #${data.notificationNumber} criada com sucesso`,
      });
      queryClient.invalidateQueries({ queryKey: ['fiscal-notifications'] });
      onSuccess?.();
      handleClose();
    },
    onError: (error: { message?: string }) => {
      toast({
        title: 'Erro ao criar notificação',
        description: error.message || 'Ocorreu um erro ao criar a notificação',
        variant: 'destructive',
      });
    },
  });

  const handleClose = () => {
    setPlate(defaultPlate || '');
    setObservations('');
    setLocation({ address: '' });
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate.trim()) {
      toast({
        title: 'Erro',
        description: 'A placa é obrigatória',
        variant: 'destructive',
      });
      return;
    }

    const input: CreateNotificationInput = {
      plate: plate.toUpperCase().replace(/[^A-Z0-9]/g, ''),
      observations: observations.trim() || undefined,
      location: location.address ? { address: location.address } : undefined,
    };

    createNotification(input);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Notificação</DialogTitle>
          <DialogDescription>
            Crie uma notificação para uma placa irregular
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="plate">Placa do Veículo *</Label>
              <Input
                id="plate"
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                placeholder="ABC1234"
                required
                disabled={!!defaultPlate}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço (Opcional)</Label>
              <Input
                id="address"
                value={location.address}
                onChange={(e) => setLocation({ address: e.target.value })}
                placeholder="Rua, número, bairro"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observations">Observações (Opcional)</Label>
              <Textarea
                id="observations"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Informações adicionais sobre a infração"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Notificação'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

