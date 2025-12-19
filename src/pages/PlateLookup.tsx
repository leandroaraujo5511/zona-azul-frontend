import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Search, Car, Clock, MapPin, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { mockActiveParkings, ActiveParking } from '@/services/mockData';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SearchResult {
  found: boolean;
  parking?: ActiveParking;
}

export default function PlateLookup() {
  const [searchPlate, setSearchPlate] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);

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

  const handleSearch = async () => {
    if (!searchPlate.trim()) return;

    setIsSearching(true);
    setResult(null);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600));

    const normalizedSearch = searchPlate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const foundParking = mockActiveParkings.find(p => 
      p.plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() === normalizedSearch
    );

    setResult({
      found: !!foundParking,
      parking: foundParking,
    });
    setIsSearching(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDateTime = (date: Date) => {
    return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const getTimeRemaining = (endTime: Date) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expirado';
    
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) {
      return `${minutes} minutos`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

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
                onChange={(e) => setSearchPlate(formatPlate(e.target.value))}
                onKeyPress={handleKeyPress}
                className="pl-12 h-14 text-lg font-mono uppercase tracking-wider"
                maxLength={8}
              />
            </div>
            <Button 
              onClick={handleSearch}
              disabled={isSearching || !searchPlate.trim()}
              className="h-14 px-8"
            >
              {isSearching ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-foreground border-t-transparent" />
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

          {/* Quick Search Suggestions */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Testar com:</span>
            {['ABC-1234', 'DEF-5678', 'GHI-9012'].map((plate) => (
              <button
                key={plate}
                onClick={() => {
                  setSearchPlate(plate);
                  setTimeout(handleSearch, 100);
                }}
                className="text-sm font-mono text-primary hover:underline"
              >
                {plate}
              </button>
            ))}
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="animate-slide-in">
            {result.found && result.parking ? (
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
                      <p className="font-semibold text-foreground">{result.parking.zoneName}</p>
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
                        <span className="text-sm">Término</span>
                      </div>
                      <p className="font-semibold text-foreground">
                        {formatDateTime(result.parking.endTime)}
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
                        {getTimeRemaining(result.parking.endTime)}
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
        {!result && (
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
