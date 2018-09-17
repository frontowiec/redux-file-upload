import {concat, fromEvent, of} from "rxjs";
import {Epic, ofType} from "redux-observable";
import {filter, map, mapTo, mergeMap, tap} from "rxjs/operators";
import {Action} from "redux-actions";
import {v4} from "uuid";
import RequestRepository from "./RequestRepository";
import FilesRepository from "./FilesRepository";
import {omit} from "lodash";

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
    private requestRepository: RequestRepository;
    private filesRepository: FilesRepository;
    public progressEpic$: Epic;
    public errorEpic$: Epic;
    public loadEpic$: Epic;
    public uploadFilesEpic$: Epic;

    constructor(private configuraton: IRequest) {
        this.filesRepository = new FilesRepository();
        this.requestRepository = new RequestRepository();

        this.loadEpic$ = action$ => action$.pipe(
            ofType('FILE_UPLOAD_STARTED'),
            tap(({payload}) => {
                const {url, method, password, username, async = true} = this.configuraton;
                this.requestRepository.getRequest(payload).open(method, url, async, username, password);
                this.requestRepository.getRequest(payload).send(
                    this.filesRepository.getFile(payload)
                );
            }),
            mergeMap(({payload}) =>
                fromEvent(this.requestRepository.getRequest(payload), 'load').pipe(
                    filter((e: ProgressEvent) => e.target!['status'] === 200),
                    mapTo(({type: 'FILE_UPLOAD_SUCCESS', payload}))
                ))
        );

        this.progressEpic$ = action$ => action$.pipe(
            ofType('FILE_UPLOAD_STARTED'),
            mergeMap(({payload}) =>
                fromEvent(this.requestRepository.getRequest(payload).upload, 'progress').pipe(
                    map((e: ProgressEvent) => ({
                        type: 'FILE_PROGRESS_CHANGED',
                        payload: {
                            progress: Math.round((e.loaded / e.total) * 100),
                            id: payload
                        }
                    }))
                ))
        );

        this.errorEpic$ = action$ => action$.pipe(
            ofType('FILE_UPLOAD_STARTED'),
            mergeMap(({payload}) =>
                fromEvent(this.requestRepository.getRequest(payload), 'readystatechange').pipe(
                    tap(console.log),
                    filter(() => this.requestRepository.getRequest(payload).readyState === 4),
                    filter(() => this.requestRepository.getRequest(payload).status !== 200),
                    mapTo({type: 'FILE_UPLOAD_FAILURE', payload})
                ))
        );

        this.uploadFilesEpic$ = action$ => action$.pipe(
            ofType('UPLOAD_FILES'),
            map(() => this.filesRepository.getIds().map(id => of({type: 'FILE_UPLOAD_STARTED', payload: id}))),
            mergeMap((idObservable) => concat(...idObservable))
        );
    }

    public attachFile(payload: File) {
        const id = v4();
        this.requestRepository.attach(id);
        this.filesRepository.attach(id, payload);

        return {
            type: 'ATTACH_FILE',
            payload: {
                id,
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

    public uploadFiles() {
        return {type: 'UPLOAD_FILES'};
    }

    public removeFile(id: string) {
        // todo: cannot remove file when uploading
        this.filesRepository.remove(id);
        this.requestRepository.remove(id);
        return {type: 'REMOVE_FILE', payload: id};
    }

    public cancelFileUpload(id: string) {
        this.requestRepository.getRequest(id).abort();
        return {type: 'FILE_UPLOAD_CANCELED', payload: id};
    }

    public clearAll() {
        this.filesRepository.clearAll();
        this.requestRepository.clearAll();
        return {type: 'CLEAR_FILES'};
    }

    public reducer(state: IState = {}, action: Action<any>) {
        const {type, payload} = action;

        switch (type) {
            case 'ATTACH_FILE':
                return {
                    ...state,
                    [payload.id]: {
                        ...payload,
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
            case 'REMOVE_FILE':
                return omit(state, payload);
            case 'CLEAR_FILES':
                return {};
            default:
                return state;
        }
    }
}

export default FileUploader;
