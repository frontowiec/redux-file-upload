import {connect} from "react-redux";
import {IFile} from "./redux/files";
import {Dispatch} from "redux";
import FileUploader from "./redux/FileUploader";
import {values} from 'lodash';

const mapStateToProps = (fileUploader: FileUploader) => (state: { file: IFile }) => ({
    files: values(state.file)
});

const mapDispatchToProps = (fileUploader: FileUploader) => (dispatch: Dispatch) => ({
    attachFile: (file: File) => dispatch(fileUploader.attachFile(file)),
    sendFile: (id: string) => dispatch(fileUploader.uploadFile(id)),
});

export const withFiles = (fileUploader: FileUploader) => connect(mapStateToProps(fileUploader), mapDispatchToProps(fileUploader));

export interface IWithFiles {
    files: IFile[],
    attachFile: (file: File) => void;
    sendFile: (id: string) => void;
}
