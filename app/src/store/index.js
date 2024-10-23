// 组合子模块
// 封装统一导出 供业务使用的方法
import { MeetingStateSetStore } from './meetingStateSet.Store'
import { SfuClientStore } from './sfuClient.Store'
import { SfuMemberStore } from './sfuMember.Store'
import { LAVDDStore } from './lavdd.Store'
import React from 'react'


// 1.声明一个rootStore
class RootStore {
  constructor() {
    // 将子模块进行实例化
    // 将来实例化根store的时候
    // 根store有个属性 是sfuApiStore
    // 对应的值 就是导入的子模块实例对象
    this.meetingStateSetStore = new MeetingStateSetStore()
    this.sfuClientStore = new SfuClientStore()
    this.sfuMemberStore = new SfuMemberStore()
    this.lavddStore = new LAVDDStore()
  }
}

// 实例化根store
const rootStore = new RootStore()

// 使用react context机制 完成统一方法封装
// useContext查找机制：优先从 Provider value找
// 找不到 就会找 createContext方法传递过来的默认参数
const context = React.createContext(rootStore)

// useContext作用：拿到createContext传递过来的rootStore实例对象 然后返回
// 只要在业务组件中调用useStore() -> rootStore
const useStore = () => React.useContext(context)

export { useStore }