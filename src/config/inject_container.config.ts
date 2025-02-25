import { Container } from "inversify";
import { IMsgConsumer, ChatMsgConsume, FirendApplyMsgConsume } from "@/service/IMsgConsume";

export const container = new Container();

container.bind<IMsgConsumer[]>("IMsgConsumer")
    .toService(ChatMsgConsume)
container.bind<IMsgConsumer[]>("IMsgConsumer")
    .toService(FirendApplyMsgConsume)
