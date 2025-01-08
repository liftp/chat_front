import { ChatRecord } from "@/db/model/models";

export interface ElectronApi {
    recordCount: () => Promise<number>;
    readRecord: (start:number, end:number, friendId: number) => Promise<ChatRecord[]>;
    findFriend: (name:string, selfId: number) => Promise<FriendList[]>;
}

declare global {
    interface Window {
        electronApi: ElectronApi
    }
}