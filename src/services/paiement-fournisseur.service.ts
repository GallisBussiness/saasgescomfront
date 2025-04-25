import Api from "./Api";
import { Service } from "./Service";

export class PaiementFournisseurService extends Service{
constructor(){
    super(Api,'paiement-fournisseur');
}

async getByUser(id: string) {
    return this.api.get(`/${this.ressource}/user/${id}`).then(res => res.data);
  }

  async byAchat(id:string) {
    return this.api.get(`/${this.ressource}/byachat/${id}`).then(res => res.data);
  }
}