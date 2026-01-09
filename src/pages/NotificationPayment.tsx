import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle, CheckCircle, Copy, QrCode, DollarSign } from 'lucide-react';
import { notificationService } from '@/services/notification.service';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function NotificationPayment() {
  const { numero } = useParams<{ numero: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Get notification data
  const { data: notification, isLoading: notificationLoading, refetch: refetchNotification } =
    useQuery({
      queryKey: ['notification-public', numero],
      queryFn: () => notificationService.getNotificationByNumber(numero!),
      enabled: !!numero,
      retry: false,
    });

  // Create payment
  const { mutate: createPayment, data: paymentData, isPending: isCreatingPayment } = useMutation({
    mutationFn: () => {
      if (!notification) throw new Error('Notification not found');
      return notificationService.createNotificationPayment(notification.id);
    },
    onError: (error: { message?: string }) => {
      toast({
        title: 'Erro ao gerar pagamento',
        description: error.message || 'Ocorreu um erro ao gerar o pagamento',
        variant: 'destructive',
      });
    },
  });

  // Poll payment status - check notification status instead
  useEffect(() => {
    if (notification && notification.status === 'recognized' && paymentData) {
      const interval = setInterval(() => {
        refetchNotification();
      }, 3000); // Poll every 3 seconds

      return () => clearInterval(interval);
    }
  }, [notification, paymentData, refetchNotification]);

  const handleCopyPixCode = () => {
    if (paymentData?.payment.qrCodeText) {
      navigator.clipboard.writeText(paymentData.payment.qrCodeText);
      setCopied(true);
      toast({
        title: 'Código copiado',
        description: 'Código PIX copiado para a área de transferência',
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Auto-create payment when notification is recognized
  useEffect(() => {
    if (notification && notification.status === 'recognized' && !paymentData && !isCreatingPayment) {
      createPayment();
    }
  }, [notification, paymentData, isCreatingPayment, createPayment]);

  if (notificationLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Carregando notificação...</p>
        </div>
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Notificação não encontrada</h3>
              <p className="text-muted-foreground mb-4">
                A notificação informada não foi encontrada.
              </p>
              <Button onClick={() => navigate('/notificacao')} variant="outline">
                Voltar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (notification.status === 'paid') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="h-16 w-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Pagamento Realizado com Sucesso!</h2>
                <p className="text-muted-foreground mb-6">
                  O valor de R$ {Number(notification.amount).toFixed(2)} foi convertido em créditos
                  na sua conta.
                </p>
                <Button onClick={() => navigate('/notificacao')} variant="outline">
                  Nova Consulta
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (notification.status !== 'recognized') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Notificação não reconhecida</h3>
              <p className="text-muted-foreground mb-4">
                Por favor, reconheça a notificação antes de realizar o pagamento.
              </p>
              <Button
                onClick={() => navigate(`/notificacao/${numero}/reconhecer`)}
                variant="outline"
              >
                Reconhecer Notificação
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src="/images/logo.png" alt="Picos Parking" width={80} height={80} />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Pagamento da Notificação</h1>
          <p className="text-muted-foreground">
            Notificação #{notification.notificationNumber} - Placa: {notification.plate}
          </p>
        </div>

        {/* Payment Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Resumo do Pagamento</span>
              <Badge variant="outline">Reconhecida</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor da Notificação:</span>
                <span className="font-semibold">R$ {Number(notification.amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total a Pagar:</span>
                <span className="text-primary">R$ {Number(notification.amount).toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Forma de Pagamento: PIX
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                O pagamento via PIX é processado instantaneamente. Após a confirmação, o valor será
                convertido em créditos na sua conta.
              </p>
            </div>

            {/* QR Code */}
            {isCreatingPayment && (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Gerando código de pagamento...</p>
              </div>
            )}

            {paymentData?.payment && (
              <div className="space-y-4">
                {paymentData.payment.qrCode && (
                  <div className="flex flex-col items-center gap-4 p-6 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <QrCode className="h-5 w-5 text-muted-foreground" />
                      <Label className="text-sm font-semibold">QR Code PIX</Label>
                    </div>
                    <img
                      src={paymentData.payment.qrCode}
                      alt="QR Code PIX"
                      className="w-64 h-64 border-2 border-border rounded-lg bg-white p-2"
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      Escaneie o QR Code com o aplicativo do seu banco
                    </p>
                  </div>
                )}

                {paymentData.payment.qrCodeText && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Código PIX (Copiar e Colar)</Label>
                    <div className="flex gap-2">
                      <Input
                        value={paymentData.payment.qrCodeText}
                        readOnly
                        className="font-mono text-xs flex-1"
                      />
                      <Button
                        onClick={handleCopyPixCode}
                        variant="outline"
                        size="icon"
                        title="Copiar código PIX"
                      >
                        {copied ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Copie o código e cole no aplicativo do seu banco para realizar o pagamento
                    </p>
                  </div>
                )}

                {paymentData.payment.expiresAt && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Atenção:</strong> Este código expira em{' '}
                      {format(new Date(paymentData.payment.expiresAt), 'dd/MM/yyyy HH:mm', {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => navigate(`/notificacao/${numero}`)}
                className="flex-1"
              >
                Voltar
              </Button>
              {!paymentData && (
                <Button onClick={() => createPayment()} className="flex-1" disabled={isCreatingPayment}>
                  {isCreatingPayment ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    'Gerar Código PIX'
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            Após o pagamento ser confirmado, você receberá os créditos automaticamente na sua conta.
          </p>
        </div>
      </div>
    </div>
  );
}

