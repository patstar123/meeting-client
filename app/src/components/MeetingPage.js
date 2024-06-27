import React, { useState, useRef, useEffect } from 'react';
import '../styles/MeetingPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faInfoCircle, faShieldAlt, faSignal, faClock, faThLarge, faExpand,
    faMicrophoneSlash, faVideoSlash, faDesktop, faUserPlus, faComments, faCloudUploadAlt,
    faRobot, faUsers, faCog, faCopy, faLink, faMicrophone, faSlash, faUser
} from '@fortawesome/free-solid-svg-icons';
import Slash from '../assets/icons/slash.svg';
import Camera from '../assets/icons/camera.svg';
import Screen from '../assets/icons/share-screen.svg';
import User from '../assets/icons/user-plus.svg';
import MgrUser from '../assets/icons/mgr-user.svg';
import Chat from '../assets/icons/chat.svg';
import RecStart from '../assets/icons/record-start.svg';
import RecStop from '../assets/icons/record-stop.svg';
import { ReactSVG } from 'react-svg';

import profileImage from '../assets/images/profile.jpg';
import profileImage2 from '../assets/images/profile2.jpg';

const MeetingPage = () => {
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [showSecurityTooltip, setShowSecurityTooltip] = useState(false);
    const [showNetworkTooltip, setShowNetworkTooltip] = useState(false);
    const securityIconRef = useRef(null);
    const networkIconRef = useRef(null);
    const infoIconRef = useRef(null);
    const [tooltipStyle, setTooltipStyle] = useState({});
    const [networkTooltipStyle, setNetworkTooltipStyle] = useState({});
    const [modalStyle, setModalStyle] = useState({});
    const [isMuted, setIsMuted] = useState(true);
    const [enabledCamera, setEnabledCamera] = useState(false);
    const [isRecording, setIsRecording] = useState(false);

    const speakers = [
        { name: "张三", imgSrc: profileImage, isSpeaking: true, isHost: true },
        { name: "张三二", imgSrc: profileImage2, isSpeaking: true, isHost: false },
        { name: "张三二一", imgSrc: profileImage, isSpeaking: true, isHost: false },
        { name: "李四", imgSrc: profileImage2, isSpeaking: false, isHost: false },
        { name: "李五", imgSrc: profileImage2, isSpeaking: false, isHost: false },
        { name: "李六", imgSrc: profileImage2, isSpeaking: false, isHost: false },
        { name: "李八七", imgSrc: profileImage2, isSpeaking: false, isHost: false },
    ];

    const handleMouseEnterSecurity = () => {
        const rect = securityIconRef.current.getBoundingClientRect();
        setTooltipStyle({
            top: rect.bottom + window.scrollY + 5 + 'px',
            left: rect.left + window.scrollX + 'px'
        });
        setShowSecurityTooltip(true);
    };

    const handleMouseEnterNetwork = () => {
        const rect = networkIconRef.current.getBoundingClientRect();
        setNetworkTooltipStyle({
            top: rect.bottom + window.scrollY + 5 + 'px',
            left: rect.left + window.scrollX + 'px'
        });
        setShowNetworkTooltip(true);
    };

    const handleClickInfo = () => {
        const rect = infoIconRef.current.getBoundingClientRect();
        setModalStyle({
            top: rect.bottom + window.scrollY + 5 + 'px',
            left: rect.left + window.scrollX + 5 + 'px'
        });
        setShowInfoModal(!showInfoModal);
    };

    const handleClickOutside = (event) => {
        if (infoIconRef.current && !infoIconRef.current.contains(event.target) &&
            !document.querySelector('.info-modal')?.contains(event.target)) {
            setShowInfoModal(false);
        }
    };

    useEffect(() => {
        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    return (
        <div className="meeting-page-container">
            <div className="meeting-header">
                <div className="left-header">
                    <div className="header-item" ref={infoIconRef} onClick={handleClickInfo}>
                        <FontAwesomeIcon icon={faInfoCircle} className="self-icon" style={{ fontSize: '13px' }} />
                        <span>会议详情</span>
                    </div>
                    <div className="border-shu" />
                    <div
                        className="header-item"
                        ref={securityIconRef}
                        onMouseEnter={handleMouseEnterSecurity}
                        onMouseLeave={() => setShowSecurityTooltip(false)}
                    >
                        <FontAwesomeIcon icon={faShieldAlt} style={{ fontSize: '14px', color: "#0066ff" }} />
                    </div>
                    {showSecurityTooltip && (
                        <div className="tooltip" style={tooltipStyle}>
                            会议已加密保护
                        </div>
                    )}
                    <div
                        className="header-item"
                        ref={networkIconRef}
                        onMouseEnter={handleMouseEnterNetwork}
                        onMouseLeave={() => setShowNetworkTooltip(false)}
                    >
                        <FontAwesomeIcon icon={faSignal} style={{ color: '#27d08e', fontSize: '13px' }} />
                    </div>
                    {showNetworkTooltip && (
                        <div className="network-tooltip" style={networkTooltipStyle}>
                            <div>网络连接正常</div>
                            <div>点击检查网络</div>
                            <div>延迟: 59 ms</div>
                            <div>路由器延迟: 8 ms</div>
                            <div>丢包率: 未知</div>
                        </div>
                    )}
                </div>
                <div className="right-header">
                    <div className="header-item">
                        <FontAwesomeIcon icon={faClock} className="self-icon" style={{ fontSize: '13px' }} />
                        <span>22:37</span>
                    </div>
                    <div className="border-shu" />
                    <div className="header-item">
                        <FontAwesomeIcon icon={faThLarge} className="self-icon" style={{ fontSize: '14px' }} />
                        <span>宫格视图</span>
                    </div>
                    <div className="border-shu" />
                    <div className="header-item">
                        <FontAwesomeIcon icon={faExpand} className="self-icon" style={{ fontSize: '15px' }} />
                    </div>
                </div>
            </div>
            <div className="border-heng"></div>
            <div className="meeting-body">
                <div className="speaker-info">正在讲话:</div>

                <div className="member-container">
                    {speakers.map((speaker, index) => (
                        <div className="member-item" key={index}>
                            <span className="icon-stack">
                                <img src={speaker.imgSrc} alt="speaker" />
                                {speaker.isHost && (
                                    <div className="host-icon-container">
                                        <FontAwesomeIcon icon={faUser} className="host-icon" />
                                    </div>
                                )}
                            </span>

                            <div className="member-name-container">
                                <span className="member-name">{speaker.name}</span>
                                <span className="icon-stack">
                                    <FontAwesomeIcon icon={faMicrophone} className="member-mic-icon" />
                                    {!speaker.isSpeaking && <ReactSVG src={Slash} className="member-mic-icon-slash" />}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="meeting-footer">
                <div className="left-controls">
                    <div className="footer-item">
                        <div className="self-icon-stack">
                            <FontAwesomeIcon icon={faMicrophone} className="self-icon" />
                            {isMuted && <ReactSVG src={Slash} className="self-icon-slash self-mic" />}
                        </div>
                        <span>解除静音</span>
                    </div>
                    <div className="footer-item">
                        <div className="self-icon-stack">
                            <img src={Camera} className="self-icon self-camera" />
                            {!enabledCamera && <ReactSVG src={Slash} className="self-icon-slash self-camera" />}
                        </div>
                        <span>开启视频</span>
                    </div>
                </div>
                <div className="center-controls">
                    <div className="footer-item">
                        <div className="self-icon-stack">
                            <img src={Screen} className="self-icon self-screen" />
                        </div>
                        <span>共享屏幕</span>
                    </div>
                    <div className="footer-item">
                        <div className="self-icon-stack">
                            <FontAwesomeIcon icon={faShieldAlt} className="self-icon self-shield" />
                        </div>
                        <span>安全</span>
                    </div>
                    <div className="footer-item">
                        <div className="self-icon-stack">
                            <img src={User} className="self-icon self-user" />
                        </div>

                        <span>邀请</span>
                    </div>
                    <div className="footer-item">
                        <div className="self-icon-stack">
                            <img src={MgrUser} className="self-icon self-mgr" />
                        </div>
                        <span>管理成员({speakers.length})</span>
                    </div>
                    <div className="footer-item">
                        <div className="self-icon-stack">
                            <img src={Chat} className="self-icon self-chat" />
                        </div>
                        <span>聊天</span>
                    </div>
                    <div className="footer-item">
                        <div className="self-icon-stack">
                            {isRecording ?
                                (<img src={RecStop} className="self-icon self-rec-stop" />) :
                                (<img src={RecStart} className="self-icon self-rec-start" />)}
                        </div>
                        <span>录制</span>
                    </div>
                    <div className="footer-item">
                        <div className="self-icon-stack">
                            <FontAwesomeIcon icon={faCog} className="self-icon" />
                        </div>
                        <span>设置</span>
                    </div>
                </div>
                <button className="end-meeting-button">
                    结束会议
                </button>
            </div>
            {showInfoModal && (
                <div className="info-modal" style={modalStyle}>
                    <div className="info-row">
                        <span className="info-label">主题</span>
                        <span className="info-value">属亚杰的个人会议室</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">会议号</span>
                        <span className="info-value">
                            <span className='num-space'>498 763 1000</span>
                            <FontAwesomeIcon icon={faCopy} className="icon-space self-icon" />
                            <div className="border-shu" />
                            <FontAwesomeIcon icon={faLink} className="icon-space self-icon" />
                        </span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">密码</span>
                        <span className="info-value">183934</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">发起人</span>
                        <span className="info-value">属亚杰</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">我的名称</span>
                        <span className="info-value">属亚杰</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">参会时长</span>
                        <span className="info-value">58:15</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MeetingPage;
