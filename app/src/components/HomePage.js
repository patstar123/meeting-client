import React, { useState } from 'react';
import '../styles/HomePage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faBolt, faCalendarCheck, faDesktop, faGear, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { faMountain } from '@fortawesome/free-solid-svg-icons'; // 新图标
import Modal from './Modal'; // 引入Modal组件

const HomePage = () => {
  const [hoveredButton, setHoveredButton] = useState(null);
  const [hoveredMeeting, setHoveredMeeting] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [quickMeetingDropdown, setQuickMeetingDropdown] = useState(false);

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

  const closeModal = () => {
    setModalOpen(false);
    setModalContent(null);
  };

  const handleIconClick = (action) => {
    switch (action) {
      case 'quickMeeting':
        window.location.href = '/start-meeting'; // 假设开会的新页面URL为'/start-meeting'
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

  return (
    <div className="meeting-container">
      <div className="sidebar">
        <div className="profile-pic"></div>
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
              <FontAwesomeIcon icon={hoveredButton === 'join' ? faMountain : faPlus} size="2x" />
            </div>
            <span className="action-text">加入会议</span>
          </div>
          <div
            className="meeting-action"
            onMouseEnter={() => handleMouseEnter('quick')}
            onMouseLeave={handleMouseLeave}
          >
            <div className="icon-button" onClick={() => handleIconClick('quickMeeting')}>
              <FontAwesomeIcon icon={hoveredButton === 'quick' ? faMountain : faBolt} size="2x" />
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
              <FontAwesomeIcon icon={hoveredButton === 'schedule' ? faMountain : faCalendarCheck} size="2x" />
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
              <FontAwesomeIcon icon={hoveredButton === 'share' ? faMountain : faDesktop} size="2x" />
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
      {modalOpen && <Modal content={modalContent} onClose={closeModal} />}
    </div>
  );
};

export default HomePage;
