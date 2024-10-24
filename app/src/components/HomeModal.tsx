/* src/styles/HomeModal.tsx */

import React, { useState, useEffect } from 'react';
import { Input, Dropdown, Menu, Divider, message, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { useCookies } from 'react-cookie';
import { NoticeType } from 'antd/es/message/interface';
import '../styles/HomeModal.css';
import { RoomInfo, SFUClient, hasCameraPermission, hasMicrophonePermission } from 'sfu-sdk';
import { useStore } from 'store';
import { useNavigate } from 'react-router-dom';
import { formatMeetingId, getRoomTimeDesc } from './common';

const HomeModal = ({ content, joinObj, onClose, handleSaveUserInfo }) => {
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [cookies, setCookie] = useCookies(['meeting_passwords', 'meeting_user']); // 使用 react-cookie 操作 cookie

  const [meetingName, setMeetingName] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingId, setMeetingId] = useState(''); // 会议号状态
  const [meetingId_, setMeetingId_] = useState(''); // 会议号状态(带-)
  const [showVideo, setShowVideo] = useState(false);
  const [openVoice, setOpenVoice] = useState(false);
  const [isPasswordRequired, setIsPasswordRequired] = useState(false); // 是否需要密码
  const [meetingPassword, setMeetingPassword] = useState(''); // 会议密码
  const [rememberPassword, setRememberPassword] = useState(true); // 是否记住密码
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [ignoreNextClose, setIgnoreNextClose] = useState(false);
  const [joinable, setJoinable] = useState(false);
  const { sfuClientStore } = useStore()

  const [messageApi, contextHolder] = message.useMessage();
  const messageTip = (tip: string, type: NoticeType = 'error') =>
    messageApi.open({
      type: type,
      content: tip,
    });

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

  // 调用接口查询会议是否需要密码
  const checkMeetingPassword = async () => {
    let requirePassword = false
    if (true) {
      const client = sfuClientStore.initCommSfuClient()
      const res = await client.roomPasswordAuthentication(meetingId, "")
      requirePassword = res.code !== 0
    } else {
      requirePassword = false
    }

    if (!requirePassword) {
      setMeetingPassword('')
      joinRoom()
    } else { // 需要密码
      setIsPasswordRequired(true);

      // 尝试从 cookie 中获取该会议号的密码
      if (cookies.meeting_passwords && cookies.meeting_passwords[meetingId]) {
        setMeetingPassword(cookies.meeting_passwords[meetingId]); // 自动填充密码
      }
    }
  };

  const navigate = useNavigate()

  const joinRoom = async () => {
    if (!username) {
      messageTip('用户名称不能为空')
      return
    }

    const granted1 = await hasMicrophonePermission()
    const granted2 = await hasCameraPermission()
    if (!granted1) {
      messageTip('用户拒绝了[麦克风]的权限,请手动授权')
      return
    }
    if (!granted2) {
      messageTip('用户拒绝了[相机]的权限,请手动授权')
      return
    }

    sfuClientStore.mcsUrl = window.location.origin
    sfuClientStore.clientName = username
    sfuClientStore.roomNum = meetingId
    sfuClientStore.autoOpenCamera = showVideo
    sfuClientStore.autoOpenMic = openVoice
    sfuClientStore.password = meetingPassword

    navigate({
      pathname: '/start-meeting',
      search: '?' + new URLSearchParams({
        action: "join" // 表示为加入会议
      }).toString(),
    })
  }

  // 提交会议密码
  const handleSubmitPassword = () => {
    if (!meetingPassword.trim()) {
      messageTip('请输入会议密码');
      return;
    }

    // 如果选择了记住密码，将其保存到 cookie 中，24 小时后过期
    if (rememberPassword) savePassword()

    joinRoom()
  };

  const savePassword = () => {
    setCookie('meeting_passwords', { ...cookies.meeting_passwords, [meetingId]: meetingPassword }, { path: '/', maxAge: 86400 });
  }

  const handleMeetingIdInput = (e) => {
    onMeetingIdChanged(e.target.value)
  };

  const onMeetingIdChanged = (id) => {
    const id_ = formatMeetingId(id)

    setMeetingId_(id_)
    setMeetingId(id_.replace('-', ''));
    setMeetingName('')
    setMeetingTime('')

    // 检查是否符合格式: 4位数字-5位数字
    const regex = /^\d{4}-\d{5}$/;
    setJoinable(regex.test(id_))
  }

  const handleClearAllRecords = () => {
    localStorage.removeItem('recentMeetingRecords');
    setDropdownVisible(false)
  };

  const handleSelectMeetingId = (id) => {
    onMeetingIdChanged(id);
    setDropdownVisible(false)
  };

  const handleClickDropdown = (e) => {
    e.stopPropagation();
    setIgnoreNextClose(true); // 设置标志位，忽略下一次关闭
    setDropdownVisible(!dropdownVisible);
  };

  const handleDropdownVisibleChange = (flag, info) => {
    if (ignoreNextClose) {
      setIgnoreNextClose(false); // 重置标志位，不再忽略后续的状态变化
      return; // 忽略本次关闭
    }
    setDropdownVisible(flag);
  };

  useEffect(() => {
    // 页面加载时检查是否已有用户信息
    if (cookies.meeting_user) {
      setUsername(cookies.meeting_user.username)
    }
  }, [cookies.meeting_user]);

  useEffect(() => {
    if (content === 'joinMeeting') setTitle('加入会议')
    else if (content === 'scheduleMeeting') setTitle('预约会议(开发中)')
    else if (content === 'addMeeting') setTitle('添加会议(开发中)')
    else if (content === 'addUserInfo') setTitle('入会名称')

    if (joinObj?.roomNum) onMeetingIdChanged(joinObj.roomNum)
    if (joinObj?.password) {
      setMeetingPassword(joinObj?.password)
      setRememberPassword(true)
      savePassword()
    }

    if (joinObj?.roomNum) {
      const client = sfuClientStore.initCommSfuClient()
      client.getRoomsPeerByIdsAndNum('', joinObj?.roomNum).then(res => {
        if (res.code !== 0) {
          messageTip(res.msg + ', 可能会议已结束')
          setJoinable(false)
          return
        }

        const info: RoomInfo = res.data
        if (info.state === 2 || info.state === 3) {
          messageTip("该会议已经结束,无法加入")
          setJoinable(false)
          return
        }

        const time = getRoomTimeDesc(info.scheduledStartTime, info.scheduledEndTime, info.scheduledDurationSeconds)
        setMeetingName(info.roomName)
        setMeetingTime(time)
      })
    }

    // document.addEventListener('click', handleOutsideClick);
    // return () => {
    //   document.removeEventListener('click', handleOutsideClick);
    // };
  }, []);

  const storedMeetingRecords = localStorage.getItem('recentMeetingRecords');
  const meetingRecords = !!storedMeetingRecords ? JSON.parse(storedMeetingRecords) : []
  const menuItems = meetingRecords.map((record) => ({
    key: record.id,
    label: (
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>{record.name}</span>
        <span>{record.id}</span>
      </div>
    ),
    onClick: () => handleSelectMeetingId(record.id),
    style: {}
  }));
  if (meetingRecords.length > 0) {
    menuItems.push({
      key: 'clearAllOption',
      label: '清空全部',
      onClick: handleClearAllRecords,
      style: { color: '#1890ff' },
    });
  }

  return (
    <div className="modal-overlay">
      {contextHolder}
      <div className={`modal-content ${content === 'joinMeeting' ? 'joinMeeting' : ''}`}>
        <label className='modal-title'>{title}</label>
        <button className="close-button" onClick={onClose}>
          &times;
        </button>

        <div className='modal-main'>
          {content === 'joinMeeting' && (
            <div>
              {meetingName && (<><label className='line-label' style={{ display: "block" }}>{meetingName}</label><br /></>)}
              {meetingTime && (<><label className='line-label' style={{ display: "block" }}>{meetingTime}</label><br /></>)}
              <div>
                <label className='line-label'>会议号</label><br />
                <div className='dropdown-input-container'>
                  <Input
                    value={meetingId_}
                    onChange={handleMeetingIdInput}
                    placeholder="请输入会议号"
                    suffix={
                      <DownOutlined
                        style={{ cursor: 'pointer' }}
                        onClick={handleClickDropdown}
                      />
                    }
                  />
                  <Dropdown
                    menu={{ items: menuItems }}
                    trigger={['click']}
                    open={dropdownVisible}
                    onOpenChange={handleDropdownVisibleChange}
                  >
                    <div style={{ left: 0, width: '100%', }} />
                  </Dropdown>
                </div>
              </div>

              <div>
                <label className='line-label'>您的名称</label><br />
                <Input className='line-input'
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入您的名称"
                />
              </div>
              <div style={{ marginTop: '43px' }}>
                <label className='line-label'>会议设置</label><br />

                <div className='line-option'>
                  <input className='line-option-checkbox'
                    type="checkbox"
                    checked={showVideo}
                    onChange={(e) => setShowVideo(e.target.checked)}
                  />
                  <label className='line-option-label'>入会开启摄像头</label>
                </div>
                <div className='line-option'>
                  <input className='line-option-checkbox'
                    type="checkbox"
                    checked={openVoice}
                    onChange={(e) => setOpenVoice(e.target.checked)}
                  />
                  <label className='line-option-label'>入会开启声音</label>
                </div>
              </div>
              <br />

              <button
                className={`joining-button ${joinable ? '' : 'disabled'}`}
                disabled={!joinable}
                onClick={checkMeetingPassword}>加入会议</button>
            </div>
          )}
          {content === 'scheduleMeeting' && <div></div>}
          {content === 'addMeeting' && <div></div>}
          {content === 'addUserInfo' &&
            <div>
              <input className='name-input'
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入您的名称"
              />
              <button className='name-ok' onClick={handleSave}>确认</button>
              <br /><br />
            </div>
          }
        </div>

        {/* 如果需要输入密码，则显示此模态框 */}
        {isPasswordRequired && (
          <div className="password-modal">
            <span className='password-title'>入会密码</span>
            <Input className='password-input'
              type="password"
              value={meetingPassword}
              onChange={(e) => setMeetingPassword(e.target.value)}
              placeholder="请输入密码"
            />

            <div>
              <input
                type="checkbox"
                checked={rememberPassword}
                onChange={(e) => setRememberPassword(e.target.checked)}
              />
              <label className='password-label'>此账号下次入会无需重复输入密码</label>
            </div>
            <div className="button-container">
              <Button className='password-joining-button' onClick={() => {
                setMeetingPassword('')
                setIsPasswordRequired(false)
              }}>取消</Button>
              <Button className={`password-joining-button ok ${meetingPassword.length > 0 ? '' : 'disabled'}`} disabled={meetingPassword.length === 0} onClick={handleSubmitPassword}>加入</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeModal;
