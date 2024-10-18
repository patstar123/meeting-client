import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie'; // 使用 react-cookie 操作 cookie
import { message } from 'antd'
import { NoticeType } from 'antd/es/message/interface'
import '../styles/Modal.css';

const Modal = ({ content, onClose, handleSaveUserInfo }) => {
  const [username, setUsername] = useState('');

  const [messageApi, contextHolder] = message.useMessage()
  const messageTip = (tip: string, type: NoticeType = 'error') =>
    messageApi.open({
      type: type,
      content: tip,
    })

  const handleOutsideClick = (e) => {
    if (e.target.className === 'modal-overlay') {
      onClose();
    }
  };

  // 提交用户信息
  const handleSave = () => {
    if (!username.trim()) {
      messageTip("请输入有效的用户名")
      return
    }

    const userData = { username: username.trim() };
    handleSaveUserInfo(userData); // 调用父组件传递的 handleSaveUserInfo 函数
  };

  useEffect(() => {
    document.addEventListener('click', handleOutsideClick);

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  return (
    <div className="modal-overlay">
      {contextHolder}
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        {content === 'joinMeeting' && <div>入会参数配置</div>}
        {content === 'scheduleMeeting' && <div>预约会议参数配置</div>}
        {content === 'addMeeting' && <div>添加会议参数配置</div>}
        {content === 'addUserInfo' &&
          <div>
            <h3>请输入用户名</h3>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="用户名(可使用中文)"
            />
            &nbsp;&nbsp;
            <button onClick={handleSave}>确认</button>
            <br/><br/>
          </div>
        }
      </div>
    </div>
  );
};

export default Modal;
