import Api from "./Api";
import { Service } from "./Service";

export class FactureVenteService extends Service{
constructor(){
    super(Api,'facture-vente');
}

async byvente(id:string) {
    return this.api.get(`/${this.ressource}/getbyvente/${id}`).then(res => res.data);
  }

  async getByUser(id: string) {
    return this.api.get(`/${this.ressource}/user/${id}`).then(res => res.data);
  }
}