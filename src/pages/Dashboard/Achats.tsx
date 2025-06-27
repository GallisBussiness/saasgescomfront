import {useEffect, useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { yupResolver } from 'mantine-form-yup-resolver';
import * as yup from 'yup';
import { DataTable } from "mantine-datatable";
import { AiOutlinePlus } from "react-icons/ai";
import { ActionIcon, Badge, Box, Button, Drawer, LoadingOverlay, Modal, NumberInput, Text, TextInput, Select as SelectM, Tooltip, Group, HoverCard, Table, Popover } from "@mantine/core";
import { FaEye, FaPlus, FaMinus, FaTrash, FaSearch, FaShoppingBag, FaRegCalendarAlt, FaMoneyBillWave, FaUser, FaCartPlus, FaWarehouse } from "react-icons/fa";
import { FaRegCircleCheck, FaCartShopping } from "react-icons/fa6";
import { BsFillPenFill } from "react-icons/bs";
import { useForm } from "@mantine/form";
import {useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { Input, Select } from "antd";
import {WeeklyRevenue} from "./WeeklyRevenue";
import useScanDetection from 'use-scan-detection';
import { ArticleService } from "../../services/article.service";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { FournisseurService } from "../../services/fournisseur.service";
import { DateInput } from "@mantine/dates";
import { AchatService } from "../../services/achat.service";
import { FamilleService } from "../../services/famille.service";
import { UniteService } from "../../services/unite.service";
import { authclient } from '../../../lib/auth-client';
import { formatN } from "../../lib/helpers";
import { DepotService } from "../../services/depot.service";
import { Depot } from "../../interfaces/depot.interface";
import { toast } from "sonner";
import { validate } from 'uuid';

const schema = yup.object().shape({
    date: yup.date().required('Invalid Date'),
    produits:yup.array().required("Invalid Produits"),
    montant: yup.number().required(""),
    remise: yup.number().required(""),
    net_a_payer: yup.number().required(""),
    fournisseur: yup.string().required(""),
    depot:yup.string(),
    userId: yup.string().required("user not valid!")
  });

  const schemaA = yup.object().shape({
    ref: yup.string().required('Invalid Ref'),
    nom: yup.string().required('Invalide Nom'),
    stock_seuil: yup.number(),
    famille: yup.string().required("famille is not valid !"),
    unite: yup.string().required("unite is not valid !"),
    prix:yup.number().required("user not valid!"),
    userId: yup.string().required("user not valid!")
  });
  
  
  const PAGE_SIZE = 10;

function Achats() {
  const { data: session } = authclient.useSession() 
  const [opened, { open, close }] = useDisclosure(false);
  const [openedA, { open:openA, close:closeA }] = useDisclosure(false);
  const [deletePopoverOpened, setDeletePopoverOpened] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [remise,setRemise] = useState<number>(0);
  const [debouncedQuery] = useDebouncedValue(query, 200);
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState([]);
  const [ref, setRef] = useState<string | null>('');
  const [total,setTotal] = useState(0);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const achatService = new AchatService();
  const articleService = new ArticleService();
  const fournisseurService = new FournisseurService();
  const familleService = new FamilleService();
  const depotService = new DepotService();
  const keyf = ['famille', session?.user.id];
  const {data:familles,isLoading:isLoadingFA} = useQuery({ queryKey: keyf, queryFn:() => familleService.getByUser(session!.user.id), enabled: !!session })
  const uniteService = new UniteService();
  const keyu = ['unite', session?.user.id];
  const {data:unites,isLoading:isLoadingUN} = useQuery({ queryKey: keyu, queryFn:() => uniteService.getByUser(session!.user.id), enabled: !!session })
  const keyFournisseur = ['get_fournisseurs', session?.user.id];
  const {data:fournisseurs,isLoading:isLoadingFournisseur} = useQuery({ queryKey: keyFournisseur, queryFn:() => fournisseurService.getByUser(session!.user.id), enabled: !!session });
  const key = ['achat', session?.user.id];
  const {data:achats,isLoading} = useQuery({ queryKey: key, queryFn:() => achatService.getByUser(session!.user.id), enabled: !!session })
  const keyd = ['depots', session?.user.id];
  const {data:depots,isLoading:isLoadingDepot} = useQuery({ queryKey: keyd, queryFn:() => depotService.getByUser(session!.user.id), enabled: !!session })
  const {mutateAsync,isPending} = useMutation({
    mutationFn: (qr:string) => articleService.byref(encodeURIComponent(qr)),
 });

 const keyar = ['articles', session?.user.id];

 const {data:articles,isLoading:isLoadingA} = useQuery({ queryKey: keyar, queryFn:() => articleService.getByUser(session!.user.id), enabled: !!session })
  const form = useForm<any>({
    mode: 'uncontrolled',
    initialValues: {
      _id:'',
      date: new Date(),
      produits: [],
      montant:0,
      remise:0,
      net_a_payer:0,
      fournisseur:'',
      depot:'',
      userId: session!.user.id
    },
    validate: yupResolver(schema),
    onValuesChange(values) {
      setTotal(values.produits.reduce((acc: number,cur: { pu: number; qte: number; }) => acc + (cur.pu * cur.qte) ,0))
    },
  });

  const formA = useForm({
    initialValues: {
      ref: '',
      nom: '',
      stock_seuil: 0,
      famille: '',
      unite: '',
      prix: 0,
      userId: session!.user.id
    },
    validate: yupResolver(schemaA),
  });

  const {mutate:createArticle,isPending:loadingCreateA} = useMutation({
    mutationFn: (data) => articleService.create(data),
    onSuccess: () => {
     closeA();
     qc.invalidateQueries({queryKey:keyar});
     formA.reset()
    }
 });


 const onCreateA = (values:any) => {
  createArticle(values);
}


  const handleRemise = (value: string | number) => {
    setTotal((prev) => prev - Number(value))
    setRemise(Number(value));
  }

    const {mutate:createAchat,isPending:loadingCreate} = useMutation({
    mutationFn: (data) => achatService.create(data),
    onSuccess: (data) => {
      toast.success(`Achat créé avec succès / #${data.ref}`);
      close();
      qc.invalidateQueries({queryKey:key});
      form.reset()
    }
  });

const {mutate:updateAchat,isPending:loadingUpdate} = useMutation({
 mutationFn:(data:{id:string,data:any}) => achatService.update(data.id, data.data),
 onSuccess: () => {
  toast.success(`Achat mis à jour avec succès`);
  close();
  qc.invalidateQueries({queryKey:key});
 }
});

const {mutate:deleteAchat,isPending:loadingDelete} = useMutation({
    mutationFn: (id:string) => achatService.delete(id),
    onSuccess: () => {
      toast.success(`Achat supprimé avec succès`);
      qc.invalidateQueries({queryKey:key});
    }
});



  const confirm = (id: string) => {
    deleteAchat(id)
  };

  const onCreate = (values:any) => {
    if (values.produits.length === 0) {
      toast.error('Aucun produit ajouté à l\'achat', {
        icon: '⚠️',
        duration: 3000,
        position: 'top-center'
      });
      return;
    }
    
    if (!values.fournisseur) {
      toast.error('Veuillez sélectionner un fournisseur', {
        icon: '⚠️',
        duration: 3000,
        position: 'top-center'
      });
      return;
    }

    // Calculer le montant total
    const montant = values.produits.reduce((acc: number,cur: { pu: number; qte: number; }) => acc + (cur.pu * cur.qte) ,0);
    const netAPayer = montant - Number(remise);
    
    // Créer ou mettre à jour l'achat
    if(form.getValues()._id === ''){
      const {_id,...rest} = values;
      toast.loading('Enregistrement en cours...', {
        id: 'creating-achat'
      });
      createAchat({
        ...rest,
        montant,
        remise: remise,
        net_a_payer: netAPayer
      });
      toast.success('Achat enregistré avec succès', {
        id: 'creating-achat',
        icon: '✅'
      });
    } else {
      const {_id,...rest} = values;
      toast.loading('Mise à jour en cours...', {
        id: 'updating-achat'
      });
      updateAchat({
        id: _id,
        data: {
          ...rest,
          montant,
          remise: remise,
          net_a_payer: netAPayer
        }
      });
      toast.success('Achat mis à jour avec succès', {
        id: 'updating-achat',
        icon: '✅'
      });
    }
  }


const handleUpdate  = (data: any) => {
  
  form.setValues({produits:data.produits,_id:data._id,fournisseur:data.fournisseur._id,depot:data.depot._id});
  setRemise(data?.remise);
  open();
}

const handleCreate  = () => {
  setRemise(0);
  form.reset();
  open();
}




const filtered = (Achat = []) => {
  return Achat?.filter(({ date }) => {
    if (
      debouncedQuery !== '' &&
      !`${date}`.toLowerCase().includes(debouncedQuery.trim().toLowerCase())
    )
      return false;
  
    return true;
  })
}

useEffect(() => {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE;
  setRecords(filtered(achats).slice(from, to) ?? []);
}, [achats,debouncedQuery,page]);


// État pour la boîte de dialogue de quantité
const [quantityModalOpened, setQuantityModalOpened] = useState(false);
const [selectedProduct, setSelectedProduct] = useState<any>(null);
const [quantityToAdd, setQuantityToAdd] = useState<number>(1);
const quantityInputRef = useRef<HTMLInputElement>(null);

// Fonction pour ajouter l'article avec la quantité spécifiée
const addProductWithQuantity = () => {
  if (!selectedProduct) return;
  
  const o = selectedProduct;
  
  // Animation et feedback pour l'ajout réussi
  const handleSuccessfulAdd = (isNew: boolean) => {
    // Réinitialiser le champ de recherche après l'ajout
    setRef(null);
    
    // Afficher un toast de confirmation
    toast.success(
      isNew ? `${o.nom} ajouté au panier (${quantityToAdd} ${o.unite.nom})` : `Quantité de ${o.nom} mise à jour (${quantityToAdd} ${o.unite.nom})`, 
      { 
        icon: isNew ? '🛒' : '⬆️',
        duration: 2000, 
        position: 'bottom-right'
      }
    );
  };
  
  if (o.prec) {
    // Si le produit existe déjà, mettre à jour la quantité
    form.setValues({
      produits: form.getValues().produits.map((v: { ref: any; qte: number; }) => {
        if (v.ref === o.ref) {
          return {...v, qte: quantityToAdd}
        }
        return v;
      })
    });
    
    handleSuccessfulAdd(false);
  } else {
    // Ajouter un nouveau produit avec la quantité spécifiée
    form.insertListItem('produits', { 
      ref: o.ref, 
      nom: o.nom, 
      pu: o.prix, 
      qte: quantityToAdd, 
      unite: o.unite.nom 
    });
    
    handleSuccessfulAdd(true);
  }
  
  // Fermer la modal et réinitialiser
  setQuantityModalOpened(false);
  setSelectedProduct(null);
}

// Scanner de code-barres avec feedback visuel et sonore
useScanDetection({
  onComplete: async (code) => {
    if(code === '') return;
     
    try {
      const c = code.replace(/Shift/gi,"");
      if(validate(c)) {
        const ar = await mutateAsync(c);
      
        if(!ar) {
          toast.error(`Code-barres non reconnu: ${c}`, {
            icon: '❌',
            duration: 3000
          });
          return;
        }
        
        // Si le produit existe déjà dans le panier
        const prec = form.getValues().produits.find((v: { ref: any; }) => v?.ref === ar.ref);
        
        // Initialiser la quantité à 1 ou à la quantité actuelle + 1
        setQuantityToAdd(prec ? prec.qte + 1 : 1);
        
        // Sauvegarder le produit sélectionné pour l'utiliser après la saisie de la quantité
        setSelectedProduct({...ar, prec});
        
        // Ouvrir la modal de saisie de quantité
        setQuantityModalOpened(true);
        
        // Focus sur l'input de quantité après ouverture de la modal
        setTimeout(() => {
          if (quantityInputRef.current) {
            quantityInputRef.current.focus();
            quantityInputRef.current.select();
          }
        }, 100);
      }
    } catch (error) {
      toast.error('Erreur lors de la lecture du code-barres', {
        duration: 3000
      });
      console.error('Scanner error:', error);
    }
  },
});

// Ajouter des raccourcis clavier pour faciliter l'utilisation
useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    // Alt+A pour focus sur la recherche d'articles
    if (event.altKey && event.key === 'a') {
      const selectElement = document.querySelector('.ant-select-selector');
      if (selectElement) {
        (selectElement as HTMLElement).click();
      }
    }
    
    // Alt+E pour soumettre le formulaire (enregistrer)
    if (event.altKey && event.key === 'e' && opened) {
      const submitButton = document.querySelector('form button[type="submit"]');
      if (submitButton) {
        (submitButton as HTMLElement).click();
      }
    }
    
    // Alt+F pour focus sur le champ fournisseur
    if (event.altKey && event.key === 'f' && opened) {
      const fournisseurSelect = document.querySelector('select[id*="fournisseur"]');
      if (fournisseurSelect) {
        (fournisseurSelect as HTMLElement).focus();
      }
    }
    
    // Alt+Q pour valider la quantité dans la modal (quand elle est ouverte)
    if (event.altKey && event.key === 'q' && quantityModalOpened) {
      addProductWithQuantity();
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
}, [opened]);

const onSelect = (v:any) => {
  if (!v) return;
  
  const o = JSON.parse(v);
  if (!o) return;
  
  // Vérifier si le produit est déjà dans le panier
  const prec = form.getValues().produits.find((v: { ref: any; }) => v?.ref === o.ref);
  
  // Initialiser la quantité à 1 ou à la quantité actuelle + 1
  setQuantityToAdd(prec ? prec.qte + 1 : 1);
  
  // Sauvegarder le produit sélectionné pour l'utiliser après la saisie de la quantité
  setSelectedProduct({...o, prec});
  
  // Ouvrir la modal de saisie de quantité
  setQuantityModalOpened(true);
  
  // Focus sur l'input de quantité après ouverture de la modal
  setTimeout(() => {
    if (quantityInputRef.current) {
      quantityInputRef.current.focus();
      quantityInputRef.current.select();
    }
  }, 100);
}


const fields = form.getValues().produits.map((item: any, index: number) => {
  return (
  <div key={item?.ref} className={`grid grid-cols-4 gap-2 items-center p-2 rounded-md mb-1 ${index % 2 === 0 ? 'bg-white dark:bg-slate-800/80' : 'bg-slate-50 dark:bg-slate-700/50'} transition-all duration-300 hover:shadow-md`}>
    <div className="relative">
      <div className="bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md text-blue-600 dark:text-blue-300 font-medium text-sm text-center">
        {item.ref}
      </div>
    </div>
    
    <div>
      <TextInput
        placeholder="Description"
        disabled={true}
        key={form.key(`produits.${index}.nom`)}
        {...form.getInputProps(`produits.${index}.nom`)}
        classNames={{
          input: "border-0 bg-transparent font-medium"
        }}
      />
    </div>
    
    <div>
      <NumberInput
        placeholder="Prix unitaire"
        withAsterisk
        key={form.key(`produits.${index}.pu`)}
        {...form.getInputProps(`produits.${index}.pu`)}
        classNames={{
          input: "rounded-md border-slate-200 dark:border-slate-700 font-medium",
          wrapper: "shadow-sm"
        }}
        rightSection={<Text size="xs" color="dimmed">FCFA</Text>}
      />
    </div>
    
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <div className="flex items-center">
          <ActionIcon
            size="xs"
            variant="subtle"
            color="blue"
            onClick={() => {
              const newQty = Math.max(1, item.qte - 1);
              form.setFieldValue(`produits.${index}.qte`, newQty);
            }}
            className="absolute left-0 top-1 z-10 ml-1"
            disabled={item.qte <= 1}
          >
            <span className="font-bold">-</span>
          </ActionIcon>
          
          <NumberInput
            placeholder="Quantité"
            withAsterisk
            min={1}
            style={{ flex: 1}}
            classNames={{
              input: 'rounded-md border-slate-200 dark:border-slate-700 font-medium pl-7 pr-7 text-center',
              wrapper: "shadow-sm",
            }}
            key={form.key(`produits.${index}.qte`)}
            {...form.getInputProps(`produits.${index}.qte`)}
            rightSection={<Text size="xs" color="dimmed">{item.unite}</Text>}
          />
          
          <ActionIcon
            size="xs"
            variant="subtle"
            color="blue"
            onClick={() => {
              const newQty = item.qte + 1;
              form.setFieldValue(`produits.${index}.qte`, newQty);
            }}
            className="absolute right-9 top-1 z-10 mr-1"
          >
            <span className="font-bold">+</span>
          </ActionIcon>
        </div>
      </div>
      
      <ActionIcon 
        color="red" 
        variant="light" 
        onClick={() => {
          // Demander confirmation avant de supprimer
          const confirmRemove = () => {
            form.removeListItem('produits', index);
            toast.success(`Article retiré du panier`, { 
              icon: '🗑️',
              duration: 2000, 
              position: 'bottom-right'
            });
          };
          confirmRemove();
        }}
        className="shadow-sm hover:shadow-md transition-all duration-200 hover:bg-red-100"
      >
        <FaTrash size="0.875rem" />
      </ActionIcon>
    </div>
  </div>
  );
});

return (
  <div className="relative">
    <LoadingOverlay
      visible={loadingDelete || isLoadingA || isLoadingFournisseur || isLoadingFA || isLoadingUN}
      zIndex={1000}
      overlayProps={{ radius: 'sm', blur: 2 }}
      loaderProps={{ color: '#422AFB', type: 'dots' }}
    />
    <div className="mt-2">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Approvisionnement</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gérez vos achats et approvisionnements</p>
        </div>
       <Button 
         bg="#FF5D14" 
         leftSection={<AiOutlinePlus className="h-5 w-5"/>} 
         onClick={handleCreate}
         className="shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
         radius="xl"
       >
         Nouvel achat
       </Button>
     </div>
     
     <WeeklyRevenue add={null}>
     <>
     <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-4 mb-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <div className="w-full md:w-1/3 relative">
            <Input 
              value={query} 
              onChange={(e) => setQuery(e.currentTarget.value)} 
              placeholder="Rechercher par référence..." 
              prefix={<FaSearch className="text-slate-400" />}
              className="shadow-sm"
            />
         </div>
         <div className="flex flex-wrap gap-2">
           <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 px-3 py-2 rounded-lg">
             <FaRegCalendarAlt size={14} className="text-blue-500" />
             <Text size="xs" className="text-blue-600 dark:text-blue-300">
               {format(new Date(), 'dd MMMM yyyy')}
             </Text>
           </div>
           <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/30 px-3 py-2 rounded-lg">
             <FaShoppingBag size={14} className="text-green-500" />
             <Text size="xs" className="text-green-600 dark:text-green-300">
               {achats?.length || 0} achats
             </Text>
           </div>
           <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/30 px-3 py-2 rounded-lg">
             <FaMoneyBillWave size={14} className="text-orange-500" />
             <Text size="xs" className="text-orange-600 dark:text-orange-300">
               {formatN(achats?.reduce((acc: number, cur: { net_a_payer: number }) => acc + cur.net_a_payer, 0) || 0)} FCFA
             </Text>
           </div>
         </div>
       </div>
     </div>
    <DataTable
      withTableBorder={true} 
      columns={[
        { 
          accessor: 'ref', 
          title: <Text fw={600} size="sm">Référence</Text>,
          textAlign: 'center',
          render: (data) => (
            <div className="bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md text-blue-600 dark:text-blue-300 font-medium text-sm text-center">
              {data.ref}
            </div>
          )
        },
        { 
          accessor: 'date',
          title: <Text fw={600} size="sm">Date</Text>,
          textAlign: 'center', 
          render: ({date}) => (
            <div className="flex items-center justify-center gap-2">
              <FaRegCalendarAlt size={14} className="text-slate-400" />
              <Text size="sm">{format(date,'dd/MM/yyyy')}</Text>
            </div>
          )
        },
        { 
          accessor: 'montant', 
          title: <Text fw={600} size="sm">Montant</Text>,
          textAlign: 'center',
          render: (data:any) => (
            <Text fw={500} className="text-slate-700 dark:text-slate-300">
              {formatN(data?.montant)} FCFA
            </Text>
          )
        },
        { 
          accessor: 'remise', 
          title: <Text fw={600} size="sm">Remise</Text>,
          textAlign: 'center',
          render: (data:any) => (
            <Text fw={500} className="text-orange-600 dark:text-orange-400">
              {formatN(data?.remise)} FCFA
            </Text>
          )
        },
        { 
          accessor: 'net_a_payer', 
          title: <Text fw={600} size="sm">Net à payer</Text>,
          textAlign: 'center',
          render: (data:any) => (
            <Text fw={600} className="text-teal-600 dark:text-teal-400">
              {formatN(data?.net_a_payer)} FCFA
            </Text>
          )
        },
        { 
          accessor: 'produits', 
          title: <Text fw={600} size="sm">Produits</Text>,
          textAlign: 'center',
          render: (data:any) => (
            <Group justify="center">
              <HoverCard width={450} shadow="md" position="bottom">
                <HoverCard.Target>
                  <ActionIcon 
                    variant="light" 
                    color="orange" 
                    className="shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <FaCartShopping size={14} />
                  </ActionIcon> 
                </HoverCard.Target>
                <HoverCard.Dropdown className="p-0 overflow-hidden border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-2">
                    <Text fw={600} size="sm" ta="center" className="text-white">
                      Détails des produits
                    </Text>
                  </div>
                  <Table className="bg-white dark:bg-slate-800">
                    <Table.Thead className="bg-slate-100 dark:bg-slate-700">
                      <Table.Tr>
                        <Table.Th className="text-slate-700 dark:text-slate-300 text-xs">N°</Table.Th>
                        <Table.Th className="text-slate-700 dark:text-slate-300 text-xs">Référence</Table.Th>
                        <Table.Th className="text-slate-700 dark:text-slate-300 text-xs">Description</Table.Th>
                        <Table.Th className="text-slate-700 dark:text-slate-300 text-xs">Qté</Table.Th>
                        <Table.Th className="text-slate-700 dark:text-slate-300 text-xs">Prix</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {data.produits.map((el:any,i: number) => (
                        <Table.Tr key={el.ref} className={i % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-700/50'}>
                          <Table.Td className="text-slate-600 dark:text-slate-400 font-medium">{i+1}</Table.Td>
                          <Table.Td>
                            <div className="bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md text-blue-600 dark:text-blue-300 text-xs font-medium">
                              {el.ref}
                            </div>
                          </Table.Td>
                          <Table.Td className="text-slate-600 dark:text-slate-400 font-medium">{el.nom}</Table.Td>
                          <Table.Td className="text-slate-600 dark:text-slate-400 font-medium">{el.qte}</Table.Td>
                          <Table.Td className="text-slate-600 dark:text-slate-400 font-medium">{formatN(el.pu)} FCFA</Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </HoverCard.Dropdown>
              </HoverCard>
            </Group>
          )
        },
        {
          accessor: 'actions',
          title: <Text fw={600} size="sm" ta="center">Actions</Text>,
          textAlign: 'center',
          render: (rowData:any) => (
            <div className="flex items-center justify-center gap-2">
              <Tooltip label="Voir les détails">
                <Button 
                  size="compact-sm" 
                  variant="light" 
                  color="blue" 
                  onClick={() => navigate(rowData._id)} 
                  rightSection={<FaEye size={14} />}
                  className="shadow-sm hover:shadow-md transition-all duration-200"
                >
                  Détails
                </Button>
              </Tooltip>
              
              <Tooltip label="Modifier">
                <ActionIcon 
                  variant="light" 
                  color="green" 
                  onClick={() => handleUpdate(rowData)}
                  className="shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <BsFillPenFill size={14} />
                </ActionIcon>
              </Tooltip>
              
                <Tooltip label="Supprimer">
                  <Popover 
                    width={250} 
                    position="bottom" 
                    withArrow 
                    shadow="md" 
                    opened={deletePopoverOpened === rowData._id}
                    onChange={() => setDeletePopoverOpened(null)}
                  >
                    <Popover.Target>
                      <ActionIcon 
                        variant="light" 
                        color="red"
                        className="shadow-sm hover:shadow-md transition-all duration-200"
                        onClick={() => setDeletePopoverOpened(rowData._id)}
                      >
                        <FaTrash size={14} />
                      </ActionIcon>
                    </Popover.Target>
                    <Popover.Dropdown className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="flex flex-col gap-3">
                        <Text fw={500} size="sm" className="text-slate-700 dark:text-slate-300">
                          Êtes-vous sûr de vouloir supprimer cet achat ?
                        </Text>
                        <div className="flex justify-end gap-2">
                          <Button className="bg-slate-500 hover:bg-slate-600 text-white" size="xs" onClick={() => setDeletePopoverOpened(null)}>Annuler</Button>
                          <Button 
                           className="bg-red-500 hover:bg-red-600 text-white"
                            size="xs" 
                            onClick={() => {
                              confirm(rowData?._id);
                              setDeletePopoverOpened(null);
                            }}
                          >
                            Confirmer
                          </Button>
                        </div>
                      </div>
                    </Popover.Dropdown>
                  </Popover>
                </Tooltip>
            </div>
          ),
        },
      ]}
      records={records}
      idAccessor="_id"
      fetching={isLoading}
      emptyState={
        <div className="flex flex-col items-center justify-center py-12">
          <FaShoppingBag size={48} className="text-slate-300 mb-4" />
          <Text c="dimmed" ta="center" size="sm">
            Aucun achat trouvé
          </Text>
        </div>
      }
      totalRecords={filtered(achats)?.length}
      recordsPerPage={10}
      page={page}
      onPageChange={(p) => setPage(p)}
      borderRadius="lg"
      shadow="sm"
      horizontalSpacing="md"
      verticalSpacing="md"
      verticalAlign="top"
      highlightOnHover={true}
      paginationActiveBackgroundColor="#FF5D14"
      paginationSize="sm"
      className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg"
    />
     </>
     
     </WeeklyRevenue>
      </div>

   <Modal opened={opened} onClose={close} title="Nouvel Achat" size="xl" overlayProps={{ blur: 3, opacity: 0.55 }} centered>
        <form onSubmit={form.onSubmit(onCreate)} className="space-y-4">
       <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 mb-6">
         <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-4">
           <div className="w-full md:w-2/3">
             <div className="flex items-center gap-2 mb-2">
               <FaCartShopping size={16} className="text-orange-500" />
               <Text fw={600} size="sm" className="text-slate-700 dark:text-slate-300">
                 Ajouter un produit
               </Text>
             </div>
             <div className="flex items-center gap-2">
               <Select 
                 showSearch  
                 optionFilterProp="label"
                 filterSort={(optionA, optionB) =>
                   `${optionA.label}`.toLowerCase().localeCompare(`${optionB.label}`.toLowerCase())}
                 className="w-full" 
                 options={articles?.map((v: {nom:string;_id: string;ref: string; prix: number; unite: any;}) => ({
                   label: `${v.nom} / ${v.ref}`,
                   value: JSON.stringify(v)
                 }))}
                 loading={isLoadingA} 
                 value={ref} 
                 onChange={onSelect} 
                 placeholder="Rechercher un produit..."
                 size="large"
                 style={{ borderRadius: '0.5rem' }}
                 dropdownRender={(menu) => (
                   <div>
                     {menu}
                     <div className="p-2 border-t border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700">
                       <Text size="xs" className="text-slate-600 dark:text-slate-300">
                         <span className="inline-block mr-4">Alt+A : Rechercher</span>
                         <span className="inline-block">Alt+E : Enregistrer</span>
                       </Text>
                     </div>
                   </div>
                 )}
               />
               <Button 
                 variant="light" 
                 color="orange" 
                 onClick={openA}
                 size="sm"
                 className="shadow-sm hover:shadow-md transition-all duration-200"
               >
                 <FaPlus size={14} />
               </Button>
             </div>
             <div className="flex justify-between items-center mt-1">
               <Text size="xs" className="text-slate-500 dark:text-slate-400">
                 Scannez un code-barres ou sélectionnez un produit dans la liste
               </Text>
               <div className="flex items-center gap-1">
                 <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                 <Text size="xs" className="text-green-600 dark:text-green-400">
                   Scanner actif
                 </Text>
               </div>
             </div>
           </div>
           
           <div className="w-full md:w-1/3">
             <div className="flex items-center gap-2 mb-2">
               <FaMoneyBillWave size={16} className="text-orange-500" />
               <Text fw={600} size="sm" className="text-slate-700 dark:text-slate-300">
                 Remise
               </Text>
             </div>
             <NumberInput
               placeholder="Montant de la remise"
               withAsterisk
               style={{ flex: 1 }}
               value={remise}
               onChange={handleRemise}
               classNames={{
                 input: "rounded-md border-slate-200 dark:border-slate-700",
                 wrapper: "shadow-sm"
               }}
               rightSection={<Text size="xs" color="dimmed">FCFA</Text>}
             />
           </div>
         </div>
     
     <Box mx="auto">
       <div className="mb-4">
         <div className="flex items-center gap-2 mb-2">
           <FaRegCalendarAlt size={16} className="text-orange-500" />
           <Text fw={600} size="sm" className="text-slate-700 dark:text-slate-300">
             Date de la facture
           </Text>
         </div>
         <DateInput
           placeholder="Sélectionner une date"
           classNames={{
             input: "rounded-md border-slate-200 dark:border-slate-700",
             wrapper: "shadow-sm"
           }}
           {...form.getInputProps('date')}
         />
       </div>
       
       <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-lg mb-6">
         <div className="flex items-center gap-2 mb-4">
           <FaShoppingBag size={16} className="text-orange-500" />
           <Text fw={600} size="sm" className="text-slate-700 dark:text-slate-200">
             Produits sélectionnés
           </Text>
         </div>
         
         {fields.length > 0 ? (
           <div>
             <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-2 rounded-md mb-2">
               <div className="grid grid-cols-4 gap-2">
                 <Text fw={600} size="sm" className="text-white">
                   RÉFÉRENCE
                 </Text>
                 <Text fw={600} size="sm" className="text-white">
                   DESCRIPTION
                 </Text>
                 <Text fw={600} size="sm" className="text-white">
                   PRIX UNITAIRE
                 </Text>
                 <Text fw={600} size="sm" className="text-white">
                   QUANTITÉ
                 </Text>
               </div>
             </div>
             <div className="max-h-60 overflow-y-auto pr-1">
               {fields.reverse()}
             </div>
           </div>
         ) : (
           <div className="flex flex-col items-center justify-center py-6 bg-white dark:bg-slate-700/30 rounded-md border border-dashed border-slate-300 dark:border-slate-600">
             <FaCartShopping size={32} className="text-slate-400 mb-2" />
             <Text c="dimmed" ta="center" size="sm">
               Aucun produit ajouté. Utilisez le sélecteur ci-dessus pour ajouter des produits.
             </Text>
           </div>
         )}
       </div>
       
       <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-lg mb-6">
         <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-2">
             <FaUser size={16} className="text-orange-500" />
             <Text fw={600} size="sm" className="text-slate-700 dark:text-slate-200">
               Fournisseur
             </Text>
           </div>
         </div>
         
         <Select
           placeholder="Sélectionner un fournisseur"
           options={fournisseurs?.map((v: { tel: any; nom: any; addr: any;_id:string }) => ({
             label: `${v.nom} ${v.tel ? `/ ${v.tel}` : ''} ${v.addr ? `/ ${v.addr}` : ''}`,
             value: v._id
           }))}
           {...form.getInputProps('fournisseur')}
           loading={isLoadingFournisseur}
           showSearch
           optionFilterProp="label"
           filterSort={(optionA, optionB) =>
             `${optionA.label}`.toLowerCase().localeCompare(`${optionB.label}`.toLowerCase())}
           className="w-full mb-2"
           style={{ borderRadius: '0.5rem' }}
         />
       </div>
       
       <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-lg mb-6">
         <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-2">
             <FaWarehouse size={16} className="text-orange-500" />
             <Text fw={600} size="sm" className="text-slate-700 dark:text-slate-200">
               Dépôt
             </Text>
           </div>
         </div>
         
         <Select
           placeholder="Sélectionner un dépôt"
           options={depots?.map((v: Depot) => ({
             label: v.nom,
             value: v._id!
           }))}
           {...form.getInputProps('depot')}
           loading={isLoadingDepot}
           showSearch
           optionFilterProp="label"
           filterSort={(optionA, optionB) =>
             `${optionA.label}`.toLowerCase().localeCompare(`${optionB.label}`.toLowerCase())}
           className="w-full mb-2"
           style={{ borderRadius: '0.5rem' }}
         />
       </div>
    </Box>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex flex-col justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center justify-center bg-orange-50 dark:bg-orange-900/20 p-3 rounded-full">
              <FaShoppingBag size={24} className="text-orange-500" />
              <Text size="xs" className="text-orange-600 dark:text-orange-400 mt-1 font-medium">
                {form.values.produits.length}
              </Text>
            </div>
            <Text size="sm" className="text-slate-600 dark:text-slate-300">
              Articles sélectionnés
            </Text>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-1 rounded-lg">
              <Text size="xs" className="text-blue-600 dark:text-blue-300 mb-1">MONTANT TOTAL</Text>
              <Text fw={700} size="sm" className="text-blue-700 dark:text-blue-300">
                {formatN(total)} FCFA
              </Text>
            </div>
            
            <div className="bg-orange-50 dark:bg-orange-900/20 p-1 rounded-lg">
              <Text size="xs" className="text-orange-600 dark:text-orange-300 mb-1">REMISE</Text>
              <Text fw={700} size="sm" className="text-orange-700 dark:text-orange-300">
                {formatN(remise)} FCFA
              </Text>
            </div>
            
            <div className="bg-teal-50 dark:bg-teal-900/20 p-1 rounded-lg">
              <Text size="xs" className="text-teal-600 dark:text-teal-300 mb-1">NET À PAYER</Text>
              <Text fw={700} size="sm" className="text-teal-700 dark:text-teal-300">
                {formatN(total - remise)} FCFA
              </Text>
            </div>
          </div>
          
          <Button 
            type="submit" 
            bg="#FF5D14" 
            loading={loadingCreate || loadingUpdate}
            size="md"
            className="shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-bold w-full md:w-auto"
            leftSection={<FaRegCircleCheck size={16} />}
            rightSection={<div className="text-xs opacity-70">Alt+E</div>}
          >
            {form.getValues()._id ? 'Mettre à jour l\'achat' : 'Enregistrer l\'achat'}
          </Button>
        </div>
      </div>
      </div>
    </form>
  </Modal>

   {/* Modal pour la saisie de quantité avant ajout */}
   <Modal
     opened={quantityModalOpened}
     onClose={() => setQuantityModalOpened(false)}
     title={
       <Text size="lg" fw={700} className="text-slate-800 dark:text-white flex items-center gap-2">
         <FaCartPlus className="text-orange-500" />
         Spécifier la quantité
       </Text>
     }
     size="sm"
     centered
     overlayProps={{
       blur: 3,
       opacity: 0.65,
     }}
     className="quantity-modal"
   >
     {selectedProduct && (
       <div className="space-y-4">
         <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
           <div className="flex items-center justify-between">
             <Text fw={600} size="sm" className="text-slate-700 dark:text-slate-200">
               {selectedProduct.nom}
             </Text>
             <Badge color="blue">{selectedProduct.ref}</Badge>
           </div>
           <div className="flex items-center justify-between mt-2">
             <Text size="xs" className="text-slate-500 dark:text-slate-400">
               Prix unitaire:
             </Text>
             <Text fw={600} size="sm" className="text-orange-600 dark:text-orange-400">
               {formatN(selectedProduct.prix)} FCFA
             </Text>
           </div>
         </div>

         <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
           <Text fw={500} size="sm" className="text-slate-600 dark:text-slate-300 mb-3 flex items-center gap-2">
             <FaCartShopping size={14} className="text-orange-500" />
             Quantité à ajouter
           </Text>
           
           <div className="flex items-center gap-2">
             <ActionIcon
               size="lg"
               variant="subtle"
               color="orange"
               onClick={() => setQuantityToAdd(Math.max(1, quantityToAdd - 1))}
               disabled={quantityToAdd <= 1}
               className="shadow-sm"
             >
               <FaMinus size={14} />
             </ActionIcon>
             
             <NumberInput
               placeholder="Quantité"
               value={quantityToAdd}
               onChange={(val) => setQuantityToAdd(Number(val))}
               min={1}
               ref={quantityInputRef}
               classNames={{
                 input: "rounded-md border-slate-200 dark:border-slate-700 font-medium text-center",
                 wrapper: "flex-1 shadow-sm"
               }}
               rightSection={
                 <div className="text-xs text-slate-500 pr-2">{selectedProduct.unite?.nom}</div>
               }
             />
             
             <ActionIcon
               size="lg"
               variant="subtle"
               color="orange"
               onClick={() => setQuantityToAdd(quantityToAdd + 1)}
               className="shadow-sm"
             >
               <FaPlus size={14} />
             </ActionIcon>
           </div>
         </div>

         <div className="flex gap-3 mt-4">
           <Button 
             variant="subtle"
             color="gray"
             onClick={() => setQuantityModalOpened(false)}
             className="flex-1"
           >
             Annuler
           </Button>
           <Button 
             onClick={addProductWithQuantity}
             className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-200 text-white flex-1 shadow-md hover:shadow-lg"
             leftSection={<FaCartPlus size={16} />}
           >
             Ajouter
           </Button>
         </div>
       </div>
     )}
   </Modal>

   <Drawer 
     opened={openedA} 
     onClose={closeA} 
     title={
       <Text size="lg" fw={700} className="text-slate-800 dark:text-white">
         Nouveau Fournisseur
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
      visible={loadingCreateA || isPending}
      zIndex={1000}
      overlayProps={{ radius: 'sm', blur: 2 }}
      loaderProps={{ color: '#FF5D14', type: 'dots' }}
    />
    <form onSubmit={formA.onSubmit(onCreateA)} className="space-y-4">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
        <Text fw={500} size="sm" className="text-slate-600 dark:text-slate-300 mb-4 flex items-center gap-2">
          <FaShoppingBag size={14} className="text-orange-500" />
          Informations de l'article
        </Text>
        
        <TextInput
          label="Référence"
          placeholder="Référence de l'article"
          required
          {...formA.getInputProps('ref')}
          classNames={{
            input: "rounded-md border-slate-200 dark:border-slate-700",
            wrapper: "shadow-sm mb-3"
          }}
        />
        
        <TextInput
          label="Nom"
          placeholder="Nom de l'article"
          required
          {...formA.getInputProps('nom')}
          classNames={{
            input: "rounded-md border-slate-200 dark:border-slate-700",
            wrapper: "shadow-sm mb-3"
          }}
        />
        
        <NumberInput
          label="Prix"
          placeholder="Prix de l'article"
          required
          {...formA.getInputProps('prix')}
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
          {...formA.getInputProps('stock_seuil')}
          classNames={{
            input: "rounded-md border-slate-200 dark:border-slate-700",
            wrapper: "shadow-sm mb-3"
          }}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <SelectM
            label="Famille"
            placeholder="Sélectionner une famille"
            {...formA.getInputProps('famille')}
            data={familles?.map((f: any) => ({label: f.nom, value: f._id}))}
            classNames={{
              input: "rounded-md border-slate-200 dark:border-slate-700",
              wrapper: "shadow-sm"
            }}
          />
          
          <SelectM
            label="Unité"
            placeholder="Sélectionner une unité"
            {...formA.getInputProps('unite')}
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
          loading={loadingCreateA}
          className="shadow-md hover:shadow-lg transition-all duration-200 mt-4 w-full"
          leftSection={<FaRegCircleCheck size={16} />}
        >
          Enregistrer l'article
        </Button>
      </div>
    </form>
  </Drawer>
    </div>
  )
}

export default Achats