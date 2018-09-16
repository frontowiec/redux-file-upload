/*
import {createActions} from "redux-actions";

enum FileUploadStatus {
    STARTED = 'started',
    DONE = 'done',
    ERROR = 'error',
    CANCELED = 'canceled'
}

interface IFile {
    id: string;
    progress: number;
    status: FileUploadStatus;
    lastModified: number;
    name: string;
    size: number;
    type: string;
    blob: File;
}

interface IRequest {
    method: string,
    url: string,
    async?: boolean,
    username?: string | null,
    password?: string | null;
}

export const {fileUploadCanceled, fileUploadStarted, fileUploadFailure, fileUploadSuccess, fileProgressChanged} =
    createActions('FILE_UPLOAD_CANCELED', 'FILE_UPLOAD_STARTED', 'FILE_UPLOAD_FAILURE', 'FILE_UPLOAD_SUCCESS', 'FILE_PROGRESS_CHANGED');

*/
