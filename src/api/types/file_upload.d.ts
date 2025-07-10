export interface FileInfo {
    url: string,
    type: string,
    len: number,
}

export interface FileDownload {
    data: ArrayBuffer
}

export type FileInfoResp = ApiResponseData<string>
export type FileDownloadResp = Blob