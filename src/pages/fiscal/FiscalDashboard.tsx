import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiscalLayout } from '@/components/layout/FiscalLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, AlertCircle, CheckCircle, Loader2, FileText, Car, DollarSign } from 'lucide-react';
import { parkingService } from '@/services/parking.service';
import { notificationService } from '@/services/notification.service';
import { fiscalParkingService } from '@/services/fiscal-parking.service';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CreateNotificationModal } from '@/components/fiscal/CreateNotificationModal';
import { CreateFiscalParkingModal } from '@/components/fiscal/CreateFiscalParkingModal';

export default function FiscalDashboard() {
  const [plate, setPlate] = useState('');
  const [searchPlate, setSearchPlate] = useState('');
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showParkingModal, setShowParkingModal] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Search parking by plate
  const {
    data: parkingData,
    isLoading: parkingLoading,
    refetch: refetchParking,
  } = useQuery({
    queryKey: ['parking-by-plate', searchPlate],
    queryFn: () => parkingService.getParkingByPlate(searchPlate),
    enabled: !!searchPlate,
    retry: false,
  });

  // Get fiscal statistics
  const { data: statistics } = useQuery({
    queryKey: ['fiscal-statistics'],
    queryFn: () => fiscalParkingService.getFiscalStatistics(),
    refetchInterval: 60000, // Refetch every minute
  });

  // Get recent notifications
  const { data: notificationsData } = useQuery({
    queryKey: ['fiscal-notifications'],
    queryFn: () => notificationService.listNotifications({ page: 1, limit: 5 }),
  });

  const handleSearch = () => {
    if (!plate.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor, informe uma placa',
        variant: 'destructive',
      });
      return;
    }
    setSearchPlate(plate.toUpperCase().replace(/[^A-Z0-9]/g, ''));
  };

  const handleCreateNotification = () => {
    if (!parkingData?.parking && !searchPlate) {
      toast({
        title: 'Erro',
        description: 'Por favor, consulte uma placa primeiro',
        variant: 'destructive',
      });
      return;
    }
    setShowNotificationModal(true);
  };

  const canCreateNotification =
    parkingData?.found === false ||
    (parkingData?.canCreateNotification === true && parkingData?.parking);

  return (
    <FiscalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard do Fiscal</h1>
          <p className="text-muted-foreground mt-1">
            Bem-vindo, {user?.name}. Consulte placas e gerencie estacionamentos.
          </p>
        </div>

        {/* Plate Search */}
        <Card>
          <CardHeader>
            <CardTitle>Consulta de Placa</CardTitle>
            <CardDescription>Consulte o status de uma placa para verificar se está regular</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="plate">Placa do Veículo</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="plate"
                    placeholder="ABC1234 ou ABC-1234"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <Button onClick={handleSearch} disabled={parkingLoading}>
                  {parkingLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Consultando...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Consultar
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Search Results */}
            {searchPlate && (
              <div className="mt-4">
                {parkingLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : parkingData ? (
                  <div className="space-y-4">
                    {parkingData.found && parkingData.parking ? (
                      <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              REGULAR
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <p>
                            <strong>Placa:</strong> {parkingData.parking.plate}
                          </p>
                          <p>
                            <strong>Zona:</strong> {parkingData.parking.zone?.name}
                          </p>
                          <p>
                            <strong>Início:</strong>{' '}
                            {format(new Date(parkingData.parking.startTime), 'dd/MM/yyyy HH:mm', {
                              locale: ptBR,
                            })}
                          </p>
                          <p>
                            <strong>Fim esperado:</strong>{' '}
                            {format(
                              new Date(parkingData.parking.expectedEndTime),
                              'dd/MM/yyyy HH:mm',
                              { locale: ptBR }
                            )}
                          </p>
                          {parkingData.parking.timeRemaining !== undefined && (
                            <p>
                              <strong>Tempo restante:</strong>{' '}
                              {Math.floor(parkingData.parking.timeRemaining / 60)} minutos
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="border rounded-lg p-4 bg-red-50 dark:bg-red-950">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                            <Badge variant="outline" className="bg-red-100 text-red-800">
                              IRREGULAR
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm mb-4">
                          {parkingData.reason ||
                            'Nenhum estacionamento ativo encontrado para esta placa.'}
                        </p>
                        {canCreateNotification && (
                          <Button onClick={handleCreateNotification} variant="destructive">
                            <FileText className="mr-2 h-4 w-4" />
                            Criar Notificação
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={() => setShowNotificationModal(true)}
                variant="outline"
                className="w-full justify-start"
              >
                <FileText className="mr-2 h-4 w-4" />
                Criar Notificação
              </Button>
              <Button
                onClick={() => setShowParkingModal(true)}
                variant="outline"
                className="w-full justify-start"
              >
                <Car className="mr-2 h-4 w-4" />
                Criar Estacionamento Avulso
              </Button>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Estatísticas Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statistics ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total de Estacionamentos:</span>
                    <span className="font-semibold">{statistics.totalParkings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Arrecadado:</span>
                    <span className="font-semibold">
                      R$ {statistics.totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PIX Pendentes:</span>
                    <span className="font-semibold">{statistics.pendingPixPayments}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Notificações Recentes</CardTitle>
            <CardDescription>Últimas notificações criadas</CardDescription>
          </CardHeader>
          <CardContent>
            {notificationsData?.data.length ? (
              <div className="space-y-2">
                {notificationsData.data.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">#{notification.notificationNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        Placa: {notification.plate} •{' '}
                        {format(new Date(notification.createdAt), 'dd/MM/yyyy HH:mm', {
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                    <Badge variant="outline">{notification.status}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Nenhuma notificação criada ainda
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      {showNotificationModal && (
        <CreateNotificationModal
          open={showNotificationModal}
          onClose={() => setShowNotificationModal(false)}
          defaultPlate={searchPlate}
          onSuccess={() => {
            setShowNotificationModal(false);
            refetchParking();
            toast({
              title: 'Sucesso',
              description: 'Notificação criada com sucesso',
            });
          }}
        />
      )}

      {showParkingModal && (
        <CreateFiscalParkingModal
          open={showParkingModal}
          onClose={() => setShowParkingModal(false)}
          onSuccess={() => {
            setShowParkingModal(false);
            toast({
              title: 'Sucesso',
              description: 'Estacionamento avulso criado com sucesso',
            });
          }}
        />
      )}
    </FiscalLayout>
  );
}

