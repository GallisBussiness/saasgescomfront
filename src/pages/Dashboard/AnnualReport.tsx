import { Button, Paper, Text, Group, Divider, Tooltip, Title, Box } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useQuery } from '@tanstack/react-query';
import { VenteService } from '../../services/vente.service';
import { AchatService } from '../../services/achat.service';
import { ParamService } from '../../services/paramservice';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatN } from '../../lib/helpers';
import pdfMake from 'pdfmake/build/pdfmake';
import { font } from "../../vfs_fonts";
import { FaPrint, FaCalendarAlt, FaChartLine, FaFileInvoiceDollar } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { authclient } from '../../../lib/auth-client';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
pdfMake.vfs = font;

function AnnualReport() {
  const venteService = new VenteService();
  const achatService = new AchatService();
  const paramService = new ParamService();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [minDate, setMinDate] = useState<Date>(new Date(2020, 0, 1));
  const [maxDate, setMaxDate] = useState<Date>(new Date());
  const { data: session } = authclient.useSession() 
  const { data: ventes } = useQuery({
    queryKey: ['ventes'],
    queryFn: () => venteService.getByUser(session!.user.id),
    enabled: !!session
  });

  const { data: achats } = useQuery({
    queryKey: ['achats'],
    queryFn: () => achatService.getByUser(session!.user.id),
    enabled: !!session
  });

  const { data: param } = useQuery({
    queryKey: ['param'],
    queryFn: () => paramService.getByUser(session!.user.id),
    enabled: !!session
  });

  // Déterminer les dates min et max à partir des données
  useEffect(() => {
    if (ventes && achats) {
      const years = new Set<number>();
      // Ajouter les années des ventes
      ventes.forEach((vente: any) => {
        const year = new Date(vente.date).getFullYear();
        years.add(year);
      });
      
      // Ajouter les années des achats
      achats.forEach((achat: any) => {
        const year = new Date(achat.date).getFullYear();
        years.add(year);
      });

      if (years.size > 0) {
        const yearArray = Array.from(years);
        const minYear = Math.min(...yearArray);
        const maxYear = Math.max(...yearArray);
        setMinDate(new Date(minYear, 0, 1));
        setMaxDate(new Date(maxYear, 11, 31));
      }
    }
  }, [ventes, achats]);

  const generatePDF = async () => {
    const selectedYear = selectedDate.getFullYear();
    
    // Calculer les statistiques par article
    const articleStats = new Map();
    let totalRemisesVentes = 0;
    let totalRemisesAchats = 0;

    // Traiter les ventes
    ventes?.forEach((vente: any) => {
      const date = new Date(vente.date);

      if (date.getFullYear() === selectedYear) {
        // Ajouter la remise de la vente au total
        totalRemisesVentes += parseFloat(vente.remise || 0);
        
        vente.produits.forEach((prod: any) => {
          if (!articleStats.has(prod.ref)) {
            articleStats.set(prod.ref, {
              ref: prod.ref,
              nom: prod.nom,
              ventes: 0,
              qteVendue: 0,
              achats: 0,
              qteAchetee: 0
            });
          }
          const stats = articleStats.get(prod.ref);
          const qte = parseInt(prod.qte);
          stats.ventes += prod.pu * qte;
          stats.qteVendue += qte;
        });
      }
    });

    // Traiter les achats
    achats?.forEach((achat: any) => {
      const date = new Date(achat.date);
      if (date.getFullYear() === selectedYear) {
        // Ajouter la remise de l'achat au total
        totalRemisesAchats += parseFloat(achat.remise || 0);
        
        achat.produits.forEach((prod: any) => {
          if (!articleStats.has(prod.ref)) {
            articleStats.set(prod.ref, {
              ref: prod.ref,
              nom: prod.nom,
              ventes: 0,
              qteVendue: 0,
              achats: 0,
              qteAchetee: 0
            });
          }
          const stats = articleStats.get(prod.ref);
          const qte = parseInt(prod.qte);
          stats.achats += prod.pu * qte;
          stats.qteAchetee += qte;
        });
      }
    });

    const statsArray = Array.from(articleStats.values());
    
    // Calculer les totaux avec des valeurs numériques garanties
    const totaux = statsArray.reduce((acc, curr) => ({
      totalVentes: (acc.totalVentes || 0) + (curr.ventes || 0),
      totalAchats: (acc.totalAchats || 0) + (curr.achats || 0),
      totalQteVendue: (acc.totalQteVendue || 0) + (curr.qteVendue || 0),
      totalQteAchetee: (acc.totalQteAchetee || 0) + (curr.qteAchetee || 0)
    }), { totalVentes: 0, totalAchats: 0, totalQteVendue: 0, totalQteAchetee: 0 });

    // Calculer les bénéfices totaux et le taux de marge global
    const beneficeTotal = totaux.totalVentes - totaux.totalAchats;
    const tauxMarge = totaux.totalAchats > 0 ? (beneficeTotal / totaux.totalAchats) * 100 : 0;

    // Calculer le stock restant global
    const stockRestant = totaux.totalQteAchetee - totaux.totalQteVendue;

    const docDefinition:any = {
      pageOrientation: 'landscape',
      pageMargins: [30, 40, 30, 40],
      footer: function(currentPage:number, pageCount:number) { 
        return { 
          text: `Page ${currentPage} sur ${pageCount}`, 
          alignment: 'center',
          margin: [0, 10, 0, 0],
          style: 'footer'
        };
      },
      background: function() {
        return {
          canvas: [
            {
              type: 'rect',
              x: 0,
              y: 0,
              w: 840,
              h: 15,
              color: '#FF5D14'
            }
          ]
        };
      },
      images: {
        logo: `${import.meta.env.VITE_BACKURL}/uploads/${param?.logo}`
      },
      content: [
        {
          columns: [
            {
              width: '*',
              stack: [
                { text: param?.nom || 'Votre Entreprise', style: 'headerCompany' },
                param?.logo ? { image: `logo`, width: 100, height: 50, margin: [0, 5, 0, 10] } : {},
                { text: `Tél: ${param?.tel || 'N/A'}`, style: 'companyDetails' },
                { text: `Email: ${param?.email || 'N/A'}`, style: 'companyDetails' },
                { text: `Adresse: ${param?.addr || 'N/A'}`, style: 'companyDetails' },
                param?.rc ? { text: `RC: ${param.rc}`, style: 'companyDetails' } : {},
                param?.ice ? { text: `ICE: ${param.ice}`, style: 'companyDetails' } : {},
                param?.if ? { text: `IF: ${param.if}`, style: 'companyDetails' } : {}
              ]
            },
            {
              width: 'auto',
              stack: [
                { text: 'RAPPORT ANNUEL D\'INVENTAIRE', style: 'header' },
                { text: `Année: ${selectedYear}`, style: 'subheader' },
                { text: `Date d'édition: ${format(new Date(), 'dd MMMM yyyy', { locale: fr })}`, style: 'subheader' },
                { text: `Généré par: ${session?.user?.name || 'Utilisateur'}`, style: 'subheader' }
              ],
              alignment: 'right'
            }
          ]
        },
        { text: '\n' },
        {
          canvas: [
            {
              type: 'line',
              x1: 0, y1: 0,
              x2: 760, y2: 0,
              lineWidth: 1,
              lineColor: '#FF5D14'
            }
          ]
        },
        {
          text: 'RÉSUMÉ GLOBAL',
          style: 'sectionHeader'
        },
        {
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*', '*', '*'],
            body: [
              [
                { text: 'Total Ventes', style: 'tableHeader' },
                { text: 'Total Achats', style: 'tableHeader' },
                { text: 'Bénéfice', style: 'tableHeader' },
                { text: 'Taux de Marge', style: 'tableHeader' },
                { text: 'Quantités Vendues', style: 'tableHeader' },
                { text: 'Stock Restant', style: 'tableHeader' }
              ],
              [
                { text: formatN(totaux.totalVentes) + ' FCFA', style: 'tableCell' },
                { text: formatN(totaux.totalAchats) + ' FCFA', style: 'tableCell' },
                { text: formatN(beneficeTotal) + ' FCFA', style: beneficeTotal >= 0 ? 'tableCellPositive' : 'tableCellNegative' },
                { text: tauxMarge.toFixed(2) + ' %', style: tauxMarge >= 0 ? 'tableCellPositive' : 'tableCellNegative' },
                { text: formatN(totaux.totalQteVendue), style: 'tableCell' },
                { text: formatN(stockRestant), style: stockRestant >= 0 ? 'tableCell' : 'tableCellNegative' }
              ]
            ]
          },
          layout: {
            hLineWidth: function(i:number, node:any) { return (i === 0 || i === node.table.body.length) ? 2 : 1; },
            vLineWidth: function(i:number, node:any) { return (i === 0 || i === node.table.widths.length) ? 2 : 1; },
            hLineColor: function(i:number, node:any) { return (i === 0 || i === node.table.body.length) ? '#FF5D14' : '#aaaaaa'; },
            vLineColor: function(i:number, node:any) { return (i === 0 || i === node.table.widths.length) ? '#FF5D14' : '#aaaaaa'; },
            paddingLeft: function() { return 5; },
            paddingRight: function() { return 5; },
            paddingTop: function() { return 3; },
            paddingBottom: function() { return 3; }
          }
        },
        { text: '\n' },
        {
          canvas: [
            {
              type: 'line',
              x1: 0, y1: 0,
              x2: 760, y2: 0,
              lineWidth: 1,
              lineColor: '#FF5D14'
            }
          ]
        },
        {
          text: 'RÉSUMÉ DES REMISES',
          style: 'sectionHeader'
        },
        {
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*'],
            body: [
              [
                { text: 'Remises sur Ventes', style: 'tableHeader' },
                { text: 'Remises sur Achats', style: 'tableHeader' },
                { text: 'Total des Remises', style: 'tableHeader' },
                { text: '% des Ventes', style: 'tableHeader' }
              ],
              [
                { text: formatN(totalRemisesVentes) + ' FCFA', style: 'tableCell' },
                { text: formatN(totalRemisesAchats) + ' FCFA', style: 'tableCell' },
                { text: formatN(totalRemisesVentes + totalRemisesAchats) + ' FCFA', style: 'tableCell' },
                { text: totaux.totalVentes > 0 ? ((totalRemisesVentes / totaux.totalVentes) * 100).toFixed(2) + ' %' : '0.00 %', style: 'tableCell' }
              ]
            ]
          },
          layout: {
            hLineWidth: function(i:number, node:any) { return (i === 0 || i === node.table.body.length) ? 2 : 1; },
            vLineWidth: function(i:number, node:any) { return (i === 0 || i === node.table.widths.length) ? 2 : 1; },
            hLineColor: function(i:number, node:any) { return (i === 0 || i === node.table.body.length) ? '#FF5D14' : '#aaaaaa'; },
            vLineColor: function(i:number, node:any) { return (i === 0 || i === node.table.widths.length) ? '#FF5D14' : '#aaaaaa'; },
            paddingLeft: function() { return 5; },
            paddingRight: function() { return 5; },
            paddingTop: function() { return 3; },
            paddingBottom: function() { return 3; }
          }
        },
        { text: '\n' },
        {
          canvas: [
            {
              type: 'line',
              x1: 0, y1: 0,
              x2: 760, y2: 0,
              lineWidth: 1,
              lineColor: '#FF5D14'
            }
          ]
        },
        {
          text: 'DÉTAILS PAR ARTICLE',
          style: 'sectionHeader'
        },
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Réf', style: 'tableHeader' },
                { text: 'Article', style: 'tableHeader' },
                { text: 'Qté Vendue', style: 'tableHeader' },
                { text: 'Ventes', style: 'tableHeader' },
                { text: 'Qté Achetée', style: 'tableHeader' },
                { text: 'Achats', style: 'tableHeader' },
                { text: 'Stock', style: 'tableHeader' },
                { text: 'Bénéfice', style: 'tableHeader' },
                { text: 'Marge %', style: 'tableHeader' }
              ],
              ...statsArray.map(stat => {
                const benefice = stat.ventes - stat.achats;
                const marge = stat.achats > 0 ? (benefice / stat.achats) * 100 : 0;
                const stock = stat.qteAchetee - stat.qteVendue;
                return [
                  { text: stat.ref, style: 'tableCell' },
                  { text: stat.nom, style: 'tableCell' },
                  { text: formatN(stat.qteVendue), style: 'tableCell' },
                  { text: formatN(stat.ventes) + ' FCFA', style: 'tableCell' },
                  { text: formatN(stat.qteAchetee), style: 'tableCell' },
                  { text: formatN(stat.achats) + ' FCFA', style: 'tableCell' },
                  { text: formatN(stock), style: stock >= 0 ? 'tableCell' : 'tableCellNegative' },
                  { text: formatN(benefice) + ' FCFA', style: benefice >= 0 ? 'tableCellPositive' : 'tableCellNegative' },
                  { text: marge.toFixed(2) + ' %', style: marge >= 0 ? 'tableCellPositive' : 'tableCellNegative' }
                ];
              })
            ]
          },
          layout: {
            hLineWidth: function(i:number, node:any) { return (i === 0 || i === node.table.body.length) ? 2 : 1; },
            vLineWidth: function(i:number, node:any) { return (i === 0 || i === node.table.widths.length) ? 2 : 1; },
            hLineColor: function(i:number, node:any) { return (i === 0 || i === node.table.body.length) ? '#FF5D14' : '#aaaaaa'; },
            vLineColor: function(i:number, node:any) { return (i === 0 || i === node.table.widths.length) ? '#FF5D14' : '#aaaaaa'; },
            paddingLeft: function() { return 5; },
            paddingRight: function() { return 5; },
            paddingTop: function() { return 3; },
            paddingBottom: function() { return 3; }
          }
        }
      ],
      styles: {
        header: {
          fontSize: 20,
          bold: true,
          margin: [0, 0, 0, 10],
          color: '#FF5D14'
        },
        headerCompany: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 5],
          color: '#333333'
        },
        companyDetails: {
          fontSize: 11,
          margin: [0, 0, 0, 3],
          color: '#555555'
        },
        subheader: {
          fontSize: 14,
          margin: [0, 0, 0, 5],
          color: '#666666'
        },
        sectionHeader: {
          fontSize: 16,
          bold: true,
          margin: [0, 15, 0, 10],
          color: '#FF5D14'
        },
        tableHeader: {
          fontSize: 12,
          bold: true,
          fillColor: '#FF5D14',
          color: '#ffffff',
          alignment: 'center',
          margin: [5, 5, 5, 5]
        },
        tableCell: {
          fontSize: 10,
          alignment: 'center',
          margin: [5, 5, 5, 5],
          color: '#333333'
        },
        tableCellPositive: {
          fontSize: 10,
          alignment: 'center',
          margin: [5, 5, 5, 5],
          color: '#22c55e',
          bold: true
        },
        tableCellNegative: {
          fontSize: 10,
          alignment: 'center',
          margin: [5, 5, 5, 5],
          color: '#ef4444',
          bold: true
        },
        footer: {
          fontSize: 9,
          color: '#777777',
          italics: true
        }
      },
      defaultStyle: {
        font: 'Roboto'
      }
    };

    pdfMake.createPdf(docDefinition).open();
  };

  return (
    <div className="mx-auto p-4">
      <Breadcrumb pageName="Rapport Annuel" />
      
      <Paper 
        p="md" 
        radius="md" 
        className="bg-white dark:bg-gray-800 shadow-xl mb-4"
        style={{
          backgroundImage: "linear-gradient(to right bottom, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9))",
          backdropFilter: "blur(10px)"
        }}
      >
        <div className="mb-4">
          <Text fw={600} size="lg" className="text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <FaChartLine className="text-orange-500" /> Rapport Annuel d'Inventaire
          </Text>
          <Text size="sm" color="dimmed" className="mt-1">
            Générez un rapport détaillé des ventes, achats et stocks pour une année spécifique
          </Text>
          <Divider className="my-3" />
        </div>
        
        <Box className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-md mb-4">
          <Group align="end" className="flex-wrap gap-6">
            <div>
              <DatePickerInput
                label="Sélectionner l'année"
                placeholder="Choisir une année"
                value={selectedDate}
                onChange={(date) => setSelectedDate(date || new Date())}
                minDate={minDate}
                maxDate={maxDate}
                w={180}
                locale="fr"
                valueFormat="YYYY"
                type="default"
                hideOutsideDates
                allowDeselect={false}
                clearable={false}
                yearLabelFormat="YYYY"
                leftSection={<FaCalendarAlt size={16} />}
                styles={{
                  input: {
                    '&:focus': {
                      borderColor: '#FF5D14'
                    }
                  }
                }}
                classNames={{
                  label: "font-medium text-gray-700 dark:text-gray-300 mb-1"
                }}
              />
            </div>
            
            <Tooltip label="Générer le rapport PDF" position="top" withArrow transitionProps={{ transition: 'pop' }}>
              <Button
                onClick={generatePDF}
                leftSection={<FaPrint size={16} />}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
                styles={{
                  root: {
                    boxShadow: '0 4px 14px 0 rgba(255, 93, 20, 0.39)'
                  }
                }}
              >
                Générer le rapport
              </Button>
            </Tooltip>
          </Group>
        </Box>
        
        <Box className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-md">
          <Group className="mb-3">
            <FaFileInvoiceDollar className="text-orange-500" size={20} />
            <Title order={4} className="text-gray-800 dark:text-gray-200">
              Aperçu du rapport
            </Title>
          </Group>
          
          <Text size="sm" className="text-gray-600 dark:text-gray-400 mb-4">
            Le rapport généré contiendra les sections suivantes :
          </Text>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Paper p="sm" radius="md" className="border border-gray-200 dark:border-gray-700">
              <Text fw={500} className="text-gray-700 dark:text-gray-300 mb-2">Résumé Global</Text>
              <Text size="sm" color="dimmed">Total des ventes, achats, quantités vendues et achetées pour l'année sélectionnée.</Text>
            </Paper>
            
            <Paper p="sm" radius="md" className="border border-gray-200 dark:border-gray-700">
              <Text fw={500} className="text-gray-700 dark:text-gray-300 mb-2">Résumé des Remises</Text>
              <Text size="sm" color="dimmed">Montant total des remises accordées sur les ventes et les achats.</Text>
            </Paper>
            
            <Paper p="sm" radius="md" className="border border-gray-200 dark:border-gray-700">
              <Text fw={500} className="text-gray-700 dark:text-gray-300 mb-2">Détails par Article</Text>
              <Text size="sm" color="dimmed">Analyse détaillée de chaque article avec quantités vendues/achetées et bénéfices.</Text>
            </Paper>
            
            <Paper p="sm" radius="md" className="border border-gray-200 dark:border-gray-700">
              <Text fw={500} className="text-gray-700 dark:text-gray-300 mb-2">Informations de l'Entreprise</Text>
              <Text size="sm" color="dimmed">En-tête avec les coordonnées de votre entreprise et la date d'édition.</Text>
            </Paper>
          </div>
        </Box>
      </Paper>
    </div>
  );
}

export default AnnualReport;
