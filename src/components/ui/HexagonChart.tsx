import { HOLLAND_META } from '../../data/chapters';
import { HollandScores } from '../../types/game';

interface HexagonChartProps {
  scores: HollandScores;
  size?: number;
}

export function HexagonChart({ scores, size = 156 }: HexagonChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.34;
  const labelR = size * 0.44;

  const getPoint = (index: number, radius: number) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / 6;
    return {
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
    };
  };

  const gridRings = [0.35, 0.68, 1.0].map((ratio) =>
    HOLLAND_META.map((_, i) => {
      const p = getPoint(i, maxR * ratio);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    }).join(' '),
  );

  const dataPoints = HOLLAND_META.map((item, i) => {
    const value = Math.max(1, Math.min(5, scores[item.id] ?? 3));
    const r = (value / 5) * maxR;
    return getPoint(i, r);
  });

  const dataPolygon = dataPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: 'block', overflow: 'visible' }}
      aria-label="흥미 육각형 그래프"
    >
      {/* Background concentric hexagons */}
      {gridRings.map((pts, idx) => (
        <polygon
          key={idx}
          points={pts}
          fill={idx === 2 ? '#ECE4D3' : 'none'}
          fillOpacity={idx === 2 ? 0.45 : 0}
          stroke="#B7AD99"
          strokeWidth={1}
        />
      ))}

      {/* Axis spokes */}
      {HOLLAND_META.map((item, i) => {
        const edge = getPoint(i, maxR);
        return (
          <line
            key={item.id}
            x1={cx}
            y1={cy}
            x2={edge.x}
            y2={edge.y}
            stroke="#C7BEAC"
            strokeWidth={1}
          />
        );
      })}

      {/* Data polygon */}
      <polygon
        points={dataPolygon}
        fill="#236B67"
        fillOpacity={0.32}
        stroke="#236B67"
        strokeWidth={2}
      />

      {/* Data vertices */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="#E8A33D" stroke="#172033" strokeWidth={1} />
      ))}

      {/* Labels */}
      {HOLLAND_META.map((item, i) => {
        const lp = getPoint(i, labelR);
        return (
          <text
            key={item.id}
            x={lp.x}
            y={lp.y}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#172033"
            fontSize={10}
            fontWeight={700}
          >
            {item.shortLabel}({item.code})
          </text>
        );
      })}
    </svg>
  );
}
