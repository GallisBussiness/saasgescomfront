import Api from "./Api";
import { Service } from "./Service";

export class FamilleService extends Service{
constructor(){
    super(Api,'famille');
}

async getByUser(id: string) {
    return this.api.get(`/${this.ressource}/user/${id}`).then(res => res.data);
  }
}