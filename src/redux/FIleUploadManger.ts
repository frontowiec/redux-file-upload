enum FileUploadStatus {
    STARTED = 'started',
    DONE = 'done',
    ERROR = 'error',
    CANCELED = 'canceled'
}

class FileUploadManger {
    progress: number;
    status: FileUploadStatus;

    constructor(private callback: Function) {
    }

    public dispatch(type: string, payload?: unknown) {
        switch (type) {
            case 'FILE_UPLOAD_STARTED':
                this.status = FileUploadStatus.STARTED;
                this.progress = 0;
                break;
            case 'FILE_UPLOAD_CANCELED':
                this.status = FileUploadStatus.CANCELED;
                break;
            case 'FILE_UPLOAD_SUCCESS':
                this.status = FileUploadStatus.DONE;
                break;
            case 'FILE_UPLOAD_FAILURE':
                this.status = FileUploadStatus.ERROR;
                break;
            case 'FILE_PROGRESS_CHANGED':
                this.progress = payload as number;
                break;
        }
        this.callback(type, payload);
    }
}
