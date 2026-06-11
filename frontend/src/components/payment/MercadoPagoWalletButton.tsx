import { Wallet, initMercadoPago } from '@mercadopago/sdk-react';
import { ExternalLink } from 'lucide-react';
import { useEffect, useMemo } from 'react';

const publicKey = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY as string | undefined;
let initializedPublicKey: string | null = null;

type MercadoPagoWalletButtonProps = {
  preferenceId: string;
  initPoint?: string;
  sandboxInitPoint?: string;
};

function mercadoPagoRedirectUrl(initPoint?: string, sandboxInitPoint?: string) {
  return initPoint || sandboxInitPoint || '';
}

export function MercadoPagoWalletButton({ preferenceId, initPoint, sandboxInitPoint }: MercadoPagoWalletButtonProps) {
  const redirectUrl = useMemo(() => mercadoPagoRedirectUrl(initPoint, sandboxInitPoint), [initPoint, sandboxInitPoint]);

  useEffect(() => {
    if (!publicKey || initializedPublicKey === publicKey) return;
    initMercadoPago(publicKey, { locale: 'es-AR' });
    initializedPublicKey = publicKey;
  }, []);

  if (!preferenceId) return null;

  if (!publicKey) {
    return (
      <div className="mp-wallet-fallback">
        <p>Configurá <code>VITE_MERCADO_PAGO_PUBLIC_KEY</code> para mostrar el botón oficial de Mercado Pago.</p>
        {redirectUrl && (
          <a href={redirectUrl} target="_blank" rel="noreferrer">
            Abrir Mercado Pago <ExternalLink size={16} />
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="mp-wallet-official" aria-label="Botón oficial de Mercado Pago">
      <Wallet initialization={{ preferenceId }} />
    </div>
  );
}
