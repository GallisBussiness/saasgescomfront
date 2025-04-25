export interface Payment {
  _id?: string;
  pack: string;
  user: string;
  montant?: number;
  date_debut?: Date;
  date_fin?: Date;
  type_abonnement?: string;
  statut?: 'en_attente' | 'valide' | 'annule' | 'expire';
  methode_paiement?: string;
  transaction_id?: string;
  createdAt?: string;
  updatedAt?: string;
}
