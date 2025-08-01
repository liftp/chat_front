import { ApplyFriend, ChatRecord, ChatRecordSearch } from "@/db/model/models";
import { FriendRelationship } from "@/db/model/models";

export interface ElectronApi {
    recordCount: (search?:ChatRecordSearch) => Promise<number>;
    readRecord: (start:number, end:number, search?:ChatRecordSearch) => Promise<ChatRecord[]>;
    findFriend: (name:string, selfId: number) => Promise<FriendList[]>;
    writeMsg: (msg: ChatRecord) => Promise<void>;
    applyRecordFind: (self: number) => Promise<ApplyFriend[]>;
    applyRecordLastUpdatedAt: (self: number) => Promise<ApplyFriend | undefined>;
    applyRecordAdd: (data: ApplyFriend) => Promise<void>;
    applyRecordUpdate: (data: ApplyFriend) => Promise<void>;
    applyRecordDelete: (selfId: number) => Promise<void>;
    friendshipAdd: (data: FriendRelationship) => Promise<void>;
    findGroupMembers: (groupId: number, selfId: number) => Promise<GroupMember[]>;
    saveGroupMembersLocal: (members: GroupMember[]) => Promise<void>;
    delMembersByGroupId: (groupId: number, selfId: number) => Promise<void>;
    selectGroupWithMaxMsgId: (selfId: number) => Promise<ChatRecord[]>;
    localFileSave: (path: string, buffer: ArrayBuffer) => Promise<string>;
    readLocalFileContent: (path: string) => Promise<ArrayBuffer>;
}

declare global {
    interface Window {
        electronApi: ElectronApi
    }
}