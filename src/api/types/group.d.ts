export interface GroupInfoDTO {
    
    id?: number,

    // @Schema(description = "群组名称")
    groupName: string,

    // @Schema(description = "群组信息")
    groupRemark: string,

    // @Schema(description = "群状态： 0:开放 1:成员邀请加入 2:仅所属人拉取 3:密码进入")
    groupStatus: number,

    // @Schema(description = "群进入密码")
    groupLockPwd: string,

    status: number, // 成员群组中状态 0: 在群聊中 1: 离开群聊

    // @Schema(description = "群组所属人id")
    selfId?: number,
}

export interface GroupMemberVO {
    
    // id
    id: number,

    // 群组id
    groupId: number,

    // 好友id
    memberId: number,

    // 好友名称
    memberName: string,

    // 群内备注
    memberRemark: string,

    // 邀请人
    inviteId: number,
}

export interface GroupMemberAddDTO {
    userIds: number[],
    groupId: number,
}

export type GroupInfoPartial = Partial<GroupInfoDTO>

export type AddGroupChatResp = ApiResponseData<GroupInfoDTO>
export type GroupMembersResp = ApiResponseData<GroupMemberVO[]>
export type GroupMembersAddResp = ApiResponseData<boolean>