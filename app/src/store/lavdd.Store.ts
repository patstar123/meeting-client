import { makeAutoObservable } from 'mobx'
import {
  LAVDD,
  LAVDDResult,
} from 'lavdd-sdk'

class LAVDDStore {
  lavdd: LAVDD
  messageTip: any

  constructor() {
    this.lavdd = new LAVDD()

    // 2.把数据弄成响应式
    makeAutoObservable(this)
  }

  setMessageTip = (messageTip: any) => {
    this.messageTip = messageTip
  }
}

export { LAVDDStore }
