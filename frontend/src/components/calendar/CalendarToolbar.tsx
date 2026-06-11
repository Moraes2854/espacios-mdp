import { PricingModule, Space } from '../../types';
import { PricingModuleSelector } from './PricingModuleSelector';
import { SpaceSelector } from './SpaceSelector';

type CalendarToolbarProps = {
  spaces: Space[];
  selectedSpace?: Space;
  spaceId: string;
  moduleId: string;
  selectedModule?: PricingModule;
  pricingModules: PricingModule[];
  onSpaceChange: (spaceId: string) => void;
  onModuleChange: (moduleId: string) => void;
};

export function CalendarToolbar({
  spaces,
  selectedSpace,
  spaceId,
  moduleId,
  pricingModules,
  onSpaceChange,
  onModuleChange,
}: CalendarToolbarProps) {
  return (
    <div className="calendar-toolbar calendar-toolbar-premium">
      <SpaceSelector
        spaces={spaces}
        selectedSpace={selectedSpace}
        selectedSpaceId={spaceId}
        onSpaceChange={onSpaceChange}
      />

      <PricingModuleSelector
        modules={pricingModules}
        selectedModuleId={moduleId}
        onModuleChange={onModuleChange}
      />
    </div>
  );
}
