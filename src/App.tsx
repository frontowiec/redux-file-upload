import * as React from 'react';
import './App.css';
import Dropzone from 'react-dropzone'
import {FileItem} from "./FileItem";
import {IWithFiles, withFiles} from "./withFiles";
import {fileUploader} from "./redux";

class App extends React.Component<IWithFiles> {
    constructor(props: IWithFiles) {
        super(props);

        this.state = {
            files: [],
            filesProgress: null
        }
    }

    onDrop(files: File[]) {
        files.forEach(file => {
            this.props.attachFile(file);
        });
    }

    public render() {
        return (
            <div className="App">
                <section>
                    <div className="dropzone">
                        <Dropzone onDrop={this.onDrop.bind(this)}>
                            <p>Try dropping some files here, or click to select files to upload.</p>
                        </Dropzone>
                    </div>
                    <aside>
                        <h2>Dropped files</h2>
                        <ul>
                            {
                                this.props.files.map((file, index) => (
                                    <React.Fragment key={index}>
                                        <FileItem file={file}
                                                  progress={file.progress}/>
                                        <button onClick={() => this.props.sendFile(file.id)}>SEND! {file.id}</button>
                                    </React.Fragment>
                                ))
                            }

                        </ul>
                    </aside>
                    <button onClick={() => this.props.uploadFiles()}>SEND ALL!</button>
                </section>
            </div>
        );
    }
}

export default withFiles(fileUploader)(App as any);
