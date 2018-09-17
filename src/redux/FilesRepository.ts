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

    public getAll() {
        return this.data;
    }

    public getIds() {
        return keys(this.data);
    }
}

export default FilesRepository;