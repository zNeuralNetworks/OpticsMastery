type MetricTileProps = {
  label: string;
  value: string;
  detail?: string;
};

export function MetricTile({ label, value, detail }: MetricTileProps) {
  return (
    <div className="card-subtle p-4 lg:p-5">
      <p className="data-label">{label}</p>
      <p className="technical-value mt-4 text-[28px] font-semibold tracking-[-0.03em] lg:text-[30px]">{value}</p>
      {detail ? <p className="mt-3 text-sm leading-6 text-muted">{detail}</p> : null}
    </div>
  );
}
