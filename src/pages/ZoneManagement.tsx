import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { zoneService } from '@/services/zone.service';
import { Zone, CreateZoneRequest, UpdateZoneRequest } from '@/types/api';
import { useToast } from '@/hooks/use-toast';

export default function ZoneManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [zoneToDelete, setZoneToDelete] = useState<Zone | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    address: '',
    pricePerPeriod: '',
    periodMinutes: '',
    maxTimeMinutes: '',
    totalSpots: '',
    status: 'active' as 'active' | 'inactive',
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch zones
  const { data: zonesData, isLoading, error } = useQuery({
    queryKey: ['zones'],
    queryFn: () => zoneService.getAllZones(),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateZoneRequest) => zoneService.createZone(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
      toast({
        title: 'Zona criada',
        description: 'A zona foi criada com sucesso.',
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível criar a zona.',
        variant: 'destructive',
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateZoneRequest }) =>
      zoneService.updateZone(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
      toast({
        title: 'Zona atualizada',
        description: 'A zona foi atualizada com sucesso.',
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível atualizar a zona.',
        variant: 'destructive',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => zoneService.deleteZone(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
      toast({
        title: 'Zona excluída',
        description: 'A zona foi excluída com sucesso.',
      });
      setDeleteDialogOpen(false);
      setZoneToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível excluir a zona.',
        variant: 'destructive',
      });
    },
  });

  const zones = zonesData?.data || [];

  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numValue);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      address: '',
      pricePerPeriod: '',
      periodMinutes: '',
      maxTimeMinutes: '',
      totalSpots: '',
      status: 'active',
    });
    setEditingZone(null);
  };

  const handleOpenDialog = (zone?: Zone) => {
    if (zone) {
      setEditingZone(zone);
      setFormData({
        code: zone.code,
        name: zone.name,
        address: zone.address,
        pricePerPeriod: parseFloat(zone.pricePerPeriod).toString(),
        periodMinutes: zone.periodMinutes.toString(),
        maxTimeMinutes: zone.maxTimeMinutes.toString(),
        totalSpots: zone.totalSpots.toString(),
        status: zone.status,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSaveZone = () => {
    if (!formData.name || !formData.code || !formData.pricePerPeriod) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    const zoneData: CreateZoneRequest | UpdateZoneRequest = {
      code: formData.code,
      name: formData.name,
      address: formData.address,
      pricePerPeriod: parseFloat(formData.pricePerPeriod),
      periodMinutes: parseInt(formData.periodMinutes) || 60,
      maxTimeMinutes: parseInt(formData.maxTimeMinutes) || 120,
      totalSpots: parseInt(formData.totalSpots) || 50,
      status: formData.status,
    };

    if (editingZone) {
      updateMutation.mutate({ id: editingZone.id, data: zoneData });
    } else {
      createMutation.mutate(zoneData as CreateZoneRequest);
    }
  };

  const handleToggleStatus = (zone: Zone) => {
    updateMutation.mutate({
      id: zone.id,
      data: { status: zone.status === 'active' ? 'inactive' : 'active' },
    });
  };

  const handleDeleteClick = (zone: Zone) => {
    setZoneToDelete(zone);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (zoneToDelete) {
      deleteMutation.mutate(zoneToDelete.id);
    }
  };

  const columns = [
    {
      key: 'code',
      header: 'Código',
      render: (item: Zone) => (
        <span className="font-mono font-semibold text-primary">{item.code}</span>
      ),
    },
    {
      key: 'name',
      header: 'Nome da Zona',
      render: (item: Zone) => (
        <div>
          <p className="font-medium text-foreground">{item.name}</p>
          <p className="text-sm text-muted-foreground">{item.address}</p>
        </div>
      ),
    },
    {
      key: 'pricePerPeriod',
      header: 'Preço/Período',
      render: (item: Zone) => (
        <div>
          <p className="font-medium text-foreground">
            {formatCurrency(item.pricePerPeriod)}
          </p>
          <p className="text-sm text-muted-foreground">{item.periodMinutes} min</p>
        </div>
      ),
    },
    {
      key: 'maxTimeMinutes',
      header: 'Tempo Máx.',
      render: (item: Zone) => (
        <span className="text-foreground">{item.maxTimeMinutes} min</span>
      ),
    },
    {
      key: 'spots',
      header: 'Vagas',
      render: (item: Zone) => (
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{
                width: `${Math.min(100, (item.occupiedSpots / item.totalSpots) * 100)}%`,
              }}
            />
          </div>
          <span className="text-sm text-muted-foreground">
            {item.occupiedSpots}/{item.totalSpots}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Zone) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (item: Zone) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenDialog(item)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteClick(item)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Switch
            checked={item.status === 'active'}
            onCheckedChange={() => handleToggleStatus(item)}
            disabled={updateMutation.isPending}
          />
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestão de Zonas</h1>
            <p className="text-muted-foreground">
              Gerencie as zonas de estacionamento rotativo
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Zona
          </Button>
        </div>

        {/* Stats */}
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
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 border border-destructive rounded-lg space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <p className="text-muted-foreground">Erro ao carregar zonas</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{zones.length}</p>
                  <p className="text-sm text-muted-foreground">Total de Zonas</p>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <MapPin className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {zones.filter((z) => z.status === 'active').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Zonas Ativas</p>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <MapPin className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {zones.reduce((acc, z) => acc + z.totalSpots, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total de Vagas</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={zones}
            keyExtractor={(item) => item.id}
          />
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingZone ? 'Editar Zona' : 'Nova Zona'}
              </DialogTitle>
              <DialogDescription>
                {editingZone
                  ? 'Altere as informações da zona de estacionamento.'
                  : 'Preencha os dados para criar uma nova zona de estacionamento.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">
                    Código * {!editingZone && <span className="text-muted-foreground text-xs">(único)</span>}
                  </Label>
                  <Input
                    id="code"
                    placeholder="ZA-001"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    disabled={!!editingZone}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    placeholder="Centro Histórico"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Endereço *</Label>
                <Input
                  id="address"
                  placeholder="Rua XV de Novembro, 100"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pricePerPeriod">Preço por Período *</Label>
                  <Input
                    id="pricePerPeriod"
                    type="number"
                    step="0.01"
                    placeholder="3.50"
                    value={formData.pricePerPeriod}
                    onChange={(e) =>
                      setFormData({ ...formData, pricePerPeriod: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="periodMinutes">Duração Período (min) *</Label>
                  <Input
                    id="periodMinutes"
                    type="number"
                    placeholder="60"
                    value={formData.periodMinutes}
                    onChange={(e) =>
                      setFormData({ ...formData, periodMinutes: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxTimeMinutes">Tempo Máximo (min) *</Label>
                  <Input
                    id="maxTimeMinutes"
                    type="number"
                    placeholder="120"
                    value={formData.maxTimeMinutes}
                    onChange={(e) =>
                      setFormData({ ...formData, maxTimeMinutes: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalSpots">Total de Vagas *</Label>
                  <Input
                    id="totalSpots"
                    type="number"
                    placeholder="50"
                    value={formData.totalSpots}
                    onChange={(e) =>
                      setFormData({ ...formData, totalSpots: e.target.value })
                    }
                  />
                </div>
                {editingZone && (
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <div className="flex items-center space-x-2 pt-2">
                      <Switch
                        id="status"
                        checked={formData.status === 'active'}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            status: checked ? 'active' : 'inactive',
                          })
                        }
                      />
                      <Label htmlFor="status" className="cursor-pointer">
                        {formData.status === 'active' ? 'Ativa' : 'Inativa'}
                      </Label>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveZone}
                disabled={
                  createMutation.isPending ||
                  updateMutation.isPending ||
                  !formData.name ||
                  !formData.code ||
                  !formData.pricePerPeriod
                }
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {editingZone ? 'Salvar Alterações' : 'Criar Zona'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir a zona "{zoneToDelete?.name}"? Esta ação
                não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
