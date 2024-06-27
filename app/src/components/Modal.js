import React, { useEffect } from 'react';
import '../styles/Modal.css';

const Modal = ({ content, onClose }) => {
  const handleOutsideClick = (e) => {
    if (e.target.className === 'modal-overlay') {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleOutsideClick);

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        {content === 'joinMeeting' && <div>入会参数配置</div>}
        {content === 'scheduleMeeting' && <div>预约会议参数配置</div>}
        {content === 'addMeeting' && <div>添加会议参数配置</div>}
      </div>
    </div>
  );
};

export default Modal;
