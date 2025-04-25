export interface Pack {
  _id: string;
  nom: string;
  nb_jours: number;
  prix: number;
  duree_mois: number;
  description: string;
  actif: boolean;
  features?: string[];
  createdAt?: string;
  updatedAt?: string;
}
