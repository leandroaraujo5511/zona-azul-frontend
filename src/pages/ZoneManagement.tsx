import { useState } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, MapPin } from 'lucide-react';
import { mockZones, Zone } from '@/services/mockData';
import { useToast } from '@/hooks/use-toast';

export default function ZoneManagement() {
  const [zones, setZones] = useState<Zone[]>(mockZones);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    pricePerPeriod: '',
    periodMinutes: '',
    maxTimeMinutes: '',
    totalSpots: '',
    address: '',
  });
  const { toast } = useToast();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleOpenDialog = (zone?: Zone) => {
    if (zone) {
      setEditingZone(zone);
      setFormData({
        name: zone.name,
        code: zone.code,
        pricePerPeriod: zone.pricePerPeriod.toString(),
        periodMinutes: zone.periodMinutes.toString(),
        maxTimeMinutes: zone.maxTimeMinutes.toString(),
        totalSpots: zone.totalSpots.toString(),
        address: zone.address,
      });
    } else {
      setEditingZone(null);
      setFormData({
        name: '',
        code: '',
        pricePerPeriod: '',
        periodMinutes: '',
        maxTimeMinutes: '',
        totalSpots: '',
        address: '',
      });
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

    if (editingZone) {
      setZones(zones.map(z => 
        z.id === editingZone.id 
          ? {
              ...z,
              name: formData.name,
              code: formData.code,
              pricePerPeriod: parseFloat(formData.pricePerPeriod),
              periodMinutes: parseInt(formData.periodMinutes),
              maxTimeMinutes: parseInt(formData.maxTimeMinutes),
              totalSpots: parseInt(formData.totalSpots),
              address: formData.address,
            }
          : z
      ));
      toast({
        title: 'Zona atualizada',
        description: `A zona "${formData.name}" foi atualizada com sucesso.`,
      });
    } else {
      const newZone: Zone = {
        id: Date.now().toString(),
        name: formData.name,
        code: formData.code,
        pricePerPeriod: parseFloat(formData.pricePerPeriod),
        periodMinutes: parseInt(formData.periodMinutes) || 60,
        maxTimeMinutes: parseInt(formData.maxTimeMinutes) || 120,
        totalSpots: parseInt(formData.totalSpots) || 50,
        occupiedSpots: 0,
        status: 'active',
        address: formData.address,
      };
      setZones([...zones, newZone]);
      toast({
        title: 'Zona criada',
        description: `A zona "${formData.name}" foi criada com sucesso.`,
      });
    }
    setIsDialogOpen(false);
  };

  const handleToggleStatus = (zone: Zone) => {
    setZones(zones.map(z => 
      z.id === zone.id 
        ? { ...z, status: z.status === 'active' ? 'inactive' : 'active' }
        : z
    ));
    toast({
      title: zone.status === 'active' ? 'Zona desativada' : 'Zona ativada',
      description: `A zona "${zone.name}" foi ${zone.status === 'active' ? 'desativada' : 'ativada'}.`,
    });
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
          <p className="font-medium text-foreground">{formatCurrency(item.pricePerPeriod)}</p>
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
              style={{ width: `${(item.occupiedSpots / item.totalSpots) * 100}%` }}
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
          <Switch
            checked={item.status === 'active'}
            onCheckedChange={() => handleToggleStatus(item)}
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
                  {zones.filter(z => z.status === 'active').length}
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

        {/* Table */}
        <DataTable
          columns={columns}
          data={zones}
          keyExtractor={(item) => item.id}
        />

        {/* Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingZone ? 'Editar Zona' : 'Nova Zona'}
              </DialogTitle>
              <DialogDescription>
                {editingZone 
                  ? 'Altere as informações da zona de estacionamento.'
                  : 'Preencha os dados para criar uma nova zona de estacionamento.'
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Código *</Label>
                  <Input
                    id="code"
                    placeholder="ZA-001"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
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
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  placeholder="Rua XV de Novembro, Centro"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço por Período (R$) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.50"
                    placeholder="3.50"
                    value={formData.pricePerPeriod}
                    onChange={(e) => setFormData({ ...formData, pricePerPeriod: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period">Período (min)</Label>
                  <Input
                    id="period"
                    type="number"
                    placeholder="60"
                    value={formData.periodMinutes}
                    onChange={(e) => setFormData({ ...formData, periodMinutes: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxTime">Tempo Máximo (min)</Label>
                  <Input
                    id="maxTime"
                    type="number"
                    placeholder="120"
                    value={formData.maxTimeMinutes}
                    onChange={(e) => setFormData({ ...formData, maxTimeMinutes: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spots">Total de Vagas</Label>
                  <Input
                    id="spots"
                    type="number"
                    placeholder="50"
                    value={formData.totalSpots}
                    onChange={(e) => setFormData({ ...formData, totalSpots: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveZone}>
                {editingZone ? 'Salvar' : 'Criar Zona'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
