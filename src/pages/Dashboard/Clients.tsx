import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { yupResolver } from 'mantine-form-yup-resolver';
import * as yup from 'yup';
import { DataTable } from "mantine-datatable";
import { ActionIcon, Box, Button, Drawer, Group, LoadingOverlay, Paper, Popover, Text, TextInput, Title, Badge, Tooltip } from "@mantine/core";
import { FaEye, FaTrash, FaUserPlus, FaUserEdit, FaSearch, FaUsers, FaAddressCard, FaPhoneAlt } from "react-icons/fa";
import { useForm } from "@mantine/form";
import { toast } from 'sonner';
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import {WeeklyRevenue} from "./WeeklyRevenue";
import { ClientService } from "../../services/client.service";
import { authclient } from '../../../lib/auth-client';
import { useNavigate } from "react-router-dom";


const schema = yup.object().shape({
  nom: yup.string().required('Invalide Nom'),
  tel: yup.string(),
  addr: yup.string(),
  userId: yup.string().required('Invalid User'),
});

const PAGE_SIZE = 10;


function Clients() {
  const { data: session } = authclient.useSession() 
  const [opened, { open, close }] = useDisclosure(false);
  const [openedU, { open:openU, close:closeU }] = useDisclosure(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebouncedValue(query, 200);
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState([]);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const clientService = new ClientService();
  const key = ['client'];
  const {data:clients,isLoading} = useQuery({ 
    queryKey: key, 
    queryFn:() => clientService.getByUser(session!.user.id), 
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
    userId:session!.user.id
    },
    validate: yupResolver(schema),
  });

  const {mutate:createClient,isPending:loadingCreate} = useMutation({
   mutationFn: (data) => clientService.create(data),
   onSuccess: () => {
    close();
    qc.invalidateQueries({queryKey:key});
    form.reset()
   }
});

const {mutate:updateClient,isPending:loadingUpdate} = useMutation({
 mutationFn:(data:{id:string,data:any}) => clientService.update(data.id, data.data),
 onSuccess: () => {
  closeU();
  qc.invalidateQueries({queryKey:key});
 }
});

const {mutate:deleteClient,isPending:loadingDelete} = useMutation({
    mutationFn: (id:string) => clientService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({queryKey:key});
    }
});


  const confirm = (id: string) => {
    deleteClient(id)
  };
  
  const cancel = () => {
    toast.info("L'action a été annulé !");
  };

  const onCreate = (values:any) => {
    createClient(values);
  }

  const onUpdate = (values:any) => {
    const {_id,createdAt,updatedAt,__v,...rest} = values;
    updateClient({id: _id,data: rest });
}

const handleUpdate  = (data: any) => {
  formU.setValues(data);
  openU();
}

const filtered = (Client = []) => {
  return Client?.filter(({ nom,tel }) => {
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
  setRecords(filtered(clients).slice(from, to) ?? []);
}, [clients,debouncedQuery,page]);


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
            <Title order={2} className="text-gray-800 dark:text-gray-200">Gestion des Clients</Title>
            <Text className="text-gray-600 dark:text-gray-400">Gérez votre portefeuille clients</Text>
          </div>
          <Badge size="lg" radius="md" className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2">
            <Group>
              <FaUsers />
              <Text>{filtered(clients)?.length || 0} clients</Text>
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
          leftSection={<FaUserPlus className="h-5 w-5 text-white"/>} 
          onClick={open} 
          className="hover:bg-orange-700 transition-colors duration-300 shadow-md"
          radius="md"
        >
          Nouveau Client
        </Button>
     </div>}>
     <>
     <div className="flex justify-between items-center w-full md:w-1/2 my-5">
     <div className="w-full relative">
            <TextInput
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              placeholder="Rechercher un client..."
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
              <FaUsers className="text-orange-500" />
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
              <FaPhoneAlt className="text-blue-500" />
              <Text fw={600}>Téléphone</Text>
            </Group>
          ), 
          textAlign: 'center',
          render: (record) => (
            <Badge color="blue" variant="light" radius="sm">
              {record.tel || 'Non spécifié'}
            </Badge>
          )
        },
        { 
          accessor: 'addr',
          title: (
            <Group>
              <FaAddressCard className="text-green-500" />
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
              <Tooltip label="Voir détails">
                <Button 
                  size="compact-sm" 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md"
                  onClick={() => navigate(rowData._id)} 
                  rightSection={<FaEye/>}
                  radius="md"
                >
                  Détails
                </Button>
              </Tooltip>
              <Tooltip label="Modifier">
                <ActionIcon 
                  onClick={() => handleUpdate(rowData)} 
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-300 text-white shadow-md"
                  radius="md"
                  size="lg"
                >
                  <FaUserEdit />
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
                    <Text className="text-gray-800 dark:text-gray-200 font-medium">Êtes-vous sûr de vouloir supprimer ce client?</Text>
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
          <img src="/img/empty.png" alt="Aucun client" className="w-32 h-32 mb-4" />
          <Text size="lg" fw={500} className="text-gray-600 dark:text-gray-400">
            Aucun client trouvé
          </Text>
          <Text size="sm" className="text-gray-500 dark:text-gray-500 mb-4">
            Ajoutez votre premier client en cliquant sur "Nouveau Client"
          </Text>
          <Button 
            leftSection={<FaUserPlus />} 
            onClick={open} 
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-300"
            radius="md"
          >
            Ajouter un client
          </Button>
        </div>
      }
      totalRecords={filtered(clients)?.length}
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
      rowClassName={() => 'hover:bg-orange-50 dark:hover:bg-gray-700 transition-colors duration-200'}
    />
     </>
     
     </WeeklyRevenue>
     </Paper>
   </div>

   <Drawer 
     opened={opened} 
     onClose={close} 
     title={<Title order={3} className="text-gray-800 dark:text-gray-200 flex items-center gap-2"><FaUserPlus className="text-orange-500" /> Nouveau Client</Title>}
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
       <Paper p="md" radius="md" className="bg-orange-50 dark:bg-gray-800 border border-orange-100 dark:border-gray-700 shadow-sm">
         <Text size="sm" fw={500} className="text-gray-600 dark:text-gray-400 mb-3">
           Informations du client
         </Text>

         <TextInput
            required
            label="Nom"
            placeholder="Entrez le nom du client"
            leftSection={<FaUsers className="text-gray-500" />}
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
            leftSection={<FaPhoneAlt className="text-gray-500" />}
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
            placeholder="Entrez l'adresse du client"
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
           className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-md"
           leftSection={<FaUserPlus />}
         >
           Créer le client
         </Button>
       </Group>
     </form>
   </Drawer>
   
   <Drawer 
     position="right" 
     opened={openedU} 
     onClose={closeU} 
     title={<Title order={3} className="text-gray-800 dark:text-gray-200 flex items-center gap-2"><FaUserEdit className="text-green-500" /> Modification du Client</Title>}
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
        Informations du client
      </Text>

      <TextInput
        required
        label="Nom"
        placeholder="Entrez le nom du client"
        leftSection={<FaUsers className="text-gray-500" />}
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
        leftSection={<FaPhoneAlt className="text-gray-500" />}
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
        placeholder="Entrez l'adresse du client"
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
        leftSection={<FaUserEdit />}
      >
        Mettre à jour
      </Button>
    </Group>
  </form>
   </Drawer>
    </div>
  )
}

export default Clients