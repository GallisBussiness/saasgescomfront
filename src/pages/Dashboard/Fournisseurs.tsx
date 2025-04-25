import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { yupResolver } from 'mantine-form-yup-resolver';
import * as yup from 'yup';
import { DataTable } from "mantine-datatable";
import { ActionIcon, Badge, Box, Button, Drawer, Group, LoadingOverlay, Paper, Popover, Text, TextInput, Title, Tooltip } from "@mantine/core";
import { FaTrash, FaUserTie, FaEdit, FaSearch, FaPhone, FaAddressCard, FaBuilding, FaPlus, FaEye } from "react-icons/fa";
import { useForm } from "@mantine/form";
import { useNavigate } from "react-router-dom";
import { toast } from 'sonner';
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import {WeeklyRevenue} from "./WeeklyRevenue";
import { FournisseurService } from "../../services/fournisseur.service";
import { authclient } from '../../../lib/auth-client';


const schema = yup.object().shape({
  nom: yup.string().required('Invalide Nom'),
  tel: yup.string(),
  addr: yup.string(),
  userId:yup.string().required("user not valid!")
});

const PAGE_SIZE = 10;

function Fournisseurs() {
  const navigate = useNavigate();
  const { data: session } = authclient.useSession() 
  const [opened, { open, close }] = useDisclosure(false);
  const [openedU, { open:openU, close:closeU }] = useDisclosure(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebouncedValue(query, 200);
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState([]);
  const qc = useQueryClient();
  const fournisseurService = new FournisseurService();
  const key = ['fournisseur'];
  const {data:fournisseurs,isLoading} = useQuery({ 
    queryKey: key, 
    queryFn:() => fournisseurService.getByUser(session!.user.id), 
    enabled: !!session 
  })

  const form = useForm({
    initialValues: {
    nom: '',
    tel: '',
    addr: '',
    userId: session!.user.id
    },
    validate: yupResolver(schema),
  });
  const formU = useForm({
    initialValues: {
    _id:'', 
    nom: '',
    tel: '',
    addr: '',
    userId: session!.user.id
    },
    validate: yupResolver(schema),
  });

  const {mutate:createFournisseur,isPending:loadingCreate} = useMutation({
   mutationFn: (data) => fournisseurService.create(data),
   onSuccess: () => {
    close();
    qc.invalidateQueries({queryKey:key});
    form.reset()
   }
});

const {mutate:updateFournisseur,isPending:loadingUpdate} = useMutation({
 mutationFn:(data:{id:string,data:any}) => fournisseurService.update(data.id, data.data),
 onSuccess: () => {
  closeU();
  qc.invalidateQueries({queryKey:key});
 }
});

const {mutate:deleteFournisseur,isPending:loadingDelete} = useMutation({
    mutationFn: (id:string) => fournisseurService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({queryKey:key});
    }
});


  const confirm = (id: string) => {
    deleteFournisseur(id)
  };
  
  const cancel = () => {
    toast.info("L'action a été annulé !");
  };

  const onCreate = (values:any) => {
    createFournisseur(values);
  }

  const onUpdate = (values:any) => {
    const {_id,createdAt,updatedAt,__v,...rest} = values;
    updateFournisseur({id: _id,data: rest });
}

const handleUpdate  = (data: any) => {
  formU.setValues(data);
  openU();
}

const filtered = (Fournisseur = []) => {
  return Fournisseur?.filter(({ nom,tel }) => {
    if (
      debouncedQuery !== '' &&
      !`${nom}${tel}`.toLowerCase().includes(debouncedQuery.trim().toLowerCase())
    )
      return false;
  
    return true;
  })
}

useEffect(() => {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE;
  setRecords(filtered(fournisseurs).slice(from, to) ?? []);
}, [fournisseurs,debouncedQuery,page]);


  return (
    <div className="min-h-screen">
    <LoadingOverlay
       visible={loadingDelete}
       zIndex={1000}
       overlayProps={{ radius: 'sm', blur: 2 }}
       loaderProps={{ color: '#FF5D14', type: 'dots' }}
     />
   <div className="mt-2">
     <div className="mb-6">
        <Group>
          <div>
            <Title order={2} className="text-gray-800 dark:text-gray-200">Gestion des Fournisseurs</Title>
            <Text className="text-gray-600 dark:text-gray-400">Gérez vos fournisseurs et partenaires commerciaux</Text>
          </div>
          <Badge size="lg" radius="md" className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2">
            <Group>
              <FaBuilding />
              <Text>{filtered(fournisseurs)?.length || 0} fournisseurs</Text>
            </Group>
          </Badge>
        </Group>
      </div>
     <Paper 
        p="md" 
        radius="md" 
        className="bg-white dark:bg-gray-800 shadow-lg mb-6"
        style={{
          backgroundImage: "linear-gradient(to right bottom, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.8))",
          backdropFilter: "blur(10px)"
        }}
      >
   <WeeklyRevenue add={<div>
     <Button 
        bg="#FF5D14" 
        leftSection={<FaPlus className="h-5 w-5 text-white"/>} 
        onClick={open} 
        className="hover:bg-orange-700 transition-colors duration-300 shadow-md"
        radius="md"
      >
        Nouveau Fournisseur
      </Button>
   </div>}>
   <>
   <div className="flex justify-between items-center w-full md:w-1/2 my-5">
   <div className="w-full relative">
          <TextInput
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            placeholder="Rechercher un fournisseur..."
            leftSection={<FaSearch className="text-gray-500" />}
            radius="md"
            className="shadow-sm"
            styles={() => ({
              input: {
                '&:focus-within': {
                  borderColor: '#FF5D14',
                },
              },
            })}
          />
    </div>
  </div>
  <DataTable
    withTableBorder={true} 
    columns={[
      { 
        accessor: 'nom', 
        title: (
          <Group>
            <FaUserTie className="text-blue-500" />
            <Text fw={600}>Nom</Text>
          </Group>
        ),
        textAlign: 'center',
        render: (record) => (
          <Text fw={500} className="text-gray-800 dark:text-gray-200">{record.nom}</Text>
        )
      },
      { 
        accessor: 'tel',
        title: (
          <Group>
            <FaPhone className="text-green-500" />
            <Text fw={600}>Téléphone</Text>
          </Group>
        ), 
        textAlign: 'center',
        render: (record) => (
          <Badge color="indigo" variant="light" radius="sm">
            {record.tel || 'Non spécifié'}
          </Badge>
        )
      },
      { 
        accessor: 'addr',
        title: (
          <Group>
            <FaAddressCard className="text-purple-500" />
            <Text fw={600}>Adresse</Text>
          </Group>
        ), 
        textAlign: 'center',
        render: (record) => (
          <Text size="sm" className="text-gray-600 dark:text-gray-400">
            {record.addr || 'Non spécifiée'}
          </Text>
        )
      },
      {
        accessor: 'actions',
        title: (
          <Box mr={6}>
            <Text fw={600} className="text-gray-700 dark:text-gray-300">Actions</Text>
          </Box>
        ),
        textAlign: 'center',
        render: (rowData:any) => (
          <Group>
            <Tooltip label="Voir les détails">
              <ActionIcon 
                onClick={() => navigate(`/dashboard/fournisseurs/${rowData._id}`)} 
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-white shadow-md"
                radius="md"
                size="lg"
              >
                <FaEye />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Modifier">
              <ActionIcon 
                onClick={() => handleUpdate(rowData)} 
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-300 text-white shadow-md"
                radius="md"
                size="lg"
              >
                <FaEdit />
              </ActionIcon>
            </Tooltip>
            <Popover width={250} position="bottom" withArrow shadow="xl">
              <Popover.Target>
                <Tooltip label="Supprimer">
                  <ActionIcon 
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-300 text-white shadow-md"
                    radius="md"
                    size="lg"
                  >
                    <FaTrash />
                  </ActionIcon>
                </Tooltip>
              </Popover.Target>
              <Popover.Dropdown className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col space-y-4">
                  <Text className="text-gray-800 dark:text-gray-200 font-medium">Êtes-vous sûr de vouloir supprimer ce fournisseur?</Text>
                  <Group>
                    <Button 
                      variant="filled" 
                      color="red" 
                      onClick={() => confirm(rowData?._id)}
                      className="hover:bg-red-700 transition-colors duration-300"
                      radius="md"
                    >
                      Confirmer
                    </Button>
                    <Button 
                      variant="outline" 
                      color="gray" 
                      onClick={cancel}
                      className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
                      radius="md"
                    >
                      Annuler
                    </Button>
                  </Group>
                </div>
              </Popover.Dropdown>
            </Popover>
          </Group>
        ),
      },
    ]}
    records={records}
    idAccessor="_id"
    striped={true}
    stripedColor="rgba(255, 93, 20, 0.1)"
    style={{
      fontWeight: 'normal',
    }}
    fetching={isLoading}
    emptyState={
      <div className="flex flex-col items-center justify-center py-10">
        <img src="/img/empty.png" alt="Aucun fournisseur" className="w-32 h-32 mb-4" />
        <Text size="lg" fw={500} className="text-gray-600 dark:text-gray-400">
          Aucun fournisseur trouvé
        </Text>
        <Text size="sm" className="text-gray-500 dark:text-gray-500 mb-4">
          Ajoutez votre premier fournisseur en cliquant sur "Nouveau Fournisseur"
        </Text>
        <Button 
          leftSection={<FaPlus />} 
          onClick={open} 
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-300"
          radius="md"
        >
          Ajouter un fournisseur
        </Button>
      </div>
    }
    totalRecords={filtered(fournisseurs)?.length}
    recordsPerPage={10}
    page={page}
    onPageChange={(p) => setPage(p)}
    borderRadius="lg"
    shadow="xl"
    horizontalSpacing="md"
    verticalSpacing="md"
    verticalAlign="center"
    highlightOnHover
    className="overflow-hidden"
    paginationActiveBackgroundColor="#FF5D14"
    rowClassName={() => 'hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-200'}
  />
   </>
   
   </WeeklyRevenue>
   </Paper>
 </div>

 <Drawer 
   opened={opened} 
   onClose={close} 
   title={<Title order={3} className="text-gray-800 dark:text-gray-200 flex items-center gap-2"><FaBuilding className="text-blue-500" /> Nouveau Fournisseur</Title>}
   padding="xl"
   size="md"
   position="right"
   classNames={{
     header: 'border-b border-gray-200 dark:border-gray-700 pb-3',
     body: 'pt-6'
   }}
 >
 <LoadingOverlay
       visible={loadingCreate}
       zIndex={1000}
       overlayProps={{ radius: 'sm', blur: 2 }}
       loaderProps={{ color: '#FF5D14', type: 'dots' }}
     />
   <form onSubmit={form.onSubmit(onCreate)} className="space-y-4">
     <Paper p="md" radius="md" className="bg-blue-50 dark:bg-gray-800 border border-blue-100 dark:border-gray-700 shadow-sm">
       <Text size="sm" fw={500} className="text-gray-600 dark:text-gray-400 mb-3">
         Informations du fournisseur
       </Text>

       <TextInput
          required
          label="Nom"
          placeholder="Entrez le nom du fournisseur"
          leftSection={<FaUserTie className="text-gray-500" />}
          {...form.getInputProps('nom')}
          className="mb-3"
          styles={() => ({
            input: {
              '&:focus': {
                borderColor: '#FF5D14',
              },
            },
          })}
        />
        <TextInput
          label="Téléphone"
          placeholder="Entrez le numéro de téléphone"
          leftSection={<FaPhone className="text-gray-500" />}
          {...form.getInputProps('tel')}
          className="mb-3"
          styles={() => ({
            input: {
              '&:focus': {
                borderColor: '#FF5D14',
              },
            },
          })}
        />
        <TextInput
          label="Adresse"
          placeholder="Entrez l'adresse du fournisseur"
          leftSection={<FaAddressCard className="text-gray-500" />}
          {...form.getInputProps('addr')}
          styles={() => ({
            input: {
              '&:focus': {
                borderColor: '#FF5D14',
              },
            },
          })}
        />
     </Paper>
     
     <Group className="mt-6">
       <Button 
         variant="subtle" 
         color="gray" 
         onClick={close}
         className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
       >
         Annuler
       </Button>
       <Button 
         type="submit" 
         className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md"
         leftSection={<FaPlus />}
       >
         Créer le fournisseur
       </Button>
     </Group>
   </form>
 </Drawer>
 
 <Drawer 
   position="right" 
   opened={openedU} 
   onClose={closeU} 
   title={<Title order={3} className="text-gray-800 dark:text-gray-200 flex items-center gap-2"><FaEdit className="text-green-500" /> Modification du Fournisseur</Title>}
   padding="xl"
   size="md"
   classNames={{
     header: 'border-b border-gray-200 dark:border-gray-700 pb-3',
     body: 'pt-6'
   }}
 >
 <LoadingOverlay
       visible={loadingUpdate}
       zIndex={1000}
       overlayProps={{ radius: 'sm', blur: 2 }}
       loaderProps={{ color: '#FF5D14', type: 'dots' }}
     />
<form onSubmit={formU.onSubmit(onUpdate)} className="space-y-4">
  <Paper p="md" radius="md" className="bg-green-50 dark:bg-gray-800 border border-green-100 dark:border-gray-700 shadow-sm">
    <Text size="sm" fw={500} className="text-gray-600 dark:text-gray-400 mb-3">
      Informations du fournisseur
    </Text>

    <TextInput
      required
      label="Nom"
      placeholder="Entrez le nom du fournisseur"
      leftSection={<FaUserTie className="text-gray-500" />}
      {...formU.getInputProps('nom')}
      className="mb-3"
      styles={() => ({
        input: {
          '&:focus': {
            borderColor: '#FF5D14',
          },
        },
      })}
    />
    <TextInput
      label="Téléphone"
      placeholder="Entrez le numéro de téléphone"
      leftSection={<FaPhone className="text-gray-500" />}
      {...formU.getInputProps('tel')}
      className="mb-3"
      styles={() => ({
        input: {
          '&:focus': {
            borderColor: '#FF5D14',
          },
        },
      })}
    />
    <TextInput
      label="Adresse"
      placeholder="Entrez l'adresse du fournisseur"
      leftSection={<FaAddressCard className="text-gray-500" />}
      {...formU.getInputProps('addr')}
      styles={() => ({
        input: {
          '&:focus': {
            borderColor: '#FF5D14',
          },
        },
      })}
    />
  </Paper>
  
  <Group className="mt-6">
    <Button 
      variant="subtle" 
      color="gray" 
      onClick={closeU}
      className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
    >
      Annuler
    </Button>
    <Button 
      type="submit" 
      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-md"
      leftSection={<FaEdit />}
    >
      Mettre à jour
    </Button>
  </Group>
</form>
 </Drawer>
  </div>
  )
}

export default Fournisseurs