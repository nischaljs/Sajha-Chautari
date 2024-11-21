import React from 'react';

interface ZoomButtonsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export const ZoomButtons: React.FC<ZoomButtonsProps> = ({ onZoomIn, onZoomOut }) => {
  return (
    <div className="flex space-x-2 fixed bottom-4 left-4 z-50 ">
      <button
        onClick={onZoomIn}
        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Zoom In
      </button>
      <button
        onClick={onZoomOut}
        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Zoom Out
      </button>
    </div>
  );
};
