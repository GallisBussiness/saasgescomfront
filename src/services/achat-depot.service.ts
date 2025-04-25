import Api from './Api';
import { Service } from './Service';
import { AchatDepot } from '../interfaces/achat-depot.interface';

export class AchatDepotService extends Service {
  constructor() {
    super(Api, 'achat-depots');
  }

  /**
   * Récupère toutes les affectations d'achats à des dépôts pour un utilisateur
   */
  async getByUser(userId: string): Promise<AchatDepot[]> {
    return this.api.get(`/${this.ressource}/user/${userId}`).then(res => res.data);
  }

  /**
   * Récupère les affectations pour un achat spécifique
   */
  async getByAchat(achatId: string): Promise<AchatDepot[]> {
    return this.api.get(`/${this.ressource}/achat/${achatId}`).then(res => res.data);
  }

  /**
   * Récupère les affectations pour un dépôt spécifique
   */
  async getByDepot(depotId: string): Promise<AchatDepot[]> {
    return this.api.get(`/${this.ressource}/depot/${depotId}`).then(res => res.data);
  }

  /**
   * Crée une nouvelle affectation d'achat à un dépôt
   */
  async create(achatDepot: Omit<AchatDepot, '_id'>): Promise<AchatDepot> {
    return this.api.post(`/${this.ressource}`, achatDepot).then(res => res.data);
  }

  /**
   * Met à jour une affectation existante
   */
  async update(id: string, achatDepot: Partial<AchatDepot>): Promise<AchatDepot> {
    return this.api.patch(`/${this.ressource}/${id}`, achatDepot).then(res => res.data);
  }

  /**
   * Supprime une affectation
   */
  async delete(id: string): Promise<void> {
    return this.api.delete(`/${this.ressource}/${id}`).then(res => res.data);
  }

  /**
   * Récupère le total des quantités par dépôt pour un article spécifique
   */
  async getStockParDepot(articleId: string): Promise<{ depot: string, quantite: number }[]> {
    return this.api.get(`/${this.ressource}/article/${articleId}/stock`).then(res => res.data);
  }
}
