import {keys} from "lodash";

interface IData {
    [id: string]: XMLHttpRequest;
}

class RequestRepository {
    private data: IData = {};

    public attach(id: string) {
        this.data = {...this.data, [id]: new XMLHttpRequest()};
    }

    public getRequest(id: string) {
        return this.data[id];
    }

    public getIds() {
        return keys(this.data);
    }

    public remove(id: string) {
        delete this.data[id];
    }

    public clearAll() {
        this.data = {};
    }
}

export default RequestRepository;
