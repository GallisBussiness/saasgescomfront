import Api from "./Api";
import { Service } from "./Service";

export class FournisseurService extends Service{
constructor(){
    super(Api,'fournisseur');
}

async getByUser(id: string) {
    return this.api.get(`/${this.ressource}/user/${id}`).then(res => res.data);
  }
}