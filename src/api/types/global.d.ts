import { ChatRecord } from "@/db/model/models";

export interface ElectronApi {
    recordCount: () => Promise<number>;
    readRecord: (start:number, end:number, friendId: number) => Promise<ChatRecord[]>;
    findFriend: (name:string, selfId: number) => Promise<FriendList[]>;
    writeMsg: (msg: ChatRecord) => Promise<void>;
}

declare global {
    interface Window {
        electronApi: ElectronApi
    }
}