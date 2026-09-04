import 'reflect-metadata';
import { injectable } from "inversify"
import { IMsgConsumer } from "./IMsgConsumer";
import emitter from "@/util/emitter";
import { etCallSignal } from "@/constants/emitter_type";

@injectable()
export class VoiceSignalConsumer implements IMsgConsumer {
    msgType = 9
    msgConsume = (msg: string) => {
        try {
            const dto = JSON.parse(msg)
            emitter.emit(etCallSignal, { from: dto.sendUserId, sig: JSON.parse(dto.content) })
        } catch (err) {
            console.log("语音信令解析失败", msg, err)
        }
    }
}
