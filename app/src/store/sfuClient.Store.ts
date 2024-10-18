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
} from 'sfu-sdk'

import {
  handleConnectionQualityChanged,
  handleLocalMediaStateChanged,
  // handleMemberConnected,
  // handleMemberDisconnected,
  handleRemoteMediaStateChanged,
  onMemberPropertiesChanged,
  onLocalVideoTxSizeChanged,
  onRemoteVideoOriginSizeChanged,
  handleRemoteNameChanged,
  handleSpeakersChanged,
  handleSpeakingChanged,
  renderParticipant,
  handleMediaDevicesChanged,
} from '../renderParticipant'

/**
 * SFU Cliet
 */
class SfuClientStore {
  // 1.定义数据
  sfuClient = new SFUClient()

  mcsUrl: string

  // 创建会议参数
  createRoomParams = new CreateRoomParams('', '', 1, 1)

  // 加入会议参数
  joinRoomParams = new JoinRoomParams('', '')

  // 最大分辨率
  maxResolution = undefined

  // 固定分辨率
  fixedResolution = false

  // 创建加入会议成功返回data数据
  roomInfo = new JoinInfo(new MCSJoinInfo({ room: null, sfu: null, user: null }), false)

  // 比较主持人ClientId是否一致
  selfClientId = new ClientId(0, "")

  // 成员信息
  memberArr = new Array<MemberInfo>()

  // 本地成员信息
  localMember = new MemberInfo(
    UnspecifiedClientId,
    '',
    false,
    false,
    false,
    false,
    new Map()
  )

  messageTip: any

  setMessageTip = (messageTip: any) => {
    this.messageTip = messageTip
  }

  callback4Page: any

  setCallback4Page = (callback4Page: any) => {
    this.callback4Page = callback4Page
  }

  // SFU会议相关的回调
  roomCallback: any = {
    onDisconnected: (roomNum: string, reason?: DisconnectReason) => {
      this.callback4Page?.onDisconnected?.(roomNum, reason)
    },
    onMemberConnected: (str: string, member: MemberInfo) => {
      this.handleMemberConnected(str, member)
    },
    onMemberDisconnected: (
      str: string,
      client: ClientId,
      member: MemberInfo
    ) => {
      this.handleMemberDisconnected(str, client, member)
    },
    onSpeakersChanged: handleSpeakersChanged,
    onLocalMediaStateChanged: (
      roomNum: string,
      client: ClientId,
      mediaType: MediaType,
      available: boolean,
      member: MemberInfo
    ) => {
      this.callback4Page?.onLocalMediaStateChanged?.(roomNum, client, mediaType, available, member)
      return handleLocalMediaStateChanged(roomNum, client, mediaType, available, member)
    },
    onMemberPropertiesChanged: (
      roomNum: string,
      client: ClientId,
      setmetadata: Map<string, string>,
      info: MemberInfo
    ) => {
      console.info("成员属性变化", roomNum, client, setmetadata)
      this.callback4Page?.onMemberPropertiesChanged?.(roomNum, client, setmetadata, info)
      return onMemberPropertiesChanged(roomNum, client, setmetadata, info)
    },
    onLocalVideoTxSizeChanged: (
      roomNum: string,
      memberId: ClientId,
      mediaType: MediaType,
      width: number,
      height: number,
    ) => {
      this.callback4Page?.onLocalVideoTxSizeChanged?.(roomNum, memberId, mediaType, width, height)
      return onLocalVideoTxSizeChanged(roomNum, memberId, mediaType, width, height)
    },
    onRemoteVideoOriginSizeChanged: (
      roomNum: string,
      memberId: ClientId,
      mediaType: MediaType,
      width: number,
      height: number,
    ) => {
      this.callback4Page?.onRemoteVideoOriginSizeChanged?.(roomNum, memberId, mediaType, width, height)
      return onRemoteVideoOriginSizeChanged(roomNum, memberId, mediaType, width, height)
    },
    onRemoteMediaStateChanged: (
      roomNum: string,
      remoteId: ClientId,
      mediaType: MediaType,
      state: number,
      member: MemberInfo
    ) => {
      this.callback4Page?.onRemoteMediaStateChanged?.(roomNum, remoteId, mediaType, state, member)
      return handleRemoteMediaStateChanged(roomNum, remoteId, mediaType, state, member, this.messageTip)
    },
    onConnectionQualityChanged: handleConnectionQualityChanged,
    onRemoteNameChanged: (
      roomNum: string,
      remoteId: ClientId,
      name: string,
      info: MemberInfo
    ) => {
      this.callback4Page?.onRemoteNameChanged?.(roomNum, remoteId, name, info)
      return handleRemoteNameChanged(roomNum, remoteId, name, info)
    },
    onSpeakingChanged: handleSpeakingChanged,
    onMediaDevicesChanged: handleMediaDevicesChanged,
    onRemoteMessage: (roomNum, remoteId, msg) => {
      this.callback4Page?.onRemoteMessage?.(roomNum, remoteId, msg)
    },
    onRoomMetadataChanged: (roomNum, metadata) => {
      console.log("onRoomMetadataChanged:", roomNum, metadata)
    },
    onHostChanged: (roomNum, params) => {
      console.log("onHostChanged:", roomNum, params)
      this.callback4Page?.onHostChanged(roomNum, params)
    }
  }

  // 新成员入会
  handleMemberConnected(str: string, member: MemberInfo) {
    console.debug('新成员入会', member, this.sfuClient.getMemberCount())
    this.memberArr.push(member)
    renderParticipant(member, false)
  }

  // 成员退出
  handleMemberDisconnected(str: string, client: ClientId, member: MemberInfo) {
    console.debug('成员退出', member, this.sfuClient.getMemberCount())
    let index = this.memberArr.indexOf(member)
    this.memberArr.splice(index, 1)
    // 成员退出
    renderParticipant(member, true)
  }

  constructor() {
    // 2.把数据弄成响应式
    makeAutoObservable(this)
  }

  // 3.定义action函数（修改数据）
  setSfuClient = (sfuClient: SFUClient) => {
    this.sfuClient = sfuClient
  }

  setCreateRoomParams = (createRoomParams: CreateRoomParams, maxResolution: string, fixedResolution: boolean) => {
    this.createRoomParams = createRoomParams
    this.maxResolution = maxResolution
    this.fixedResolution = fixedResolution
  }

  setJoinRoomParams = (joinRoomParams: JoinRoomParams, maxResolution: string, fixedResolution: boolean) => {
    this.joinRoomParams = joinRoomParams
    this.maxResolution = maxResolution
    this.fixedResolution = fixedResolution
  }

  setRoomInfo = (roomInfo: JoinInfo) => {
    this.roomInfo = roomInfo
  }
  setSelfClientId = (selfClientId: ClientId) => {
    this.selfClientId = selfClientId
  }

  //MCS地址
  setMcsUrl = (mcsUrl: string) => {
    this.mcsUrl = mcsUrl
    const params = new ClientInitParams(
      mcsUrl,
      UnspecifiedClientId,
      '测试客户端',
      false,
      false,
      false
    )
    params.enableVideoOriginSize = true
    this.sfuClient.init(params, {})

    this.sfuClient.setNetAddressTransformer({
      onRemoteAddress: (isTcp: boolean, address: string, port: number) => {
        // 重庆逻辑：把RTC服务的TCP地址和端口转换成本地代理的安全端口
        if (false) {
          // TODO: 根据安全网关实际分配的端口修改7880
          if (isTcp && port === 26001) return { changed: true, dropped: false, address: "127.0.0.1", port: 7880 }
          // TODO: 根据安全网关实际分配的端口修改7881
          if (isTcp && port === 26002) return { changed: true, dropped: false, address: "127.0.0.1", port: 7881 }
          return { changed: false, dropped: false }
        }

        if (false) { // 公司环境测试: 强制转换为公网入口
          if (address !== "114.114.114.115") return { changed: true, dropped: true }
          return { changed: true, dropped: false, address: "112.82.215.45", port: port }
        }

        // 默认: 不转换地址
        return { changed: false, dropped: false }
      },

      onLocalAddress: (isTcp: boolean, address: string, port: number) => {
        // 重庆逻辑: 不转换本地地址
        if (false) {
          return { changed: false, dropped: false }
        }

        if (false) { // 公司环境测试: 强制使客户端的地址都不可达，使其走远程提供的地址
          return { changed: true, dropped: false, address: "114.114.113.113", port: port }
        }

        // 默认: 不转换地址
        return { changed: false, dropped: false }
      },
    })

    const urlParams = new Map<string, string>();
    urlParams.set('ak', 'ak1');
    urlParams.set('token', 'token1');
    this.sfuClient.setMcsUrlParams(urlParams)

    if (this.sfuClient.isTsbox() || this.sfuClient.isTs5000()) {
      // this.sfuClient.setLocalIpcUrl("rtsp://192.168.1.57:1554")
      // this.sfuClient.setLocalIpcUrl("rtsp://admin:Njsws*2023@192.168.1.62:554/h264/ch33/main/av_stream", "192.168.1.130")
      // this.sfuClient.setLocalIpcUrl("rtsp://127.0.0.1:1554/test")
    }
  }
}

export { SfuClientStore }
