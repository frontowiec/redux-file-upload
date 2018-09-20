import {combineReducers} from "redux";
import {combineEpics} from "redux-observable";
import FileUploader from "./FileUploader";
import {uploadFileUrl} from "../api";
import FileEpics from "./FileEpics";

export const fileUploaderA = new FileUploader('moduleA', {method: 'POST', url: `${uploadFileUrl}/A`});
export const fileUploaderB = new FileUploader('moduleB', {method: 'POST', url: `${uploadFileUrl}/B`});
const fileUploaderEpics = new FileEpics({'moduleA': fileUploaderA, 'moduleB': fileUploaderB});

export const rootEpic$ = combineEpics(
    fileUploaderEpics.progressEpic$, fileUploaderEpics.errorEpic$, fileUploaderEpics.loadEpic$, fileUploaderEpics.uploadFilesEpic$
);
export default combineReducers({moduleA: fileUploaderA.createReducer(), moduleB: fileUploaderB.createReducer()});
