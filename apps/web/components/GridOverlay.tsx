interface GridOverlayProps {
    size: number;
    width: number;
    height: number;
  }
  
 export const GridOverlay: React.FC<GridOverlayProps> = ({ size, width, height }) => {
    return (
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #ddd 1px, transparent 1px),
            linear-gradient(to bottom, #ddd 1px, transparent 1px)
          `,
          backgroundSize: `${size}px ${size}px`,
          width: `${width}px`,
          height: `${height}px`,
          opacity: 0.5
        }}
      />
    );
  };