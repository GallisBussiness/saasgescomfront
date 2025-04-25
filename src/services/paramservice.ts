import Api from "./Api";
import { Service } from "./Service";

export class ParamService extends Service{
constructor(){
    super(Api,'param');
}

async getByUser(id: string) {
    return this.api.get(`/${this.ressource}/user/${id}`).then(res => res.data);
  }

}