import { makeAutoObservable } from 'mobx'

/**
 * meeting set
 */
class MeetingStateSetStore {
  // 1.定义数据
  localMicOpened: boolean = false
  localCamOpened: boolean = false
  localScreenShared: boolean = false
  notifyHost: boolean = false

  constructor() {
    // 2.把数据弄成响应式
    makeAutoObservable(this)
  }

  // 3.定义action函数（修改数据）

  setLocalMicOpened(opt: boolean) {
    this.localMicOpened = opt
  }

  setLocalCamOpened(opt: boolean) {
    this.localCamOpened = opt
  }

  setLocalScreenShared(opt: boolean) {
    this.localScreenShared = opt
  }

  setNotifyHost(opt: boolean) {
    this.notifyHost = opt
  }
}

export { MeetingStateSetStore }
