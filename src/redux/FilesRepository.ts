import {keys} from "lodash";

interface IData {
    [id: string]: FormData;
}

class FilesRepository {
    private data: IData = {};

    public attach(id: string, file: File) {
        const formData = new FormData();
        formData.append(file.name, file);
        this.data = {...this.data, [id]: formData}
    }

    public getFile(id: string) {
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

export default FilesRepository;