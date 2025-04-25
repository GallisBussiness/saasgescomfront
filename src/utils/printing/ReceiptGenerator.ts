import pdfMake from 'pdfmake/build/pdfmake';
import { font } from "../../vfs_fonts";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatN } from '../../lib/helpers';

// Register fonts
pdfMake.vfs = font;

interface Product {
  ref: string;
  nom: string;
  unite: string;
  qte: number;
  pu: number;
}

interface Client {
  nom: string;
  tel?: string;
  email?: string;
  adresse?: string;
}

interface VenteData {
  ref: string;
  date: string;
  client?: Client;
  produits: Product[];
  remise?: number;
}

interface BusinessInfo {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
}

export class ReceiptGenerator {
  /**
   * Génère un ticket de caisse au format PDF pour une vente
   * @param venteData Les données de la vente
   * @param businessInfo Informations sur l'entreprise (optionnel)
   * @returns La définition du document PDF pour pdfMake
   */
  static generateReceiptDefinition(
    venteData: VenteData, 
    businessInfo: BusinessInfo = { 
      name: 'Votre Entreprise',
      address: 'Adresse de l\'entreprise',
      phone: 'Téléphone',
      email: 'Email'
    }
  ) {
    // Calculer le total
    const total = venteData.produits.reduce((acc, product) => acc + (product.pu * product.qte), 0);
    const remise = venteData.remise || 0;
    const netAPayer = total - remise;
    
    // Formater la date
    // const formattedDate = format(new Date(venteData.date), 'dd MMMM yyyy HH:mm', { locale: fr });
    
    // Créer les données du tableau des produits - Optimisé pour format A8
    const tableBody = [
      // En-tête du tableau
      [
        { text: 'N°', style: 'tableHeader' },
        { text: 'Désig.', style: 'tableHeader' },
        { text: 'Qt', style: 'tableHeader' },
        { text: 'Total', style: 'tableHeader' }
      ],
      // Lignes du tableau pour chaque produit - version ultra-compacte
      ...venteData.produits.map((product, index) => [
        { text: (index + 1).toString(), alignment: 'center', fontSize: 6 },
        { text: product.nom.length > 15 ? product.nom.substring(0, 13) + '...' : product.nom, fontSize: 6 },
        { text: product.qte.toString(), alignment: 'center', fontSize: 6 },
        { text: `${formatN(product.pu * product.qte)}`, alignment: 'right', fontSize: 6 }
      ])
    ];
    
    // Définition du document PDF - Optimisé pour format A8
    const docDefinition:any = {
      pageSize: 'A8',
      pageMargins: [2, 2, 2, 2],
      content: [
        // En-tête avec informations de l'entreprise - ultra-compacté
        { text: businessInfo.name, style: 'header', alignment: 'center' },
        
        // Informations de l'entreprise et de la vente - ultra-compactées
        {
          text: [
            { text: `#${venteData.ref} - `, fontSize: 5, bold: true },
            { text: format(new Date(venteData.date), 'dd/MM/yy', { locale: fr }), fontSize: 5 }
          ],
          alignment: 'center',
          margin: [0, 1, 0, 1]
        },
        
        // Ligne de séparation fine
        { canvas: [{ type: 'line', x1: 0, y1: 1, x2: 100, y2: 1, lineWidth: 0.2, lineColor: '#cccccc' }], margin: [0, 1, 0, 1] },
        
        // Client et contact en une seule ligne si disponible
        venteData.client ? {
          text: `${venteData.client.nom}${venteData.client.tel ? ' - ' + venteData.client.tel : ''}`,
          fontSize: 5,
          alignment: 'center',
          margin: [0, 0, 0, 1]
        } : {},
        
        // Ligne de séparation fine
        { canvas: [{ type: 'line', x1: 0, y1: 1, x2: 100, y2: 1, lineWidth: 0.2, lineColor: '#cccccc' }], margin: [0, 1, 0, 1] },
        
        // Tableau des produits - Optimisé pour format A8
        {
          table: {
            headerRows: 1,
            widths: [8, '*', 10, 25],
            body: tableBody
          },
          layout: {
            fillColor: function(rowIndex: number) {
              return (rowIndex === 0) ? '#FF5D14' : null;
            },
            hLineWidth: function(i: number, node: any) { return (i === 0 || i === node.table.body.length) ? 0.2 : 0.1; },
            vLineWidth: function() { return 0.1; },
            hLineColor: function() { return '#cccccc'; },
            vLineColor: function() { return '#cccccc'; },
            paddingLeft: function() { return 1; },
            paddingRight: function() { return 1; },
            paddingTop: function() { return 0.5; },
            paddingBottom: function() { return 0.5; }
          }
        },
        
        // Résumé financier - Optimisé pour format A8
        {
          columns: [
            { width: '*', text: 'Total:', alignment: 'left', fontSize: 5 },
            { width: 'auto', text: `${formatN(total)}`, alignment: 'right', fontSize: 5 }
          ],
          margin: [0, 1, 0, 0]
        },
        remise > 0 ? {
          columns: [
            { width: '*', text: 'Remise:', alignment: 'left', fontSize: 5 },
            { width: 'auto', text: `${formatN(remise)}`, alignment: 'right', fontSize: 5 }
          ],
          margin: [0, 0, 0, 0]
        } : {},
        {
          columns: [
            { width: '*', text: 'Net à payer:', alignment: 'left', bold: true, fontSize: 6 },
            { width: 'auto', text: `${formatN(netAPayer)}`, alignment: 'right', bold: true, color: '#FF5D14', fontSize: 6 }
          ],
          margin: [0, 1, 0, 1]
        },
        
        // Ligne de séparation fine
        { canvas: [{ type: 'line', x1: 0, y1: 1, x2: 100, y2: 1, lineWidth: 0.2, lineColor: '#cccccc' }], margin: [0, 1, 0, 1] },
        
        // Message de remerciement et pied de page - ultra-compactés
        { text: 'Merci pour votre achat!', alignment: 'center', italics: true, fontSize: 5 }
      ],
      
      // Styles du document - Optimisés pour format A8
      styles: {
        header: {
          fontSize: 8,
          bold: true,
          margin: [0, 0, 0, 1]
        },
        subheader: {
          fontSize: 7,
          bold: true,
          margin: [0, 1, 0, 1]
        },
        tableHeader: {
          bold: true,
          fontSize: 5,
          color: 'white',
          fillColor: '#FF5D14',
          alignment: 'center'
        }
      },  
      // Informations du document
      info: {
        title: `Ticket de caisse - ${venteData.ref}`,
        author: businessInfo.name,
        subject: 'Ticket de caisse',
        keywords: 'ticket, caisse, vente'
      }
    };
    
    return docDefinition;
  }
  
  /**
   * Génère et télécharge un ticket de caisse au format PDF
   * @param venteData Les données de la vente
   * @param businessInfo Informations sur l'entreprise (optionnel)
   */
  static downloadReceipt(venteData: VenteData, businessInfo?: BusinessInfo): void {
    const docDefinition = this.generateReceiptDefinition(venteData, businessInfo);
    pdfMake.createPdf(docDefinition).download(`ticket_caisse_${venteData.ref}.pdf`);
  }
  
  /**
   * Génère et ouvre un ticket de caisse dans une nouvelle fenêtre
   * @param venteData Les données de la vente
   * @param businessInfo Informations sur l'entreprise (optionnel)
   */
  static printReceipt(venteData: VenteData, businessInfo?: BusinessInfo): void {
    const docDefinition = this.generateReceiptDefinition(venteData, businessInfo);
    pdfMake.createPdf(docDefinition).print();
  }
  
  /**
   * Génère et ouvre un ticket de caisse dans une nouvelle fenêtre
   * @param venteData Les données de la vente
   * @param businessInfo Informations sur l'entreprise (optionnel)
   */
  static openReceipt(venteData: VenteData, businessInfo?: BusinessInfo): void {
    const docDefinition = this.generateReceiptDefinition(venteData, businessInfo);
    pdfMake.createPdf(docDefinition).open();
  }
}
