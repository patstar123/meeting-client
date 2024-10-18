import {
  ClientId,
  ConnectionQuality,
  ConnectionState,
  MediaType,
  MemberInfo,
} from 'sfu-sdk'

// export const handleMemberConnected = (str: string, member: MemberInfo) => {
//   // 新成员入会
//   console.debug('应用层有新成员入会')
//   renderParticipant(member)
// }

// export const handleMemberDisconnected = (
//   str: string,
//   client: ClientId,
//   member: MemberInfo
// ) => {
//   // 成员退出
//   renderParticipant(member, true)
// }

export const handleSpeakersChanged = () => {
  // console.debug('(语音)发言人变化列表')
}

export const handleMediaDevicesChanged = () => {
  // 设备变化 调用SDK获取新设备的接口
  console.debug('设备变化')
}

export const handleLocalMediaStateChanged = (
  roomNum: string,
  client: ClientId,
  mediaType: MediaType,
  available: boolean,
  member: MemberInfo
) => {
  console.debug('本地媒体的可用状态发生变化', mediaType, available, member)

  const identity = client.toSFUId()

  if (mediaType === MediaType.Camera) {
    renderParticipant(member, false, available ? 1 : -1)
    return available ? document.getElementById(`video-${identity}`) : null
  } else if (mediaType === MediaType.Microphone) {
    renderParticipant(member, false, available ? 1 : -1)
    return available ? document.getElementById(`audio-${identity}`) : null
  } else if (mediaType === MediaType.ScreenShare) {
    renderScreenShare(member, available)
    return available ? document.getElementById('screenshare-video') : null
  } else if (mediaType === MediaType.ScreenShareAudio) {
    // todo
    renderScreenShare(member, available)
    return available ? document.getElementById('screenshare-video') : null
  }
}

const countPlayingVideo = () => {
  let count = 0
  const videoElements = document.querySelectorAll('video');
  videoElements.forEach((videoElement) => {
    if (videoElement.id !== "screenshare-video" && videoElement.srcObject) {
      ++count
    }
  });
  return count
}

export const handleRemoteMediaStateChanged = (
  roomNum: string,
  remoteId: ClientId,
  mediaType: MediaType,
  state: number,
  member: MemberInfo,
  messageTip?: any,
) => {
  console.debug('远程媒体的可用状态发生变化', mediaType, state, member)

  const identity = remoteId.toSFUId()
  if (mediaType === MediaType.Camera) {
    renderParticipant(member, false, state)
    if (state !== 0) {
      const count = countPlayingVideo()
      const e = document.getElementById(`video-${identity}`) as HTMLMediaElement
      if (!e.srcObject && count >= 3) {
        const msg = "默认最多展示3路视频, 更多须手动调用`setRemoteMediaElement`以显示该远程"
        console.warn(msg)
        if (messageTip) messageTip(msg)
        return null
      } else {
        return e
      }
    } else {
      return null
    }
  } else if (mediaType === MediaType.Microphone) {
    renderParticipant(member, false, state)
    return state !== 0 ? document.getElementById(`audio-${identity}`) : null
  } else if (mediaType === MediaType.ScreenShare) {
    renderScreenShare(member, state !== 0)
    return state !== 0 ? document.getElementById('screenshare-video') : null
  } else if (mediaType === MediaType.ScreenShareAudio) {
    // todo
    renderScreenShare(member, state !== 0)
    return state !== 0 ? document.getElementById('screenshare-video') : null
  }
}

export const handleConnectionQualityChanged = (
  roomNum: string,
  client: ClientId,
  quality: ConnectionQuality
) => {
  console.debug('成员连接质量变化(包含自身)', client, quality)

  const identity = client.toSFUId()
  const signalElm = document.getElementById(`signal-${identity}`)!
  if (!signalElm) {
    console.debug("尚未收到成员连接事件,忽略本次质量事件")
    return
  }

  switch (quality) {
    case ConnectionQuality.Excellent:
    case ConnectionQuality.Good:
    case ConnectionQuality.Poor:
      signalElm.className = `connection-${quality}`
      signalElm.innerHTML = '<i class="fas fa-circle"></i>'
      break
    default:
      signalElm.innerHTML = ''
    // do nothing
  }
  console.debug('signalElm.className', signalElm.className)
}

export const onMemberPropertiesChanged = (
  roomNum: string,
  client: ClientId,
  properties: Map<string, string>,
  info: MemberInfo
) => {
  const identity = client.toSFUId()
  document.getElementById(`name-${identity}`)!.innerHTML =
    info.clientName + "/" + info.sfuId +
    (info.isLocal ? "(自己)" : "") +
    (info.isHost ? "(主持人)" : "") +
    (info.isLowHost ? "(联席主持人)" : "")
}

export const onLocalVideoTxSizeChanged = (
  roomNum: string,
  memberId: ClientId,
  mediaType: MediaType,
  width: number,
  height: number,
) => {
  console.debug('本地视频发送分辨率发生变化', mediaType, width, height)
}

export const onRemoteVideoOriginSizeChanged = (
  roomNum: string,
  memberId: ClientId,
  mediaType: MediaType,
  width: number,
  height: number,
) => {
  console.debug('远程视频原始分辨率发生变化', memberId, mediaType, width, height)
}

export const handleRemoteNameChanged = (
  roomNum: string,
  client: ClientId,
  name: string,
  info: MemberInfo
) => {
  console.debug('成员的名称变化(包括自己)', name)
  const identity = client.toSFUId()
  document.getElementById(`name-${identity}`)!.innerHTML =
    name + "/" + info.sfuId +
    (info.isLocal ? "(自己)" : "") +
    (info.isHost ? "(主持人)" : "") +
    (info.isLowHost ? "(联席主持人)" : "")
}

// 说话人变化
export const handleSpeakingChanged = (
  roomNum: string,
  client: ClientId,
  isSpeaking: boolean
) => {
  const identity = client.toSFUId()
  let div = document.getElementById(`participant-${identity}`)
  if (isSpeaking) {
    div!.classList.add('speaking')
  } else {
    div!.classList.remove('speaking')
  }
}

// updates participant UI
export const renderParticipant = (
  participant: MemberInfo,
  remove: boolean = false,
  state?: number, // 0=被移除,不可用 1=可用,可播放 -1=被暂停
) => {
  return renderParticipant2(
    participant.clientId.toSFUId(),
    participant.sfuId,
    participant.clientName,
    participant.isLocal,
    participant.isHost,
    remove,
    participant.isLowHost
  )
}

export const renderParticipant2 = (
  identity: string,
  sfuId: string,
  name: string,
  isLocal: boolean,
  isHost: boolean,
  remove: boolean,
  isLowHost?: boolean,
) => {
  const container = document.getElementById('participants-area')

  if (!container) return
  let div = document.getElementById(`participant-${identity}`)

  if (!div && !remove) {
    // 左侧容器
    div = document.createElement('div')
    div.id = `participant-${identity}`
    div.className = 'participant'
    div.innerHTML = `
      <video autoplay playsinline id="video-${identity}"></video>
      <audio id="audio-${identity}"></audio>
      <div class="info-bar">
        <div id="name-${identity}" class="name"></div>
        <div style="text-align: center;">
          <span id="codec-${identity}" class="codec">
          </span>
          <span id="size-${identity}" class="size">
          </span>
          <span id="bitrate-${identity}" class="bitrate">
          </span>
        </div>
        <div class="right">
          <span id="signal-${identity}"></span>
          <span id="mic-${identity}" class="mic-on"></span>
          <span id="e2ee-${identity}" class="e2ee-on"></span>
        </div>
      </div>
      ${!isLocal
        ? `<div class="volume-control">
        <input id="volume-${identity}" type="range" min="0" max="1" step="0.1" value="1" orient="vertical" />
      </div>`
        : `<progress id="local-volume" max="1" value="0" />`
      }
    `
    container.appendChild(div)

    const sizeElm = document.getElementById(`size-${identity}`)
    const videoElm = <HTMLVideoElement>(
      document.getElementById(`video-${identity}`)
    )
    videoElm.onresize = () => {
      updateVideoSize(videoElm!, sizeElm!)
    }
    videoElm.style.objectFit = "contain"
  }
  // 视频
  const videoElm = <HTMLVideoElement>(
    document.getElementById(`video-${identity}`)
  )
  // 音频
  const audioELm = <HTMLAudioElement>(
    document.getElementById(`audio-${identity}`)
  )
  // 下线移除
  if (remove) {
    div?.remove()
    if (videoElm) {
      videoElm.srcObject = null
      videoElm.src = ''
    }
    if (audioELm) {
      audioELm.srcObject = null
      audioELm.src = ''
    }
    return
  }

  // update properties
  document.getElementById(`name-${identity}`)!.innerHTML =
    name + "/" + sfuId +
    (isLocal ? "(自己)" : "") +
    (isHost ? "(主持人)" : "") +
    (isLowHost ? "(联席主持人)" : "")
}

// 共享屏幕
export const renderScreenShare = (
  member: MemberInfo,
  screenSharePub: boolean
) => {
  console.debug('state11', member, screenSharePub)

  const div = document.getElementById('screenshare-area')!
  const videoElm = <HTMLVideoElement>(
    document.getElementById('screenshare-video')
  )

  if (screenSharePub && member) {
    div.style.display = 'block'
    videoElm.onresize = () => {
      updateVideoSize(
        videoElm,
        <HTMLSpanElement>document.getElementById('screenshare-resolution')
      )
    }
    const infoElm = document.getElementById('screenshare-info')!
    infoElm.innerHTML = `Screenshare from ${member.clientName}`
  } else {
    div.style.display = 'none'
    if (videoElm) {
      videoElm.srcObject = null
      videoElm.src = ''
    }
  }
}

function updateVideoSize(element: HTMLVideoElement, target: HTMLElement) {
  target.innerHTML = `(${element.videoWidth}x${element.videoHeight})`
}
