import { UserRound } from 'lucide-react';
import { User } from '../../types';
import { fullName } from '../../utils/formatters';

type ProfileCardProps = {
  user: User;
  admin?: boolean;
};

export function ProfileCard({ user, admin = false }: ProfileCardProps) {
  return (
    <aside className={`profile-card ${admin ? 'admin-profile' : ''}`}>
      <div className="avatar"><UserRound size={22} /></div>
      <div>
        <strong>{fullName(user)}</strong>
        <span>{user.email}</span>
        <small>{admin ? 'Administrador' : user.professionalProfile?.profession || 'Profesional'}</small>
      </div>
    </aside>
  );
}
