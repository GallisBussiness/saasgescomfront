import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  Box, 
  Button, 
  LoadingOverlay, 
  Text, 
  Modal,
  NumberInput, 
  Group, 
  ActionIcon 
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { DatePickerInput } from "@mantine/dates";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "mantine-datatable";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Empty } from "antd";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { formatN } from "../../lib/helpers";
import { VenteService } from "../../services/vente.service";
import { PaiementClientService } from "../../services/paiement-client.service";
import { ClientService } from "../../services/client.service";
import { WeeklyRevenue } from "./WeeklyRevenue";
import { toast } from "react-toastify";
import { authclient } from '../../../lib/auth-client';

const PAGE_SIZE = 10;

interface Paiement {
  _id?: string;
  date: string;
  vente: string;
  montant: number;
  client: string;
  userId: string;
}

function PaiementClient() {
  const { id } = useParams();
  const { data: session } = authclient.useSession() 
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState<Paiement[]>([]);
  const [currentPaiement, setCurrentPaiement] = useState<Paiement>({
    date: new Date().toISOString(),
    vente: id || "",
    montant: 0, 
    client: "",
    userId: session!.user.id
  });
  const [isEditing, setIsEditing] = useState(false);

  const venteService = new VenteService();
  const paiementClientService = new PaiementClientService();
  const clientService = new ClientService();

  // Récupérer les informations de la vente
  const { data: vente, isLoading: isLoadingVente } = useQuery({
    queryKey: ['get_vente', id],
    queryFn: () => venteService.getOne(id!)
  });

  // Récupérer le client associé à la vente
  const { data: client, isLoading: isLoadingClient } = useQuery({
    queryKey: ['get_client_vente', vente?.client],
    queryFn: () => clientService.getOne(vente?.client),
    enabled: !!vente?.client
  });

  // Récupérer tous les paiements pour cette vente
  const { data: paiements, isLoading: isLoadingPaiements } = useQuery({
    queryKey: ['get_paiements_vente', id],
    queryFn: () => paiementClientService.byVente(id!),
    enabled: !!id
  });

  // Mettre à jour les enregistrements affichés lors du changement de page
  useEffect(() => {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE;
    setRecords(paiements?.slice(from, to) ?? []);
  }, [paiements, page]);

  // Calculer le montant restant à payer
  const calculateRestantAPayer = () => {
    if (!vente) return 0;
    
    const totalPaiements = paiements?.reduce((acc: number, paiement: any) => acc + paiement.montant, 0) || 0;
    return vente.net_a_payer - totalPaiements;
  };

  // Ouvrir le modal pour ajouter un nouveau paiement
  const handleAddPaiement = () => {
    setIsEditing(false);
    setCurrentPaiement({
      date: new Date().toISOString(),
      vente: id || "",
      montant: calculateRestantAPayer(),
      client: vente?.client || "",
      userId: session!.user.id
    });
    open();
  };

  // Ouvrir le modal pour éditer un paiement existant
  const handleEditPaiement = (paiement: Paiement) => {
    setIsEditing(true);
    setCurrentPaiement(paiement);
    open();
  };

  // Sauvegarder un paiement (création ou mise à jour)
  const handleSavePaiement = async () => {
    try {
      if (isEditing && currentPaiement._id) {
        await paiementClientService.update(currentPaiement._id, currentPaiement);
        toast.success("Paiement mis à jour avec succès");
      } else {
        await paiementClientService.create(currentPaiement);
        toast.success("Paiement ajouté avec succès");
      }
      
      // Rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['get_paiements_vente', id] });
      close();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du paiement:", error);
      toast.error("Une erreur est survenue lors de la sauvegarde du paiement");
    }
  };

  // Supprimer un paiement
  const handleDeletePaiement = async (paiementId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce paiement ?")) {
      try {
        await paiementClientService.delete(paiementId);
        toast.success("Paiement supprimé avec succès");
        
        // Rafraîchir les données
        queryClient.invalidateQueries({ queryKey: ['get_paiements_vente', id] });
      } catch (error) {
        console.error("Erreur lors de la suppression du paiement:", error);
        toast.error("Une erreur est survenue lors de la suppression du paiement");
      }
    }
  };

  return (
    <div>
      <LoadingOverlay
        visible={isLoadingVente || isLoadingClient || isLoadingPaiements}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
        loaderProps={{ color: '#422AFB', type: 'dots' }}
      />
      <WeeklyRevenue add={''}>
        <>
          {/* Informations de la vente */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Informations de la Vente</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Text size="sm" c="dimmed">Référence</Text>
                <Text size="lg" fw={500}>{vente?.ref}</Text>
              </div>
              <div>
                <Text size="sm" c="dimmed">Date</Text>
                <Text size="lg" fw={500}>
                  {vente?.date ? format(new Date(vente.date), 'dd MMMM yyyy', { locale: fr }) : ''}
                </Text>
              </div>
              <div>
                <Text size="sm" c="dimmed">Client</Text>
                <Text size="lg" fw={500}>{client?.nom}</Text>
              </div>
              <div>
                <Text size="sm" c="dimmed">Montant Total</Text>
                <Text size="lg" fw={500}>{vente?.montant ? formatN(vente.montant) + ' FCFA' : ''}</Text>
              </div>
              <div>
                <Text size="sm" c="dimmed">Net à Payer</Text>
                <Text size="lg" fw={500}>{vente?.net_a_payer ? formatN(vente.net_a_payer) + ' FCFA' : ''}</Text>
              </div>
              <div>
                <Text size="sm" c="dimmed">Reste à Payer</Text>
                <Text size="lg" fw={500} color={calculateRestantAPayer() > 0 ? "red" : "green"}>
                  {formatN(calculateRestantAPayer())} FCFA
                </Text>
              </div>
            </div>
          </div>

          {/* Bouton pour ajouter un paiement */}
          <div className="flex justify-end mb-4">
            <Button
              onClick={handleAddPaiement}
              leftSection={<FaPlus />}
              color="blue"
            >
              Ajouter un paiement
            </Button>
          </div>

          {/* Table des paiements */}
          <DataTable
            withTableBorder={true}
            columns={[
              { 
                accessor: 'date', 
                title: 'Date',
                textAlign: 'center',
                render: (row) => format(new Date(row.date), 'dd MMMM yyyy', { locale: fr })
              },
              { 
                accessor: 'montant', 
                title: 'Montant',
                textAlign: 'center',
                render: (row) => formatN(row.montant) + ' FCFA'
              },
              {
                accessor: 'actions',
                title: <Box mr={6}>Actions</Box>,
                textAlign: 'center',
                render: (row: any) => (
                  <div className="flex items-center justify-center space-x-2">
                    <ActionIcon
                      variant="subtle"
                      color="blue"
                      onClick={() => handleEditPaiement(row)}
                    >
                      <FaEdit />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() => handleDeletePaiement(row._id)}
                    >
                      <FaTrash />
                    </ActionIcon>
                  </div>
                ),
              },
            ]}
            records={records}
            idAccessor="_id"
            striped={true}
            stripedColor="#f7ddd2"
            fetching={isLoadingPaiements}
            emptyState={
              <Empty 
                image="/img/empty.png" 
                description="Aucun paiement trouvé pour cette vente" 
              />
            }
            totalRecords={paiements?.length || 0}
            recordsPerPage={PAGE_SIZE}
            page={page}
            onPageChange={(p) => setPage(p)}
            highlightOnHover
            borderRadius="lg"
            shadow="lg"
            horizontalSpacing="xs"
            verticalAlign="top"
            paginationActiveBackgroundColor="#FF5D14"
          />

          {/* Modal pour ajouter/éditer un paiement */}
          <Modal
            opened={opened}
            onClose={close}
            title={isEditing ? "Modifier le paiement" : "Ajouter un paiement"}
            size="md"
            centered
          >
            <div className="space-y-4">
              <DatePickerInput
                label="Date"
                placeholder="Sélectionner une date"
                value={currentPaiement.date ? new Date(currentPaiement.date) : null}
                onChange={(date) => setCurrentPaiement({
                  ...currentPaiement,
                  date: date ? date.toISOString() : new Date().toISOString()
                })}
                required
                locale="fr"
              />
              
              <NumberInput
                label="Montant"
                placeholder="Entrez le montant"
                value={currentPaiement.montant}
                onChange={(value) => setCurrentPaiement({
                  ...currentPaiement,
                  montant: value as number
                })}
                required
                min={0}
                max={isEditing ? undefined : calculateRestantAPayer()}
                error={currentPaiement.montant > calculateRestantAPayer() && !isEditing ? "Le montant ne peut pas dépasser le reste à payer" : ""}
              />
              
              <Group mt="md">
                <Button variant="outline" onClick={close}>Annuler</Button>
                <Button onClick={handleSavePaiement}>Enregistrer</Button>
              </Group>
            </div>
          </Modal>
        </>
      </WeeklyRevenue>
    </div>
  );
}

export default PaiementClient;
