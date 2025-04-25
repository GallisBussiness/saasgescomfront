import Api from "./Api";
import { Service } from "./Service";

export class ArticleService extends Service{
constructor(){
    super(Api,'article');
}

  async getByUser(id: string, ref?: string) {
    return this.api.get(`/${this.ressource}/user/${id}${ref ? `?ref=${ref}` : ''}`).then(res => res.data);
  }
  
  async byref(ref: string) {
    return this.api.get(`/${this.ressource}/byref/${ref}`).then(res => res.data);
  }
}