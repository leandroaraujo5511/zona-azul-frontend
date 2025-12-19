import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Car, Mail, Lock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Por favor, informe o e-mail');
      return;
    }

    if (!email.includes('@')) {
      setError('Por favor, informe um e-mail válido');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    const success = await login(email, password);
    
    if (success) {
      toast({
        title: 'Login realizado com sucesso',
        description: 'Bem-vindo ao Sistema Zona Azul',
      });
      navigate('/dashboard');
    } else {
      setError('E-mail ou senha inválidos');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="flex items-center justify-center mb-8">
            <Car className="h-20 w-20 text-sidebar-primary" />
          </div>
          <h1 className="text-4xl font-bold text-sidebar-accent-foreground mb-4">
            Zona Azul
          </h1>
          <p className="text-lg text-sidebar-foreground">
            Sistema de Gerenciamento de Estacionamento Rotativo
          </p>
          <div className="mt-12 grid grid-cols-2 gap-6 text-left">
            <div className="bg-sidebar-accent rounded-lg p-4">
              <p className="text-2xl font-bold text-sidebar-primary">500+</p>
              <p className="text-sm text-sidebar-foreground">Vagas monitoradas</p>
            </div>
            <div className="bg-sidebar-accent rounded-lg p-4">
              <p className="text-2xl font-bold text-sidebar-primary">24/7</p>
              <p className="text-sm text-sidebar-foreground">Fiscalização ativa</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <Car className="h-12 w-12 text-primary" />
            <span className="ml-3 text-2xl font-bold text-foreground">Zona Azul</span>
          </div>

          <div className="bg-card rounded-xl border border-border p-8 shadow-lg">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground">Acesso ao Sistema</h2>
              <p className="text-muted-foreground mt-2">
                Entre com suas credenciais para continuar
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm animate-fade-in">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu.email@prefeitura.gov.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-foreground border-t-transparent" />
                    Entrando...
                  </div>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Use qualquer e-mail válido e senha com 6+ caracteres
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
