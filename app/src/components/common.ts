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

function encodeRoomInvite(msg: string): string {
    return btoa(msg).replace(/=*$/, '');
};

function decodeRoomInvite(encoded: string): string {
    const paddingLength = 4 - (encoded.length % 4);
    if (paddingLength < 4) encoded += '='.repeat(paddingLength);
    return atob(encoded);
};

export function getRoomInviteFromCurrentUrl(): { roomNum: string, password: string } {
    const homepage = process.env.PUBLIC_URL;
    const location = window.location.pathname;

    if (location.startsWith(`${homepage}/join`)) {
        const regex = new RegExp(`^${homepage}/join/([^/]+)$`);
        const match = location.match(regex);

        if (match && match[1]) {
            const decoded = decodeRoomInvite(match[1])
            const items = decoded.split(";");
            return {
                roomNum: items[0],
                password: items.length > 1 ? items[1] : ''
            }
        } else {
            return {
                roomNum: '',
                password: ''
            }
        }
    } else {
        return undefined
    }
}

export function genRoomInviteByCurrentUrl(roomNum: string, password: string): string {
    const msg = roomNum + ';' + (password ? password : '')
    const encoded = encodeRoomInvite(msg)

    const homepage = process.env.PUBLIC_URL;
    return window.location.origin + homepage + '/join/' + encoded
}

export function getTimeDesc(datetimeStr: string): [string, string] {
    const datetime = new Date(datetimeStr);

    const year = datetime.getFullYear();
    const month = String(datetime.getMonth() + 1).padStart(2, '0');
    const day = String(datetime.getDate()).padStart(2, '0');
    const date = `${year}年${month}月${day}`;

    const hours = String(datetime.getHours()).padStart(2, '0');
    const minutes = String(datetime.getMinutes()).padStart(2, '0');
    const time = `${hours}:${minutes}`;

    return [date, time]
}

export function getRoomTimeDesc(start, end, durationSeconds): string {
    const [sd, st] = getTimeDesc(start)
    const [ed, et] = getTimeDesc(end)
    return sd + ' ' + st + '~' + et + ' (' + Math.round(durationSeconds / 60) + '分钟)'
}

export function goHome(navigate, homepage) {
    if (false) {
        navigate('/')
        window.location.reload();
    } else {
        window.location.href = window.location.origin + homepage
    }
}

export function formatMeetingId(id) {
    // 只保留数字
    let id_ = id.replace(/\D/g, '');
    // 只保留最多9位数字
    if (id_.length > 9) id_ = id_.slice(0, 9);
    // 插入分隔符 "-"
    if (id_.length > 4) id_ = `${id_.slice(0, 4)}-${id_.slice(4)}`;
    return id_
}