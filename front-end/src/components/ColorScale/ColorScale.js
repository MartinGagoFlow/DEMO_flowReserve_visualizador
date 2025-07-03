import React from "react";
import './ColorScale.css'

export const ColorScale = (props) => {
  if (props.colors === 'ffr') {
    return (
      <div className="color-bar-container">
        <p className="color-bar-title">FFR</p>
        <div className="gradient-wrapper">
          <div className="gradient-scale-ffr"></div>
          <div className="gradient-labels">
            {[1.0, 0.95, 0.9, 0.85, 0.8, 0.75, 0.7].map((value, i) => (
              <p key={i} className="label" style={{ top: `${((1.0 - value) / 0.3) * 100}%` }}>
                {value.toFixed(2)}
              </p>
            ))}
          </div>
          <div className="no-valuable-ffr"></div>
        </div>
      </div>

    );
  } else if (props.colors === 'wss') {
    return (
      <div className="color-bar-container">
        <p className="color-bar-title">WSS</p>
        <div className="gradient-scale-wss">
          <div className="labels-wss">
            <span style={{ left: '0%' }}>25</span>
            <span style={{ left: '20%' }}>20</span>
            <span style={{ left: '40%' }}>15</span>
            <span style={{ left: '60%' }}>10</span>
            <span style={{ left: '75%' }}>5</span>
            <span style={{ left: '85%' }}>0</span>
            <span style={{ left: '100%' }}>No valorable</span>
          </div>
          <div className="no-valuable-wss"></div>
        </div>
      </div>
    );
  } else if (props.colors === 'ifr') {
    return (
      <div className="color-bar-container">
        <p className="color-bar-title">iFR</p>
        <div className="gradient-wrapper">
          <div className="gradient-scale-ffr"></div>
          <div className="gradient-labels">
            {[1.0, 0.975, 0.95, 0.925, 0.90, 0.875, 0.85].map((value, i) => (
              <p key={i} className="label" style={{ top: `${((1.0 - value) / 0.3) * 100}%` }}>
                {value.toFixed(3)}
              </p>
            ))}
          </div>
          <div className="no-valuable-ffr"></div>
        </div>
      </div>
    );
  }
};