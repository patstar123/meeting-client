import { makeAutoObservable } from 'mobx'
import { MemberInfo } from 'sfu-sdk'

class SfuMemberStore {
  // 1.定义数据
  memberList = new Array<MemberInfo>()

  updateTag = 0

  constructor() {
    // 2.把数据弄成响应式
    makeAutoObservable(this)
  }

  // 3.定义action函数（修改数据）
  setMemberArr = (memberList: Array<MemberInfo>) => {
    this.memberList = memberList
  }

  // 获取主持人信息
  getHostMember = () => {
    const host = this.memberList.filter((p) => p.isHost === true)
    return host
  }

  // 更新成员属性的值
  updateMemberArr = (member: MemberInfo) => {
    for (let i = 0; i < this.memberList.length; i++) {
      if (this.memberList[i].clientId.toSFUId() === member.clientId.toSFUId()) {
        this.memberList[i] = member
      }
    }
    this.updateTag = this.updateTag + 1
  }
}

export { SfuMemberStore }
