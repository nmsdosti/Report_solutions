import { useRef, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";

interface FanDiagramProps {
  angle: number;
  weight: number;
  onAngleChange: (angle: number) => void;
  accentColor?: string;
  label?: string;
}

export default function FanDiagram({ angle, weight, onAngleChange, accentColor = "#00C9A7", label }: FanDiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const cx = 120;
  const cy = 120;
  const r = 80;
  const markerR = r - 10;

  const angleRad = ((angle - 90) * Math.PI) / 180;
  const markerX = cx + markerR * Math.cos(angleRad);
  const markerY = cy + markerR * Math.sin(angleRad);

  const getAngleFromEvent = useCallback(
    (clientX: number, clientY: number) => {
      if (!svgRef.current) return 0;
      const rect = svgRef.current.getBoundingClientRect();
      const scaleX = 240 / rect.width;
      const scaleY = 240 / rect.height;
      const x = (clientX - rect.left) * scaleX - cx;
      const y = (clientY - rect.top) * scaleY - cy;
      let a = (Math.atan2(y, x) * 180) / Math.PI + 90;
      if (a < 0) a += 360;
      if (a >= 360) a -= 360;
      return Math.round(a);
    },
    []
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    onAngleChange(getAngleFromEvent(e.clientX, e.clientY));
  };

  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e: MouseEvent) => {
      onAngleChange(getAngleFromEvent(e.clientX, e.clientY));
    };
    const handleUp = () => setIsDragging(false);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [isDragging, getAngleFromEvent, onAngleChange]);

  // Fan blades
  const blades = Array.from({ length: 8 }, (_, i) => {
    const a = (i * 45 * Math.PI) / 180;
    const x1 = cx + 20 * Math.cos(a);
    const y1 = cy + 20 * Math.sin(a);
    const x2 = cx + 65 * Math.cos(a - 0.3);
    const y2 = cy + 65 * Math.sin(a - 0.3);
    const x3 = cx + 65 * Math.cos(a + 0.3);
    const y3 = cy + 65 * Math.sin(a + 0.3);
    return `M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} Z`;
  });

  // Arc from 0 to angle
  const arcStart = { x: cx, y: cy - markerR };
  const arcEnd = {
    x: cx + markerR * Math.cos(angleRad),
    y: cy + markerR * Math.sin(angleRad),
  };
  const largeArc = angle > 180 ? 1 : 0;
  const arcPath = `M ${arcStart.x} ${arcStart.y} A ${markerR} ${markerR} 0 ${largeArc} 1 ${arcEnd.x} ${arcEnd.y}`;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative">
        <svg
          ref={svgRef}
          width="240"
          height="240"
          viewBox="0 0 240 240"
          className="cursor-crosshair select-none"
          onMouseDown={handleMouseDown}
        >
          {/* Outer ring */}
          <circle cx={cx} cy={cy} r={r + 15} fill="none" stroke="#1E3A5F" strokeWidth="1" />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1E3A5F" strokeWidth="1" strokeDasharray="4 4" />

          {/* Reference lines */}
          <line x1={cx} y1={cy - r - 15} x2={cx} y2={cy - r + 5} stroke="#2A4A6A" strokeWidth="1" />
          <line x1={cx} y1={cy + r - 5} x2={cx} y2={cy + r + 15} stroke="#2A4A6A" strokeWidth="1" />
          <line x1={cx - r - 15} y1={cy} x2={cx - r + 5} y2={cy} stroke="#2A4A6A" strokeWidth="1" />
          <line x1={cx + r - 5} y1={cy} x2={cx + r + 15} y2={cy} stroke="#2A4A6A" strokeWidth="1" />

          {/* Labels */}
          <text x={cx} y={cy - r - 20} textAnchor="middle" fill="#4A6B8A" fontSize="9" fontFamily="monospace">I</text>
          <text x={cx} y={cy + r + 25} textAnchor="middle" fill="#4A6B8A" fontSize="9" fontFamily="monospace">III</text>
          <text x={cx - r - 18} y={cy + 4} textAnchor="middle" fill="#4A6B8A" fontSize="9" fontFamily="monospace">IV</text>
          <text x={cx + r + 18} y={cy + 4} textAnchor="middle" fill="#4A6B8A" fontSize="9" fontFamily="monospace">II</text>

          {/* Fan blades */}
          {blades.map((d, i) => (
            <path key={i} d={d} fill="#1E3A5F" stroke="#2A5A8A" strokeWidth="0.5" />
          ))}

          {/* Center hub */}
          <circle cx={cx} cy={cy} r={16} fill="#162032" stroke="#1E3A5F" strokeWidth="2" />
          <circle cx={cx} cy={cy} r={6} fill={accentColor} opacity="0.6" />

          {/* Angle arc */}
          {angle > 0 && (
            <path d={arcPath} fill="none" stroke={accentColor} strokeWidth="2" strokeDasharray="3 2" opacity="0.7" />
          )}

          {/* Correction marker */}
          <circle
            cx={markerX}
            cy={markerY}
            r={10}
            fill={accentColor}
            stroke="#0D1B2A"
            strokeWidth="2"
            className={isDragging ? "cursor-grabbing" : "cursor-grab"}
            style={{ filter: `drop-shadow(0 0 6px ${accentColor}99)` }}
          />
          <circle cx={markerX} cy={markerY} r={4} fill="#0D1B2A" />
        </svg>
        <div className="text-center text-[#4A6B8A] text-[10px] mt-1 font-medium">
          Drag marker to adjust angle
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-col gap-3 flex-1">
        {label && (
          <div className="text-xs font-bold tracking-wider mb-1" style={{ color: accentColor }}>
            {label.toUpperCase()}
          </div>
        )}
        <div className="bg-[#162032] border border-[#1E3A5F] rounded-xl p-4">
          <div className="text-[#4A6B8A] text-[10px] font-semibold tracking-wider mb-1">CORRECTION WEIGHT</div>
          <div className="text-3xl font-black font-mono" style={{ color: accentColor }}>{weight || "—"}</div>
          <div className="text-[#2A4A6A] text-xs">grams</div>
        </div>
        <div className="bg-[#162032] border border-[#1E3A5F] rounded-xl p-4">
          <div className="text-[#4A6B8A] text-[10px] font-semibold tracking-wider mb-1">ADDING ANGLE</div>
          <div className="text-3xl font-black font-mono" style={{ color: accentColor }}>{angle}°</div>
          <div className="flex items-center gap-2 mt-2">
            <input
              type="range"
              min={0}
              max={359}
              value={angle}
              onChange={(e) => onAngleChange(parseInt(e.target.value))}
              className="w-full"
              style={{ accentColor }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
