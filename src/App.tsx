import * as React from 'react';
import './App.css';
import ModuleA from "./ModuleA";
import ModuleB from "./ModuleB";

class App extends React.Component {
    public render() {
        return (
            <div className="App">
                <ModuleA/>
                <ModuleB/>
            </div>
        );
    }
}

export default App;
