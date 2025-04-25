import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { yupResolver } from 'mantine-form-yup-resolver';
import * as yup from 'yup';
import { DataTable } from "mantine-datatable";
import { ActionIcon, Button, Drawer, Group, LoadingOverlay, NumberInput, Text, TextInput, Select, Popover, HoverCard,Tooltip } from "@mantine/core";
import { FaTrash, FaSearch, FaShoppingBag, FaPlus, FaEdit, FaBoxOpen } from "react-icons/fa";
import { FaRegCircleCheck } from "react-icons/fa6";
import { useForm } from "@mantine/form";
import { toast } from 'sonner';
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { Input} from "antd";
import { ArticleService } from "../../services/article.service";
import { FamilleService } from "../../services/famille.service";
import { UniteService } from "../../services/unite.service";
import { authclient } from '../../../lib/auth-client';
import { formatN } from "../../lib/helpers";

const schema = yup.object().shape({
  ref: yup.string().required('Invalid Ref'),
  nom: yup.string().required('Invalide Nom'),
  stock_seuil: yup.number(),
  famille: yup.string().required("famille is not valid !"),
  unite: yup.string().required("unite is not valid !"),
  prix:yup.number().required("user not valid!"),
  userId: yup.string().required('Invalid User'),
});

const PAGE_SIZE = 10;

function Articles() {
  const { data: session } = authclient.useSession() 
  const [opened, { open, close }] = useDisclosure(false);
  const [openedU, { open:openU, close:closeU }] = useDisclosure(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebouncedValue(query, 200);
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState([]);
  const qc = useQueryClient();
  const articleService = new ArticleService();
  const key = ['article'];
  const {data:articles,isLoading} = useQuery({ queryKey: key, queryFn:() => articleService.getByUser(session!.user.id), enabled: !!session })

  const familleService = new FamilleService();
  const keyf = ['famille'];
  const {data:familles} = useQuery({ queryKey: keyf, queryFn:() => familleService.getByUser(session!.user.id), enabled: !!session })

  const uniteService = new UniteService();
  const keyu = ['unite'];
  const {data:unites} = useQuery({ queryKey: keyu, queryFn:() => uniteService.getByUser(session!.user.id), enabled: !!session })

  const form = useForm({
    initialValues: {
      ref: '',
      nom: '',
      stock_seuil: 0,
      famille: '',
      unite: '',
      prix: 0,
      userId: session!.user.id
    },
    validate: yupResolver(schema),
  });
  const formU = useForm({
    initialValues: {
    _id:'', 
    ref: '',
    nom: '',
    stock_seuil: 0,
    famille: '',
    unite: '',
    prix: 0,
    userId: session!.user.id
    },
    validate: yupResolver(schema),
  });

  const {mutate:createArticle,isPending:loadingCreate} = useMutation({
   mutationFn: (data) => articleService.create(data),
   onSuccess: () => {
    close();
    qc.invalidateQueries({queryKey:key});
    form.reset()
   }
});

const {mutate:updateArticle,isPending:loadingUpdate} = useMutation({
 mutationFn:(data:{id:string,data:any}) => articleService.update(data.id, data.data),
 onSuccess: () => {
  closeU();
  qc.invalidateQueries({queryKey:key});
 }
});

const {mutate:deleteArticle,isPending:loadingDelete} = useMutation({
    mutationFn: (id:string) => articleService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({queryKey:key});
    }
});


  const confirm = (id: string) => {
    deleteArticle(id)
  };
  
  const cancel = () => {
    toast.info("L'action a été annulé !");
  };

  const onCreate = (values:any) => {
    createArticle(values);
  }

  const onUpdate = (values:any) => {
    const {_id,createdAt,updatedAt,__v,...rest} = values;
    updateArticle({id: _id,data: rest });
}

const handleUpdate  = (data: any) => {
  const {famille,unite} = data;
  formU.setValues({...data,famille:famille._id,unite:unite._id});
  openU();
}

const filtered = (Article = []) => {
  return Article?.filter(({ nom,ref }) => {
    if (
      debouncedQuery !== '' &&
      !`${nom}${ref}`.toLowerCase().includes(debouncedQuery.trim().toLowerCase())
    )
      return false;
  
    return true;
  })
}

useEffect(() => {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE;
  setRecords(filtered(articles).slice(from, to) ?? []);
}, [articles,debouncedQuery,page]);

  return (
    <div className="relative">
      <LoadingOverlay
        visible={loadingDelete}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
        loaderProps={{ color: '#FF5D14', type: 'dots' }}
      />
      <div className="mt-2">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Gestion des Articles</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Gérez votre catalogue de produits</p>
          </div>
          <Button 
            bg="#FF5D14" 
            leftSection={<FaPlus size={16} />} 
            onClick={open}
            className="shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            Nouvel Article
          </Button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-full">
                <FaBoxOpen size={24} className="text-orange-500" />
              </div>
              <div>
                <Text size="xs" className="text-slate-500 dark:text-slate-400">Total des articles</Text>
                <Text size="xl" fw={700} className="text-slate-800 dark:text-white">{articles?.length || 0}</Text>
              </div>
            </div>

            <div className="relative w-full md:w-1/3">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400 dark:text-gray-600" />
              </div>
              <Input 
                value={query} 
                onChange={(e) => setQuery(e.currentTarget.value)} 
                placeholder="Rechercher un article..." 
                className="pl-10 border-slate-200 dark:border-slate-700 rounded-lg" 
              />
            </div>
          </div>
    <DataTable
      withTableBorder={false}
      columns={[
        { 
          accessor: 'ref', 
          title: <Text fw={600} size="sm">Référence</Text>,
          textAlign: 'center',
          render: (data: any) => (
            <Text fw={500} className="text-slate-700 dark:text-slate-300">
              {data.ref}
            </Text>
          )
        },
        { 
          accessor: 'nom', 
          title: <Text fw={600} size="sm">Désignation</Text>,
          textAlign: 'center',
          sortable: true,
          render: (data: any) => (
            <HoverCard width={280} shadow="md" withArrow openDelay={200} closeDelay={100}>
              <HoverCard.Target>
                <Text fw={500} className="text-slate-700 dark:text-slate-300 cursor-pointer hover:text-blue-500 transition-colors duration-200">
                  {data.nom}
                </Text>
              </HoverCard.Target>
              <HoverCard.Dropdown className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <div className="p-2">
                  <Text fw={600} size="sm" className="text-slate-800 dark:text-white mb-2">{data.nom}</Text>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-slate-500 dark:text-slate-400">Référence:</div>
                    <div className="text-slate-700 dark:text-slate-300 font-medium">{data.ref}</div>
                    <div className="text-slate-500 dark:text-slate-400">Prix:</div>
                    <div className="text-slate-700 dark:text-slate-300 font-medium">{formatN(data.prix)} FCFA</div>
                    <div className="text-slate-500 dark:text-slate-400">Stock seuil:</div>
                    <div className="text-slate-700 dark:text-slate-300 font-medium">{data.stock_seuil}</div>
                  </div>
                </div>
              </HoverCard.Dropdown>
            </HoverCard>
          )
        },
        { 
          accessor: 'famille.nom', 
          title: <Text fw={600} size="sm">Famille</Text>,
          textAlign: 'center',
          sortable: true,
          render: (data: any) => (
            <div className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full text-center">
              <Text size="sm" className="text-blue-600 dark:text-blue-400">
                {data.famille?.nom}
              </Text>
            </div>
          )
        },
        { 
          accessor: 'unite.nom', 
          title: <Text fw={600} size="sm">Unité</Text>,
          textAlign: 'center',
          sortable: true,
          render: (data: any) => (
            <Text size="sm" className="text-slate-600 dark:text-slate-400">
              {data.unite?.nom}
            </Text>
          )
        },
        { 
          accessor: 'prix', 
          title: <Text fw={600} size="sm">Prix</Text>,
          textAlign: 'center',
          render: (data: any) => (
            <Text fw={600} className="text-orange-600 dark:text-orange-400">
              {formatN(data?.prix)} FCFA
            </Text>
          )
        },
        { 
          accessor: 'stock_seuil', 
          title: <Text fw={600} size="sm">Stock Seuil</Text>,
          textAlign: 'center',
          sortable: true,
          render: (data: any) => (
            <div className="px-3 py-1 bg-teal-50 dark:bg-teal-900/20 rounded-lg text-center">
              <Text size="sm" className="text-teal-600 dark:text-teal-400">
                {data.stock_seuil}
              </Text>
            </div>
          )
        },
        {
          accessor: 'actions',
          title: <Text fw={600} size="sm" ta="center">Actions</Text>,
          textAlign: 'center',
          render: (rowData: any) => (
            <Group gap={6} justify="center">
              <Tooltip label="Modifier">
                <ActionIcon 
                  onClick={() => handleUpdate(rowData)} 
                  variant="light" 
                  color="blue" 
                  className="hover:scale-110 transition-transform duration-200"
                >
                  <FaEdit size={16} />
                </ActionIcon>
              </Tooltip>
              <Popover width={220} position="bottom" withArrow shadow="md">
                <Popover.Target>
                  <Tooltip label="Supprimer">
                    <ActionIcon 
                      variant="light" 
                      color="red"
                      className="hover:scale-110 transition-transform duration-200"
                    >
                      <FaTrash size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Popover.Target>
                <Popover.Dropdown className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <div className="flex flex-col gap-3">
                    <Text size="sm" className="text-slate-700 dark:text-slate-300">
                      Êtes-vous sûr de vouloir supprimer cet article ?
                    </Text>
                    <div className="flex justify-between gap-2">
                      <Button 
                        variant="filled" 
                        color="red" 
                        onClick={() => confirm(rowData?._id)}
                        size="xs"
                        className="flex-1"
                      >
                        Confirmer
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={cancel}
                        size="xs"
                        className="flex-1"
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                </Popover.Dropdown>
              </Popover>
            </Group>
          ),
        },
      ]}
      records={records}
      idAccessor="_id"
      fetching={isLoading}
      emptyState={
        <div className="flex flex-col items-center justify-center py-12">
          <FaBoxOpen size={48} className="text-slate-300 mb-4" />
          <Text c="dimmed" ta="center" size="sm">
            Aucun article trouvé
          </Text>
        </div>
      }
      totalRecords={filtered(articles)?.length}
      recordsPerPage={10}
      page={page}
      onPageChange={(p) => setPage(p)}
      className="border-none shadow-none"
      rowClassName={() => "hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors duration-150"}
      paginationActiveBackgroundColor="#FF5D14"
    />
        </div>
      </div>

      <Drawer 
        opened={opened} 
        onClose={close} 
        title={
          <Text size="lg" fw={700} className="text-slate-800 dark:text-white">
            Nouvel Article
          </Text>
        }
        padding="lg"
        position="right"
        size="md"
        overlayProps={{
          blur: 3,
          opacity: 0.55,
        }}
      >
        <LoadingOverlay
          visible={loadingCreate}
          zIndex={1000}
          overlayProps={{ radius: 'sm', blur: 2 }}
          loaderProps={{ color: '#FF5D14', type: 'dots' }}
        />
        <form onSubmit={form.onSubmit(onCreate)} className="space-y-4">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
            <Text fw={500} size="sm" className="text-slate-600 dark:text-slate-300 mb-4 flex items-center gap-2">
              <FaShoppingBag size={14} className="text-orange-500" />
              Informations de l'article
            </Text>
            
            <TextInput
              label="Référence"
              placeholder="Référence de l'article"
              required
              {...form.getInputProps('ref')}
              classNames={{
                input: "rounded-md border-slate-200 dark:border-slate-700",
                wrapper: "shadow-sm mb-3"
              }}
            />
            
            <TextInput
              label="Nom"
              placeholder="Nom de l'article"
              required
              {...form.getInputProps('nom')}
              classNames={{
                input: "rounded-md border-slate-200 dark:border-slate-700",
                wrapper: "shadow-sm mb-3"
              }}
            />
            
            <NumberInput
              label="Prix"
              placeholder="Prix de l'article"
              required
              {...form.getInputProps('prix')}
              classNames={{
                input: "rounded-md border-slate-200 dark:border-slate-700",
                wrapper: "shadow-sm mb-3"
              }}
              rightSection={<Text size="xs" color="dimmed">FCFA</Text>}
            />
            
            <NumberInput
              label="Stock Seuil"
              placeholder="Seuil d'alerte de stock"
              required
              {...form.getInputProps('stock_seuil')}
              classNames={{
                input: "rounded-md border-slate-200 dark:border-slate-700",
                wrapper: "shadow-sm mb-3"
              }}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <Select
                label="Famille"
                placeholder="Sélectionner une famille"
                {...form.getInputProps('famille')}
                data={familles?.map((f: any) => ({label: f.nom, value: f._id}))}
                classNames={{
                  input: "rounded-md border-slate-200 dark:border-slate-700",
                  wrapper: "shadow-sm"
                }}
              />
              
              <Select
                label="Unité"
                placeholder="Sélectionner une unité"
                {...form.getInputProps('unite')}
                data={unites?.map((f: any) => ({label: f.nom, value: f._id}))}
                classNames={{
                  input: "rounded-md border-slate-200 dark:border-slate-700",
                  wrapper: "shadow-sm"
                }}
              />
            </div>

            <Button 
              type="submit" 
              bg="#FF5D14" 
              loading={loadingCreate}
              className="shadow-md hover:shadow-lg transition-all duration-200 mt-4 w-full"
              leftSection={<FaRegCircleCheck size={16} />}
            >
              Enregistrer l'article
            </Button>
          </div>
        </form>
      </Drawer>
   
      <Drawer 
        opened={openedU} 
        onClose={closeU} 
        title={
          <Text size="lg" fw={700} className="text-slate-800 dark:text-white">
            Modifier l'Article
          </Text>
        }
        padding="lg"
        position="right"
        size="md"
        overlayProps={{
          blur: 3,
          opacity: 0.55,
        }}
      >
        <LoadingOverlay
          visible={loadingUpdate}
          zIndex={1000}
          overlayProps={{ radius: 'sm', blur: 2 }}
          loaderProps={{ color: '#FF5D14', type: 'dots' }}
        />
        <form onSubmit={formU.onSubmit(onUpdate)} className="space-y-4">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
            <Text fw={500} size="sm" className="text-slate-600 dark:text-slate-300 mb-4 flex items-center gap-2">
              <FaEdit size={14} className="text-blue-500" />
              Modifier les informations
            </Text>
            
            <TextInput
              label="Référence"
              placeholder="Référence de l'article"
              required
              {...formU.getInputProps('ref')}
              classNames={{
                input: "rounded-md border-slate-200 dark:border-slate-700",
                wrapper: "shadow-sm mb-3"
              }}
            />
            
            <TextInput
              label="Nom"
              placeholder="Nom de l'article"
              required
              {...formU.getInputProps('nom')}
              classNames={{
                input: "rounded-md border-slate-200 dark:border-slate-700",
                wrapper: "shadow-sm mb-3"
              }}
            />
            
            <NumberInput
              label="Prix"
              placeholder="Prix de l'article"
              required
              {...formU.getInputProps('prix')}
              classNames={{
                input: "rounded-md border-slate-200 dark:border-slate-700",
                wrapper: "shadow-sm mb-3"
              }}
              rightSection={<Text size="xs" color="dimmed">FCFA</Text>}
            />
            
            <NumberInput
              label="Stock Seuil"
              placeholder="Seuil d'alerte de stock"
              required
              {...formU.getInputProps('stock_seuil')}
              classNames={{
                input: "rounded-md border-slate-200 dark:border-slate-700",
                wrapper: "shadow-sm mb-3"
              }}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <Select
                label="Famille"
                placeholder="Sélectionner une famille"
                {...formU.getInputProps('famille')}
                data={familles?.map((f: any) => ({label: f.nom, value: f._id}))}
                classNames={{
                  input: "rounded-md border-slate-200 dark:border-slate-700",
                  wrapper: "shadow-sm"
                }}
              />
              
              <Select
                label="Unité"
                placeholder="Sélectionner une unité"
                {...formU.getInputProps('unite')}
                data={unites?.map((f: any) => ({label: f.nom, value: f._id}))}
                classNames={{
                  input: "rounded-md border-slate-200 dark:border-slate-700",
                  wrapper: "shadow-sm"
                }}
              />
            </div>

            <Button 
              type="submit" 
              bg="#FF5D14" 
              loading={loadingUpdate}
              className="shadow-md hover:shadow-lg transition-all duration-200 mt-4 w-full"
              leftSection={<FaRegCircleCheck size={16} />}
            >
              Mettre à jour l'article
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  )
}

export default Articles