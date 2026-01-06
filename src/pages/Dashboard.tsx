import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/ui/StatsCard';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { 
  Car, 
  DollarSign, 
  Users, 
  MapPin,
  Clock,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { parkingService } from '@/services/parking.service';
import { Parking } from '@/types/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  // Only fetch data if authenticated
  // Fetch dashboard metrics
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => parkingService.getDashboardMetrics(),
    refetchInterval: 60000, // Refetch every minute
    enabled: isAuthenticated, // Only fetch if authenticated
    retry: (failureCount, error: any) => {
      // Don't retry on 401 (unauthorized)
      if (error?.status === 401) return false;
      return failureCount < 2;
    },
  });

  // Fetch active parkings (combining active, expiring, expired statuses)
  // Note: We fetch all and filter on client side since API doesn't support multiple status filter
  const { data: parkingsData, isLoading: parkingsLoading, error: parkingsError } = useQuery({
    queryKey: ['active-parkings'],
    queryFn: async () => {
      const result = await parkingService.getAllParkings({ 
        page: 1,
        limit: 100 // Get more to filter active ones
      });
      return {
        ...result,
        data: result.data.filter(p => 
          ['active', 'expiring', 'expired'].includes(p.status) && !p.actualEndTime
        ).slice(0, 20) // Limit to 20 for display
      };
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: isAuthenticated, // Only fetch if authenticated
    retry: (failureCount, error: any) => {
      // Don't retry on 401 (unauthorized)
      if (error?.status === 401) return false;
      return failureCount < 2;
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatTime = (date: string | Date) => {
    return format(new Date(date), 'HH:mm', { locale: ptBR });
  };

  const formatDateTime = (date: string | Date) => {
    return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: ptBR });
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
      key: 'startTime',
      header: 'Início',
      render: (item: Parking) => (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="h-4 w-4" />
          {formatDateTime(item.startTime)}
        </div>
      ),
    },
    {
      key: 'expectedEndTime',
      header: 'Término Previsto',
      render: (item: Parking) => (
        <span className="text-muted-foreground">{formatDateTime(item.expectedEndTime)}</span>
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

  // Error handling
  if (metricsError) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h3 className="text-lg font-semibold">Erro ao carregar métricas</h3>
          <p className="text-muted-foreground">
            Não foi possível carregar os dados do dashboard.
          </p>
          <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
        </div>
      </DashboardLayout>
    );
  }

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
        {metricsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-lg border border-border p-6">
                <div className="flex items-center justify-center h-24">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Estacionamentos Ativos"
              value={metrics?.activeParkings || 0}
              icon={Car}
              variant="primary"
            />
            <StatsCard
              title="Arrecadação Hoje"
              value={formatCurrency(metrics?.totalRevenueToday || 0)}
              icon={DollarSign}
              variant="success"
            />
            <StatsCard
              title="Usuários Ativos"
              value={(metrics?.activeUsers || 0).toLocaleString('pt-BR')}
              icon={Users}
              variant="default"
            />
            <StatsCard
              title="Zonas Ativas"
              value={metrics?.registeredZones || 0}
              icon={MapPin}
              variant="warning"
            />
          </div>
        )}

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
          
          {parkingsLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : parkingsError ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4 border border-border rounded-lg">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-muted-foreground">Erro ao carregar estacionamentos ativos</p>
            </div>
          ) : parkingsData?.data && parkingsData.data.length > 0 ? (
            <DataTable
              columns={columns}
              data={parkingsData.data}
              keyExtractor={(item) => item.id}
            />
          ) : (
            <div className="flex items-center justify-center h-64 border border-border rounded-lg">
              <p className="text-muted-foreground">Nenhum estacionamento ativo no momento</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
