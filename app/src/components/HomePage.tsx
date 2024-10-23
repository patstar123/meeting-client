import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import '../styles/HomePage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faBolt, faCalendarCheck, faDesktop, faGear, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { faMountain } from '@fortawesome/free-solid-svg-icons'; // 新图标
import HomeModal from './HomeModal'; // 引入Modal组件
import { useCookies } from 'react-cookie'; // 使用 react-cookie 操作 cookie
import { message } from 'antd'
import { NoticeType } from 'antd/es/message/interface'
import { useStore } from '../store'
import HomeCamera from '../assets/icons/home-camera.svg';
import HomeBolt from '../assets/icons/home-bolt.svg';
import HomeMeeting from '../assets/icons/home-meeting.svg';
import HomeAdd from '../assets/icons/home-add.svg';
import HomeCalendar from '../assets/icons/home-calendar.svg';
import HomeCheck from '../assets/icons/home-check.svg';
import HomePencil from '../assets/icons/home-pencil.svg';
import HomeBook from '../assets/icons/home-book.svg';

import {
  ClientId,
  ClientIdType,
  UnspecifiedClientId,
  MCSRoomPermission,
  CreateRoomParams,
  ClientInitParams,
  SFUClient,
  RoomType,
  hasMicrophonePermission,
  hasCameraPermission,
  ExtRole,
} from 'sfu-sdk'

const HomePage = () => {
  // 状态管理
  const [hoveredButton, setHoveredButton] = useState(null);
  const [hoveredMeeting, setHoveredMeeting] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [quickMeetingDropdown, setQuickMeetingDropdown] = useState(false);
  const [tryFastMeeting, setTryFastMeeting] = useState(false);
  const [cookies, setCookie] = useCookies(['meeting_user']); // 读取和设置 cookies
  const [userInfo, setUserInfo] = useState(null); // 当前用户信息
  const { sfuClientStore } = useStore()

  const [messageApi, contextHolder] = message.useMessage()
  const messageTip = (tip: string, type: NoticeType = 'error') =>
    messageApi.open({
      type: type,
      content: tip,
    })

  const handleMouseEnter = (buttonName) => {
    setHoveredButton(buttonName);
  };

  const handleMouseLeave = () => {
    setHoveredButton(null);
  };

  const handleMeetingMouseEnter = (meetingId) => {
    setHoveredMeeting(meetingId);
  };

  const handleMeetingMouseLeave = () => {
    setHoveredMeeting(null);
  };

  const openModal = (content) => {
    setModalContent(content);
    setModalOpen(true);
  };

  const closeModal = (canceled: boolean = true) => {
    setModalOpen(false);
    setModalContent(null);
    if (canceled) setTryFastMeeting(false)
  };

  const navigate = useNavigate()

  const handleIconClick = (action) => {
    switch (action) {
      case 'quickMeeting':
        if (!userInfo || !userInfo.username) {
          setTryFastMeeting(true)
          openModal('addUserInfo');
          return
        }

        setTryFastMeeting(false);
        fastMeeting()
        break;
      case 'joinMeeting':
        openModal('joinMeeting');
        break;
      case 'scheduleMeeting':
        openModal('scheduleMeeting');
        break;
      case 'addMeeting':
        openModal('addMeeting');
        break;
      default:
        break;
    }
  };

  // 提交用户信息，保存到 cookie 并关闭模态框
  const handleSaveUserInfo = (userData) => {
    setCookie('meeting_user', userData, { path: '/', maxAge: 3600 * 24 * 7 }); // 保存 cookie，设置有效期为7天
    setUserInfo(userData); // 设置当前用户信息
    closeModal(false);
  };

  // 快速会议
  const fastMeeting = async () => {
    if (!userInfo.username) {
      messageTip('用户名不能为空')
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
    sfuClientStore.roomName = userInfo.username + "的快速会议"
    sfuClientStore.clientName = userInfo.username
    sfuClientStore.roomNum = undefined
    sfuClientStore.autoOpenCamera = false
    sfuClientStore.autoOpenMic = false
    sfuClientStore.password = ''

    navigate({
      pathname: '/start-meeting',
      search: '?' + new URLSearchParams({
        action: "fast" // 表示为快速会议(创建并加入会议)
      }).toString(),
    })
  }

  // 页面加载时检查是否已有用户信息
  useEffect(() => {
    if (cookies.meeting_user) {
      if (cookies.meeting_user?.username !== userInfo?.username) {
        setUserInfo(cookies.meeting_user); // 如果 cookie 中存在用户信息，使用它
        messageTip("当前用户名: " + cookies.meeting_user.username, 'info')
      }
    } else {
      openModal('addUserInfo');
    }
  }, [cookies.meeting_user]);

  useEffect(() => {
    if (userInfo && userInfo.username && tryFastMeeting) {
      handleIconClick("quickMeeting")
    }
  }, [userInfo]);

  return (
    <div className="meeting-container">
      {contextHolder}
      <div className="sidebar">
        <div className="profile-pic" onClick={() => openModal('addUserInfo')}></div>
        <div className="sidebar-bottom">
          <div className="sidebar-item">
            <FontAwesomeIcon icon={faGear} className="icon" />
          </div>
        </div>
      </div>
      <div className="left-content">
        <div className="meeting-actions">
          <div
            className="meeting-action"
            onMouseEnter={() => handleMouseEnter('join')}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleIconClick('joinMeeting')}
          >
            <div className="icon-button">
              {hoveredButton === 'join' ?
                (<img src={HomeMeeting} className="left-button" style={{ height: '35px' }} />) :
                (<img src={HomeAdd} className="left-button" style={{ height: '35px' }} />)}
            </div>
            <span className="action-text">加入会议</span>
          </div>
          <div
            className="meeting-action"
            onMouseEnter={() => handleMouseEnter('quick')}
            onMouseLeave={handleMouseLeave}
          >
            <div className="icon-button" onClick={() => handleIconClick('quickMeeting')}>
              {hoveredButton === 'quick' ?
                (<img src={HomeCamera} className="left-button" style={{ height: '35px' }} />) :
                (<img src={HomeBolt} className="left-button" style={{ height: '60px' }} />)}
            </div>
            <span className="action-text">
              快速会议
              <span className="dropdown-toggle" onClick={() => setQuickMeetingDropdown(!quickMeetingDropdown)}>
                &#9660;
              </span>
              {quickMeetingDropdown && (
                <div className="dropdown-menu">
                  <div className="dropdown-item">使用个人固定号</div>
                </div>
              )}
            </span>
          </div>
          <div
            className="meeting-action"
            onMouseEnter={() => handleMouseEnter('schedule')}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleIconClick('scheduleMeeting')}
          >
            <div className="icon-button">
              {hoveredButton === 'schedule' ?
                (<img src={HomeCalendar} className="left-button" style={{ height: '35px' }} />) :
                (<img src={HomeCheck} className="left-button" style={{ height: '45px' }} />)}
            </div>
            <span className="action-text">预定会议</span>
          </div>
          <div
            className="meeting-action"
            onMouseEnter={() => handleMouseEnter('share')}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleIconClick('addMeeting')}
          >
            <div className="icon-button">
              {hoveredButton === 'share' ?
                (<img src={HomeBook} className="left-button" style={{ height: '37px' }} />) :
                (<img src={HomePencil} className="left-button" style={{ height: '45px' }} />)}
            </div>
            <span className="action-text">添加会议</span>
          </div>
        </div>
      </div>
      <div className="border-right" />
      <div className="right-content">
        <div className="meeting-schedule">
          <div className="date">
            <div className="main-date">6月24日</div>
            <div className="sub-date-container">
              <div className="sub-date">周一 农历五月十九</div>
              <button className="history-button">历史会议 &gt;</button>
            </div>
          </div>
          <div className="date-separator"></div>
          <div className="meeting-date">今天 6月24日</div>
          <div
            className={`meeting-item ${hoveredMeeting === 'meeting1' ? 'hovered' : ''}`}
            onMouseEnter={() => handleMeetingMouseEnter('meeting1')}
            onMouseLeave={handleMeetingMouseLeave}
          >
            {hoveredMeeting === 'meeting1' && (
              <div className="meeting-actions2">
                <FontAwesomeIcon icon={faEllipsisV} />
                <button className="join-button">入会</button>
              </div>
            )}
            <div className="meeting-content">
              <div className="meeting-title">添加会议 2</div>
              <div className="meeting-details">
                <span>11:30-12:00</span>
                <span className="separator">·</span>
                <span>867 488 878</span>
              </div>
            </div>
          </div>
          <div className="meeting-date">明天 6月25日</div>
          <div
            className={`meeting-item ${hoveredMeeting === 'meeting2' ? 'hovered' : ''}`}
            onMouseEnter={() => handleMeetingMouseEnter('meeting2')}
            onMouseLeave={handleMeetingMouseLeave}
          >
            {hoveredMeeting === 'meeting2' && (
              <div className="meeting-actions2">
                <FontAwesomeIcon icon={faEllipsisV} />
                <button className="join-button">入会</button>
              </div>
            )}
            <div className="meeting-content">
              <div className="meeting-title">派大星预定的会议</div>
              <div className="meeting-details">
                <span>11:30-12:00</span>
                <span className="separator">·</span>
                <span>514 375 162</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {modalOpen && <HomeModal content={modalContent} onClose={closeModal} handleSaveUserInfo={handleSaveUserInfo} />}
    </div>
  );
};

export default HomePage;
