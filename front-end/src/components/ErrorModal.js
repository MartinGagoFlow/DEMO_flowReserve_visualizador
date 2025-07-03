import React from 'react';
import { Modal } from '@mui/material';
import './ErrorModal.css'

const ErrorModal = ({ isOpen, onClose, message }) => (
  <Modal
    open={isOpen}
    onClose={onClose}
    aria-labelledby="error-modal-title"
    aria-describedby="error-modal-description"
  >
    <div className="modal-content">
        <div id='background'>
            <h2 id="error-modal-title">Error</h2>
            <p id="error-modal-description">{message}</p>
            <button className='btn-error' onClick={onClose}>Close</button>
        </div>
    </div>
  </Modal>
);

export default ErrorModal;
