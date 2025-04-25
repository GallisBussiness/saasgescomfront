import Api from "./Api";
import { Service } from "./Service";

export class UniteService extends Service{
constructor(){
    super(Api,'unite');
}

async getByUser(id: string) {
    return this.api.get(`/${this.ressource}/user/${id}`).then(res => res.data);
  }
}