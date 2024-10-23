export class MemberItem {
    sfuId: string // 分配的SFU侧ID
    name: string // 成员名称
    imgSrc: any // 头像
    isHost: boolean // 是否为主持人
    isLowHost: boolean // 是否为联席主持人
    isSelf: boolean // 是否为自己
    isMicrophoneEnabled: boolean // 是否打开麦克风
    isCameraEnabled: boolean // 是否打开相机
    isScreenShareEnabled: boolean // 是否打开桌面共享
    isSpeaking: boolean // 是否在讲话(语音检测的结果)
    empty: boolean // 表示占位的空成员

    constructor(
        sfuId: string,
        name: string,
        imgSrc: any,
        isSelf: boolean,
        isHost: boolean,
        isLowHost: boolean,
        isMicrophoneEnabled: boolean,
        isCameraEnabled: boolean,
        isScreenShareEnabled: boolean,
    ) {
        this.sfuId = sfuId
        this.name = name
        this.imgSrc = imgSrc
        this.isSelf = isSelf
        this.isHost = isHost
        this.isLowHost = isLowHost
        this.isMicrophoneEnabled = isMicrophoneEnabled
        this.isCameraEnabled = isCameraEnabled
        this.isScreenShareEnabled = isScreenShareEnabled
    }
}

export function createEmptyMemberItem(): MemberItem {
    const item = new MemberItem("_mx_", "···", undefined, false, false, false, false, false, false)
    item.empty = true
    return item
}

export const generateAvatar = (name) => {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const context = canvas.getContext('2d');
    if (context) {
        // Draw background
        context.fillStyle = '#3b5998';
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Draw text
        context.fillStyle = '#ffffff';
        let fontSize = 40;
        if (name.length > 2) {
            fontSize = Math.max((80 / name.length) + 5, 15); // Adjust font size for longer names
        }

        context.font = `bold ${fontSize}px Arial`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(name.slice(0, 10), canvas.width / 2, canvas.height / 2); // Limit to 10 characters
    }
    return canvas.toDataURL();
};