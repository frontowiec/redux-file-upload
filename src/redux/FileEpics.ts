import FileUploader from "./FileUploader";
import {Epic} from "redux-observable";
import {filter, map, mapTo, mergeMap, tap} from "rxjs/operators";
import {concat, fromEvent, of, pipe} from "rxjs";
import {AnyAction} from "redux";

const ofTypeRegExp = (regexp: RegExp) => pipe(
    filter((action: AnyAction) => regexp.test(action.type)),
    map((action: AnyAction) => ({...action, payload: action.payload, meta: {prefix: action.type.split('/')[0]}}))
);

class FileEpics {
    public progressEpic$: Epic;
    public errorEpic$: Epic;
    public loadEpic$: Epic;
    public uploadFilesEpic$: Epic;

    constructor(private fileUploaders: { [moduleName: string]: FileUploader }) {
        this.loadEpic$ = action$ => action$.pipe(
            ofTypeRegExp(/(.*)\/FILE_UPLOAD_STARTED$/),
            tap(({payload, meta: {prefix}}) => {
                const findUploader = this.getFileUploader(prefix);
                const {url, method, password, username, async = true} = findUploader.requestConfiguration;
                findUploader.requestRepository.getRequest(payload).open(method, url, async, username, password);
                findUploader.requestRepository.getRequest(payload).send(
                    findUploader.filesRepository.getFile(payload)
                );
            }),
            mergeMap(({payload, meta: {prefix}}) =>
                fromEvent(this.getFileUploader(prefix).requestRepository.getRequest(payload), 'load').pipe(
                    filter((e: ProgressEvent) => e.target!['status'] === 200),
                    mapTo(({type: `${prefix}/FILE_UPLOAD_SUCCESS`, payload}))
                ))
        );

        this.progressEpic$ = action$ => action$.pipe(
            ofTypeRegExp(/(.*)\/FILE_UPLOAD_STARTED$/),
            mergeMap(({payload, meta: {prefix}}) =>
                fromEvent(this.getFileUploader(prefix).requestRepository.getRequest(payload).upload, 'progress').pipe(
                    map((e: ProgressEvent) => ({
                        type: `${prefix}/FILE_PROGRESS_CHANGED`,
                        payload: {
                            progress: Math.round((e.loaded / e.total) * 100),
                            id: payload
                        }
                    }))
                ))
        );

        this.errorEpic$ = action$ => action$.pipe(
            ofTypeRegExp(/(.*)\/FILE_UPLOAD_STARTED$/),
            mergeMap(({payload, meta: {prefix}}) =>
                fromEvent(this.getFileUploader(prefix).requestRepository.getRequest(payload), 'readystatechange').pipe(
                    filter(() => this.getFileUploader(prefix).requestRepository.getRequest(payload).readyState === 4),
                    filter(() => this.getFileUploader(prefix).requestRepository.getRequest(payload).status !== 200),
                    mapTo({type: `${prefix}/FILE_UPLOAD_FAILURE`, payload})
                ))
        );

        this.uploadFilesEpic$ = action$ => action$.pipe(
            ofTypeRegExp(/(.*)\/UPLOAD_FILES$/),
            map(({meta: {prefix}}) => this.getFileUploader(prefix).filesRepository.getIds().map(id => of({
                type: `${prefix}/FILE_UPLOAD_STARTED`,
                payload: id
            }))),
            mergeMap(idObservable => concat(...idObservable))
        );
    }

    private getFileUploader(moduleName: string) {
        const fileUploader = this.fileUploaders[moduleName];

        if (!fileUploader) {
            throw new Error('File uploader not found');
        }

        return fileUploader;
    }
}

export default FileEpics;