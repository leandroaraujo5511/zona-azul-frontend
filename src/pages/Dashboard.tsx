import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/ui/StatsCard';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { 
  Car, 
  DollarSign, 
  Users, 
  MapPin,
  Clock
} from 'lucide-react';
import { dashboardMetrics, mockActiveParkings, ActiveParking } from '@/services/mockData';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Dashboard() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatTime = (date: Date) => {
    return format(new Date(date), 'HH:mm', { locale: ptBR });
  };

  const columns = [
    {
      key: 'plate',
      header: 'Placa',
      render: (item: ActiveParking) => (
        <span className="font-mono font-semibold text-foreground">{item.plate}</span>
      ),
    },
    {
      key: 'zoneName',
      header: 'Zona',
      render: (item: ActiveParking) => (
        <span className="text-foreground">{item.zoneName}</span>
      ),
    },
    {
      key: 'startTime',
      header: 'Início',
      render: (item: ActiveParking) => (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="h-4 w-4" />
          {formatTime(item.startTime)}
        </div>
      ),
    },
    {
      key: 'endTime',
      header: 'Término',
      render: (item: ActiveParking) => (
        <span className="text-muted-foreground">{formatTime(item.endTime)}</span>
      ),
    },
    {
      key: 'creditsUsed',
      header: 'Créditos',
      render: (item: ActiveParking) => (
        <span className="font-medium text-foreground">{formatCurrency(item.creditsUsed)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: ActiveParking) => <StatusBadge status={item.status} />,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do sistema de estacionamento rotativo
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Estacionamentos Ativos"
            value={dashboardMetrics.activeParkings}
            icon={Car}
            variant="primary"
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Arrecadação Hoje"
            value={formatCurrency(dashboardMetrics.totalRevenueToday)}
            icon={DollarSign}
            variant="success"
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard
            title="Usuários Ativos"
            value={dashboardMetrics.activeUsers.toLocaleString('pt-BR')}
            icon={Users}
            variant="default"
          />
          <StatsCard
            title="Zonas Ativas"
            value={dashboardMetrics.registeredZones}
            icon={MapPin}
            variant="warning"
          />
        </div>

        {/* Active Parkings Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Estacionamentos Ativos
            </h2>
            <span className="text-sm text-muted-foreground">
              Atualizado em tempo real
            </span>
          </div>
          <DataTable
            columns={columns}
            data={mockActiveParkings}
            keyExtractor={(item) => item.id}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
