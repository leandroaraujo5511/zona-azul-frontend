import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, CheckCircle, FileText, Calendar, DollarSign, Car } from 'lucide-react';
import { notificationService } from '@/services/notification.service';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function NotificationLookup() {
  const { numero } = useParams<{ numero: string }>();
  const navigate = useNavigate();
  const [notificationNumber, setNotificationNumber] = useState(numero || '');

  const {
    data: notification,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['notification-public', numero],
    queryFn: () => notificationService.getNotificationByNumber(numero!),
    enabled: !!numero,
    retry: false,
  });

  const handleSearch = () => {
    if (!notificationNumber.trim()) {
      return;
    }
    navigate(`/notificacao/${notificationNumber.trim()}`);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
      pending: 'outline',
      recognized: 'secondary',
      paid: 'default',
      expired: 'destructive',
      converted: 'destructive',
    };

    const labels: Record<string, string> = {
      pending: 'Pendente',
      recognized: 'Reconhecida',
      paid: 'Paga',
      expired: 'Expirada',
      converted: 'Convertida em Multa',
    };

    return (
      <Badge variant={variants[status] || 'outline'} className="text-sm">
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src="/images/logo.png" alt="Picos Parking" width={80} height={80} />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Consulta de Notificação</h1>
          <p className="text-muted-foreground">
            Digite o número da notificação para consultar seu status
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Buscar Notificação</CardTitle>
            <CardDescription>Informe o número da notificação</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  value={notificationNumber}
                  onChange={(e) => setNotificationNumber(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Ex: 00000001"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Button onClick={handleSearch} disabled={!notificationNumber.trim()}>
                Buscar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {numero && (
          <Card>
            {isLoading ? (
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Buscando notificação...</p>
                </div>
              </CardContent>
            ) : error ? (
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Notificação não encontrada</h3>
                  <p className="text-muted-foreground mb-4">
                    Verifique se o número está correto e tente novamente.
                  </p>
                  <Button onClick={() => navigate('/notificacao')} variant="outline">
                    Nova Busca
                  </Button>
                </div>
              </CardContent>
            ) : notification ? (
              <>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Notificação #{notification.notificationNumber}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {getStatusBadge(notification.status)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Status Messages */}
                  {notification.status === 'pending' && (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        Esta notificação está pendente de reconhecimento. Por favor, reconheça a
                        notificação para prosseguir com o pagamento.
                      </p>
                    </div>
                  )}

                  {notification.status === 'recognized' && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        Esta notificação foi reconhecida. Você pode prosseguir com o pagamento.
                      </p>
                    </div>
                  )}

                  {notification.status === 'paid' && (
                    <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                          Notificação paga com sucesso!
                        </p>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        O valor foi convertido em créditos na sua conta.
                      </p>
                    </div>
                  )}

                  {notification.status === 'expired' && (
                    <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800 dark:text-red-200">
                        Esta notificação expirou e não pode mais ser paga. Entre em contato com a
                        prefeitura para mais informações.
                      </p>
                    </div>
                  )}

                  {notification.status === 'converted' && (
                    <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800 dark:text-red-200">
                        Esta notificação foi convertida em multa. Entre em contato com a prefeitura
                        para mais informações.
                      </p>
                    </div>
                  )}

                  {/* Notification Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                      <Car className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Placa do Veículo</p>
                        <p className="font-semibold">{notification.plate}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                      <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Valor</p>
                        <p className="font-semibold">R$ {Number(notification.amount).toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Data de Criação</p>
                        <p className="font-semibold">
                          {format(new Date(notification.createdAt), 'dd/MM/yyyy HH:mm', {
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Validade</p>
                        <p className="font-semibold">
                          {format(new Date(notification.expiresAt), 'dd/MM/yyyy', {
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                    {notification.status === 'pending' && (
                      <Button
                        onClick={() => navigate(`/notificacao/${notification.notificationNumber}/reconhecer`)}
                        className="w-full sm:w-auto"
                      >
                        Reconhecer Notificação
                      </Button>
                    )}

                    {notification.status === 'recognized' && (
                      <Button
                        onClick={() => navigate(`/notificacao/${notification.notificationNumber}/pagamento`)}
                        className="w-full sm:w-auto"
                      >
                        Realizar Pagamento
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      onClick={() => {
                        setNotificationNumber('');
                        navigate('/notificacao');
                      }}
                      className="w-full sm:w-auto"
                    >
                      Nova Busca
                    </Button>
                  </div>
                </CardContent>
              </>
            ) : null}
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>
            Dúvidas? Entre em contato com a prefeitura através dos canais oficiais.
          </p>
        </div>
      </div>
    </div>
  );
}

