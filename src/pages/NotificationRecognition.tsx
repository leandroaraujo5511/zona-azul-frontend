import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { notificationService } from '@/services/notification.service';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

// CPF mask function
const maskCPF = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14);
};

// Phone mask function
const maskPhone = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{4,5})(\d{4})$/, '$1-$2')
    .slice(0, 15);
};

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
}

export default function NotificationRecognition() {
  const { numero } = useParams<{ numero: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [cpf, setCpf] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSearchingUser, setIsSearchingUser] = useState(false);

  // Get notification data
  const { data: notification, isLoading: notificationLoading } = useQuery({
    queryKey: ['notification-public', numero],
    queryFn: () => notificationService.getNotificationByNumber(numero!),
    enabled: !!numero,
    retry: false,
  });

  // Search user by CPF
  const searchUserByCpf = async (cpfValue: string) => {
    if (!cpfValue || cpfValue.replace(/\D/g, '').length !== 11) {
      return;
    }

    setIsSearchingUser(true);
    try {
      const normalizedCpf = cpfValue.replace(/\D/g, '');
      const response = await api.get<{ found: boolean; user?: User }>(
        `/users/by-cpf/${normalizedCpf}`
      );

      if (response.data.found && response.data.user) {
        const user = response.data.user;
        setName(user.name || '');
        setEmail(user.email || '');
        setPhone(user.phone || '');
        toast({
          title: 'Usuário encontrado',
          description: 'Dados do usuário foram preenchidos automaticamente',
        });
      }
    } catch (error: any) {
      // User not found or error - that's ok, they'll fill the form
      // Don't show error toast for 404 (user not found)
      if (error?.status !== 404) {
        console.log('Error searching user:', error);
      }
    } finally {
      setIsSearchingUser(false);
    }
  };

  const { mutate: recognizeNotification, isPending } = useMutation({
    mutationFn: (data: {
      cpf: string;
      name: string;
      email: string;
      phone?: string;
      address?: string;
    }) => notificationService.recognizeNotification(numero!, data),
    onSuccess: (data) => {
      toast({
        title: 'Notificação reconhecida',
        description: 'Redirecionando para o pagamento...',
      });
      setTimeout(() => {
        navigate(`/notificacao/${numero}/pagamento`);
      }, 1500);
    },
    onError: (error: { message?: string }) => {
      toast({
        title: 'Erro ao reconhecer notificação',
        description: error.message || 'Ocorreu um erro ao reconhecer a notificação',
        variant: 'destructive',
      });
    },
  });

  const handleCpfBlur = () => {
    if (cpf.replace(/\D/g, '').length === 11) {
      searchUserByCpf(cpf);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!cpf || cpf.replace(/\D/g, '').length !== 11) {
      toast({
        title: 'CPF inválido',
        description: 'Por favor, informe um CPF válido',
        variant: 'destructive',
      });
      return;
    }

    if (!name.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, informe seu nome completo',
        variant: 'destructive',
      });
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      toast({
        title: 'Email inválido',
        description: 'Por favor, informe um email válido',
        variant: 'destructive',
      });
      return;
    }

    recognizeNotification({
      cpf: cpf.replace(/\D/g, ''),
      name: name.trim(),
      email: email.trim(),
      phone: phone ? phone.replace(/\D/g, '') : undefined,
      address: address.trim() || undefined,
    });
  };

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

  if (notification.status !== 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Notificação já processada</h3>
              <p className="text-muted-foreground mb-4">
                Esta notificação já foi reconhecida ou está em outro status.
              </p>
              <Button onClick={() => navigate(`/notificacao/${numero}`)} variant="outline">
                Voltar
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Reconhecer Notificação</h1>
          <p className="text-muted-foreground">
            Notificação #{notification.notificationNumber} - Placa: {notification.plate}
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Dados Pessoais</CardTitle>
            <CardDescription>
              Preencha seus dados para reconhecer a notificação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Plate (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="plate">Placa do Veículo</Label>
                <Input
                  id="plate"
                  value={notification.plate}
                  readOnly
                  className="bg-muted"
                />
              </div>

              {/* CPF */}
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <div className="relative">
                  <Input
                    id="cpf"
                    value={cpf}
                    onChange={(e) => setCpf(maskCPF(e.target.value))}
                    onBlur={handleCpfBlur}
                    placeholder="000.000.000-00"
                    required
                    maxLength={14}
                    disabled={isSearchingUser}
                  />
                  {isSearchingUser && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Ao preencher o CPF, o sistema buscará seus dados automaticamente se você já
                  tiver cadastro.
                </p>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone (Opcional)</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(maskPhone(e.target.value))}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Endereço (Opcional)</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Rua, número, bairro, cidade"
                />
              </div>

              {/* Submit */}
              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/notificacao/${numero}`)}
                  className="flex-1"
                  disabled={isPending}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Reconhecer e Continuar
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

