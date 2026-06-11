export function CalendarLegend() {
  return (
    <div className="availability-legend" aria-label="Referencias del calendario">
      <span><i className="legend-dot available" /> Disponible</span>
      <span><i className="legend-dot booked" /> Ocupado</span>
      <span><i className="legend-dot blocked" /> Bloqueado</span>
      <span><i className="legend-dot selected" /> Tu selección</span>
    </div>
  );
}
