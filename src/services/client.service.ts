import Api from "./Api";
import { Service } from "./Service";

export class ClientService extends Service{
constructor(){
    super(Api,'client');
}

async getByUser(id: string) {
    return this.api.get(`/${this.ressource}/user/${id}`).then(res => res.data);
  }
}