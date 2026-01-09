import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiscalLayout } from '@/components/layout/FiscalLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';
import { fiscalSettlementService } from '@/services/fiscal-settlement.service';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FiscalSettlement } from '@/types/fiscal-settlement';

export default function FiscalSettlements() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSettlement, setSelectedSettlement] = useState<FiscalSettlement | null>(null);
  const { toast } = useToast();

  const { data: settlementsData, isLoading } = useQuery({
    queryKey: ['fiscal-settlements', statusFilter],
    queryFn: () =>
      fiscalSettlementService.listSettlements({
        ...(statusFilter !== 'all' && { status: statusFilter as any }),
        page: 1,
        limit: 50,
      }),
  });

  const { data: settlementDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ['fiscal-settlement-details', selectedSettlement?.id],
    queryFn: () => fiscalSettlementService.getSettlementById(selectedSettlement!.id),
    enabled: !!selectedSettlement,
  });

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

    const icons: Record<string, any> = {
      pending: Clock,
      reviewed: FileText,
      approved: CheckCircle,
      rejected: XCircle,
    };

    const Icon = icons[status] || FileText;

    return (
      <Badge variant={variants[status] || 'outline'} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <FiscalLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Prestação de Contas</h1>
            <p className="text-muted-foreground mt-1">
              Visualize suas prestações de contas e estacionamentos avulsos
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="reviewed">Revisado</SelectItem>
                    <SelectItem value="approved">Aprovado</SelectItem>
                    <SelectItem value="rejected">Rejeitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settlements List */}
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
                <p>Nenhuma prestação de contas encontrada</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {settlementsData?.data.map((settlement) => (
              <Card key={settlement.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5" />
                        Período: {format(new Date(settlement.periodStart), 'dd/MM/yyyy', {
                          locale: ptBR,
                        })}{' '}
                        -{' '}
                        {format(new Date(settlement.periodEnd), 'dd/MM/yyyy', {
                          locale: ptBR,
                        })}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Criado em{' '}
                        {format(new Date(settlement.createdAt), 'dd/MM/yyyy HH:mm', {
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
                    Ver Detalhes
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Details Modal */}
        {selectedSettlement && (
          <Dialog open={!!selectedSettlement} onOpenChange={() => setSelectedSettlement(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Detalhes da Prestação de Contas</DialogTitle>
                <DialogDescription>
                  Período:{' '}
                  {format(new Date(selectedSettlement.periodStart), 'dd/MM/yyyy', {
                    locale: ptBR,
                  })}{' '}
                  -{' '}
                  {format(new Date(selectedSettlement.periodEnd), 'dd/MM/yyyy', {
                    locale: ptBR,
                  })}
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

                  {/* Review Info */}
                  {settlementDetails.reviewedAt && (
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm">
                        <strong>Revisado por:</strong> {settlementDetails.reviewer?.name || 'N/A'}
                      </p>
                      <p className="text-sm">
                        <strong>Data:</strong>{' '}
                        {format(new Date(settlementDetails.reviewedAt), 'dd/MM/yyyy HH:mm', {
                          locale: ptBR,
                        })}
                      </p>
                      {settlementDetails.observations && (
                        <p className="text-sm mt-2">
                          <strong>Observações:</strong> {settlementDetails.observations}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : null}
            </DialogContent>
          </Dialog>
        )}
      </div>
    </FiscalLayout>
  );
}

