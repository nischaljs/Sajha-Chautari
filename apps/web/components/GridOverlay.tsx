
interface GridOverlayProps {
  size: number;
  width: number;
  height: number;
}

export const GridOverlay: React.FC<GridOverlayProps> = ({ size, width, height }) => {
  return (
      <svg
          width={width}
          height={height}
          className="absolute top-0 left-0 pointer-events-none opacity-30"
      >
          <defs>
              <pattern
                  id="grid"
                  width={size}
                  height={size}
                  patternUnits="userSpaceOnUse"
              >
                  <path
                      d={`M ${size} 0 L 0 0 0 ${size}`}
                      fill="none"
                      stroke="gray"
                      strokeWidth="0.5"
                  />
              </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
  );
};