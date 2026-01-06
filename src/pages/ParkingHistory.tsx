import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, Filter, Download, Clock, DollarSign, Car, Loader2, AlertCircle } from 'lucide-react';
import { parkingService } from '@/services/parking.service';
import { zoneService } from '@/services/zone.service';
import { Parking, Zone } from '@/types/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

export default function ParkingHistoryPage() {
  const [dateFilter, setDateFilter] = useState('');
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const { toast } = useToast();

  // Fetch zones for filter
  const { data: zonesData } = useQuery({
    queryKey: ['zones'],
    queryFn: () => zoneService.getAllZones({ status: 'active' }),
  });

  // Build query params
  const queryParams: any = {
    page,
    limit: 20,
  };

  if (statusFilter !== 'all') {
    queryParams.status = statusFilter;
  }

  if (zoneFilter !== 'all') {
    queryParams.zoneId = zoneFilter;
  }

  if (dateFilter) {
    const startDate = new Date(dateFilter);
    startDate.setHours(0, 0, 0, 0);
    queryParams.startDate = startDate.toISOString();
    
    const endDate = new Date(dateFilter);
    endDate.setHours(23, 59, 59, 999);
    queryParams.endDate = endDate.toISOString();
  }

  // Fetch parkings
  const { data, isLoading, error } = useQuery({
    queryKey: ['parking-history', queryParams],
    queryFn: () => parkingService.getAllParkings(queryParams),
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDateTime = (date: string | Date) => {
    return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR });
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  const totalCredits = data?.data.reduce((acc, item) => acc + item.creditsUsed, 0) || 0;
  const totalDuration = data?.data.reduce((acc, item) => acc + (item.actualMinutes || 0), 0) || 0;

  const handleExport = () => {
    toast({
      title: 'Exportação iniciada',
      description: 'O relatório será baixado em breve.',
    });
  };

  const clearFilters = () => {
    setDateFilter('');
    setZoneFilter('all');
    setStatusFilter('all');
    setPage(1);
  };

  const columns = [
    {
      key: 'plate',
      header: 'Placa',
      render: (item: Parking) => (
        <span className="font-mono font-semibold text-foreground">{item.plate}</span>
      ),
    },
    {
      key: 'zone',
      header: 'Zona',
      render: (item: Parking) => (
        <span className="text-foreground">{item.zone?.name || 'N/A'}</span>
      ),
    },
    {
      key: 'user',
      header: 'Usuário',
      render: (item: Parking) => (
        <span className="text-foreground">{item.user?.name || 'N/A'}</span>
      ),
    },
    {
      key: 'startTime',
      header: 'Entrada',
      render: (item: Parking) => (
        <span className="text-muted-foreground">{formatDateTime(item.startTime)}</span>
      ),
    },
    {
      key: 'endTime',
      header: 'Saída',
      render: (item: Parking) => (
        <span className="text-muted-foreground">
          {item.actualEndTime ? formatDateTime(item.actualEndTime) : '-'}
        </span>
      ),
    },
    {
      key: 'duration',
      header: 'Duração',
      render: (item: Parking) => (
        <div className="flex items-center gap-1 text-foreground">
          <Clock className="h-4 w-4 text-muted-foreground" />
          {formatDuration(item.actualMinutes)}
        </div>
      ),
    },
    {
      key: 'creditsUsed',
      header: 'Créditos',
      render: (item: Parking) => (
        <span className="font-medium text-foreground">{formatCurrency(item.creditsUsed)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Parking) => <StatusBadge status={item.status} />,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Histórico de Estacionamentos</h1>
            <p className="text-muted-foreground">
              Consulte o histórico de todos os estacionamentos registrados
            </p>
          </div>
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>

        {/* Summary Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-center h-20">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Car className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{data?.pagination.total || 0}</p>
                  <p className="text-sm text-muted-foreground">Registros</p>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <DollarSign className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(totalCredits)}</p>
                  <p className="text-sm text-muted-foreground">Total Arrecadado</p>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{formatDuration(totalDuration)}</p>
                  <p className="text-sm text-muted-foreground">Tempo Total</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Filtros</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="date"
                  type="date"
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Zona</Label>
              <Select value={zoneFilter} onValueChange={(value) => {
                setZoneFilter(value);
                setPage(1);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as zonas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as zonas</SelectItem>
                  {zonesData?.data.map((zone: Zone) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="expired">Expirado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="expiring">Expirando</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="invisible">Ação</Label>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={clearFilters}
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64 bg-card border border-border rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 border border-destructive rounded-lg space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <p className="text-muted-foreground">Erro ao carregar histórico</p>
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={data?.data || []}
              keyExtractor={(item) => item.id}
              emptyMessage="Nenhum registro encontrado com os filtros aplicados"
            />
            
            {/* Pagination */}
            {data && data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Página {data.pagination.page} de {data.pagination.totalPages} ({data.pagination.total} registros)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                    disabled={page === data.pagination.totalPages}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
