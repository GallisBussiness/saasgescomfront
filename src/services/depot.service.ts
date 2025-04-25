import Api from './Api';
import { Service } from './Service';
import { Depot } from '../interfaces/depot.interface';

export class DepotService extends Service {
  constructor() {
    super(Api, 'depot');
  }

  /**
   * Récupère tous les dépôts de l'utilisateur
   */
  async getByUser(userId: string): Promise<Depot[]> {
    return this.api.get(`/${this.ressource}/user/${userId}`).then(res => res.data);
  }

  /**
   * Récupère un dépôt par son ID
   */
  async getById(id: string): Promise<Depot> {
    return this.api.get(`/${this.ressource}/${id}`).then(res => res.data);
  }

  /**
   * Change le statut actif/inactif d'un dépôt
   */
  async toggleStatus(id: string, actif: boolean): Promise<Depot> {
    return this.api.patch(`/${this.ressource}/${id}/status`, { actif }).then(res => res.data);
  }
}
