import { Container } from "inversify";
import { IMsgConsumer } from "@/service/IMsgConsumer";
import { ChatMsgConsume } from "@/service/ChatMsgConsumer";
import { FriendApplyMsgConsumer } from "@/service/FriendApplyConsumer";
import SERVICE_IDENTIFIES from "@/constants/identifiers";
import { FriendApplyResultMsgConsumer } from "@/service/FriendApplyResultConsumer";
import { FriendshipAddConsumer } from "@/service/FriendshipAddConsumer";
import { GroupMemberAddConsumer } from "@/service/GroupMemberAddConsumer";
import { GroupMemberToUpdateConsumer } from "@/service/GroupMemberToUpdateConsumer";

export const container = new Container();

container.bind<IMsgConsumer>(SERVICE_IDENTIFIES.IMSG_CONSUMER)
    .to(ChatMsgConsume).inSingletonScope()
container.bind<IMsgConsumer>(SERVICE_IDENTIFIES.IMSG_CONSUMER)
    .to(FriendApplyMsgConsumer).inSingletonScope()
container.bind<IMsgConsumer>(SERVICE_IDENTIFIES.IMSG_CONSUMER)
    .to(FriendApplyResultMsgConsumer).inSingletonScope()
container.bind<IMsgConsumer>(SERVICE_IDENTIFIES.IMSG_CONSUMER)
    .to(FriendshipAddConsumer).inSingletonScope()
container.bind<IMsgConsumer>(SERVICE_IDENTIFIES.IMSG_CONSUMER)
    .to(GroupMemberAddConsumer).inSingletonScope()
container.bind<IMsgConsumer>(SERVICE_IDENTIFIES.IMSG_CONSUMER)
    .to(GroupMemberToUpdateConsumer).inSingletonScope()
// container.bind<IMsgConsumer[]>('IMsgConsumers').toService('IMsgConsumer')
