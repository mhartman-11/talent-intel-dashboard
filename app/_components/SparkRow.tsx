interface SparkRowProps {
  label: string;
  value: string | number;
  sublabel?: string;
  color?: string;
  className?: string;
}

export function SparkRow({
  label,
  value,
  sublabel,
  color = "#81ecff",
  className,
}: SparkRowProps) {
  return (
    <div className={`flex items-baseline justify-between gap-4 py-2 ${className ?? ""}`}>
      <div>
        <span className="text-sm text-white/60">{label}</span>
        {sublabel && (
          <span className="ml-2 text-xs text-white/30">{sublabel}</span>
        )}
      </div>
      <span
        className="font-mono text-lg font-bold"
        style={{ color }}
      >
        {value}
      </span>
    </div>
  );
}
