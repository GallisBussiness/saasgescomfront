import Api from "./Api";
import { Service } from "./Service";

export class VenteService extends Service{
constructor(){
    super(Api,'vente');
}

async findByClient(id:string) {
    return this.api.get(`/${this.ressource}/byclient/${id}`).then(res => res.data);
  }

  async getByUser(id: string) {
    return this.api.get(`/${this.ressource}/user/${id}`).then(res => res.data);
  }
}