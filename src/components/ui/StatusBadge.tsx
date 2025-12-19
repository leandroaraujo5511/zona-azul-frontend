import { cn } from '@/lib/utils';

type StatusType = 'active' | 'inactive' | 'expired' | 'expiring' | 'completed' | 'cancelled' | 'warning';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  active: { label: 'Ativo', className: 'status-badge-active' },
  inactive: { label: 'Inativo', className: 'status-badge-inactive' },
  expired: { label: 'Expirado', className: 'status-badge-expired' },
  expiring: { label: 'Expirando', className: 'status-badge-warning' },
  completed: { label: 'Concluído', className: 'status-badge-active' },
  cancelled: { label: 'Cancelado', className: 'status-badge-inactive' },
  warning: { label: 'Atenção', className: 'status-badge-warning' },
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span className={cn('status-badge', config.className)}>
      {label || config.label}
    </span>
  );
}
