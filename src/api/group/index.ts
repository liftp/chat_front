import { request } from "@/util/request";
import { AddGroupChatResp, GroupMembersResp, GroupInfoDTO, GroupInfoPartial, GroupMemberAddDTO, GroupMembersAddResp } from "../types/group";

export function addGroupChat(data: GroupInfoPartial) {
    return request<AddGroupChatResp>({
        url: "groupInfo/addGroupChat",
        method: 'post',
        data
    })
}

export function findGroupMemberById(groupId: number) {
    return request<GroupMembersResp>({
        url: "groupInfo/findGroupMemberById",
        method: 'get',
        params: {
            groupId
        }
    })
}

export function findAllGroupMemberById(groupId: number) {
    return request<GroupMembersResp>({
        url: "groupInfo/findAllGroupMemberById",
        method: 'get',
        params: {
            groupId
        }
    })
}

export function groupMemebersAddApi(groupMemberAdd: GroupMemberAddDTO) {
    return request<GroupMembersAddResp>({
        url: "groupInfo/addGroupMembers",
        method: 'post',
        data: groupMemberAdd
    })
}

