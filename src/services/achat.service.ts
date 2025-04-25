import Api from "./Api";
import { Service } from "./Service";

export class AchatService extends Service{
constructor(){
    super(Api,'achat');
}

async getByUser(id: string) {
    return this.api.get(`/${this.ressource}/user/${id}`).then(res => res.data);
  }

  async byFournisseur(id: string) {
    return this.api.get(`/${this.ressource}/byfournisseur/${id}`).then(res => res.data);
  }

  /**
   * Récupère un achat par son ID
   */
  async getById(id: string) {
    return this.api.get(`/${this.ressource}/${id}`).then(res => res.data);
  }

  /**
   * Récupère les achats par dépôt
   */
  async getByDepot(depotId: string) {
    return this.api.get(`/${this.ressource}/bydepot/${depotId}`).then(res => res.data);
  }
}