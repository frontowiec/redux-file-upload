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

    public getAll() {
        return this.data;
    }

    public getIds() {
        return keys(this.data);
    }
}

export default RequestRepository;
