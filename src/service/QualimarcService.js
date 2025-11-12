import axios from "axios";


export class QualimarcService {


    client = axios.create({
        baseURL: import.meta.env.VITE_APP_ROOT_API,
    });

    controller = new AbortController();
    randomId = null;

    async ensureRandomId() {
        if (!this.randomId) {
            const response = await this.client.get("getGeneratedId", { signal: this.controller.signal });
            this.randomId = response.data;
        }
    }
    cancel() {
        // Cancel the request
        this.controller.abort();
        this.controller = new AbortController();
    }

        /**
         * fonction permetant de faire passer les regles sur une liste de ppn selon le type d'analyse choisi
         * @param ppnList la liste de ppn ex: ["123456789","987654321"]
         * @param typeAnalyse le type d'analyse choisi ex: "QUICK"
         * @param famillesDocuments la/les familles de doc choisi
         * @param ruleSet les jeux de regles choisi
         * @param isReplay boolean permetant de distingé si l' analyse est rejoué ou pas
         * @returns {Promise<AxiosResponse<any>>}
         */
    async checkPpnWithTypeAnalyse(ppnList, typeAnalyse, famillesDocuments, ruleSet, isReplay) {
        await this.ensureRandomId();
        let data = {
            id: this.randomId,
            ppnList: ppnList,
            typeAnalyse: typeAnalyse,
            isReplay: isReplay,
        }
        if(ruleSet.length > 0){
            data.ruleSet = ruleSet
        }
        if(famillesDocuments.length > 0){
            data.famillesDocuments = famillesDocuments
        }
        return this.client.post('check',data, {signal: this.controller.signal})
    }


    /**
     * Renvoie la liste des analyses
     * @return {Promise<AxiosResponse<any>>}
     * response.data : {
     *     "quickAnalyse": {
     *         "id": "QUICK",
     *         "libelle"
     *         "description"
     *         "nbRules"
     *     },
     *     "completeAnalyse": {
     *         "id": "COMPLETE",
     *         "libelle"
     *         "description"
     *         "nbRules"
     *     },
     *     "focusAnalyse": {
     *         "id": "FOCUS"
     *         "libelle"
     *         "description"
     *         "nbRules"
     *         "famillesDocument": [
     *             {
     *                 "id"
     *                 "libelle"
     *                 "nbRules"
     *             }
     *         ],
     *         "ruleSets": [
     *             {
     *                 "id": 1,
     *                 "libelle"
     *                 "description"
     *                 "position"
     *                 "nbRules"
     *             }
     *         ]
     *     }
     * }
     */
    getAnalyses() {
        return this.client.get("getAnalyses", {signal: this.controller.signal})
    }

    /**
     * Renvoie la liste des familles de documents
     * @return {Promise<AxiosResponse<any>>}
     * response.data : { id, libelle}
     */
    getFamillesDocuments(){
      return this.client.get("getFamillesDocuments", {signal: this.controller.signal})
    }

    /**
     * Renvoie la liste des jeux de regles
     * @return {Promise<AxiosResponse<any>>}
     * response.data : {id, libelle, description, position}
     */
    getRuleSetList(){
      return this.client.get("getRuleSets", {signal: this.controller.signal})
    }

    /**
     * Renvoie la liste des règles
     * @return {Promise<AxiosResponse<any>>}
     * response.data : {id, zoneUnm1, zoneUnm2, typeDoc, message, priority}
     */
    getRules() {
        return this.client.get("rules", {signal: this.controller.signal})
    }

    /**
     * Renvoie le status de la tache (0 à 100%)
     */
    async getStatus() {
        await this.ensureRandomId();
        return this.client.get("getStatus/"+this.randomId, {signal: this.controller.signal})
    }

}
export default new QualimarcService();
