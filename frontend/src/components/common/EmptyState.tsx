import { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

type EmptyStateProps = {
  title: string;
  text?: string;
  action?: ReactNode;
};

export function EmptyState({ title, text, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <AlertCircle size={22} />
      <strong>{title}</strong>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}
