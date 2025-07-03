// src/components/CustomButton.js
import './CustomButton.css';


const CustomButton = ({ text, onClick, className = '', disabled = false, title = '' }) => {
  return (
    <button className={`custom-btn ${className}  ${disabled ? 'disabled' : ''}`} 
    onClick={onClick} 
    disabled={disabled}
    title={title}>
      {text}
    </button>
  );
};

export default CustomButton;
