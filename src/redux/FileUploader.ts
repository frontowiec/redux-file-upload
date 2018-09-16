import {fromEvent} from "rxjs";
import {Epic, ofType} from "redux-observable";
import {map, mapTo, switchMap, tap} from "rxjs/operators";
import {Action} from "redux-actions";
import {v4} from "uuid";

enum FileUploadStatus {
    ATTACHED = 'attached',
    STARTED = 'started',
    DONE = 'done',
    ERROR = 'error',
    CANCELED = 'canceled'
}

interface IRequest {
    method: string,
    url: string,
    async?: boolean,
    username?: string | null,
    password?: string | null;
}

interface IState {
    [id: string]: {
        name: string;
        size: number;
        type: string;
        id: string;
        status: FileUploadStatus;
        progress: number;
        lastModified: number; // timestamp
    }
}

class FileUploader {
    private data: FormData;
    private request: XMLHttpRequest;
    public progressEpic$: Epic;
    public errorEpic$: Epic;
    public loadEpic$: Epic;

    constructor(private configuraton: IRequest) {
        this.request = new XMLHttpRequest();
        this.data = new FormData();

        const onprogress$ = fromEvent(this.request.upload, 'progress');
        const onerror$ = fromEvent(this.request, 'error');
        const onload$ = fromEvent(this.request, 'load');

        this.progressEpic$ = action$ => action$.pipe(
            ofType('FILE_UPLOAD_STARTED'),
            switchMap(({payload}) => onprogress$.pipe(
                map((e: ProgressEvent) => ({
                    type: 'FILE_PROGRESS_CHANGED',
                    payload: {
                        progress: Math.round((e.loaded / e.total) * 100),
                        id: payload
                    },
                }))
            ))
        );

        this.loadEpic$ = action$ => action$.pipe(
            ofType('FILE_UPLOAD_STARTED'),
            tap(() => {
                const {url, method, password, username, async = true} = this.configuraton;
                this.request.open(method, url, async, username, password);
                this.request.send(this.data);
            }),
            switchMap(({payload}) => onload$.pipe(
                mapTo(({type: 'FILE_UPLOAD_SUCCESS', payload}))
            ))
        );

        this.errorEpic$ = action$ => action$.pipe(
            ofType('FILE_UPLOAD_STARTED'),
            switchMap(({payload}) => onerror$.pipe(
                mapTo(({type: 'FILE_UPLOAD_FAILURE', payload}))
            ))
        );
    }

    public attachFile(payload: File) {
        this.data.append(payload.name, payload);
        return {
            type: 'ATTACH_FILE',
            payload: {
                name: payload.name,
                lastModified: payload.lastModified,
                size: payload.size,
                type: payload.type
            }
        };
    }

    public uploadFile(id: string) {
        // todo: check if this.data is not empty
        return {type: 'FILE_UPLOAD_STARTED', payload: id};
    }

    public removeFile(id: string) {
        // todo
    }

    public cancelFileUpload(id: string) {
        this.request.abort();
        return {type: 'FILE_UPLOAD_CANCELED'};
    }

    public reducer(state: IState = {}, action: Action<any>) {
        const {type, payload} = action;

        switch (type) {
            case 'ATTACH_FILE':
                const id = v4();
                return {
                    ...state,
                    [id]: {
                        ...payload,
                        id,
                        status: FileUploadStatus.ATTACHED,
                        progress: 0
                    }
                };
            case 'FILE_UPLOAD_STARTED':
                const fileStarted = {
                    ...state[payload],
                    status: FileUploadStatus.STARTED,
                    progress: 0
                };
                return {
                    ...state,
                    [payload]: fileStarted
                };
            case 'FILE_UPLOAD_CANCELED':
                const fileCanceled = {
                    ...state[payload],
                    status: FileUploadStatus.CANCELED
                };
                return {
                    ...state,
                    [payload]: fileCanceled
                };
            case 'FILE_UPLOAD_SUCCESS':
                const fileSuccess = {
                    ...state[payload],
                    status: FileUploadStatus.DONE,
                    progress: 100
                };
                return {
                    ...state,
                    [payload]: fileSuccess
                };
            case 'FILE_UPLOAD_FAILURE':
                const fileFailure = {
                    ...state[payload],
                    status: FileUploadStatus.ERROR
                };
                return {
                    ...state,
                    [payload]: fileFailure
                };
            case 'FILE_PROGRESS_CHANGED':
                const fileProgress = {
                    ...state[payload.id],
                    progress: payload.progress
                };
                return {
                    ...state,
                    [payload.id]: fileProgress
                };
            default:
                return state;
        }
    }
}

export default FileUploader;