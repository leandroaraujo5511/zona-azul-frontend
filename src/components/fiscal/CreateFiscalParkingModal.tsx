import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { parkingService } from '@/services/parking.service';
import { zoneService } from '@/services/zone.service';
import { useToast } from '@/hooks/use-toast';
// QR Code will be displayed as image if available, or we can use a simple div

interface CreateFiscalParkingModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateFiscalParkingModal({
  open,
  onClose,
  onSuccess,
}: CreateFiscalParkingModalProps) {
  const [zoneId, setZoneId] = useState('');
  const [plate, setPlate] = useState('');
  const [requestedMinutes, setRequestedMinutes] = useState(60);
  const [createdParking, setCreatedParking] = useState<{
    id: string;
    plate: string;
    zone: { name: string };
    creditsUsed: number;
  } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get zones
  const { data: zonesData } = useQuery({
    queryKey: ['zones'],
    queryFn: () => zoneService.getAllZones({ status: 'active' }),
  });

  const { mutate: createParking, isPending } = useMutation({
    mutationFn: (data: { plate: string; zoneId: string; requestedMinutes: number }) =>
      parkingService.createAvulsoParking(data),
    onSuccess: (data) => {
      setCreatedParking({
        id: data.id,
        plate: data.plate,
        zone: data.zone || { name: 'Zona não informada' },
        creditsUsed: data.creditsUsed,
      });
      queryClient.invalidateQueries({ queryKey: ['parking-by-plate'] });
      queryClient.invalidateQueries({ queryKey: ['active-parkings'] });
      onSuccess?.();
    },
    onError: (error: { message?: string }) => {
      toast({
        title: 'Erro ao criar estacionamento',
        description: error.message || 'Ocorreu um erro ao criar o estacionamento',
        variant: 'destructive',
      });
    },
  });

    useEffect(() => {
    if (!open) {
      // Reset form when modal closes
      setZoneId('');
      setPlate('');
      setRequestedMinutes(60);
      setCreatedParking(null);
    }
  }, [open]);

  const handleClose = () => {
    if (createdParking) {
      // If parking was created, just close and reset
      setCreatedParking(null);
    }
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneId) {
      toast({
        title: 'Erro',
        description: 'Selecione uma zona',
        variant: 'destructive',
      });
      return;
    }

    const selectedZone = zonesData?.data.find((z) => z.id === zoneId);
    if (!selectedZone) return;

    // Validate requested minutes
    if (requestedMinutes < selectedZone.periodMinutes) {
      toast({
        title: 'Erro',
        description: `Tempo mínimo é ${selectedZone.periodMinutes} minutos`,
        variant: 'destructive',
      });
      return;
    }

    if (requestedMinutes > selectedZone.maxTimeMinutes) {
      toast({
        title: 'Erro',
        description: `Tempo máximo é ${selectedZone.maxTimeMinutes} minutos`,
        variant: 'destructive',
      });
      return;
    }

    createParking({
      plate: plate.toUpperCase().replace(/[^A-Z0-9]/g, ''),
      zoneId,
      requestedMinutes,
    });
  };

  const selectedZone = zonesData?.data.find((z) => z.id === zoneId);
  const calculatedValue = selectedZone
    ? Math.ceil(requestedMinutes / selectedZone.periodMinutes) *
      parseFloat(selectedZone.pricePerPeriod)
    : 0;

  if (createdParking) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Estacionamento Criado</DialogTitle>
            <DialogDescription>
              Estacionamento avulso criado com sucesso
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm">
                <strong>Placa:</strong> {createdParking.plate}
              </p>
              <p className="text-sm">
                <strong>Zona:</strong> {createdParking.zone.name}
              </p>
              <p className="text-sm">
                <strong>Valor:</strong> R$ {createdParking.creditsUsed.toFixed(2)}
              </p>
              <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Estacionamento avulso criado com sucesso! O valor foi debitado da conta do usuário. 
                  Se o usuário não tiver saldo suficiente, o saldo ficará negativo e deverá ser ajustado posteriormente.
                </p>
              </div>
          </div>
          </div>
          <DialogFooter>
            <Button onClick={handleClose}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Estacionamento Avulso</DialogTitle>
          <DialogDescription>
            Crie um estacionamento para um cliente avulso
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="zone">Zona *</Label>
              <Select value={zoneId} onValueChange={setZoneId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma zona" />
                </SelectTrigger>
                <SelectContent>
                  {zonesData?.data.map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name} - {zone.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plate">Placa do Veículo *</Label>
              <Input
                id="plate"
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                placeholder="ABC1234"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minutes">Tempo (minutos) *</Label>
              <Input
                id="minutes"
                type="number"
                value={requestedMinutes}
                onChange={(e) => setRequestedMinutes(parseInt(e.target.value) || 0)}
                min={selectedZone?.periodMinutes || 15}
                max={selectedZone?.maxTimeMinutes || 480}
                required
              />
              {selectedZone && (
                <p className="text-xs text-muted-foreground">
                  Mínimo: {selectedZone.periodMinutes} min • Máximo:{' '}
                  {selectedZone.maxTimeMinutes} min
                </p>
              )}
            </div>

            {selectedZone && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>Valor calculado:</strong> R$ {calculatedValue.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {Math.ceil(requestedMinutes / selectedZone.periodMinutes)} período(s) × R${' '}
                  {parseFloat(selectedZone.pricePerPeriod).toFixed(2)}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || !zoneId}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Estacionamento'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

