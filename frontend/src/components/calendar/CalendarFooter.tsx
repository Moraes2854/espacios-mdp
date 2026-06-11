import { CalendarCheck, Clock, MapPin, ReceiptText, ShieldCheck } from 'lucide-react';
import { PricingModule, SessionMode, Space } from '../../types';
import { SelectedRange } from '../../utils/calendar';
import { formatDurationHours, formatLongDate, formatMoney, formatTime } from '../../utils/formatters';
import { isBestHourlyRate, moduleDisplayName, moduleSecondaryLabel } from '../../utils/pricingModules';
import { PaymentActions } from './PaymentActions';

type CalendarFooterProps = {
  mode: SessionMode;
  selected: SelectedRange | null;
  selectedBlocks: SelectedRange[];
  selectedModule?: PricingModule;
  selectedSpace?: Space;
  spaceId: string;
  requiredBlocks: number;
  blockHours: number;
  isWeekly: boolean;
  isSelectionComplete: boolean;
  onCreateBooking: () => void;
};

function spaceSubtitle(space?: Space) {
  if (!space) return 'Seleccioná un espacio';
  return [space.address, space.floor].filter(Boolean).join(' · ') || space.name;
}

function selectedTimeLabel(selected: SelectedRange | null) {
  if (!selected) return 'Pendiente';
  return `${formatTime(selected.startAt)} — ${formatTime(selected.endAt)}`;
}

function blockLabel(block: SelectedRange, index: number) {
  return `Bloque ${index + 1}: ${formatLongDate(block.startAt)} · ${formatTime(block.startAt)} — ${formatTime(block.endAt)}`;
}

function weeklyProgressLabel(selectedBlocks: SelectedRange[], requiredBlocks: number, blockHours: number) {
  if (selectedBlocks.length >= requiredBlocks) return 'Pack completo';
  const remaining = requiredBlocks - selectedBlocks.length;
  return `Falta ${remaining} bloque${remaining === 1 ? '' : 's'} de ${blockHours} horas en otro día`;
}


function buildWhatsappMessage(selectedSpace?: Space, selectedModule?: PricingModule) {
  const spaceName = selectedSpace?.name || 'un espacio profesional';
  const moduleName = selectedModule ? moduleDisplayName(selectedModule) : 'un módulo';
  return `Hola, quiero consultar por la reserva de ${spaceName} para ${moduleName}.`;
}


function buildMercadoPagoReference(selectedSpace?: Space, selectedModule?: PricingModule, selectedBlocks: SelectedRange[] = []) {
  const blockKey = selectedBlocks.map((block) => `${block.startAt}_${block.endAt}`).join('__') || 'sin-horario';
  return `espacios-mdp:${selectedSpace?.id || 'space'}:${selectedModule?.id || 'module'}:${blockKey}`;
}

function buildMercadoPagoDescription(selectedBlocks: SelectedRange[], isWeekly: boolean) {
  if (!selectedBlocks.length) return 'Reserva de espacio profesional';
  if (isWeekly) {
    return selectedBlocks
      .map((block, index) => `Bloque ${index + 1}: ${formatLongDate(block.startAt)} de ${formatTime(block.startAt)} a ${formatTime(block.endAt)}`)
      .join(' | ');
  }
  const block = selectedBlocks[0];
  return `${formatLongDate(block.startAt)} de ${formatTime(block.startAt)} a ${formatTime(block.endAt)}`;
}

function buildMercadoPagoPreference(
  selectedSpace: Space | undefined,
  selectedModule: PricingModule | undefined,
  selectedBlocks: SelectedRange[],
  isWeekly: boolean,
) {
  if (!selectedSpace || !selectedModule || !selectedBlocks.length) return undefined;

  return {
    title: `Reserva ${selectedSpace.name} - ${moduleDisplayName(selectedModule)}`,
    amount: Number(selectedModule.totalPrice),
    description: buildMercadoPagoDescription(selectedBlocks, isWeekly),
    externalReference: buildMercadoPagoReference(selectedSpace, selectedModule, selectedBlocks),
    metadata: {
      spaceId: selectedSpace.id,
      pricingModuleId: selectedModule.id,
      blocks: selectedBlocks.map((block) => ({ startAt: block.startAt, endAt: block.endAt })),
    },
  };
}

function disabledPaymentReason(isWeekly: boolean, requiredBlocks: number, blockHours: number) {
  if (isWeekly) return `Seleccioná ${requiredBlocks} bloques de ${blockHours} h`;
  return 'Elegí un horario';
}

export function CalendarFooter({
  mode,
  selected,
  selectedBlocks,
  selectedModule,
  selectedSpace,
  spaceId,
  requiredBlocks,
  blockHours,
  isWeekly,
  isSelectionComplete,
  onCreateBooking,
}: CalendarFooterProps) {
  const hasSelection = Boolean(selectedBlocks.length && selectedModule && selectedSpace);
  const canReserve = Boolean(hasSelection && isSelectionComplete && spaceId);
  const total = selectedModule ? formatMoney(selectedModule.totalPrice) : '-';
  const perHour = selectedModule ? formatMoney(selectedModule.pricePerHour) : '-';
  const mercadoPagoPreference = buildMercadoPagoPreference(selectedSpace, selectedModule, selectedBlocks, isWeekly);

  return (
    <aside className={`selection-summary selection-summary-premium${hasSelection ? ' has-selection' : ''}`}>
      <div className="selection-summary-head">
        <div>
          <h4>Tu reserva</h4>
          <p>{selectedSpace?.name || 'Mar del Plata'}</p>
        </div>
        <ReceiptText size={30} />
      </div>

      <div className="selection-summary-body">
        <div className="reservation-line">
          <MapPin size={18} />
          <div>
            <span>Espacio</span>
            <strong>{selectedSpace?.name || 'Seleccioná un espacio'}</strong>
            <small>{spaceSubtitle(selectedSpace)}</small>
          </div>
        </div>

        {!isWeekly && (
          <>
            <div className="reservation-line">
              <CalendarCheck size={18} />
              <div>
                <span>Fecha seleccionada</span>
                <strong>{selected ? formatLongDate(selected.startAt) : 'Pendiente'}</strong>
              </div>
            </div>

            <div className="reservation-line">
              <Clock size={18} />
              <div>
                <span>Horario y duración</span>
                <strong>{selectedTimeLabel(selected)} {selected && <em>{formatDurationHours(selected.startAt, selected.endAt)}</em>}</strong>
              </div>
            </div>
          </>
        )}

        {isWeekly && (
          <div className="weekly-block-summary">
            <div className="weekly-block-summary-head">
              <Clock size={18} />
              <div>
                <span>Pack semanal</span>
                <strong>{weeklyProgressLabel(selectedBlocks, requiredBlocks, blockHours)}</strong>
              </div>
            </div>
            <div className="weekly-block-list">
              {Array.from({ length: requiredBlocks }).map((_, index) => {
                const block = selectedBlocks[index];
                return (
                  <div className={`weekly-block-item${block ? ' is-complete' : ''}`} key={index}>
                    <span>{index + 1}</span>
                    <strong>{block ? blockLabel(block, index) : `Elegí un bloque de ${blockHours} horas`}</strong>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="summary-price-box">
          <div>
            <span>{selectedModule ? moduleDisplayName(selectedModule) : 'Módulo pendiente'}</span>
            <strong>
              {selectedModule ? `${perHour} por hora` : '-'}
              {selectedModule && isBestHourlyRate(selectedModule) ? ' · Mejor precio por hora' : ''}
            </strong>
            {selectedModule && <small>{moduleSecondaryLabel(selectedModule)}</small>}
          </div>
          <div>
            <span>Total a pagar</span>
            <strong className="summary-price-total">{total}</strong>
          </div>
        </div>

        <PaymentActions
          mode={mode}
          canContinue={canReserve}
          disabledReason={disabledPaymentReason(isWeekly, requiredBlocks, blockHours)}
          onPrimaryAction={onCreateBooking}
          whatsappMessage={buildWhatsappMessage(selectedSpace, selectedModule)}
          mercadoPagoPreference={mercadoPagoPreference}
        />

        <div className="safe-booking-note">
          <ShieldCheck size={17} />
          <span>
            {canReserve
              ? 'Vas a poder revisar la reserva antes del pago final.'
              : isWeekly
                ? `Seleccioná ${requiredBlocks} bloques de ${blockHours} horas en días distintos.`
                : 'Elegí un horario disponible para continuar.'}
          </span>
        </div>
      </div>
    </aside>
  );
}
