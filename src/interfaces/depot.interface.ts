export interface Depot {
  _id?: string;
  nom: string;
  adresse: string;
  responsable?: string;
  description?: string;
  actif: boolean;
  userId: string;
}
