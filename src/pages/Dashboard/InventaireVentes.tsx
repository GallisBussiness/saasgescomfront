import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataTable } from 'mantine-datatable';
import {
  Box,
  Button,
  Card,
  Group,
  Text,
  Title,
  Badge,
  LoadingOverlay,
  NumberFormatter,
  Divider,
  Paper,
  SimpleGrid,
  Tooltip,
  ActionIcon
} from '@mantine/core';
import {
  FaPrint,
  FaCalendar,
  FaMoneyBillWave,
  FaUser,
  FaShoppingBag,
  FaFileExcel
} from 'react-icons/fa';
import { DatePickerInput } from '@mantine/dates';
import { VenteService } from '../../services/vente.service';
import { format, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import pdfMake from 'pdfmake/build/pdfmake';
import { font } from '../../vfs_fonts';
import { formatN } from '../../lib/helpers';
import { toast } from 'sonner';
import { authclient } from '../../../lib/auth-client';

pdfMake.vfs = font;

interface Vente {
  id: string;
  date: string;
  numero?: string;
  ref?: string;
  client: {
    nom: string;
    tel?: string;
  };
  produits: Array<{
    produit: {
      nom: string;
      prix: number;
    };
    quantite: number;
    prix_unitaire: number;
  }>;
  montant: number;
  remise: number;
  net_a_payer: number;
  utilisateur?: {
    nom: string;
  };
}

const venteService = new VenteService();

export default function InventaireVentes() {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  const { data: session } = authclient.useSession();

  // Récupération des ventes
  const { data: ventes = [], isLoading } = useQuery({
    queryKey: ['ventes-inventaire', session?.user?.id],
    queryFn: () => venteService.getByUser(session!.user.id),
    enabled: !!session?.user?.id,
    select: (data) => data || []
  });

  // Filtrage des ventes par date
  const ventesFiltered = useMemo(() => {
    if (!startDate || !endDate) return ventes;
    
    return ventes.filter((vente: Vente) => {
      const venteDate = new Date(vente.date);
      return isWithinInterval(venteDate, {
        start: startOfDay(startDate),
        end: endOfDay(endDate)
      });
    });
  }, [ventes, startDate, endDate]);

  // Calcul des statistiques
  const stats = useMemo(() => {
    const totalVentes = ventesFiltered.length;
    const chiffreAffaires = ventesFiltered.reduce((sum: number, vente: Vente) => {
      const netAPayer = Number(vente.net_a_payer) || 0;
      return sum + netAPayer;
    }, 0);
    const totalRemises = ventesFiltered.reduce((sum: number, vente: Vente) => {
      const remise = Number(vente.remise) || 0;
      return sum + remise;
    }, 0);
    const montantBrut = ventesFiltered.reduce((sum: number, vente: Vente) => {
      const montant = Number(vente.montant) || 0;
      return sum + montant;
    }, 0);
    
    // Articles vendus
    const articlesVendus = ventesFiltered.reduce((total: number, vente: Vente) => {
      const produitsQuantite = vente.produits?.reduce((sum: number, produit: any) => {
        const quantite = Number(produit.qte) || 0;
        return sum + quantite;
      }, 0) || 0;
      return total + produitsQuantite;
    }, 0);

    // Clients uniques
    const clientsUniques = new Set(
      ventesFiltered
        .filter((vente: Vente | null) => vente?.client?.nom)
        .map((vente: Vente | null) => vente?.client.nom)
    ).size;

    return {
      totalVentes: totalVentes || 0,
      chiffreAffaires: chiffreAffaires || 0,
      totalRemises: totalRemises || 0,
      montantBrut: montantBrut || 0,
      articlesVendus: articlesVendus || 0,
      clientsUniques: clientsUniques || 0
    };
  }, [ventesFiltered]);

  // Génération du PDF
  const genererPDF = () => {
    const dateText = startDate && endDate 
      ? `du ${format(startDate, 'dd/MM/yyyy', { locale: fr })} au ${format(endDate, 'dd/MM/yyyy', { locale: fr })}`
      : 'Toutes les ventes';

    const docDefinition: any = {
      content: [
        // En-tête
        {
          text: 'INVENTAIRE DES VENTES',
          style: 'header',
          alignment: 'center',
          margin: [0, 0, 0, 10]
        },
        {
          text: `Période: ${dateText}`,
          style: 'subheader',
          alignment: 'center',
          margin: [0, 0, 0, 20]
        },

        // Statistiques
        {
          text: 'RÉSUMÉ',
          style: 'sectionHeader',
          margin: [0, 0, 0, 10]
        },
        {
          table: {
            headerRows: 0,
            widths: ['*', '*', '*'],
            body: [
              [
                { text: 'Nombre de ventes', style: 'tableCell' },
                { text: 'Chiffre d\'affaires', style: 'tableCell' },
                { text: 'Articles vendus', style: 'tableCell' }
              ],
              [
                { text: stats.totalVentes.toString(), style: 'tableCellBold' },
                { text: formatN(stats.chiffreAffaires) + ' FCFA', style: 'tableCellBold' },
                { text: stats.articlesVendus.toString(), style: 'tableCellBold' }
              ]
            ]
          },
          margin: [0, 0, 0, 20]
        },

        // Détail des ventes
        {
          text: 'DÉTAIL DES VENTES',
          style: 'sectionHeader',
          margin: [0, 20, 0, 10]
        },
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Date', style: 'tableHeader' },
                { text: 'N° Vente', style: 'tableHeader' },
                { text: 'Client', style: 'tableHeader' },
                { text: 'Articles', style: 'tableHeader' },
                { text: 'Remise', style: 'tableHeader' },
                { text: 'Net à payer', style: 'tableHeader' }
              ],
              ...ventesFiltered.map((vente: Vente) => [
                { text: format(new Date(vente.date), 'dd/MM/yyyy'), style: 'tableCell' },
                { text: vente.numero || vente.ref || 'N/A', style: 'tableCell' },
                { text: vente.client?.nom || 'Client inconnu', style: 'tableCell' },
                { text: (vente.produits?.reduce((sum: number, p: any) => sum + (Number(p.qte) || 0), 0) || 0).toString(), style: 'tableCell' },
                { text: formatN(Number(vente.remise) || 0) + ' FCFA', style: 'tableCell' },
                { text: formatN(Number(vente.net_a_payer) || 0) + ' FCFA', style: 'tableCell' }
              ])
            ]
          }
        },

        // Total
        {
          table: {
            headerRows: 0,
            widths: ['*', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: '', border: [false, false, false, false] },
                { text: '', border: [false, false, false, false] },
                { text: 'TOTAL:', style: 'tableCellBold', alignment: 'right' },
                { text: formatN(stats.chiffreAffaires) + ' FCFA', style: 'tableCellBold' }
              ]
            ]
          },
          margin: [0, 10, 0, 0]
        }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true
        },
        subheader: {
          fontSize: 14,
          italics: true
        },
        sectionHeader: {
          fontSize: 14,
          bold: true,
          decoration: 'underline'
        },
        tableHeader: {
          bold: true,
          fontSize: 10,
          color: 'white',
          fillColor: '#2563eb'
        },
        tableCell: {
          fontSize: 9
        },
        tableCellBold: {
          fontSize: 9,
          bold: true
        }
      },
      defaultStyle: {
        fontSize: 10
      }
    };

    pdfMake.createPdf(docDefinition).download(`inventaire-ventes-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    toast.success('PDF généré avec succès');
  };

  // Export Excel simple
  const exporterExcel = () => {
    const csvContent = [
      ['Date', 'N° Vente', 'Client', 'Articles vendus', 'Montant brut', 'Remise', 'Net à payer', 'Vendeur'],
      ...ventesFiltered.map((vente: Vente) => [
        format(new Date(vente.date), 'dd/MM/yyyy'),
        vente.numero || vente.ref || 'N/A',
        vente.client?.nom || 'Client inconnu',
        (vente.produits?.reduce((sum: number, p: any) => sum + (Number(p.qte) || 0), 0) || 0).toString(),
        (Number(vente.montant) || 0).toString(),
        (Number(vente.remise) || 0).toString(),
        (Number(vente.net_a_payer) || 0).toString(),
        vente.utilisateur?.nom || 'N/A'
      ])
    ].map(row => row.join(';')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      const dateText = startDate && endDate 
        ? `_${format(startDate, 'dd-MM-yyyy')}_au_${format(endDate, 'dd-MM-yyyy')}`
        : '_toutes';
      link.setAttribute('download', `inventaire-ventes${dateText}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    toast.success('Fichier CSV exporté avec succès');
  };

  return (
    <Box p="md">
      <LoadingOverlay visible={isLoading} />
      
      {/* En-tête */}
      <Card shadow="sm" mb="lg">
        <Group justify="space-between" align="center">
          <div>
            <Title order={2} c="blue">
              <FaShoppingBag style={{ marginRight: 8 }} />
              Inventaire des Ventes
            </Title>
            <Text size="sm" c="dimmed">
              Consultez et imprimez l'inventaire de vos ventes
            </Text>
          </div>
          <Group>
            <Tooltip label="Imprimer PDF">
              <Button
                leftSection={<FaPrint />}
               className='bg-blue-600 hover:bg-blue-700'
                onClick={genererPDF}
                disabled={ventesFiltered.length === 0}
              >
                Imprimer
              </Button>
            </Tooltip>
            <Tooltip label="Exporter CSV">
              <ActionIcon
                size="lg"
                variant="light"
                color="green"
                onClick={exporterExcel}
                disabled={ventesFiltered.length === 0}
              >
                <FaFileExcel />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </Card>

      {/* Filtres */}
      <Card shadow="sm" mb="lg">
        <Title order={4} mb="md">
          <FaCalendar style={{ marginRight: 8 }} />
          Filtrer par période
        </Title>
        <DatePickerInput
          type="range"
          label="Sélectionner une période"
          placeholder="Choisir les dates de début et fin"
          value={dateRange}
          onChange={setDateRange}
          locale="fr"
          clearable
          maxDate={new Date()}
        />
      </Card>

      {/* Statistiques */}
      <SimpleGrid cols={{ base: 2, md: 4 }} mb="lg">
        <Paper shadow="sm" p="md" withBorder>
          <Group>
            <ActionIcon size="lg" variant="light" color="blue">
              <FaShoppingBag />
            </ActionIcon>
            <div>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                Ventes
              </Text>
              <Text fw={700} size="xl">
                {stats.totalVentes}
              </Text>
            </div>
          </Group>
        </Paper>

        <Paper shadow="sm" p="md" withBorder>
          <Group>
            <ActionIcon size="lg" variant="light" color="green">
              <FaMoneyBillWave />
            </ActionIcon>
            <div>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                Chiffre d'affaires
              </Text>
              <Text fw={700} size="xl">
                <NumberFormatter
                  value={stats.chiffreAffaires}
                  thousandSeparator=" "
                  suffix=" FCFA"
                />
              </Text>
            </div>
          </Group>
        </Paper>

        <Paper shadow="sm" p="md" withBorder>
          <Group>
            <ActionIcon size="lg" variant="light" color="orange">
              <FaUser />
            </ActionIcon>
            <div>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                Clients
              </Text>
              <Text fw={700} size="xl">
                {stats.clientsUniques}
              </Text>
            </div>
          </Group>
        </Paper>

        <Paper shadow="sm" p="md" withBorder>
          <Group>
            <ActionIcon size="lg" variant="light" color="violet">
              <FaShoppingBag />
            </ActionIcon>
            <div>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                Articles vendus
              </Text>
              <Text fw={700} size="xl">
                {stats.articlesVendus}
              </Text>
            </div>
          </Group>
        </Paper>
      </SimpleGrid>

      {/* Tableau des ventes */}
      <Card shadow="sm">
        <DataTable
          withTableBorder
          withColumnBorders
          striped
          highlightOnHover
          records={ventesFiltered}
          columns={[
            {
              accessor: 'date',
              title: 'Date',
              sortable: true,
              render: (vente: Vente) => format(new Date(vente.date), 'dd/MM/yyyy HH:mm', { locale: fr })
            },
            {
              accessor: 'numero',
              title: 'N° Vente',
              render: (vente: Vente) => (
                <Badge variant="light" color="blue">
                  {vente.numero || vente.ref || 'N/A'}
                </Badge>
              )
            },
            {
              accessor: 'client.nom',
              title: 'Client',
              sortable: true,
              render: (vente: Vente) => vente.client?.nom || 'Client inconnu'
            },
            {
              accessor: 'produits',
              title: 'Articles',
              textAlign: 'center',
              render: (vente: Vente) => {
                const totalQuantite = vente.produits?.reduce((sum: number, p: any) => {
                  return sum + (Number(p.qte) || 0);
                }, 0) || 0;
                return (
                  <Badge variant="outline">
                    {totalQuantite} articles
                  </Badge>
                );
              }
            },
            {
              accessor: 'montant',
              title: 'Montant brut',
              textAlign: 'right',
              sortable: true,
              render: (vente: Vente) => (
                <NumberFormatter
                  value={Number(vente.montant) || 0}
                  thousandSeparator=" "
                  suffix=" FCFA"
                />
              )
            },
            {
              accessor: 'remise',
              title: 'Remise',
              textAlign: 'right',
              sortable: true,
              render: (vente: Vente) => {
                const remise = Number(vente.remise) || 0;
                return (
                  <Text c={remise > 0 ? 'red' : 'dimmed'}>
                    <NumberFormatter
                      value={remise}
                      thousandSeparator=" "
                      suffix=" FCFA"
                    />
                  </Text>
                );
              }
            },
            {
              accessor: 'net_a_payer',
              title: 'Net à payer',
              textAlign: 'right',
              sortable: true,
              render: (vente: Vente) => (
                <Text fw={700} c="green">
                  <NumberFormatter
                    value={Number(vente.net_a_payer) || 0}
                    thousandSeparator=" "
                    suffix=" FCFA"
                  />
                </Text>
              )
            },
            {
              accessor: 'utilisateur',
              title: 'Vendeur',
              render: (vente: Vente) => vente.utilisateur?.nom || 'N/A'
            }
          ]}
          totalRecords={ventesFiltered.length}
          noRecordsText="Aucune vente trouvée pour cette période"
          minHeight={400}
        />

        {/* Totaux */}
        <Divider my="md" />
        <Group justify="space-between">
          <Group>
            <Text fw={700}>
              Total des ventes : {stats.totalVentes}
            </Text>
            <Text fw={700}>
              Articles vendus : {stats.articlesVendus}
            </Text>
          </Group>
          <Group>
            <Text fw={700} c="orange">
              Remises : <NumberFormatter value={stats.totalRemises} thousandSeparator=" " suffix=" FCFA" />
            </Text>
            <Text fw={700} c="green" size="lg">
              Total : <NumberFormatter value={stats.chiffreAffaires} thousandSeparator=" " suffix=" FCFA" />
            </Text>
          </Group>
        </Group>
      </Card>
    </Box>
  );
}
