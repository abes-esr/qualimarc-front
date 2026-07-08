import axios from "axios";


export class QualimarcService {


    client = axios.create({
        baseURL: import.meta.env.VITE_APP_ROOT_API,
    });

    controller = new AbortController();
    randomId = null;
    currentAnalysis = null;

    async ensureRandomId() {
        if (!this.randomId) {
            const response = await this.client.get("getGeneratedId", { signal: this.controller.signal });
            this.randomId = response.data;
        }
    }

    startAnalysisTracking(ppnCount, analysisType, isReplay) {
        this.currentAnalysis = {
            startedAt: performance.now(),
            ppnCount: ppnCount,
            analysisType: analysisType,
            isReplay: isReplay,
        };
    }

    logAnalysisDuration(status) {
        if (!this.currentAnalysis) {
            this.randomId = null;
            return;
        }

        const durationMs = Math.round(performance.now() - this.currentAnalysis.startedAt);

        console.info('[Qualimarc] Analyse ' + status, {
            dureeMs: durationMs,
            dureeSecondes: Number((durationMs / 1000).toFixed(3)),
            nbPpn: this.currentAnalysis.ppnCount,
            typeAnalyse: this.currentAnalysis.analysisType,
            replay: this.currentAnalysis.isReplay,
        });

        this.currentAnalysis = null;
        this.randomId = null;
    }

    cancel() {
        this.controller.abort();
        this.controller = new AbortController();
        this.randomId = null;
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
        this.randomId = null;
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
        try {
            return await this.client.get("getStatus/" + this.randomId, {signal: this.controller.signal})
        } catch (error) {
            if (error.message === 'canceled' || error.code === 'ERR_CANCELED') {
                return null;
            }
            throw error;
        }
    }

    async getResult() {
        await this.ensureRandomId();
        try {
            return await this.client.get("result/" + this.randomId, {signal: this.controller.signal})
        } catch (error) {
            if (error.message === 'canceled' || error.code === 'ERR_CANCELED') {
                return null;
            }
            throw error;
        }
    }

}
export default new QualimarcService();
