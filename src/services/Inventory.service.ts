import Api from "./Api";
import { Service } from "./Service";

export class InventoryService extends Service{
constructor(){
    super(Api,'inventory');
}

// async byref(ref:string) {
//     return this.api.post(`/${this.ressource}/getbyref/${ref}`).then(res => res.data);
//   }

async getByUser(id: string) {
    return this.api.get(`/${this.ressource}/user/${id}`).then(res => res.data);
  }

  async getOneByUser(userID: string,id:string) {
    return this.api.get(`/${this.ressource}/user/${userID}/${id}`).then(res => res.data);
  }
}