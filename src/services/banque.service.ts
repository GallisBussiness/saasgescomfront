import Api from "./Api";
import { Service } from "./Service";

export class BanqueService extends Service{
constructor(){
    super(Api,'banque');
}
async toggle(id: string,data: any) {
    return this.api.patch(`/${this.ressource}/toggle/${id}`, data).then(res => res.data);
  }
}