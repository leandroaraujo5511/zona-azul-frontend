import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Receipt,
  Loader2,
  Calendar,
  DollarSign,
  FileText,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
} from 'lucide-react';
import { fiscalSettlementService } from '@/services/fiscal-settlement.service';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FiscalSettlement } from '@/types/fiscal-settlement';

export default function AdminSettlementReview() {
  const [selectedSettlement, setSelectedSettlement] = useState<FiscalSettlement | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected'>('approved');
  const [observations, setObservations] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settlementsData, isLoading } = useQuery({
    queryKey: ['admin-pending-settlements'],
    queryFn: () => fiscalSettlementService.getPendingSettlements(),
  });

  const { data: settlementDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ['admin-settlement-details', selectedSettlement?.id],
    queryFn: () => fiscalSettlementService.getSettlementById(selectedSettlement!.id),
    enabled: !!selectedSettlement,
  });

  const { mutate: reviewSettlement, isPending: isReviewing } = useMutation({
    mutationFn: (data: { id: string; status: 'approved' | 'rejected'; observations?: string }) =>
      fiscalSettlementService.reviewSettlement(data.id, {
        status: data.status,
        observations: data.observations,
      }),
    onSuccess: () => {
      toast({
        title: 'Prestação de contas revisada',
        description: 'A prestação de contas foi revisada com sucesso',
      });
      setSelectedSettlement(null);
      setObservations('');
      queryClient.invalidateQueries({ queryKey: ['admin-pending-settlements'] });
    },
    onError: (error: { message?: string }) => {
      toast({
        title: 'Erro ao revisar prestação de contas',
        description: error.message || 'Ocorreu um erro ao revisar a prestação de contas',
        variant: 'destructive',
      });
    },
  });

  const handleReview = () => {
    if (!selectedSettlement) return;

    reviewSettlement({
      id: selectedSettlement.id,
      status: reviewStatus,
      observations: observations.trim() || undefined,
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
      pending: 'outline',
      reviewed: 'secondary',
      approved: 'default',
      rejected: 'destructive',
    };

    const labels: Record<string, string> = {
      pending: 'Pendente',
      reviewed: 'Revisado',
      approved: 'Aprovado',
      rejected: 'Rejeitado',
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Revisão de Prestações de Contas</h1>
          <p className="text-muted-foreground mt-1">
            Revise e aprove ou rejeite as prestações de contas dos fiscais
          </p>
        </div>

        {/* Pending Settlements List */}
        {isLoading ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            </CardContent>
          </Card>
        ) : settlementsData?.data.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma prestação de contas pendente</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {settlementsData?.data.map((settlement) => (
              <Card key={settlement.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5" />
                        Fiscal: {settlement.fiscal.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Período: {format(new Date(settlement.periodStart), 'dd/MM/yyyy', {
                          locale: ptBR,
                        })}{' '}
                        -{' '}
                        {format(new Date(settlement.periodEnd), 'dd/MM/yyyy', {
                          locale: ptBR,
                        })}
                      </CardDescription>
                    </div>
                    {getStatusBadge(settlement.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Total de Estacionamentos</p>
                      <p className="text-lg font-semibold">{settlement.totalParkings}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total PIX</p>
                      <p className="text-lg font-semibold">
                        R$ {settlement.totalPixAmount.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Dinheiro</p>
                      <p className="text-lg font-semibold">
                        R$ {settlement.totalCashAmount.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Geral</p>
                      <p className="text-lg font-semibold text-primary">
                        R$ {settlement.totalAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setSelectedSettlement(settlement)}
                    variant="outline"
                    className="w-full"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Revisar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Review Dialog */}
        {selectedSettlement && (
          <Dialog open={!!selectedSettlement} onOpenChange={() => setSelectedSettlement(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Revisar Prestação de Contas</DialogTitle>
                <DialogDescription>
                  Fiscal: {selectedSettlement.fiscal.name} ({selectedSettlement.fiscal.email})
                </DialogDescription>
              </DialogHeader>

              {detailsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : settlementDetails ? (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                    <div>
                      <p className="text-xs text-muted-foreground">Total de Estacionamentos</p>
                      <p className="text-2xl font-bold">{settlementDetails.totalParkings}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">PIX</p>
                      <p className="text-2xl font-bold">
                        R$ {settlementDetails.totalPixAmount.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {settlementDetails.pixPaymentsCount} pagamentos
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Dinheiro</p>
                      <p className="text-2xl font-bold">
                        R$ {settlementDetails.totalCashAmount.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {settlementDetails.cashPaymentsCount} pagamentos
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Geral</p>
                      <p className="text-2xl font-bold text-primary">
                        R$ {settlementDetails.totalAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Parkings List */}
                  {settlementDetails.parkings && settlementDetails.parkings.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Estacionamentos do Período</h3>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {settlementDetails.parkings.map((parking) => (
                          <div
                            key={parking.id}
                            className="p-3 border rounded-lg flex items-center justify-between"
                          >
                            <div className="flex-1">
                              <p className="font-medium">{parking.plate}</p>
                              <p className="text-sm text-muted-foreground">
                                {parking.zone.name} •{' '}
                                {format(new Date(parking.startTime), 'dd/MM/yyyy HH:mm', {
                                  locale: ptBR,
                                })}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">R$ {parking.amount.toFixed(2)}</p>
                              <Badge variant="outline" className="text-xs">
                                {parking.paymentMethod === 'pix' ? 'PIX' : 'Dinheiro'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Review Form */}
                  <div className="space-y-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label>Decisão *</Label>
                      <Select
                        value={reviewStatus}
                        onValueChange={(v) => setReviewStatus(v as 'approved' | 'rejected')}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="approved">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              Aprovar
                            </div>
                          </SelectItem>
                          <SelectItem value="rejected">
                            <div className="flex items-center gap-2">
                              <XCircle className="h-4 w-4 text-red-600" />
                              Rejeitar
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="observations">Observações (Opcional)</Label>
                      <Textarea
                        id="observations"
                        value={observations}
                        onChange={(e) => setObservations(e.target.value)}
                        placeholder="Adicione observações sobre a revisão..."
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedSettlement(null);
                    setObservations('');
                    setReviewStatus('approved');
                  }}
                  disabled={isReviewing}
                >
                  Cancelar
                </Button>
                <Button onClick={handleReview} disabled={isReviewing}>
                  {isReviewing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      {reviewStatus === 'approved' ? (
                        <CheckCircle className="mr-2 h-4 w-4" />
                      ) : (
                        <XCircle className="mr-2 h-4 w-4" />
                      )}
                      {reviewStatus === 'approved' ? 'Aprovar' : 'Rejeitar'}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}

