import {combineReducers} from "redux";
import {combineEpics} from "redux-observable";
import FileUploader from "./FileUploader";
import {uploadFileUrl} from "../api";

export const fileUploaderA = new FileUploader('moduleA', {method: 'POST', url: `${uploadFileUrl}/A`});
export const fileUploaderB = new FileUploader('moduleB', {method: 'POST', url: `${uploadFileUrl}/B`});

export const rootEpic$ = combineEpics(
    fileUploaderA.progressEpic$, fileUploaderA.errorEpic$, fileUploaderA.loadEpic$, fileUploaderA.uploadFilesEpic$
);
export default combineReducers({moduleA: fileUploaderA.createReducer(), moduleB: fileUploaderB.createReducer()});
