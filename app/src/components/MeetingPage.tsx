import '../styles/MeetingPage.css';

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, json } from 'react-router-dom'
// 导入中间件连接 mobx 和 react 完成响应式变化
import { observer } from 'mobx-react-lite'

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
import profileImage2 from '../assets/images/profile2.jpeg';

import { Button, Col, Row, Popover, Modal, Input, message } from 'antd'
import { NoticeType } from 'antd/es/message/interface'

import { useStore } from '../store'
import {
    MediaType, MediaTypeStr, MemberInfo, MCSRoomPermission, SFUClient,
    DisconnectReason, ClientId, ClientIdType, Prop,
    CreateIngressParams, StreamParams, SFURoomCallback,
    MCSEgressLayoutMode, CreateEgressParams,
    MCSLivekitEncodingOptions, MCSEgressLayoutParams,
    MCSEgressOutputParams, MCSEgressOutputType,
    SFUClientCallback, EgressStatus, EgressState,
    RtspVcState, TxVideoConfigs, ClientInitParams, UnspecifiedClientId, genClientIdBySFUId, JoinInfo, ConnectionQuality,
} from 'sfu-sdk'
import VoiceMembersGrid from './MemberShowVoiceOnly';
import { MemberItem } from './common';
import MemberAudioPlayGrid, { MemberAudio } from './MemberPlayAudio';

const MeetingPage = () => {
    // 状态管理
    const [sfuClient, setSfuClient] = useState(new SFUClient());
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
    const [hasSharedScreeen, setHasSharedScreeen] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isHost, setIsHost] = useState<boolean>() // 获取主持人标识
    const [isLowHost, setIsLowHost] = useState<boolean>() // 获取主持人标识
    const [isEndingMeeting, setIsEndingMeeting] = useState(false);
    const { meetingStateSetStore, sfuClientStore, sfuMemberStore } = useStore()
    const [members, setMembers] = useState<MemberItem[]>([
        // { sfuId: "1", name: "派大星", imgSrc: undefined, isHost: false, isLowHost: false, isMicrophoneEnabled: false, isSpeaking: false, isCameraEnabled: false, isScreenShareEnabled: false, empty: false, isSelf: false },
        // { sfuId: "2", name: "张三", imgSrc: undefined, isHost: false, isLowHost: false, isMicrophoneEnabled: false, isSpeaking: false, isCameraEnabled: false, isScreenShareEnabled: false, empty: false, isSelf: false },
        // { sfuId: "3", name: "张", imgSrc: undefined, isHost: false, isLowHost: false, isMicrophoneEnabled: false, isSpeaking: false, isCameraEnabled: false, isScreenShareEnabled: false, empty: false, isSelf: false },
        // { sfuId: "4", name: "张一", imgSrc: undefined, isHost: false, isLowHost: false, isMicrophoneEnabled: false, isSpeaking: false, isCameraEnabled: false, isScreenShareEnabled: false, empty: false, isSelf: false },
        // { sfuId: "5", name: "李一二", imgSrc: undefined, isHost: false, isLowHost: false, isMicrophoneEnabled: false, isSpeaking: false, isCameraEnabled: false, isScreenShareEnabled: false, empty: false, isSelf: false },
        // { sfuId: "6", name: "李一二三", imgSrc: undefined, isHost: false, isLowHost: false, isMicrophoneEnabled: false, isSpeaking: false, isCameraEnabled: false, isScreenShareEnabled: false, empty: false, isSelf: false },
        // { sfuId: "7", name: "李一二三四", imgSrc: undefined, isHost: false, isLowHost: false, isMicrophoneEnabled: false, isSpeaking: false, isCameraEnabled: false, isScreenShareEnabled: false, empty: false, isSelf: false },
        // { sfuId: "11", name: "派大星2", imgSrc: undefined, isHost: false, isLowHost: false, isMicrophoneEnabled: true, isSpeaking: false, isCameraEnabled: false, isScreenShareEnabled: false, empty: false, isSelf: false },
        // { sfuId: "12", name: "张三2", imgSrc: undefined, isHost: false, isLowHost: false, isMicrophoneEnabled: true, isSpeaking: false, isCameraEnabled: false, isScreenShareEnabled: false, empty: false, isSelf: false },
        // { sfuId: "13", name: "张2", imgSrc: undefined, isHost: false, isLowHost: false, isMicrophoneEnabled: true, isSpeaking: false, isCameraEnabled: false, isScreenShareEnabled: false, empty: false, isSelf: false },
        // { sfuId: "14", name: "张一2", imgSrc: undefined, isHost: false, isLowHost: false, isMicrophoneEnabled: true, isSpeaking: false, isCameraEnabled: false, isScreenShareEnabled: false, empty: false, isSelf: false },
        // { sfuId: "15", name: "李一二2", imgSrc: undefined, isHost: false, isLowHost: false, isMicrophoneEnabled: false, isSpeaking: false, isCameraEnabled: false, isScreenShareEnabled: false, empty: false, isSelf: false },
        // { sfuId: "16", name: "李一二三2", imgSrc: undefined, isHost: false, isLowHost: false, isMicrophoneEnabled: false, isSpeaking: false, isCameraEnabled: false, isScreenShareEnabled: false, empty: false, isSelf: false },
        // { sfuId: "17", name: "李一二三四2", imgSrc: undefined, isHost: false, isLowHost: false, isMicrophoneEnabled: false, isSpeaking: false, isCameraEnabled: false, isScreenShareEnabled: false, empty: false, isSelf: false },
        // { sfuId: "21", name: "派大星3", imgSrc: undefined, isHost: false, isLowHost: false, isMicrophoneEnabled: true, isSpeaking: false, isCameraEnabled: false, isScreenShareEnabled: false, empty: false, isSelf: false },
        // { sfuId: "22", name: "张三3", imgSrc: undefined, isHost: false, isLowHost: false, isMicrophoneEnabled: true, isSpeaking: false, isCameraEnabled: false, isScreenShareEnabled: false, empty: false, isSelf: false },
        // { sfuId: "23", name: "张3", imgSrc: undefined, isHost: false, isLowHost: false, isMicrophoneEnabled: true, isSpeaking: false, isCameraEnabled: false, isScreenShareEnabled: false, empty: false, isSelf: false },
        // { sfuId: "24", name: "张一3", imgSrc: undefined, isHost: false, isLowHost: false, isMicrophoneEnabled: true, isSpeaking: false, isCameraEnabled: false, isScreenShareEnabled: false, empty: false, isSelf: false },
        // { sfuId: "25", name: "李一二3", imgSrc: undefined, isHost: false, isLowHost: false, isMicrophoneEnabled: false, isSpeaking: false, isCameraEnabled: false, isScreenShareEnabled: false, empty: false, isSelf: false },
        // { sfuId: "26", name: "李一二三3", imgSrc: undefined, isHost: false, isLowHost: false, isMicrophoneEnabled: false, isSpeaking: false, isCameraEnabled: false, isScreenShareEnabled: false, empty: false, isSelf: false },
        // { sfuId: "27", name: "李一二三四3", imgSrc: undefined, isHost: false, isLowHost: false, isMicrophoneEnabled: false, isSpeaking: false, isCameraEnabled: false, isScreenShareEnabled: false, empty: false, isSelf: false },
    ]);

    const [index, setIndex] = useState(0);
    const doTestNext = () => {
        setIndex(index + 1)
        const selected = members[Math.floor(index / 2) % members.length]
        setMembers((prevMembers) => {
            if (!prevMembers) return [];
            return prevMembers.map((member) =>
                selected && member.sfuId === selected.sfuId ?
                    {
                        ...member,
                        isSpeaking: !member.isSpeaking,
                    } : member
            );
        });
    }

    // 获取入会方式
    const action = new URLSearchParams(useLocation().search).get('action');

    // 初始化页面操作
    useEffect(() => {
        // 消息回调
        sfuClientStore.setMessageTip(messageTip)

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    // 客户端初始化操作
    useEffect(() => {
        // 初始化SDK
        sfuClientStore.initCommSfuClient(sfuClient)

        // 设置客户端回调
        sfuClient.setSFUClientCallback({})

        if (action === "fast") { // 创建会议并加入
            const params = sfuClientStore.getCommCreateRoomParams()
            console.debug("CreateRoomParams", params)

            sfuClient.createRoom(params, roomCallback, sfuClientStore.maxResolution, sfuClientStore.fixedResolution)
                .then((res) => onJoined("createRoom", res, undefined))
        } else if (action === "join") { // 加入会议
            const params = sfuClientStore.getCommJoinRoomParams()
            console.debug("JoinRoomParams", params)

            sfuClient.joinRoom(params, roomCallback, sfuClientStore.maxResolution, sfuClientStore.fixedResolution)
                .then((res) => onJoined("joinRoom", res, undefined))
        } else { // 直接加入SFU
        }
    }, [])

    const onJoined = (entry, res, layout) => {
        console.log(entry + " result:", res)

        if (res.code === 0) {
            const info: JoinInfo = res.data
            setIsHost(info.isHost || (layout && layout === "host"))
            sfuClientStore.clientId = info.clientId
            saveMeetingRecord(info.roomName, info.roomNum)
        } else {
            messageTip(res.msg)
        }
    }

    // 会议回调
    const roomCallback: SFURoomCallback = {
        // (自身)已退出房间
        onDisconnected: (roomNum: string, reason?: DisconnectReason) => {
            onLeave("退出会议 (" + roomNum + "): " + reason)
        },
        // (自身)重连中
        onReconnecting: (roomNum: string) => {
            messageTip("掉线重连中", "warning")
        },
        // (自身)已重连成功
        onReconnected: (roomNum: string) => {
            messageTip("重连成功", "info")
        },
        // 有成员加入房间
        onMemberConnected: (roomNum: string, member: MemberInfo) => {
            console.debug('新成员入会', member, '当前' + sfuClient.getMemberCount() + '人')

            const newOne = new MemberItem(
                member.sfuId,
                member.clientName,
                undefined,
                sfuClientStore.isMyId(member.clientId),
                member.isHost,
                member.isLowHost,
                member.isMicrophoneEnabled,
                member.isCameraEnabled,
                member.isScreenShareEnabled,
            )

            setMembers((prevMembers) => {
                if (!prevMembers) return [newOne];
                return [...prevMembers, newOne];
            });
        },
        // 有成员离开房间
        onMemberDisconnected: (
            roomNum: string,
            client: ClientId,
            member: MemberInfo
        ) => {
            console.debug('成员退出', member, '剩余' + sfuClient.getMemberCount() + '人')

            setMembers((prevMembers) => {
                if (!prevMembers) return [];
                return prevMembers.filter((member) => member.sfuId !== member.sfuId);
            });
        },
        // 本地媒体的可用状态发生变化
        onLocalMediaStateChanged: (
            roomNum: string,
            client: ClientId,
            mediaType: MediaType,
            available: boolean,
            member: MemberInfo
        ): HTMLMediaElement | null | 'delayed' => {
            console.debug('本地媒体的可用状态发生变化', member.sfuId, MediaTypeStr(mediaType), available, member)

            if (mediaType === MediaType.Camera) {
                setEnabledCamera(available)
            } else if (mediaType === MediaType.Microphone) {
                setIsMuted(!available)
            } else if (mediaType === MediaType.ScreenShare) {
                setHasSharedScreeen(available)
            }

            updateMember(member)
            return checkShouldShow(true, mediaType, available, member) ? 'delayed' : null
        },
        // 远程媒体的可用状态发生变化
        onRemoteMediaStateChanged: (
            roomNum: string,
            remoteId: ClientId,
            mediaType: MediaType,
            state: number,
            member: MemberInfo
        ): HTMLMediaElement | null | 'delayed' => {
            console.debug('远程媒体的可用状态发生变化', member.sfuId, MediaTypeStr(mediaType), state, member)

            updateMember(member)
            return checkShouldShow(false, mediaType, state > 0, member) ? 'delayed' : null
        },
        // 其他成员的名称(昵称)变化
        onRemoteNameChanged: (
            roomNum: string,
            remoteId: ClientId,
            name: string,
            info: MemberInfo
        ) => {
            console.debug('其他成员的名称变化', name)
            updateMember(info)
        },
        // 成员连接质量变化(包含自身)
        onConnectionQualityChanged: (
            roomNum: string,
            client: ClientId,
            quality: ConnectionQuality
        ) => {
            console.debug('成员连接质量变化(包含自身)', client, quality)
        },
        // 成员属性变化(包含自身)
        onMemberPropertiesChanged: (
            roomNum: string,
            client: ClientId,
            properties: Map<string, string>,
            info: MemberInfo
        ) => {
            console.info("成员属性变化", roomNum, client, properties)

            if (sfuClientStore.isMyId(client)) {
                setIsHost(info.isHost)
                setIsLowHost(info.isLowHost)
            }

            updateMember(info)
        },
        // 本地视频发送分辨率发生变化
        onLocalVideoTxSizeChanged: (
            roomNum: string,
            memberId: ClientId,
            mediaType: MediaType,
            width: number,
            height: number,
        ) => {
            console.debug('本地视频发送分辨率发生变化', MediaTypeStr(mediaType), width, height)
        },
        // 远程视频原始分辨率发生变化
        onRemoteVideoOriginSizeChanged: (
            roomNum: string,
            memberId: ClientId,
            mediaType: MediaType,
            width: number,
            height: number,
        ) => {
            console.debug('远程视频原始分辨率发生变化', memberId, MediaTypeStr(mediaType), width, height)
        },
        // 来自远程的应用层消息
        onRemoteMessage: (
            roomNum: string,
            memberInfo: MemberInfo,
            msg: string
        ) => {
            console.log("收到消息，会议号：" + roomNum + " 发送者id：" + memberInfo.clientId.toSFUId() + " 发送者姓名:" + memberInfo.clientName + " 消息内容：" + msg)
            messageTip("[消息] " + memberInfo.clientName + ": " + msg)
        },
        // 发言终端状态改变
        onSpeakingChanged: (
            roomNum: string,
            client: ClientId,
            isSpeaking: boolean
        ) => {
            updateMemberSpeaking(client.toSFUId(), isSpeaking)
        },
        // 会议属性发生改变
        onRoomMetadataChanged: (roomNum, metadata) => {
            console.log("onRoomMetadataChanged:", roomNum, metadata)
        },
        // 主持人发生改变后的回调
        onHostChanged: (roomNum, params) => {
            console.log("onHostChanged:", roomNum, params)
        }
    }

    // 成员的audio标签状态变化
    const onAudioElement = (member: MemberItem, audioElement) => {
        const clientId = genClientIdBySFUId(member.sfuId)
        if (audioElement) {
            console.log(`Audio element created for member ${member.sfuId}`);
            const res = sfuClient.setMediaElement(clientId, MediaType.Microphone, audioElement)
            if (res.code !== 0) {
                console.warn("sfuClient.setMediaElement failed", res)
            }
        } else {
            console.log(`Audio element removed for member ${member.sfuId}`);
            const res = sfuClient.removeMediaElement(clientId, MediaType.Microphone)
            if (res.code !== 0) {
                console.warn("sfuClient.removeMediaElement failed", res)
            }
        }
    };

    //判断哪个位成员媒体信息需要同步更新
    const filterMediaStateChanged = (list: Array<MemberInfo>, id: ClientId, member: MemberInfo) => {
        for (let i = 0; i < list.length; i++) {
            const item = list[i]
            if (isClientIdEqual(id, item.clientId)) {
                // // 更新成员的信息
                sfuMemberStore.updateMemberArr(member)
            }
        }
    }

    // 结束会议
    const doStopMeeting = async () => {
        const res = await sfuClient.deleteRoom()
        if (res.code === 0) {
            onLeave()
        } else {
            messageTip(res.msg)
        }
    }

    // 退出会议
    const doExitMeeting = async () => {
        const res = await sfuClient.exitRoom()
        if (res.code === 0) {
            onLeave()
        } else {
            messageTip(res.msg)
        }
    }

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

    const handleEndMeetingClick = () => {
        setIsEndingMeeting(true);
    };

    const handleCancelClick = () => {
        setIsEndingMeeting(false);
    };

    // 修改会议权限
    const handleUpdateRoomPermission = async (tag: string) => {
        if (tag === 'allowMemOpenCam') {
            sfuClientStore.allowMemOpenCam = !sfuClientStore.allowMemOpenCam
        } else if (tag === 'allowMemRename') {
            sfuClientStore.allowMemRename = !sfuClientStore.allowMemRename
        } else if (tag === 'allowMemOpenMic') {
            sfuClientStore.allowMemOpenMic = !sfuClientStore.allowMemOpenMic
        } else if (tag === 'allowMemHandsUp') {
            sfuClientStore.allowMemHandsUp = !sfuClientStore.allowMemHandsUp
        } else if (tag === 'allowMemShareScreen') {
            sfuClientStore.allowMemShareScreen = !sfuClientStore.allowMemShareScreen
        } else if (tag === 'forceMuteMicWhileJoining') {
            sfuClientStore.forceMuteMicWhileJoining = !sfuClientStore.forceMuteMicWhileJoining
        } else if (tag === 'forceMuteCameraWhileJoining') {
            sfuClientStore.forceMuteCameraWhileJoining = !sfuClientStore.forceMuteCameraWhileJoining
        }
        const permission = sfuClientStore.getRoomPermission()
        await sfuClient.setRoomPermission(permission)
    }

    const checkShouldShow = (isLocal: boolean, mediaType: MediaType,
        available: boolean, member: MemberInfo): boolean => {
        return available
    }

    // 一些辅助方法
    const isClientIdEqual = (o1: ClientId, o2: ClientId): boolean => {
        return o1.type === o2.type && o1.value === o2.value
    }
    const [messageApi, contextHolder] = message.useMessage()
    const messageTip = (tip: string, type: NoticeType = 'error') => messageApi.open({
        type: type,
        content: tip,
    })
    const navigate = useNavigate()
    const onLeave = (message?: string) => {
        if (message) {
            messageTip("即将退出：" + message)
            setTimeout(function () {
                navigate('/')
                window.location.reload();
            }, 3000);
        } else {
            navigate('/')
            window.location.reload();
        }
    }
    const updateMember = (updatedMember: MemberInfo) => {
        setMembers((prevMembers) => {
            if (!prevMembers) return [];
            return prevMembers.map((member) =>
                member.sfuId === updatedMember.sfuId ?
                    {
                        ...member,
                        name: updatedMember.clientName,
                        isHost: updatedMember.isHost,
                        isLowHost: updatedMember.isLowHost,
                        isMicrophoneEnabled: updatedMember.isMicrophoneEnabled,
                        isCameraEnabled: updatedMember.isCameraEnabled,
                        isScreenShareEnabled: updatedMember.isScreenShareEnabled,
                    } : member
            );
        });
    };
    const updateMemberSpeaking = (sfuId: string, isSpeaking: boolean) => {
        setMembers((prevMembers) => {
            if (!prevMembers) return [];
            return prevMembers.map((member) =>
                member.sfuId === sfuId ?
                    {
                        ...member,
                        isSpeaking: isSpeaking,
                    } : member
            );
        });
    };
    const saveMeetingRecord = (meetingName, meetingId) => {
        const storedMeetingRecords = localStorage.getItem('recentMeetingRecords');
        const meetingRecords = !!storedMeetingRecords ? JSON.parse(storedMeetingRecords) : []

        // 更新最近的会议记录列表，确保不重复, 且最多保存10条
        const updatedMeetingRecords = [
            { name: meetingName, id: meetingId },
            ...meetingRecords.filter(record => record.id !== meetingId),
        ].slice(0, 10);

        localStorage.setItem('recentMeetingRecords', JSON.stringify(updatedMeetingRecords));
    };

    return (
        <div className="meeting-page-container">
            {contextHolder}
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
                <MemberAudioPlayGrid members={members} onAudioElement={onAudioElement} />
                <VoiceMembersGrid members={members} maxCnt={14} />
            </div>
            <div className={`border-heng ${isEndingMeeting ? 'ending' : 'hidden'}`} />
            <div className={`meeting-footer ${isEndingMeeting ? 'ending' : ''}`}>
                <div className="left-controls">
                    <div className="footer-item fixed4" onClick={() => sfuClient.switchLocalMedia(MediaType.Microphone, isMuted)}>
                        <div className="self-icon-stack">
                            <FontAwesomeIcon icon={faMicrophone} className="self-icon" />
                            {isMuted && <ReactSVG src={Slash} className="self-icon-slash self-mic" />}
                        </div>
                        <span>{isMuted ? '解除静音' : '静音'}</span>
                    </div>
                    <div className="footer-item fixed4">
                        <div className="self-icon-stack">
                            <img src={Camera} className="self-icon self-camera" />
                            {!enabledCamera && <ReactSVG src={Slash} className="self-icon-slash self-camera" />}
                        </div>
                        <span>{!enabledCamera ? '开启视频' : '关闭视频'}</span>
                    </div>
                </div>
                <div className="center-controls">
                    <div className="footer-item fixed5">
                        <div className="self-icon-stack">
                            <img src={Screen} className="self-icon self-screen" />
                        </div>
                        <span>{hasSharedScreeen ? '共享屏幕中' : '共享屏幕'}</span>
                    </div>
                    <div className="footer-item" onClick={doTestNext}>
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
                    <div className="footer-item fixed6">
                        <div className="self-icon-stack">
                            <img src={MgrUser} className="self-icon self-mgr" />
                        </div>
                        <span>管理成员({members.length})</span>
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
                <button className="end-meeting-button" onClick={handleEndMeetingClick}>
                    结束会议
                </button>
                <div className="end-meeting-overlay">
                    <div className="end-meeting-controls">
                        <button className="end-meeting-button2" onClick={doStopMeeting}>结束会议</button>
                        <button className="leave-meeting-button" onClick={doExitMeeting}>离开会议</button>
                    </div>
                </div>
                <button className="ending-cancel-button" onClick={handleCancelClick}>取消</button>
            </div>
            {showInfoModal && (
                <div className="info-modal" style={modalStyle}>
                    <div className="info-row">
                        <span className="info-label">主题</span>
                        <span className="info-value">派大星的个人会议室</span>
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
                        <span className="info-value">派大星</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">我的名称</span>
                        <span className="info-value">派大星</span>
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

export default observer(MeetingPage);