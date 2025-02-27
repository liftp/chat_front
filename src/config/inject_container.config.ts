import { Container } from "inversify";
import { IMsgConsumer } from "@/service/IMsgConsume";
import { ChatMsgConsume } from "@/service/ChatMsgConsumer";
import { FirendApplyMsgConsume } from "@/service/FriendApplyConsumer";
import SERVICE_IDENTIFIES from "@/constants/identifiers";

export const container = new Container();

container.bind<IMsgConsumer>(SERVICE_IDENTIFIES.IMSG_CONSUMER)
    .to(ChatMsgConsume).inSingletonScope()
container.bind<IMsgConsumer>(SERVICE_IDENTIFIES.IMSG_CONSUMER)
    .to(FirendApplyMsgConsume).inSingletonScope()
// container.bind<IMsgConsumer[]>('IMsgConsumers').toService('IMsgConsumer')
