import {Action, createActions, handleActions} from "redux-actions";
import {Epic, ofType} from "redux-observable";
import {catchError, map, mapTo, switchMap, tap, withLatestFrom} from "rxjs/operators";
import {forkJoin, Observable, of, Subject, Subscriber} from "rxjs";
import {uploadFileUrl} from "../../api";
import {v4} from 'uuid';

export interface IFile {
    id: string;
    progress: number;
    done: boolean;
    error: boolean;
    lastModified: number;
    name: string;
    size: number;
    type: string;
    blob: File;
}

export interface IRequest {
    method: string,
    url: string,
    async?: boolean,
    username?: string | null,
    password?: string | null;
}

const initialState: IFile[] = [];

const {configureFiles, attachFile, sendFile, sendFiles, setFileProgress, setFileAsDone, removeFile, cancelSend, sendFailure} =
    createActions('CONFIGURE_FILES', 'ATTACH_FILE', 'SEND_FILE', 'SEND_FILES', 'SET_FILE_PROGRESS', 'SET_FILE_AS_DONE', 'REMOVE_FILE', 'CANCEL_SEND', 'SEND_FAILURE');

export const filesActionsBag = {attachFile, sendFile, sendFiles, removeFile, cancelSend, sendFailure};

/*
const cancelSend$ = action$ => action$.pipe(
    ofType({type: 'CANCELED_SEND_FILE'}),
    map(({payload}) => (sendFile(payload)))
);
*/

const progressSubject = new Subject<{ id: string, progress: number }>();

const send$ = (file: IFile, requestConf: IRequest) => Observable.create((subscriber: Subscriber<any>) => {
    const {id, blob} = file;
    const request = new XMLHttpRequest();
    const formData = new FormData();
    formData.append(file.name, blob);
    request.upload.onprogress = (e: ProgressEvent) => {
        progressSubject.next({id, progress: Math.round((e.loaded / e.total) * 100)});
    };


    request.onreadystatechange = () => {
        if (request.readyState == 4) {
            if (request.status == 200) {
                subscriber.next(JSON.parse(request.response));
                subscriber.complete();
            } else {
                subscriber.error(request.response);
            }
        }
    };

    request.open(requestConf.method, requestConf.url, requestConf.async = true, requestConf.username, requestConf.password);
    request.send(formData);

    return () => {
        request.abort();
    };
});

export const sendFile$: Epic = action$ => action$.pipe(
    ofType(sendFile.toString()),
    switchMap(({payload}: Action<IFile>) => send$(payload!, {method: 'POST', url: uploadFileUrl}).pipe(
        mapTo(setFileAsDone(payload)),
        catchError(() => of(sendFailure(payload))),
        // takeUntil(cancelSend$)
    ))
);

export const sendFiles$: Epic = (action$, state$) => action$.pipe(
    ofType(sendFiles.toString()),
    withLatestFrom(state$),
    map(([action, {files}]: Array<{action: any, files: IFile[]}>) => {
        return forkJoin(files.map(file => send$(file!, {method: 'POST', url: uploadFileUrl})))
    }),
    tap(console.log),
    mapTo(({type: 'test'}))
);

export default handleActions({
    [attachFile.toString()]: (state, {payload}: Action<File>) => [...state, {
        id: v4(),
        name: payload!.name,
        lastModified: payload!.lastModified,
        size: payload!.size,
        type: payload!.type,
        done: false,
        error: false,
        progress: 0,
        blob: payload
    }],
    [setFileProgress.toString()]: (state: any[], {payload}: Action<any>) => state.map(file => file.id === payload.id ? payload : file),
    [setFileAsDone.toString()]: (state: any[], {payload}: Action<any>) => state.map(file => file.id === payload.id ? {
        ...payload,
        done: true,
        error: false
    } : file),
    [sendFailure.toString()]: (state: any[], {payload}: Action<any>) => state.map(file => file.id === payload.id ? {
        ...payload,
        done: false,
        error: true
    } : file),
}, initialState);

export {configureFiles};
