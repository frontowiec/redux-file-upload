import * as React from 'react';
import {Line} from 'rc-progress';
import {IFile} from "./redux/files";

export class FileItem extends React.PureComponent<IProps, IState> {

    /*sendFile = (file: File, url: string) => {
        const request = new XMLHttpRequest();
        const formData = new FormData();
        formData.append(file.name, file);
        request.open('POST', url);
        request.upload.addEventListener('progress', (e) => {
            this.setState({
                    filesProgress: {
                        ...this.state.filesProgress,
                        [file.name]: Math.round((e.loaded / e.total) * 100)}
                }
            )
        });
        request.send(formData);
        request.addEventListener('load', () => console.log('load'));
    };*/

    render() {
        const {file, progress} = this.props;
        return (
            <li>{file.name} - {file.size} bytes
                <Line percent={progress} strokeWidth="4" strokeColor="#D3D3D3"/>
            </li>
        )
    }
}

interface IProps {
    file: IFile;
    progress?: number;
}

interface IState {
}