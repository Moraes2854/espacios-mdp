import { ProfileCard } from '../../components/common/ProfileCard';
import { User } from '../../types';

type UserProfilePageProps = {
  user: User;
};

export function UserProfilePage({ user }: UserProfilePageProps) {
  return (
    <section className="panel-card clean-panel">
      <h2>Perfil</h2>
      <ProfileCard user={user} />
      <div className="profile-data-grid">
        <div><span>Email</span><strong>{user.email}</strong></div>
        <div><span>Teléfono</span><strong>{user.phone || 'Sin cargar'}</strong></div>
        <div><span>Profesión</span><strong>{user.professionalProfile?.profession || 'Sin cargar'}</strong></div>
        <div><span>Documento</span><strong>{user.professionalProfile?.documentNumber || 'Sin cargar'}</strong></div>
        <div><span>Facturación</span><strong>{user.professionalProfile?.taxCondition || 'Pendiente'}</strong></div>
      </div>
    </section>
  );
}
