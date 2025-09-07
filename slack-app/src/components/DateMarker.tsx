import React from 'react';
import './DateMarker.css';

interface DateMarkerProps {
  dateText: string;
}

const DateMarker: React.FC<DateMarkerProps> = ({ dateText }) => {
  return (
    <div className="date-marker">
      <div className="date-marker-line"></div>
      <div className="date-marker-text">{dateText}</div>
      <div className="date-marker-line"></div>
    </div>
  );
};

export default DateMarker;
