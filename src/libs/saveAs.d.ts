
declare interface FileSaver {
    saveAs(data: Blob|File, filename?: string, disableAutoBOM?: boolean): FileSaver
}

declare module "browser-filesaver" {
    function saveAs(data: Blob|File, filename?: string, disableAutoBOM?: boolean): FileSaver
}