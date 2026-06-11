type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = 'Cargando datos...' }: LoadingStateProps) {
  return (
    <div className="loading-state" aria-live="polite">
      <span className="loader-dot" />
      {label}
    </div>
  );
}
