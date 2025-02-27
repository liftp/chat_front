import 'reflect-metadata';
import { injectable } from "inversify"
import { IMsgConsumer } from "./IMsgConsume"


@injectable()
export class FirendApplyMsgConsume implements IMsgConsumer {
    msgType = 4
    msgConsume = (msg: string) => {
        // 
    }
}
