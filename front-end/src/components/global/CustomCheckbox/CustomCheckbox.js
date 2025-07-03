import React from "react";
import "./CustomCheckbox.css";

const CustomCheckbox = ({ id, checked, onChange, label, title }) => {
  return (
    <div className="custom-checkbox-wrapper">
        {label && <span className="custom-label">{label}</span>}
      <label className="custom-checkbox">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          title= {title}
        />
        <span className="slider" />
      </label>
      
    </div>
  );
};

export default CustomCheckbox;
