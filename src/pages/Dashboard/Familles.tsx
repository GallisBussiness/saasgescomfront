import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { yupResolver } from 'mantine-form-yup-resolver';
import * as yup from 'yup';
import { DataTable } from "mantine-datatable";
import { ActionIcon, Button, Drawer, LoadingOverlay, Popover, TextInput, Paper, Group, Text, Divider, Badge, Tooltip } from "@mantine/core";
import { FaTrash, FaEdit, FaFolderOpen, FaSearch, FaSave, FaPlus, FaTags } from "react-icons/fa";
import { useForm } from "@mantine/form";
import { toast } from 'sonner';
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { FamilleService } from "../../services/famille.service";
import { WeeklyRevenue } from "./WeeklyRevenue";
import { useAppStore } from "../../common/Loader/store";
import { USER_ROLE } from "../../acl/Ability";
import { authclient } from '../../../lib/auth-client';

const schema = yup.object().shape({
    nom: yup.string().required('Le nom est requis'),
    userId: yup.string().required('Utilisateur invalide'),
  });
  
  const PAGE_SIZE = 10;

function Familles() {
  const { data: session } = authclient.useSession() 
  const { role } = useAppStore() as any;
  const [opened, { open, close }] = useDisclosure(false);
  const [openedU, { open:openU, close:closeU }] = useDisclosure(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebouncedValue(query, 200);
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState([]);
  const qc = useQueryClient();
  const familleService = new FamilleService();
  const key = ['famille'];
  const {data:familles,isLoading} = useQuery({ queryKey: key, queryFn:() => familleService.getByUser(session!.user.id), enabled: !!session   })

  const form = useForm({
    initialValues: {
    nom: '',
    userId: session!.user.id
    },
    validate: yupResolver(schema),
  });
  const formU = useForm({
    initialValues: {
    _id:'', 
    nom: '',
    userId: session!.user.id
    },
    validate: yupResolver(schema),
  });

  const {mutate:createFamille,isPending:loadingCreate} = useMutation({
   mutationFn: (data) => familleService.create(data),
   onSuccess: () => {
    close();
    qc.invalidateQueries({queryKey:key});
    form.reset()
   }
});

const {mutate:updateFamille,isPending:loadingUpdate} = useMutation({
 mutationFn:(data:{id:string,data:any}) => familleService.update(data.id, data.data),
 onSuccess: () => {
  closeU();
  qc.invalidateQueries({queryKey:key});
 }
});

const {mutate:deleteFamille,isPending:loadingDelete} = useMutation({
    mutationFn: (id:string) => familleService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({queryKey:key});
    }
});


  const confirm = (id: string) => {
    deleteFamille(id)
  };
  
  const cancel = () => {
    toast.info("L'action a été annulé !");
  };

  const onCreate = (values:any) => {
    createFamille(values);
  }

  const onUpdate = (values:any) => {
    const {_id,createdAt,updatedAt,__v,...rest} = values;
    updateFamille({id: _id,data: rest });
}

const handleUpdate  = (data: any) => {
  formU.setValues(data);
  openU();
}

const filtered = (Famille = []) => {
  return Famille?.filter(({ nom }) => {
    if (
      debouncedQuery !== '' &&
      !`${nom}`.toLowerCase().includes(debouncedQuery.trim().toLowerCase())
    )
      return false;
  
    return true;
  })
}

useEffect(() => {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE;
  setRecords(filtered(familles).slice(from, to) ?? []);
}, [familles,debouncedQuery,page]);


  return (
       <div className="p-4">
      <LoadingOverlay
         visible={loadingDelete}
         zIndex={1000}
         overlayProps={{ radius: 'sm', blur: 2 }}
         loaderProps={{ color: '#FF5D14', type: 'dots' }}
       />
     <div className="mt-5">
     
     <WeeklyRevenue add={<div>
       <Button 
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-md"
          leftSection={<FaPlus className="h-5 w-5 text-white"/>} 
          onClick={open}
        >
          Nouvelle famille
        </Button>
     </div>}>
     <>
     <Paper 
        p="md" 
        radius="md" 
        className="bg-white dark:bg-gray-800 shadow-sm mb-4"
        style={{
          backgroundImage: "linear-gradient(to right bottom, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9))",
          backdropFilter: "blur(10px)"
        }}
      >
        <Group mb="xs">
          <Text fw={600} className="text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <FaTags className="text-orange-500" /> Gestion des familles
          </Text>
          <Badge size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
            {filtered(familles)?.length || 0} famille(s)
          </Badge>
        </Group>
        <Divider mb="md" />
        
        <div className="flex justify-between items-center w-full md:w-1/2 mb-5">
          <div className="w-full relative">
            <TextInput
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              placeholder="Rechercher une famille..."
              leftSection={<FaSearch className="text-gray-400" />}
              className="w-full"
              styles={{ input: { '&:focus': { borderColor: '#FF5D14' } } }}
            />
          </div>
        </div>
    <DataTable
      withTableBorder={true} 
      columns={[
        { 
          accessor: 'nom', 
          title: <Text fw={600} className="text-gray-700 dark:text-gray-200">Nom de la famille</Text>,
          textAlign: 'left',
          render: (rowData: any) => (
            <div className="flex items-center gap-2">
              <FaFolderOpen className="text-orange-500" />
              <Text className="font-medium text-gray-800 dark:text-gray-200">{rowData.nom}</Text>
            </div>
          )
        },
        {
          accessor: 'actions',
          title: <Text fw={600} className="text-gray-700 dark:text-gray-200 text-center">Actions</Text>,
          textAlign: 'center',
          render: (rowData:any) => (
            <div className="flex items-center justify-center space-x-2">
              { role === USER_ROLE.ADMIN && <>
                <Tooltip label="Modifier">
                  <ActionIcon 
                    onClick={() => handleUpdate(rowData)} 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-sm text-white"
                    radius="xl"
                    size="md"
                  >
                    <FaEdit size={14} />
                  </ActionIcon>
                </Tooltip>
                <Popover width={250} position="bottom" withArrow shadow="md">
                  <Popover.Target>
                    <Tooltip label="Supprimer">
                      <ActionIcon 
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-sm text-white"
                        radius="xl"
                        size="md"
                      >
                        <FaTrash size={14} />
                      </ActionIcon>
                    </Tooltip>
                  </Popover.Target>
                  <Popover.Dropdown>
                    <div className="flex flex-col space-y-3">
                      <Text fw={500} className="text-gray-800 dark:text-gray-200">Confirmation de suppression</Text>
                      <Divider />
                      <Text size="sm" className="text-gray-600 dark:text-gray-400">
                        Êtes-vous sûr de vouloir supprimer cette famille ? Cette action est irréversible.
                      </Text>
                      <div className="flex justify-end gap-2 mt-2">
                        <Button variant="light" onClick={cancel} size="xs">Annuler</Button>
                        <Button 
                          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                          onClick={() => confirm(rowData?._id)} 
                          size="xs"
                        >
                          Confirmer
                        </Button>
                      </div>
                    </div>
                  </Popover.Dropdown>
                </Popover>
              </>
            }
            </div>
          ),
        },
      ]}
      records={records}
      idAccessor="_id"
      fetching={isLoading}
      striped={true}
      stripedColor="rgba(255, 93, 20, 0.1)"
      highlightOnHover={true}
      className="rounded-lg overflow-hidden"
      styles={{
        header: { backgroundColor: 'rgba(255, 93, 20, 0.05)' },
        table: { fontWeight: 'normal', borderCollapse: 'separate', borderSpacing: '0' },
        footer: { backgroundColor: 'rgba(255, 93, 20, 0.05)' },
      }}
      emptyState={
        <div className="flex flex-col items-center justify-center py-10">
          <img src="/img/empty.png" alt="Aucune donnée" className="w-32 h-32 mb-4 opacity-70" />
          <Text size="lg" fw={500} className="text-gray-500 dark:text-gray-400">Aucune famille trouvée</Text>
          <Text size="sm" className="text-gray-400 dark:text-gray-500 mt-1 max-w-md text-center">
            Vous n'avez pas encore créé de famille ou votre recherche ne correspond à aucun résultat.
          </Text>
        </div>
      }
      totalRecords={filtered(familles)?.length}
      recordsPerPage={10}
      page={page}
      onPageChange={(p) => setPage(p)}
      borderRadius="lg"
      shadow="lg"
      horizontalSpacing="md"
      verticalSpacing="md"
      verticalAlign="top"
      paginationActiveBackgroundColor="#FF5D14"
    />
     </Paper>
     </>

     </WeeklyRevenue>
   </div>

   <Drawer 
      opened={opened} 
      onClose={close} 
      title={<div className="flex items-center gap-2"><FaPlus className="text-orange-500" /> Création d'une nouvelle famille</div>}
      position="right"
      overlayProps={{ blur: 3 }}
      size="md"
      classNames={{
        title: "text-lg font-medium text-gray-800 dark:text-gray-200",
        header: "border-b border-gray-200 dark:border-gray-700 pb-2"
      }}
    >
      <LoadingOverlay
        visible={loadingCreate}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
        loaderProps={{ color: '#FF5D14', type: 'dots' }}
      />
      <div className="mt-4">
        <Paper 
          p="md" 
          radius="md" 
          className="bg-white dark:bg-gray-800 shadow-sm mb-4 border border-gray-100 dark:border-gray-700"
        >
          <Group mb="xs">
            <Text fw={600} className="text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <FaTags className="text-orange-500" /> Informations de la famille
            </Text>
          </Group>
          <Divider mb="md" />
          
          <form onSubmit={form.onSubmit(onCreate)} className="space-y-4">
            <TextInput
              required
              label="Nom de la famille"
              placeholder="Saisissez le nom de la famille"
              leftSection={<FaTags size={16} />}
              {...form.getInputProps('nom')}
              styles={{ input: { '&:focus': { borderColor: '#FF5D14' } } }}
            />
            
            <Text size="sm" color="dimmed" className="mt-2">
              Les familles vous permettent de regrouper vos articles par catégories pour une meilleure organisation.
            </Text>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="light" onClick={close}>Annuler</Button>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-md"
                leftSection={<FaSave size={16} />}
              >
                Enregistrer
              </Button>
            </div>
          </form>
        </Paper>
      </div>
   </Drawer>
   
   <Drawer 
      position="right" 
      opened={openedU} 
      onClose={closeU} 
      title={<div className="flex items-center gap-2"><FaEdit className="text-orange-500" /> Modification d'une famille</div>}
      overlayProps={{ blur: 3 }}
      size="md"
      classNames={{
        title: "text-lg font-medium text-gray-800 dark:text-gray-200",
        header: "border-b border-gray-200 dark:border-gray-700 pb-2"
      }}
    >
      <LoadingOverlay
        visible={loadingUpdate}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
        loaderProps={{ color: '#FF5D14', type: 'dots' }}
      />
      <div className="mt-4">
        <Paper 
          p="md" 
          radius="md" 
          className="bg-white dark:bg-gray-800 shadow-sm mb-4 border border-gray-100 dark:border-gray-700"
        >
          <Group mb="xs">
            <Text fw={600} className="text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <FaTags className="text-orange-500" /> Modifier les informations
            </Text>
          </Group>
          <Divider mb="md" />
          
          <form onSubmit={formU.onSubmit(onUpdate)} className="space-y-4">
            <TextInput
              required
              label="Nom de la famille"
              placeholder="Saisissez le nom de la famille"
              leftSection={<FaTags size={16} />}
              {...formU.getInputProps('nom')}
              styles={{ input: { '&:focus': { borderColor: '#FF5D14' } } }}
            />
            
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="light" onClick={closeU}>Annuler</Button>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-md"
                leftSection={<FaSave size={16} />}
              >
                Mettre à jour
              </Button>
            </div>
          </form>
        </Paper>
      </div>
   </Drawer>
    </div>
  )
}

export default Familles