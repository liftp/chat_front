export interface ApplyResultInfo {
    applyStatus: number,    // 申请状态： 0:申请中 1:通过 2:拒绝
    proposerId: number, // 申请人id
    proposerRemark: string, // 申请人备注
    targetUser: number, // 被申请好友id
    proposerRelationshipId?: number, // 申请人的好友关系id
    targetRelationshipId?: number, // 被申请人的好友关系id
}