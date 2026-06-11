import { useCallback, useEffect, useState } from 'react';
import { BookingCalendar } from '../components/calendar/BookingCalendar';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingState } from '../components/common/LoadingState';
import { SectionHeading } from '../components/common/SectionHeading';
import { Footer } from '../components/layout/Footer';
import { Header } from '../components/layout/Header';
import { HeroSection } from '../components/marketing/HeroSection';
import { LeadCaptureForm } from '../components/marketing/LeadCaptureForm';
import { LocationBenefitsSection } from '../components/marketing/LocationBenefitsSection';
import { SpacesSection } from '../components/marketing/SpacesSection';
import { useCoreData } from '../hooks/useCoreData';
import { User } from '../types';

type PublicViewProps = {
  user?: User | null;
  onSignIn: () => void;
  onOpenPanel: () => void;
};

function resolveInitialSpaceId(spaces: { id: string }[]) {
  return spaces[0]?.id || '';
}

export function PublicView({ user, onSignIn, onOpenPanel }: PublicViewProps) {
  const { spaces, pricingModules, isLoading, error } = useCoreData();
  const [preferredSpaceId, setPreferredSpaceId] = useState('');

  useEffect(() => {
    if (!preferredSpaceId && spaces.length) {
      setPreferredSpaceId(resolveInitialSpaceId(spaces));
      return;
    }

    if (preferredSpaceId && spaces.length && !spaces.some((space) => space.id === preferredSpaceId)) {
      setPreferredSpaceId(resolveInitialSpaceId(spaces));
    }
  }, [preferredSpaceId, spaces]);

  const handleSpaceSelected = useCallback((spaceId: string) => setPreferredSpaceId(spaceId), []);

  return (
    <div className="public-view public-view-premium">
      <Header user={user} onSignIn={onSignIn} onOpenPanel={onOpenPanel} />
      <main>
        <HeroSection spaces={spaces} />
        <SpacesSection spaces={spaces} selectedSpaceId={preferredSpaceId} onSelectSpace={handleSpaceSelected} />
        <section className="section calendar-section calendar-section-premium" id="calendario">
          <SectionHeading
            title="Reservá en minutos"
            text="Seleccioná oficina, elegí duración y marcá un horario disponible."
          />
          {isLoading && <LoadingState label="Cargando espacios y módulos..." />}
          {error && <EmptyState title="Backend no disponible" text={error} />}
          {!isLoading && !error && (
            <BookingCalendar
              mode={user ? 'user' : 'public'}
              user={user || undefined}
              spaces={spaces}
              pricingModules={pricingModules}
              preferredSpaceId={preferredSpaceId}
              onSpaceSelected={handleSpaceSelected}
              onSignIn={onSignIn}
            />
          )}
        </section>

        <LocationBenefitsSection />
        <LeadCaptureForm spaces={spaces} />
      </main>
      <Footer />
    </div>
  );
}
