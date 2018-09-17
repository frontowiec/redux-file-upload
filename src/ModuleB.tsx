import * as React from 'react';
import {StatelessComponent} from 'react';
import Dropzone from "react-dropzone";
import {FileItem} from "./FileItem";
import {IWithFiles, withFiles} from "./withFiles";
import {fileUploaderB} from "./redux";
import {IFile} from "./redux/files";

const ModuleB: StatelessComponent<IWithFiles> = ({clearAll, uploadFiles, moduleB, sendFile, attachFile, cancelFileUpload, removeFile}) => {
    const onDrop = (files: File[]) => {
        files.forEach(file => {
            attachFile(file);
        });
    };
    
    return (
        <section>
            <div className="dropzone">
                <Dropzone onDrop={onDrop}>
                    <p>Try dropping some files here, or click to select files to upload.</p>
                </Dropzone>
            </div>
            <aside>
                <h2>Dropped files</h2>
                <ul>
                    {
                        moduleB.map((file: IFile, index: number) => (
                            <React.Fragment key={index}>
                                <FileItem file={file}
                                          progress={file.progress}/>
                                <button onClick={() => sendFile(file.id)}>SEND</button>
                                <button onClick={() => removeFile(file.id)}>REMOVE</button>
                                <button onClick={() => cancelFileUpload(file.id)}>CANCEL</button>
                            </React.Fragment>
                        ))
                    }

                </ul>
            </aside>
            <button onClick={() => uploadFiles()}>SEND ALL!</button>
            <button onClick={() => clearAll()}>CLEAR ALL</button>
        </section>
    )
};

export default withFiles(fileUploaderB)(ModuleB as any);
