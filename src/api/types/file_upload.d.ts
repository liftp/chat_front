export interface FileInfo {
    url: string,
    type: string,
    len: number,
}

export interface FileDownload {
    data: ArrayBuffer
}

export type FileInfoResp = ApiResponseData<FileInfo>
export type FileDownloadResp = ArrayBuffer