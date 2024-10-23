import { makeAutoObservable } from 'mobx'
import {
  ClientId,
  UnspecifiedClientId,
  CreateRoomParams,
  JoinRoomParams,
  JoinInfo,
  MemberInfo,
  SFUClient,
  MCSJoinInfo,
  DisconnectReason,
  MediaType,
  ClientInitParams,
  MCSRoomPermission,
  ExtRole,
  RoomType,
  isClientIdEqual,
} from 'sfu-sdk'

/**
 * SFU Cliet
 */
class SfuClientStore {

  /////////////////////// 基本参数
  mcsUrl: string = ''

  /////////////////////// 参会属性
  clientId: ClientId = UnspecifiedClientId // 客户端ID
  clientName: string = "Undefined" // 客户端名称
  areaId: string = '' // 区域ID
  autoOpenMic: boolean = false // 入会时自动打开麦克风
  autoOpenCamera: boolean = false // 入会时自动打开相机
  adaptiveStream: boolean = false // 自用自适应流
  videoSimulcast: boolean = true // 启用多播
  enableVideoOriginSize: boolean = false // 启用视频原始分辨率上报
  maxResolution: string = undefined // 最大分辨率
  fixedResolution: boolean = false // 固定分辨率
  password: string = undefined // 会议密码

  /////////////////////// 建会属性
  roomName: string = 'Unknown' // 会议名称
  maxMembers: number = 100 // 最大会议人数
  emptyTimeoutSec: number = 60 // 会议室空置回收超时时间
  durationSeconds: number = 3600 // 会议持续时长(秒)
  allowMemOpenCam: boolean = true // 允许成员开启视频
  allowMemRename: boolean = true // 允许成员改名
  allowMemOpenMic: boolean = true // 允许成员自我解除静音
  allowMemHandsUp: boolean = true // 允许成员举手
  allowMemShareScreen: boolean = true // 允许屏幕共享
  forceMuteMicWhileJoining: boolean = false // 成员入会时是否强制关闭麦克风
  forceMuteCameraWhileJoining: boolean = true // 成员入会时是否强制关闭摄像头

  /////////////////////// 入会属性
  roomNum: string = undefined

  /////////////////////// 其他
  messageTip: any // 用户从消息提示句柄

  constructor() {
    makeAutoObservable(this)
  }

  setMessageTip = (messageTip: any) => {
    this.messageTip = messageTip
  }

  initCommSfuClient = (client: SFUClient) => {
    const params = new ClientInitParams(
      this.mcsUrl,
      this.clientId,
      this.clientName,
      this.autoOpenMic,
      this.autoOpenCamera,
      this.videoSimulcast,
    )
    params.areaId = this.areaId
    params.adaptiveStream = this.adaptiveStream
    params.enableVideoOriginSize = this.enableVideoOriginSize
    params.extRole = ExtRole.Normal

    client.init(params, {})

    client.setNetAddressTransformer({
      onRemoteAddress: (isTcp: boolean, address: string, port: number) => {
        // 默认: 不转换地址
        return { changed: false, dropped: false }
      },
      onLocalAddress: (isTcp: boolean, address: string, port: number) => {
        // 默认: 不转换地址
        return { changed: false, dropped: false }
      },
    })
  }

  getCommCreateRoomParams = (): CreateRoomParams => {
    return new CreateRoomParams(
      this.clientName,
      this.roomName,
      RoomType.Normal,
      this.maxMembers,
      this.password,
      this.getRoomPermission(),
      this.emptyTimeoutSec,
      this.durationSeconds,
    )
  }

  getCommJoinRoomParams = (): JoinRoomParams => {
    return new JoinRoomParams(this.clientName, this.roomNum.replace('-', ''), this.password)
  }

  getRoomPermission = (): MCSRoomPermission => {
    return new MCSRoomPermission(
      this.allowMemRename,
      this.allowMemOpenCam,
      this.allowMemOpenMic,
      this.allowMemShareScreen,
      this.forceMuteMicWhileJoining ? 0 : 1,
      this.forceMuteCameraWhileJoining ? 0 : 1,
      6,
      3,
    )
  }

  isMyId = (id: ClientId): boolean => {
    return this.clientId && isClientIdEqual(id, this.clientId)
  }
}

export { SfuClientStore }
