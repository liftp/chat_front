import { ApplyFriend, ChatRecord, ChatRecordSearch } from "@/db/model/models";

export interface ElectronApi {
    recordCount: (search?:ChatRecordSearch) => Promise<number>;
    readRecord: (start:number, end:number, search?:ChatRecordSearch) => Promise<ChatRecord[]>;
    findFriend: (name:string, selfId: number) => Promise<FriendList[]>;
    writeMsg: (msg: ChatRecord) => Promise<void>;
    applyRecordFind: (self: number) => Promise<ApplyFriend[]>;
    applyRecordAdd: (data: ApplyFriend) => Promise<void>;
}

declare global {
    interface Window {
        electronApi: ElectronApi
    }
}