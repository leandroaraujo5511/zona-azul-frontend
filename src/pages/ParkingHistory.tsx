import { useState, useMemo } from 'react';
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
import { Calendar, Filter, Download, Clock, DollarSign, Car } from 'lucide-react';
import { mockParkingHistory, mockZones, ParkingHistory } from '@/services/mockData';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

export default function ParkingHistoryPage() {
  const [dateFilter, setDateFilter] = useState('');
  const [zoneFilter, setZoneFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDateTime = (date: Date) => {
    return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  const filteredData = useMemo(() => {
    return mockParkingHistory.filter(item => {
      if (zoneFilter !== 'all' && item.zoneId !== zoneFilter) return false;
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (dateFilter) {
        const itemDate = format(new Date(item.startTime), 'yyyy-MM-dd');
        if (itemDate !== dateFilter) return false;
      }
      return true;
    });
  }, [dateFilter, zoneFilter, statusFilter]);

  const totalCredits = filteredData.reduce((acc, item) => acc + item.creditsConsumed, 0);
  const totalDuration = filteredData.reduce((acc, item) => acc + item.duration, 0);

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
  };

  const columns = [
    {
      key: 'plate',
      header: 'Placa',
      render: (item: ParkingHistory) => (
        <span className="font-mono font-semibold text-foreground">{item.plate}</span>
      ),
    },
    {
      key: 'zoneName',
      header: 'Zona',
      render: (item: ParkingHistory) => (
        <span className="text-foreground">{item.zoneName}</span>
      ),
    },
    {
      key: 'startTime',
      header: 'Entrada',
      render: (item: ParkingHistory) => (
        <span className="text-muted-foreground">{formatDateTime(item.startTime)}</span>
      ),
    },
    {
      key: 'endTime',
      header: 'Saída',
      render: (item: ParkingHistory) => (
        <span className="text-muted-foreground">{formatDateTime(item.endTime)}</span>
      ),
    },
    {
      key: 'duration',
      header: 'Duração',
      render: (item: ParkingHistory) => (
        <div className="flex items-center gap-1 text-foreground">
          <Clock className="h-4 w-4 text-muted-foreground" />
          {formatDuration(item.duration)}
        </div>
      ),
    },
    {
      key: 'creditsConsumed',
      header: 'Créditos',
      render: (item: ParkingHistory) => (
        <span className="font-medium text-foreground">{formatCurrency(item.creditsConsumed)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: ParkingHistory) => <StatusBadge status={item.status} />,
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Car className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{filteredData.length}</p>
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
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Zona</Label>
              <Select value={zoneFilter} onValueChange={setZoneFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as zonas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as zonas</SelectItem>
                  {mockZones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="expired">Expirado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
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
        <DataTable
          columns={columns}
          data={filteredData}
          keyExtractor={(item) => item.id}
          emptyMessage="Nenhum registro encontrado com os filtros aplicados"
        />
      </div>
    </DashboardLayout>
  );
}
