import {useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { yupResolver } from 'mantine-form-yup-resolver';
import * as yup from 'yup';
import { DataTable } from "mantine-datatable";
import { AiOutlinePlus } from "react-icons/ai";
import { ActionIcon, Box, Button, Drawer, Group, HoverCard, LoadingOverlay, Modal, NumberFormatter, NumberInput, Popover, Radio, Stack, Table, Text, TextInput, Tooltip} from "@mantine/core";
import { FaEye, FaPlus, FaTrash, FaSearch, FaShoppingBag, FaRegCalendarAlt, FaMoneyBillWave, FaUser, FaPrint, FaSortAlphaDown, FaSortAlphaDownAlt } from "react-icons/fa";
import { FaCartShopping, FaRegCircleCheck} from "react-icons/fa6";
import { BsFillPenFill } from "react-icons/bs";
import { useForm } from "@mantine/form";
import { toast } from 'sonner';
import {useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { Input, Select } from "antd";
import {WeeklyRevenue} from "./WeeklyRevenue";
import { VenteService } from "../../services/vente.service";
import useScanDetection from 'use-scan-detection';
import { ArticleService } from "../../services/article.service";
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { add, format, isAfter, isBefore } from "date-fns";
import { useNavigate, useSearchParams } from "react-router-dom";
import pdfMake from "pdfmake/build/pdfmake";
import { font } from "../../vfs_fonts";
pdfMake.vfs = font;
import { ParamService } from "../../services/paramservice";
import { ClientService } from "../../services/client.service";
import { DateInput, DatePicker } from "@mantine/dates";
import { sortBy } from "lodash";
import { TbSum, TbDiscount } from "react-icons/tb";
import { InventoryService } from "../../services/Inventory.service";
// import SectionTitle from "../../components/SectionTitle";
import { formatN } from "../../lib/helpers";
import { authclient } from '../../../lib/auth-client';
import { validate } from "uuid";

const schemaC = yup.object().shape({
  nom: yup.string().required('Invalide Nom'),
  tel: yup.string(),
  addr: yup.string(),
  userId: yup.string().required("user not valid!")
});
const schema = yup.object().shape({
    date: yup.date().required('Invalid Date'),
    produits:yup.array().required("Invalid Produits"),
    montant: yup.number().required(""),
    remise: yup.number().required(""),
    net_a_payer: yup.number().required(""),
    client: yup.string().required(""),
    userId: yup.string().required("user not valid!")
  });
  
  const PAGE_SIZE = 10;



function Ventes() {
  const { data: session } = authclient.useSession() 
  const [opened, { open, close }] = useDisclosure(false);
  const [openedA, { open:openA, close:closeA }] = useDisclosure(false);
  const [query, setQuery] = useState('');
  const [remise,setRemise] = useState<number>(0);
  const [debouncedQuery] = useDebouncedValue(query, 200);
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState<any[]>([]);
  const [ref, setRef] = useState<string | null>('');
  const [total,setTotal] = useState(0);
  const qc = useQueryClient();
  const [dateSearchRange, setDateSearchRange] = useState<any>();
  const [bodyRef] = useAutoAnimate();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortStatus, setSortStatus] = useState<any>({
    columnAccessor: 'type',
    direction: 'asc',
  });
  const [printModalOpened, setPrintModalOpened] = useState(false);
  const [selectedVente, setSelectedVente] = useState<any>(null);
  const [selectedFormat, setSelectedFormat] = useState<'A4' | 'A5'>('A4');
  const paramService = new ParamService();
  const venteService = new VenteService();
  const articleService = new ArticleService();
  const clientService = new ClientService();
  const inventoryService = new InventoryService();
  const keyP = ['param', session!.user.id];
  const {data:param,isLoading:isLoadingP} = useQuery({ 
    queryKey: keyP, 
    queryFn:() => paramService.getByUser(session!.user.id),
    enabled: !!session
  });
  const keyClient = ['get_clients', session!.user.id];
  const {data:clients,isLoading:isLoadingClient} = useQuery({ 
    queryKey: keyClient, 
    queryFn:() => clientService.getByUser(session!.user.id),
    enabled: !!session
  });
  const key = ['vente', session!.user.id];
  const {data:ventes,isLoading} = useQuery({ 
    queryKey: key, 
    queryFn:() => venteService.getByUser(session!.user.id),
    enabled: !!session
  });
  const keyI = ['get_inventory', session!.user.id];
  const {data:invs,isLoading:isLoadingI} = useQuery({ 
    queryKey: keyI, 
    queryFn:() => inventoryService.getByUser(session!.user.id),
    enabled: !!session
  });
  const {mutateAsync,isPending} = useMutation({
    mutationFn: (qr:string) => articleService.byref(qr),
 });

 const keyar = ['get_article', session!.user.id];

 const {data:articles,isLoading:isLoadingA} = useQuery({ 
   queryKey: keyar, 
   queryFn:() => articleService.getByUser(session!.user.id),
   enabled: !!session
 });

  const formC = useForm({
  initialValues: {
  nom: '',
  tel: '',
  addr: '',
  user: session!.user.id
  },
  validate: yupResolver(schemaC),
});
  const form = useForm<any>({
    mode: 'uncontrolled',
    initialValues: {
      _id:'',
      date: new Date(),
      produits: [],
      montant:0,
      remise:0,
      net_a_payer:0,
      client:'',
      userId:session!.user.id
    },
    validate: yupResolver(schema),
    onValuesChange(values) {
      setTotal(values.produits.reduce((acc: number,cur: { pu: number; qte: number; }) => acc + (cur.pu * cur.qte) ,0))
    },
  });


  const handleRemise = (value: string | number) => {
    setTotal(form.getValues().produits.reduce((acc: number,cur: { pu: number; qte: number; }) => acc + (cur.pu * cur.qte) ,0) - Number(value))
    setRemise(Number(value));
  }

    const {mutate:createVente,isPending:loadingCreate} = useMutation({
    mutationFn: (data: any) => venteService.create(data),
    onSuccess: (data) => {
      toast.success(`Vente cree avec success/ #${data.ref}`);
      close();
      qc.invalidateQueries({queryKey:key});
      navigate(`/dashboard/ventes/${data._id}`);
    }
  });

const {mutate:updateVente,isPending:loadingUpdate} = useMutation({
 mutationFn:(data:{id:string,data:any}) => venteService.update(data.id, data.data),
 onSuccess: () => {
  toast.success(`Vente mise à jour avec success`);
  close();
  qc.invalidateQueries({queryKey:key});
 }
});

const {mutate:deleteVente,isPending:loadingDelete} = useMutation({
    mutationFn: (id:string) => venteService.delete(id),
    onSuccess: () => {
      toast.success(`Vente supprimée avec success`);
      qc.invalidateQueries({queryKey:key});
    }
});

  const confirm = (id: string) => {
    deleteVente(id)
  };
  
  const cancel = () => {
    toast.info("L'action a été annulé !");
  };


  const onCreate = (values:any) => {
    if (values.produits.length === 0) {
      toast.error('Aucun produit ajouté à la vente', {
        icon: '⚠️',
        duration: 3000,
        position: 'top-center'
      });
      return;
    }
    
    if (!values.client) {
      toast.error('Veuillez sélectionner un client', {
        icon: '⚠️',
        duration: 3000,
        position: 'top-center'
      });
      return;
    }

    // Calculer le montant total
    const montant = values.produits.reduce((acc: number,cur: { pu: number; qte: number; }) => acc + (cur.pu * cur.qte) ,0);
    const netAPayer = montant - Number(remise);
    
    // Créer ou mettre à jour la vente
    if(form.getValues()._id === ''){
      const {_id,...rest} = values;
      
      createVente({
        ...rest,
        montant,
        remise: +remise,
        net_a_payer: netAPayer
      })
    } else {
      const {_id,...rest} = values;
      
      updateVente({
        id: _id,
        data: {
          ...rest,
          montant,
          remise: +remise,
          net_a_payer: netAPayer
        }
      })
    }
  }

  const {mutate:createClient,isPending:loadingCreateClient} = useMutation({
    mutationFn: (data: any) => clientService.create(data),
    onSuccess: () => {
     closeA();
     qc.invalidateQueries({queryKey:keyClient});
     form.setFieldValue('client', '');
    }
  });


  const onCreateC = (values:any) => {
    createClient(values);
  }


const handleUpdate  = (data: any) => {
  form.setValues({produits:data.produits,_id:data._id,client:data.client._id});
  setRemise(data?.remise);
  open();
}

const handleCreate  = () => {
  setRemise(0);
  form.reset();
  open();
}



// Fonction pour ouvrir le modal de sélection de format d'impression
const handlePrint = (facture: any) => {
  setSelectedVente(facture);
  setPrintModalOpened(true);
}

// Fonction pour générer et imprimer la facture avec le format sélectionné
const printInvoice = () => {
  if (!selectedVente) return;
  
  // Ajuster les dimensions en fonction du format sélectionné
  const pageSize = selectedFormat;
  const fontSize = selectedFormat === 'A4' ? {
    title: 16,
    subtitle: 14,
    normal: 10,
    small: 8,
    table: 10
  } : {
    title: 14,
    subtitle: 12,
    normal: 9,
    small: 7,
    table: 8
  };
  
  const margins = selectedFormat === 'A4' ? [40, 40, 40, 40] : [20, 20, 20, 20];
  const tableWidths = selectedFormat === 'A4' ? ['8%', '7%','15%', '25%', '20%', '20%'] : ['8%', '7%', '15%', '25%', '20%', '20%'];
  
  const docDefinition: any = {
    pageSize: pageSize,
    pageMargins: margins,
    footer: {text: `Merci d'avoir choisi ${param.nom} à bientôt !!!`, fontSize: fontSize.normal, alignment: 'center'},
    styles: {
      entete: {
        bold: true,
        alignment: 'center',
        fontSize: fontSize.normal,
        color: 'white'
      },
      center: {
        alignment: 'center',
      },
      left: {
        alignment: 'left',
      },
      right: {
        alignment: 'right',
      },
      nombre: {
        alignment: 'right',
        fontSize: fontSize.normal,
        bold: true
      },
      tword: {
        fontSize: fontSize.normal,
        italics: true
      },
      tword1: {
        fontSize: fontSize.subtitle,
        margin: [0, 10, 0, 10]
      },
      info: {
        fontSize: fontSize.normal,
      },
      header3: {
        color: "white",
        fillColor: '#73BFBA',
        bold: true,
        alignment: 'center',
        fontSize: fontSize.small,
      },
      header4: {
        color: "white",
        fillColor: '#73BFBA',
        bold: true,
        alignment: 'right',
        fontSize: fontSize.small
      },
      total: {
        color: "white",
        bold: true,
        fontSize: fontSize.normal,
        fillColor: '#73BFBA',
        alignment: 'center'
      },
      anotherStyle: {
        italics: true,
        alignment: 'right'
      }
    },
    content: [
      {
        columnGap: selectedFormat === 'A4' ? 200 : 150,
        columns: [
          {
            alignment: 'left',
            stack: [
              {image: 'logo', width: selectedFormat === 'A4' ? 80 : 60, alignment: "right"},
              {text: `FACTURE`, fontSize: fontSize.title, bold: true, alignment: "right", margin: [0, 4]},
            ]
          },
          {
            alignment: 'right',
            width: selectedFormat === 'A4' ? 200 : 150,
            table: {
              widths: ['*'],
              body: [
                [{
                  stack: [
                    {text: `${param?.nom}`, fontSize: fontSize.subtitle, bold: true, alignment: "justify", margin: [0, 2]},
                    {text: `${param?.desc}`, fontSize: fontSize.normal, bold: true, alignment: "justify", margin: [0, 2]},
                    {text: `${param?.tel}`, fontSize: fontSize.normal, bold: true, alignment: "justify", margin: [0, 2]},
                  ]
                }],
              ]
            }
          },
        ],
      },
      {
        columnGap: selectedFormat === 'A4' ? 120 : 80,
        columns: [
          {
            alignment: 'left',
            width: selectedFormat === 'A4' ? 200 : 150,
            stack: [
              {text: `CLIENT : `, fontSize: fontSize.normal, bold: true, alignment: "left", margin: [0, 2]},
              {text: `Nom: ${selectedVente?.client.nom}`, fontSize: fontSize.normal, alignment: "left", margin: [0, 2]},
              {text: `Tel: ${selectedVente?.client?.tel}`, fontSize: fontSize.normal, alignment: "left", margin: [0, 2]},
              {text: `Addr: ${selectedVente?.client.addr}`, fontSize: fontSize.normal, alignment: "left", margin: [0, 2]},
            ]
          },
          {
            alignment: 'right',
            width: selectedFormat === 'A4' ? 200 : 150,
            stack: [
              {
                margin: [2, 5],
                fillColor: "#FF5D14",
                alignment: 'left',
                layout: 'noBorders',
                table: {
                  widths: ['100%'],
                  body: [
                    [{text: `N°: ${selectedVente?.ref}`, fontSize: fontSize.subtitle, bold: true, color: 'white', margin: [2, 1]}],
                    [{text: `DATE : ${format(new Date(), 'dd-MM-yyyy')}`, fontSize: fontSize.normal, bold: true, margin: [2, 1], fillColor: '#F1F5F9'}],
                    [{text: `ECHEANCE : ${format(selectedVente.date, 'dd-MM-yyyy')}`, fontSize: fontSize.normal, margin: [2, 1], bold: true, fillColor: '#F1F5F9'}],
                  ]
                }
              },
            ]
          },
        ],
      },
      {
        margin: [0, 10],
        width: '100%',
        alignment: 'justify',
        layout: {
          fillColor: function(rowIndex: number) {
            return (rowIndex === 0) ? '#FF5D14' : null;
          },
          hLineWidth: function() {
            return 1;
          },
          vLineWidth: function() {
            return 1;
          },
          hLineColor: function() {
            return 'black';
          },
          vLineColor: function() {
            return 'black';
          },
        },
        table: {
          widths: tableWidths,
          body: [
            [{text: '#REF', style: 'entete'}, {text: 'Q', style: 'entete'},{text: 'Unit', style: 'entete'}, {text: 'Desc', style: 'entete'},{text: 'Pu', style: 'entete'},  {text: 'Total', style: 'entete'}],
            ...selectedVente?.produits?.map((k: any) => (
              [{text: `${k.ref}`, style: 'info'},
               {text: `${formatN(k.qte)}`, style: 'nombre'},
               {text: `${k.unite}`, style: 'info'},
               {text: `${k.nom}`, style: 'info'},
               {text: `${formatN(k.pu)}`, style: 'nombre'},
               {text: `${formatN(k.pu * k.qte)}`, style: 'nombre'}
              ]
            )),
          ],
        }
      },
      {
        columnGap: selectedFormat === 'A4' ? 120 : 80,
        columns: [
          {},
          {
            alignment: 'right',
            width: selectedFormat === 'A4' ? 300 : 250,
            stack: [
              {
                margin: [2, 5],
                fillColor: "#FF5D14",
                alignment: 'left',
                layout: 'noBorders',
                table: {
                  widths: ['100%'],
                  body: [
                    [{text: `MONTANT : ${formatN(selectedVente?.montant)} FCFA`, fontSize: fontSize.normal, bold: true, margin: [2, 1], fillColor: '#F1F5F9'}],
                    [{text: `REMISE : ${formatN(selectedVente?.remise)} FCFA`, fontSize: fontSize.normal, bold: true, margin: [2, 1], fillColor: '#F1F5F9'}],
                    [{text: `NET A PAYER : ${formatN(selectedVente?.net_a_payer)} FCFA`, fontSize: fontSize.subtitle, color: 'white', margin: [2, 1], bold: true}],
                  ]
                }
              },
            ]
          },
        ],
      },
    ],
    images: {
      logo: `${import.meta.env.VITE_BACKURL}/uploads/${param?.logo}`,
    }
  }

  pdfMake.createPdf(docDefinition).open();
  setPrintModalOpened(false);
}


const filtered = (Vente:any[]) => {
  return Vente?.filter(({ ref,date }) => {
    if (
      debouncedQuery !== '' &&
      !`${ref}`.toLowerCase().includes(debouncedQuery.trim().toLowerCase())
    )
      return false;
      if (
        dateSearchRange &&
        dateSearchRange[0] &&
        dateSearchRange[1] &&
        (isAfter(dateSearchRange[0],date) ||
         isBefore(dateSearchRange[1],date))
      )
        return false;

  
    return true;
  })
}

useEffect(() => {
  if(debouncedQuery === ''){
    if(searchParams.has('page')){
      setPage(parseInt(searchParams.get('page') ?? '1'));
    }else {
      setPage(1);
    }
   }
   else {
    setPage(1);
   }
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE;
  const data = sortBy(ventes, sortStatus.columnAccessor);
  setRecords(sortStatus.direction === 'desc' ? (filtered(data).slice(from, to) ?? []).reverse() : filtered(data).slice(from, to) ?? []);
}, [searchParams,page,ventes,debouncedQuery,dateSearchRange,sortStatus]);


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
      
      // Vérifier le stock
      const stockItem = invs?.find((p: { ref: any; }) => p.ref === ar.ref);
      if (stockItem?.qr <= 0) {
        toast.error(`Produit en rupture de stock: ${ar.nom}`, {
          icon: '⚠️',
          duration: 3000
        });
        return;
      }
      
      // Si le produit existe déjà dans le panier
      const prec = form.getValues().produits.find((v: { ref: any; }) => v?.ref === ar.ref);
      
      if(prec) {
        // Vérifier si l'ajout d'une unité dépasserait le stock disponible
        if (prec.qte + 1 > stockItem.qr) {
          toast.warning(`Limite de stock atteinte pour ${ar.nom}`, {
            icon: '⚠️',
            duration: 3000
          });
          return;
        }
        
        // Augmenter la quantité
        form.setValues({
          produits: form.getValues().produits.map((v: { ref: any; qte: number; }) => {
            if(v.ref === ar.ref) {
              return {...v, qte: v.qte + 1}
            }
            return v;
          })
        });
        
        // Notification de succès
        toast.success(`Quantité de ${ar.nom} augmentée`, { 
          icon: '⬆️',
          duration: 2000
        });
      } else {
        // Ajouter un nouveau produit
        form.insertListItem('produits', { 
          ref: ar.ref, 
          nom: ar.nom, 
          pu: ar.prix, 
          qte: 1, 
          unite: ar.unite.nom 
        });
        
        // Notification de succès
        toast.success(`${ar.nom} ajouté au panier`, { 
          icon: '🛒',
          duration: 2000
        });
      }
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
  
  // Vérifier le stock
  const stockItem = invs?.find((p: { ref: any; }) => p.ref === o.ref);
  if (stockItem?.qr <= 0) {
    toast.error('Quantité insuffisante en stock', {
      icon: '⚠️',
      duration: 3000,
      position: 'top-center'
    });
    return;
  }

  // Animation et feedback pour l'ajout réussi
  const handleSuccessfulAdd = (isNew: boolean) => {
    // Réinitialiser le champ de recherche après l'ajout
    setRef(null);
    
    // Afficher un toast de confirmation
    toast.success(
      isNew ? `${o.nom} ajouté au panier` : `Quantité de ${o.nom} augmentée`, 
      { 
        icon: isNew ? '🛒' : '⬆️',
        duration: 2000, 
        position: 'bottom-right'
      }
    );
  };

  // Vérifier si le produit est déjà dans le panier
  const prec = form.getValues().produits.find((v: { ref: any; }) => v?.ref === o.ref);
  
  if (prec) {
    // Si le produit existe déjà, augmenter la quantité
    const newQty = prec.qte + 1;
    
    // Vérifier si la nouvelle quantité dépasse le stock disponible
    if (newQty > stockItem.qr) {
      toast.warning(`Limite de stock atteinte pour ${o.nom}`, {
        icon: '⚠️',
        duration: 3000
      });
      return;
    }
    
    form.setValues({
      produits: form.getValues().produits.map((v: { ref: any; qte: number; }) => {
        if (v.ref === o.ref) {
          return {...v, qte: newQty}
        }
        return v;
      })
    });
    
    handleSuccessfulAdd(false);
  } else {
    // Ajouter un nouveau produit
    form.insertListItem('produits', { 
      ref: o.ref, 
      nom: o.nom, 
      pu: o.prix, 
      qte: 1, 
      unite: o.unite.nom 
    });
    
    handleSuccessfulAdd(true);
  }
}


const fields = form.getValues().produits.map((item: any, index: number) => {
  const stockQuantity = invs?.find((p: { ref: any; }) => p.ref === item.ref)?.qr || 0;
  const isStockLow = item.qte >= stockQuantity;
  
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
            max={stockQuantity}
            min={1}
            style={{ flex: 1}}
            classNames={{
              input: isStockLow 
                ? 'bg-red-50 text-red-700 font-medium rounded-md border-red-200 pl-7 pr-7' 
                : 'rounded-md border-slate-200 dark:border-slate-700 font-medium pl-7 pr-7 text-center',
              wrapper: "shadow-sm",
            }}
            key={form.key(`produits.${index}.qte`)}
            {...form.getInputProps(`produits.${index}.qte`)}
            rightSection={
              <div className="text-xs text-slate-500 pr-2">{item.unite}</div>
            }
          />
          
          <ActionIcon
            size="xs"
            variant="subtle"
            color="blue"
            onClick={() => {
              if (item.qte < stockQuantity) {
                const newQty = item.qte + 1;
                form.setFieldValue(`produits.${index}.qte`, newQty);
              } else {
                toast.warning(`Stock maximum atteint pour cet article`, {
                  duration: 2000
                });
              }
            }}
            className="absolute right-9 top-1 z-10 mr-1"
            disabled={item.qte >= stockQuantity}
          >
            <span className="font-bold">+</span>
          </ActionIcon>
        </div>
        
        {isStockLow && (
          <div className="absolute -bottom-4 left-0 w-full text-center">
            <Text size="xs" className="text-red-500">{`Stock: ${stockQuantity}`}</Text>
          </div>
        )}
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
})

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen p-4">
      <LoadingOverlay
         visible={loadingDelete || isLoadingA || loadingCreate || isLoadingP || isLoadingI || loadingCreateClient }
         zIndex={1000}
         overlayProps={{ radius: 'sm', blur: 2 }}
         loaderProps={{ color: '#FF5D14', type: 'dots' }}
       />
     <div className="mt-2">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <Text size="xs" fw={500} className="text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Gestion des ventes
          </Text>
          <Text size="xl" fw={700} className="text-slate-800 dark:text-white">
            Mes Ventes
          </Text>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            bg="#FF5D14" 
            leftSection={<AiOutlinePlus className="h-5 w-5 text-white"/>} 
            onClick={handleCreate}
            className="shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            radius="xl"
          >
            Nouvelle vente
          </Button>
        </div>
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
               {ventes?.length || 0} ventes
             </Text>
           </div>
           <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/30 px-3 py-2 rounded-lg">
             <FaMoneyBillWave size={14} className="text-orange-500" />
             <Text size="xs" className="text-orange-600 dark:text-orange-300">
                {formatN(ventes?.reduce((acc: number, cur: { net_a_payer: number }) => acc + cur.net_a_payer, 0) || 0)} FCFA
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
            <div className="bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md text-blue-600 dark:text-blue-300 font-medium text-sm">
              {data.ref}
            </div>
          )
        },
        { 
          accessor: 'Date',
          title: <Text fw={600} size="sm">Date</Text>,
          textAlign: 'center', 
          render: ({date}) => (
            <div className="flex items-center justify-center gap-2">
              <FaRegCalendarAlt size={14} className="text-slate-400" />
              <Text size="sm">{format(date,'dd/MM/yyyy')}</Text>
            </div>
          ),
          sortable: true,
          filter: ({ close }) => (
            <Stack p="md">
              <Text fw={500} size="sm" className="mb-2">Filtrer par période</Text>
              <DatePicker
                maxDate={add(new Date(),{days:1})}
                type="range"
                value={dateSearchRange}
                onChange={setDateSearchRange}
              />
              <Button
                disabled={!dateSearchRange}
                variant="light"
                color="blue"
                onClick={() => {
                  setDateSearchRange(undefined);
                  close();
                }}
              >
                Effacer
              </Button>
            </Stack>
          ),
          filtering: Boolean(dateSearchRange),
        },
        { 
          accessor: 'montant', 
          title: <Text fw={600} size="sm">Montant</Text>,
          textAlign: 'center',
          render: (data:any) => (
            <Text fw={500} className="text-slate-700 dark:text-slate-300">
              {formatN(data?.montant)} FCFA
            </Text>
          ),
          sortable: true,
          footer: (
            <Group gap="xs" className="flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 py-2 rounded-md">
              <Box mb={-4}>
                <TbSum size={20} className="text-blue-500" />
              </Box>
              <div className="font-semibold text-blue-600 dark:text-blue-400">
                <NumberFormatter thousandSeparator="." decimalSeparator="," value={records.reduce((acc,cur) => acc + cur.montant,0)} suffix=' FCFA' />
              </div>
            </Group>
          ),
        },
        { 
          accessor: 'remise', 
          title: <Text fw={600} size="sm">Remise</Text>,
          textAlign: 'center',
          render: (data:any) => (
            <div className="flex items-center justify-center gap-2">
              <TbDiscount size={14} className="text-orange-500" />
              <Text fw={500} className="text-orange-600 dark:text-orange-400">
                {formatN(data?.remise)} FCFA
              </Text>
            </div>
          ),
          sortable: true,
          footer: (
            <Group gap="xs" className="flex items-center justify-center bg-orange-50 dark:bg-orange-900/30 py-2 rounded-md">
              <Box mb={-4}>
                <TbSum size={20} className="text-orange-500" />
              </Box>
              <div className="font-semibold text-orange-600 dark:text-orange-400">
                <NumberFormatter thousandSeparator="." decimalSeparator="," value={records.reduce((acc,cur) => acc + cur.remise,0)} suffix=' FCFA' />
              </div>
            </Group>
          ),
        },
        { 
          accessor: 'net_a_payer', 
          title: <Text fw={600} size="sm">Net à payer</Text>,
          textAlign: 'center',
          render: (data:any) => (
            <Text fw={700} className="text-teal-600 dark:text-teal-400">
              {formatN(data?.net_a_payer)} FCFA
            </Text>
          ),
          sortable: true,
          footer: (
            <Group gap="xs" className="flex items-center justify-center bg-teal-50 dark:bg-teal-900/30 py-2 rounded-md">
              <Box mb={-4}>
                <TbSum size={20} className="text-teal-500" />
              </Box>
              <div className="font-semibold text-teal-600 dark:text-teal-400">
                <NumberFormatter thousandSeparator="." decimalSeparator="," value={records.reduce((acc,cur) => acc + cur.net_a_payer,0)} suffix=' FCFA' />
              </div>
            </Group>
          ),
        },
        { 
          accessor: 'produits', 
          title: <Text fw={600} size="sm">Produits</Text>,
          textAlign: 'center',
          render: (data:any) => (
            <Group justify="center">
              <HoverCard width={450} shadow="md" position="bottom" withArrow>
                <HoverCard.Target>
                  <Button 
                    variant="subtle" 
                    color="orange" 
                    size="xs"
                    leftSection={<FaCartShopping size={14} />}
                    className="px-2 py-1 rounded-full"
                  >
                    {data.produits.length} article{data.produits.length > 1 ? 's' : ''}
                  </Button>
                </HoverCard.Target>
                <HoverCard.Dropdown className="p-0 overflow-hidden">
                  <div className="bg-orange-50 dark:bg-orange-900/30 p-2 border-b border-orange-100 dark:border-orange-800">
                    <Text fw={600} size="sm" className="text-orange-700 dark:text-orange-300">
                      Détails des produits
                    </Text>
                  </div>
                  <Table highlightOnHover>
                    <Table.Thead className="bg-gradient-to-r from-[#FF5D14] to-[#FF7A40] text-white">
                      <Table.Tr>
                        <Table.Th className="text-white">N°</Table.Th>
                        <Table.Th className="text-white">Référence</Table.Th>
                        <Table.Th className="text-white">Description</Table.Th>
                        <Table.Th className="text-white">Qté</Table.Th>
                        <Table.Th className="text-white">Prix</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {data.produits.map((el:any, i: number) => (
                        <Table.Tr key={el.ref} className={i % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-700'}>
                          <Table.Td>{i+1}</Table.Td>
                          <Table.Td>
                            <div className="bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md text-blue-600 dark:text-blue-300 text-xs">
                              {el.ref}
                            </div>
                          </Table.Td>
                          <Table.Td>{el.nom}</Table.Td>
                          <Table.Td className="font-medium">{el.qte}</Table.Td>
                          <Table.Td className="font-medium">{formatN(el.pu)} FCFA</Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </HoverCard.Dropdown>
              </HoverCard>
            </Group>
          ),
        },
        {
          accessor: 'actions',
          title: <Text fw={600} size="sm">Actions</Text>,
          textAlign: 'center',
          render: (rowData:any) => (
            <Group justify="center" gap={8}>
              <Tooltip label="Voir les détails" position="top" withArrow transitionProps={{ transition: 'pop' }}>
                <ActionIcon 
                  variant="light" 
                  color="blue" 
                  onClick={() => navigate(`/dashboard/ventes/${rowData._id}`)}
                  className="shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <FaEye size={14} />
                </ActionIcon>
              </Tooltip>
              
              <Tooltip label="Imprimer la facture" position="top" withArrow transitionProps={{ transition: 'pop' }}>
                <Button 
                  size="xs" 
                  variant="light" 
                  color="orange" 
                  onClick={() => handlePrint(rowData)} 
                  leftSection={<FaPrint size={14} />}
                  className="shadow-sm hover:shadow-md transition-all duration-200"
                >
                  Facture
                </Button>
              </Tooltip>
              
              <Tooltip label="Modifier" position="top" withArrow transitionProps={{ transition: 'pop' }}>
                <ActionIcon 
                  variant="light" 
                  color="green" 
                  onClick={() => handleUpdate(rowData)}
                  className="shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <BsFillPenFill size={14} />
                </ActionIcon>
              </Tooltip>
              
              <Popover width={220} position="bottom" withArrow shadow="md">
                <Popover.Target>
                  <Tooltip label="Supprimer" position="top" withArrow transitionProps={{ transition: 'pop' }}>
                    <ActionIcon 
                      variant="light" 
                      color="red"
                      className="shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <FaTrash size={14} />
                    </ActionIcon>
                  </Tooltip>
                </Popover.Target>
                <Popover.Dropdown>
                  <div className="flex flex-col gap-3">
                    <Text size="sm" fw={500} className="text-slate-700 dark:text-slate-300">
                      Êtes-vous sûr de vouloir supprimer cette vente ?
                    </Text>
                    <div className="flex justify-between gap-2">
                      <Button 
                        variant="light" 
                        color="red" 
                        onClick={() => confirm(rowData?._id)}
                        fullWidth
                      >
                        Confirmer
                      </Button>
                      <Button 
                        variant="subtle" 
                        color="gray" 
                        onClick={cancel}
                        fullWidth
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
      striped={true}
      stripedColor="rgba(255, 93, 20, 0.05)"
      style={{
        fontWeight: 'normal',
      }}
      fetching={isLoading}
      loaderSize="sm"
      loaderColor="#FF5D14"
      loadingText="Chargement des données..."
      emptyState={
        <div className="flex flex-col items-center justify-center py-10">
          <img src="/img/empty.png" alt="Aucune donnée" className="w-32 h-32 mb-4 opacity-60" />
          <Text size="sm" fw={500} className="text-slate-500 dark:text-slate-400">
            Aucune vente trouvée
          </Text>
        </div>
      }
      totalRecords={filtered(ventes)?.length}
      recordsPerPage={10}
      page={page}
      onPageChange={(p) => {
        setSearchParams({'page': p.toString()});
        setPage(p);
      }}
      sortStatus={sortStatus}
      onSortStatusChange={setSortStatus}
      sortIcons={{
        sorted: <FaSortAlphaDownAlt size={14} className="text-blue-500" />,
        unsorted: <FaSortAlphaDown size={14} className="text-slate-400" />,
      }}
      borderRadius="lg"
      shadow="sm"
      horizontalSpacing="md"
      verticalSpacing="md"
      verticalAlign="top"
      highlightOnHover={true}
      paginationActiveBackgroundColor="#FF5D14"
      paginationSize="sm"
      bodyRef={bodyRef}
      className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg"
    />
     </>
     
     </WeeklyRevenue>
   </div>

   <Modal 
     closeOnClickOutside={false} 
     opened={opened} 
     onClose={close} 
     title={
       <Text size="lg" fw={700} className="text-slate-800 dark:text-white">
         {form.getValues()._id ? 'Modifier la vente' : 'Nouvelle vente'}
       </Text>
     } 
     size="xl"
     overlayProps={{
       blur: 3,
       opacity: 0.55,
     }}
     centered
   >
   <LoadingOverlay
         visible={loadingCreate || isPending || loadingUpdate}
         zIndex={1000}
         overlayProps={{ radius: 'sm', blur: 2 }}
         loaderProps={{ color: '#FF5D14', type: 'dots' }}
       />
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
             <Select 
               showSearch  
               optionFilterProp="label"
               filterSort={(optionA, optionB) =>
                 `${optionA.label}`.toLowerCase().localeCompare(`${optionB.label}`.toLowerCase())}
               className="w-full" 
               options={articles?.map((v: {nom:string;_id: string;ref: string; prix: number; unite: any;}) => ({
                 label: `${v.nom} / ${v.ref}`,
                 value: JSON.stringify(v),
                 disabled: invs?.find((p: { ref: any; }) => p.ref === v.ref)?.qr <= 0
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
                       <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span> En stock
                       <span className="inline-block w-3 h-3 rounded-full bg-red-500 ml-3 mr-1"></span> Rupture de stock
                     </Text>
                   </div>
                 </div>
               )}
               optionRender={(option) => {
                 // S'assurer que option.value est défini avant de le parser
                 const parsedValue = option.value ? JSON.parse(option.value as string) : null;
                 const isInStock = parsedValue ? invs?.find((p: { ref: any; }) => p.ref === parsedValue.ref)?.qr > 0 : false;
                 return (
                   <div className="flex justify-between items-center w-full px-1">
                     <span>{option.label}</span>
                     {!isInStock && (
                       <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                         Rupture
                       </span>
                     )}
                     {isInStock && (
                       <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded">
                         En stock
                       </span>
                     )}
                   </div>
                 );
               }}
             />
             <div className="flex justify-between items-center mt-1">
               <Text size="xs" className="text-slate-500 dark:text-slate-400">
                 Scannez un code-barres ou sélectionnez un produit dans la liste
               </Text>
               <Text size="xs" className="text-blue-600 dark:text-blue-400">
                 Raccourci: Alt+A pour rechercher
               </Text>
             </div>
           </div>
           
           <div className="w-full md:w-1/3">
             <div className="flex items-center gap-2 mb-2">
               <TbDiscount size={16} className="text-orange-500" />
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
             />
           </div>
         </div>
         
         <div className="h-px w-full bg-slate-100 dark:bg-slate-700 my-4"></div>
        
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
              Informations client
            </Text>
          </div>
          <Button 
            variant="light" 
            color="orange" 
            leftSection={<FaPlus className="h-4 w-4"/>} 
            onClick={openA}
            size="xs"
            className="shadow-sm hover:shadow-md transition-all duration-200"
          >
            Nouveau client
          </Button>
        </div>
        
        <Select
          placeholder="Sélectionner un client"
          options={clients?.map((v: { tel: any; nom: any; addr: any;_id:string }) => ({
            label: `${v.nom} ${v.tel ? `/ ${v.tel}` : ''} ${v.addr ? `/ ${v.addr}` : ''}`,
            value: v._id
          }))}
          {...form.getInputProps('client')}
          loading={isLoadingClient}
          showSearch
          optionFilterProp="label"
          filterSort={(optionA, optionB) =>
            `${optionA.label}`.toLowerCase().localeCompare(`${optionB.label}`.toLowerCase())}
          className="w-full mb-2"
          style={{ borderRadius: '0.5rem' }}
        />
        
        <Text size="xs" className="text-slate-500 dark:text-slate-400">
          Sélectionnez un client existant ou créez-en un nouveau
        </Text>
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
          
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
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
                {formatN(total-remise)} FCFA
              </Text>
            </div>
          </div>
          
          <Button 
            type="submit" 
            bg="#FF5D14" 
            loading={loadingCreate || loadingUpdate}
            size="md"
            className="shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-bold"
            leftSection={<FaRegCircleCheck size={16} />}
            rightSection={<div className="text-xs opacity-70">Alt+E</div>}
            fullWidth
          >
            {form.getValues()._id ? 'Mettre à jour la vente' : 'Enregistrer la vente'}
          </Button>
        </div>
      </div>
       </div>
     </form>
   </Modal>



   <Drawer 
     opened={openedA} 
     onClose={closeA} 
     title={
       <Text size="lg" fw={700} className="text-slate-800 dark:text-white">
         Nouveau Client
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
       visible={loadingCreateClient}
       zIndex={1000}
       overlayProps={{ radius: 'sm', blur: 2 }}
       loaderProps={{ color: '#FF5D14', type: 'dots' }}
     />
     
     <form onSubmit={formC.onSubmit(onCreateC)} className="space-y-4">
       <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
         <Text fw={500} size="sm" className="text-slate-600 dark:text-slate-300 mb-4 flex items-center gap-2">
           <FaUser size={14} className="text-orange-500" />
           Informations du client
         </Text>
         
         <TextInput
           label="Nom"
           placeholder="Nom du client"
           required
           {...formC.getInputProps('nom')}
           classNames={{
             input: "rounded-md border-slate-200 dark:border-slate-700",
             wrapper: "shadow-sm mb-3"
           }}
         />
         
         <TextInput
           label="Téléphone"
           placeholder="Numéro de téléphone"
           {...formC.getInputProps('tel')}
           classNames={{
             input: "rounded-md border-slate-200 dark:border-slate-700",
             wrapper: "shadow-sm mb-3"
           }}
         />
         
         <TextInput
           label="Adresse"
           placeholder="Adresse du client"
           {...formC.getInputProps('addr')}
           classNames={{
             input: "rounded-md border-slate-200 dark:border-slate-700",
             wrapper: "shadow-sm mb-3"
           }}
         />

         <Button 
           type="submit" 
           bg="#FF5D14" 
           loading={loadingCreateClient}
           className="shadow-md hover:shadow-lg transition-all duration-200 mt-4 w-full"
           leftSection={<FaRegCircleCheck size={16} />}
         >
           Enregistrer le client
         </Button>
       </div>
     </form>
   </Drawer>

   {/* Modal pour la sélection du format d'impression */}
   <Modal
     opened={printModalOpened}
     onClose={() => setPrintModalOpened(false)}
     title={
       <Text size="lg" fw={700} className="text-slate-800 dark:text-white">
         Format d'impression
       </Text>
     }
     size="sm"
     centered
   >
     <div className="space-y-4">
       <Text size="sm" className="text-slate-600 dark:text-slate-300">
         Veuillez sélectionner le format de papier pour l'impression de la facture :
       </Text>
       
       <div className="space-y-2">
         <Radio.Group
           value={selectedFormat}
           onChange={(value: string) => setSelectedFormat(value as 'A4' | 'A5')}
           name="formatPaper"
           className="space-y-2"
         >
           <div className="p-3 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
             <Radio value="A4" label={
               <div className="ml-2">
                 <Text size="sm" fw={500}>Format A4</Text>
                 <Text size="xs" color="dimmed">210 × 297 mm - Format standard</Text>
               </div>
             } />
           </div>
           
           <div className="p-3 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
             <Radio value="A5" label={
               <div className="ml-2">
                 <Text size="sm" fw={500}>Format A5</Text>
                 <Text size="xs" color="dimmed">148 × 210 mm - Format moyen</Text>
               </div>
             } />
           </div>
         </Radio.Group>
       </div>
       
       <div className="flex justify-end gap-3 mt-4">
         <Button variant="subtle" color="gray" onClick={() => setPrintModalOpened(false)}>
           Annuler
         </Button>
         <Button 
           className="bg-orange-500 hover:bg-orange-600"
           onClick={printInvoice}
           leftSection={<FaPrint size={14} />}
         >
           Imprimer
         </Button>
       </div>
     </div>
   </Modal>
    </div>
  )
}

export default Ventes