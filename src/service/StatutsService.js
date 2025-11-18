import axios from "axios";

export class StatutsService {
    client = axios.create({
        baseURL: import.meta.env.VITE_APP_ROOT_API,
    });

    /**
     * Renvoie les statuts des différentes bases de données
     * @return {Promise<AxiosResponse<any>>}
     * response.data : { statut, valeur}
     */
    getStatusApplication(){
        return this.client.get("statusApplication")
    }
}
export default new StatutsService();