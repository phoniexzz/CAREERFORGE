interface Props {
  score: number;
  size?: number;
  stroke?: number;
}

function bandColor(score: number) {
  if (score >= 80) return "var(--color-success)";
  if (score >= 65) return "var(--color-primary)";
  if (score >= 50) return "var(--color-warning)";
  return "var(--color-danger)";
}

function bandLabel(score: number) {
  if (score >= 80) return "STRONG FIT";
  if (score >= 65) return "MODERATE";
  if (score >= 50) return "STRETCH";
  return "LOW FIT";
}

export function MatchRing({ score, size = 72, stroke = 6 }: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const color = bandColor(score);

  return (
    <div className="flex flex-col items-center gap-1 shrink-0">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="var(--color-border)"
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-base font-semibold" style={{ color }}>
            {score}
            <span className="text-[10px] font-medium align-top">%</span>
          </span>
        </div>
      </div>
      <span className="text-[10px] font-bold tracking-wider" style={{ color }}>
        {bandLabel(score)}
      </span>
    </div>
  );
}
