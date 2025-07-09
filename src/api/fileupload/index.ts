import { request } from "@/util/request";
import { FileDownloadResp, FileInfoResp } from "../types/file_upload";

export function fileUpload(data: FormData) {
    return request<FileInfoResp>({
        url: 'file/upload',
        method: 'post',
        headers: {
            'Content-Type': "multipart/form-data",
        },
        data,
    })
}

export function fileDownload(fileUrl: string) {
    return request<FileDownloadResp>({
        url: 'file/download',
        method: 'post',
        data: fileUrl,
        responseType: 'arraybuffer'
    })
}