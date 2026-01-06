import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Search, Car, Clock, MapPin, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { parkingService } from '@/services/parking.service';
import { Parking } from '@/types/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function PlateLookup() {
  const [searchPlate, setSearchPlate] = useState('');
  const [enabled, setEnabled] = useState(false);

  const formatPlate = (value: string) => {
    // Remove non-alphanumeric characters and convert to uppercase
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    
    // Format as ABC-1234 or ABC1D23 (Mercosul)
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 7) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    }
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}`;
  };

  // Query for parking lookup
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['parking-by-plate', searchPlate.replace(/[^A-Z0-9]/g, '').toUpperCase()],
    queryFn: () => parkingService.getParkingByPlate(searchPlate.replace(/[^A-Z0-9]/g, '').toUpperCase()),
    enabled: enabled && searchPlate.trim().length > 0,
    retry: false,
  });

  const handleSearch = () => {
    if (!searchPlate.trim()) return;
    setEnabled(true);
    refetch();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDateTime = (date: string | Date) => {
    return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const getTimeRemaining = (parking: Parking) => {
    if (!parking.timeRemaining && parking.timeRemaining !== 0) {
      const now = new Date();
      const end = new Date(parking.expectedEndTime);
      const diff = end.getTime() - now.getTime();
      
      if (diff <= 0) return 'Expirado';
      
      const minutes = Math.floor(diff / 60000);
      if (minutes < 60) {
        return `${minutes} minutos`;
      }
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}min`;
    }

    if (parking.timeRemaining <= 0) return 'Expirado';
    if (parking.timeRemaining < 60) {
      return `${parking.timeRemaining} minutos`;
    }
    const hours = Math.floor(parking.timeRemaining / 60);
    const remainingMinutes = parking.timeRemaining % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  const result = data;
  const hasSearched = enabled;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Consulta de Placa</h1>
          <p className="text-muted-foreground">
            Consulte a situação de estacionamento por placa do veículo
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Car className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Digite a placa (ex: ABC-1234)"
                value={searchPlate}
                onChange={(e) => {
                  setSearchPlate(formatPlate(e.target.value));
                  setEnabled(false);
                }}
                onKeyPress={handleKeyPress}
                className="pl-12 h-14 text-lg font-mono uppercase tracking-wider"
                maxLength={8}
              />
            </div>
            <Button 
              onClick={handleSearch}
              disabled={isLoading || !searchPlate.trim()}
              className="h-14 px-8"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Buscando...
                </div>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Consultar
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Result */}
        {hasSearched && (
          <div className="animate-slide-in">
            {isLoading ? (
              <div className="flex items-center justify-center h-64 bg-card border border-border rounded-xl">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="bg-card border border-destructive rounded-xl p-8 text-center">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Erro ao consultar
                </h3>
                <p className="text-muted-foreground">
                  Não foi possível consultar a placa. Tente novamente.
                </p>
              </div>
            ) : result?.found && result.parking ? (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                {/* Status Header */}
                <div className={`p-4 ${
                  result.parking.status === 'active' 
                    ? 'bg-success/10' 
                    : result.parking.status === 'expiring'
                    ? 'bg-warning/10'
                    : 'bg-destructive/10'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {result.parking.status === 'active' ? (
                        <CheckCircle className="h-6 w-6 text-success" />
                      ) : result.parking.status === 'expiring' ? (
                        <AlertCircle className="h-6 w-6 text-warning" />
                      ) : (
                        <XCircle className="h-6 w-6 text-destructive" />
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {result.parking.status === 'expired' 
                            ? 'Estacionamento Expirado' 
                            : 'Estacionamento Regular'
                          }
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Placa: <span className="font-mono font-bold">{result.parking.plate}</span>
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={result.parking.status} />
                  </div>
                </div>

                {/* Details */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">Zona</span>
                      </div>
                      <p className="font-semibold text-foreground">{result.parking.zone?.name || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">{result.parking.zone?.address || ''}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">Início</span>
                      </div>
                      <p className="font-semibold text-foreground">
                        {formatDateTime(result.parking.startTime)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">Término Previsto</span>
                      </div>
                      <p className="font-semibold text-foreground">
                        {formatDateTime(result.parking.expectedEndTime)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">Tempo Restante</span>
                      </div>
                      <p className={`font-semibold ${
                        result.parking.status === 'expired' 
                          ? 'text-destructive' 
                          : result.parking.status === 'expiring'
                          ? 'text-warning'
                          : 'text-success'
                      }`}>
                        {getTimeRemaining(result.parking)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <Car className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nenhum registro encontrado
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Não há estacionamento ativo para a placa <span className="font-mono font-bold">{searchPlate}</span>.
                  Verifique se a placa está correta ou se o veículo está estacionado em zona não regulamentada.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        {!hasSearched && (
          <div className="bg-muted/50 rounded-lg p-6">
            <h3 className="font-semibold text-foreground mb-3">Instruções para Fiscalização</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Digite a placa do veículo no formato ABC-1234 ou ABC1D23 (Mercosul)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Verifique o status do estacionamento: Ativo (verde), Expirando (amarelo) ou Expirado (vermelho)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Em caso de estacionamento expirado, proceda com a autuação conforme regulamentação vigente
              </li>
            </ul>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
