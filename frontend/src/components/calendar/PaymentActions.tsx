import { ArrowRight, CreditCard, MessageCircle, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { api } from '../../api';
import { whatsappUrl } from '../../config/business';
import { MercadoPagoPreferenceRequest, SessionMode } from '../../types';
import { MercadoPagoWalletButton } from '../payment/MercadoPagoWalletButton';

type PaymentActionsProps = {
  mode: SessionMode;
  canContinue: boolean;
  disabledReason: string;
  onPrimaryAction: () => void | Promise<void>;
  whatsappMessage: string;
  mercadoPagoPreference?: MercadoPagoPreferenceRequest;
  compact?: boolean;
};

function primaryLabel(mode: SessionMode) {
  if (mode === 'admin') return 'Confirmar reserva';
  return 'Pagar con Mercado Pago';
}

function primaryIcon(mode: SessionMode) {
  if (mode === 'admin') return <ShieldCheck size={18} />;
  return <CreditCard size={18} />;
}

export function PaymentActions({
  mode,
  canContinue,
  disabledReason,
  onPrimaryAction,
  whatsappMessage,
  mercadoPagoPreference,
  compact = false,
}: PaymentActionsProps) {
  const [isPreparingPayment, setIsPreparingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [preference, setPreference] = useState<{ id: string; initPoint?: string; sandboxInitPoint?: string } | null>(null);

  async function handlePrimaryClick() {
    if (!canContinue) return;

    if (mode === 'admin') {
      await onPrimaryAction();
      return;
    }

    if (!mercadoPagoPreference) {
      await onPrimaryAction();
      return;
    }

    setPaymentError(null);
    setIsPreparingPayment(true);

    try {
      const createdPreference = await api.createMercadoPagoPreference(mercadoPagoPreference);
      setPreference({
        id: createdPreference.id,
        initPoint: createdPreference.initPoint,
        sandboxInitPoint: createdPreference.sandboxInitPoint,
      });
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'No se pudo iniciar Mercado Pago.');
    } finally {
      setIsPreparingPayment(false);
    }
  }

  return (
    <div className={`payment-actions${compact ? ' payment-actions--compact' : ''}`}>
      {preference ? (
        <MercadoPagoWalletButton
          preferenceId={preference.id}
          initPoint={preference.initPoint}
          sandboxInitPoint={preference.sandboxInitPoint}
        />
      ) : (
        <button className="payment-primary-button" type="button" onClick={handlePrimaryClick} disabled={!canContinue || isPreparingPayment}>
          {primaryIcon(mode)}
          <span>{!canContinue ? disabledReason : isPreparingPayment ? 'Preparando Mercado Pago...' : primaryLabel(mode)}</span>
          {canContinue && !isPreparingPayment && <ArrowRight size={18} />}
        </button>
      )}

      {paymentError && <p className="payment-error-message">{paymentError}</p>}

      <a className="payment-secondary-button" href={whatsappUrl(whatsappMessage)} target="_blank" rel="noreferrer">
        <MessageCircle size={17} />
        <span>Consultar por WhatsApp</span>
      </a>

      <div className="payment-trust-row" aria-label="Confianza y medios de pago">
        <span><b>MP</b> Mercado Pago</span>
        <span><ShieldCheck size={14} /> Pago seguro</span>
      </div>
    </div>
  );
}
