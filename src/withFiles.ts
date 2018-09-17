import {connect} from "react-redux";
import {IFile} from "./redux/files";
import {Dispatch} from "redux";
import FileUploader from "./redux/FileUploader";
import {values} from 'lodash';

const mapStateToProps = (fileUploader: FileUploader) => (state: { [key: string]: IFile }) => ({
    [fileUploader.getModuleName()]: values(state[fileUploader.getModuleName()])
});

const mapDispatchToProps = (fileUploader: FileUploader) => (dispatch: Dispatch) => ({
    attachFile: (file: File) => dispatch(fileUploader.attachFile(file)),
    sendFile: (id: string) => dispatch(fileUploader.uploadFile(id)),
    uploadFiles: () => dispatch(fileUploader.uploadFiles()),
    removeFile: (id: string) => dispatch(fileUploader.removeFile(id)),
    cancelFileUpload: (id: string) => dispatch(fileUploader.cancelFileUpload(id)),
    clearAll: () => dispatch(fileUploader.clearAll())
});

export const withFiles = (fileUploader: FileUploader) => connect(mapStateToProps(fileUploader), mapDispatchToProps(fileUploader));

export interface IWithFiles {
    [key: string]: any;
    attachFile: (file: File) => void;
    sendFile: (id: string) => void;
    uploadFiles: () => void;
    removeFile: (id: string) => void;
    cancelFileUpload: (id: string) => void;
    clearAll: () => void;
}
