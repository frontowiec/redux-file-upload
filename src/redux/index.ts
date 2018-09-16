import {combineReducers} from "redux";
import {combineEpics} from "redux-observable";
import FileUploader from "./FileUploader";
import {uploadFileUrl} from "../api";

export const fileUploader = new FileUploader({method: 'POST', url: uploadFileUrl});

export const rootEpic$ = combineEpics(fileUploader.progressEpic$, fileUploader.errorEpic$, fileUploader.loadEpic$);
export default combineReducers({file: fileUploader.reducer});
