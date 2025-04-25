import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "react-router-dom"
import { InventoryService } from "../../services/Inventory.service";
import { Badge, Box, Button, Group, LoadingOverlay, Text, Stack } from "@mantine/core";
import { add, format, isAfter, isBefore } from "date-fns";
import { DataTable } from "mantine-datatable";
import { useEffect, useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import { Input } from "antd";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { sortBy } from "lodash";
import { DatePicker } from "@mantine/dates";
import { TbSum } from "react-icons/tb";
import { FaSortAlphaDown, FaSortAlphaDownAlt, FaSearch, FaShoppingCart, FaCalendarAlt, FaBoxOpen, FaBoxes } from "react-icons/fa";
import { formatN } from "../../lib/helpers";
import { authclient } from '../../../lib/auth-client';
const PAGE_SIZE = 10;

function Inventori() {
    const {id} = useParams();
    const { data: session } = authclient.useSession() 
    const [query1, setQuery1] = useState('');
  const [debouncedQuery1] = useDebouncedValue(query1, 200);
  const [page1, setPage1] = useState(1);
  const [records1, setRecords1] = useState<any>([]);
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebouncedValue(query, 200);
  const [page, setPage] = useState(1);
  const [dateSearchRange, setDateSearchRange] = useState<any>();
  const [bodyRef] = useAutoAnimate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortStatus, setSortStatus] = useState<any>({
      columnAccessor: 'type',
      direction: 'asc',
    });
    const [dateSearchRange1, setDateSearchRange1] = useState<any>();
  const [bodyRef1] = useAutoAnimate();
  const [searchParams1, setSearchParams1] = useSearchParams();
  const [sortStatus1, setSortStatus1] = useState<any>({
      columnAccessor: 'type',
      direction: 'asc',
    });
  const [records, setRecords] = useState<any>([]);
    const inventoryService = new InventoryService();
    const key  = ['get_inventory',id];
    const {data,isLoading} = useQuery({ queryKey: key, queryFn:() => inventoryService.getOneByUser(session!.user.id,id!) });

    const filtered = (DATA:any[] = []) => {
        return DATA?.filter(({ ref,date }) => {
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
        if(debouncedQuery1 === ''){
          if(searchParams1.has('page')){
            setPage1(parseInt(searchParams1.get('page') ?? '1'));
          }else {
            setPage1(1);
          }
         }
         else {
          setPage1(1);
         }
        const from1 = (page1 - 1) * PAGE_SIZE;
        const to1 = from1 + PAGE_SIZE;
        const d = sortBy(data?.ventes, sortStatus1.columnAccessor);
        setRecords1(sortStatus1.direction === 'desc' ? (filtered(d).slice(from1, to1) ?? []).reverse() : filtered(d).slice(from1, to1) ?? []);
      }, [searchParams1,page1,data?.ventes,debouncedQuery1,dateSearchRange1,sortStatus1]);

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
        setRecords(filtered(data?.achats).slice(from, to) ?? []);
      }, [searchParams,page,data?.achats,debouncedQuery,dateSearchRange,sortStatus]);
    


  return (
    <div className="relative">
      <LoadingOverlay 
        visible={isLoading}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
        loaderProps={{ color: '#FF5D14', type: 'dots' }}
      />
      
      <div className="mt-2">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Détails d'Inventaire</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Mouvements et historique du produit {data?.ref}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-full">
              <FaShoppingCart size={20} className="text-orange-500" />
            </div>
            <Text fw={600} size="lg" className="text-slate-800 dark:text-white">Historique des Ventes</Text>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <div className="relative w-full md:w-1/3">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400 dark:text-gray-600" />
              </div>
              <Input 
                value={query1} 
                onChange={(e) => setQuery1(e.currentTarget.value)} 
                placeholder="Rechercher une vente..." 
                className="pl-10 border-slate-200 dark:border-slate-700 rounded-lg" 
              />
            </div>
          </div>
          <DataTable
            columns={[
              { 
                accessor: 'n', 
                title: <Text fw={600} size="sm">N°</Text>,
                textAlign: 'center',
                render: (data: any) => (
                  <Badge color="blue" size="sm" variant="light">
                    {data.n}
                  </Badge>
                )
              },
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
                accessor: 'Date', 
                title: <Text fw={600} size="sm" className="flex items-center gap-1"><FaCalendarAlt size={12} className="text-blue-500" /> Date</Text>,
                textAlign: 'center',
                sortable: true,
                render: ({date}) => (
                  <Text fw={500} className="text-slate-600 dark:text-slate-400">
                    {format(date, 'eeee dd/MM/yyyy')}
                  </Text>
                ),
                filter: ({ close }) => (
                  <Stack className="p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg">
                    <Text size="sm" fw={500} className="text-slate-700 dark:text-slate-300 mb-2">
                      Filtrer par période
                    </Text>
                    <DatePicker
                      maxDate={add(new Date(), {days: 1})}
                      type="range"
                      value={dateSearchRange1}
                      onChange={setDateSearchRange1}
                      className="mb-2"
                    />
                    <Button
                      disabled={!dateSearchRange1}
                      variant="light"
                      color="blue"
                      onClick={() => {
                        setDateSearchRange1(undefined);
                        close();
                      }}
                      className="w-full"
                    >
                      Effacer le filtre
                    </Button>
                  </Stack>
                ),
                filtering: Boolean(dateSearchRange1)
              },
              { 
                accessor: 'qte', 
                title: <Text fw={600} size="sm">Quantité</Text>,
                textAlign: 'center',
                sortable: true,
                render: (data: any) => (
                  <Text fw={600} className="text-orange-600 dark:text-orange-400">
                    {data.qte}
                  </Text>
                ),
                footer: (
                  <Group gap="xs" className="flex items-center justify-center bg-orange-50 dark:bg-orange-900/20 py-2 rounded-md">
                    <Box mb={-4}>
                      <TbSum size={20} className="text-orange-600 dark:text-orange-400" />
                    </Box>
                    <Text fw={700} size="sm" className="text-orange-600 dark:text-orange-400">
                      {records1.reduce((acc: any, cur: { qte: any; }) => acc + cur.qte, 0)} pièces
                    </Text>
                  </Group>
                )
              },
              { 
                accessor: 'montant', 
                title: <Text fw={600} size="sm">Montant</Text>,
                textAlign: 'center',
                sortable: true,
                render: (data: any) => (
                  <Text fw={600} className="text-green-600 dark:text-green-400">
                    {formatN(data?.montant)} FCFA
                  </Text>
                ),
                footer: (
                  <Group gap="xs" className="flex items-center justify-center bg-green-50 dark:bg-green-900/20 py-2 rounded-md">
                    <Box mb={-4}>
                      <TbSum size={20} className="text-green-600 dark:text-green-400" />
                    </Box>
                    <Text fw={700} size="sm" className="text-green-600 dark:text-green-400">
                      {formatN(records1.reduce((acc: any, cur: { montant: any; }) => acc + cur.montant, 0))} FCFA
                    </Text>
                  </Group>
                )
              }
            ]}
            records={records1}
            idAccessor="_id"
            fetching={isLoading}
            emptyState={
              <div className="flex flex-col items-center justify-center py-12">
                <FaBoxOpen size={48} className="text-slate-300 mb-4" />
                <Text c="dimmed" ta="center" size="sm">
                  Aucune vente trouvée
                </Text>
              </div>
            }
            totalRecords={filtered(data?.ventes)?.length}
            recordsPerPage={10}
            page={page1}
            onPageChange={(p) => {
              setSearchParams1({'page': p.toString()});
              setPage1(p);
            }}
            sortStatus={sortStatus1}
            onSortStatusChange={setSortStatus1}
            sortIcons={{
              sorted: <FaSortAlphaDownAlt size={14} className="text-blue-500" />,
              unsorted: <FaSortAlphaDown size={14} className="text-slate-400" />,
            }}
            className="border-none shadow-none"
            rowClassName={() => "hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors duration-150"}
            paginationActiveBackgroundColor="#FF5D14"
            bodyRef={bodyRef1}
          />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 mt-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-full">
              <FaBoxes size={20} className="text-blue-500" />
            </div>
            <Text fw={600} size="lg" className="text-slate-800 dark:text-white">Historique des Approvisionnements</Text>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <div className="relative w-full md:w-1/3">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400 dark:text-gray-600" />
              </div>
              <Input 
                value={query} 
                onChange={(e) => setQuery(e.currentTarget.value)} 
                placeholder="Rechercher un approvisionnement..." 
                className="pl-10 border-slate-200 dark:border-slate-700 rounded-lg" 
              />
            </div>
          </div>
          <DataTable
            columns={[
              { 
                accessor: 'n', 
                title: <Text fw={600} size="sm">N°</Text>,
                textAlign: 'center',
                render: (data: any) => (
                  <Badge color="indigo" size="sm" variant="light">
                    {data.n}
                  </Badge>
                )
              },
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
                accessor: 'Date', 
                title: <Text fw={600} size="sm" className="flex items-center gap-1"><FaCalendarAlt size={12} className="text-indigo-500" /> Date</Text>,
                textAlign: 'center',
                sortable: true,
                render: ({date}) => (
                  <Text fw={500} className="text-slate-600 dark:text-slate-400">
                    {format(date, 'eeee dd/MM/yyyy')}
                  </Text>
                ),
                filter: ({ close }) => (
                  <Stack className="p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg">
                    <Text size="sm" fw={500} className="text-slate-700 dark:text-slate-300 mb-2">
                      Filtrer par période
                    </Text>
                    <DatePicker
                      maxDate={add(new Date(), {days: 1})}
                      type="range"
                      value={dateSearchRange}
                      onChange={setDateSearchRange}
                      className="mb-2"
                    />
                    <Button
                      disabled={!dateSearchRange}
                      variant="light"
                      color="indigo"
                      onClick={() => {
                        setDateSearchRange(undefined);
                        close();
                      }}
                      className="w-full"
                    >
                      Effacer le filtre
                    </Button>
                  </Stack>
                ),
                filtering: Boolean(dateSearchRange)
              },
              { 
                accessor: 'qte', 
                title: <Text fw={600} size="sm">Quantité</Text>,
                textAlign: 'center',
                sortable: true,
                render: (data: any) => (
                  <Text fw={600} className="text-indigo-600 dark:text-indigo-400">
                    {data.qte}
                  </Text>
                ),
                footer: (
                  <Group gap="xs" className="flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/20 py-2 rounded-md">
                    <Box mb={-4}>
                      <TbSum size={20} className="text-indigo-600 dark:text-indigo-400" />
                    </Box>
                    <Text fw={700} size="sm" className="text-indigo-600 dark:text-indigo-400">
                      {records.reduce((acc: any, cur: { qte: any; }) => acc + cur.qte, 0)} pièces
                    </Text>
                  </Group>
                )
              },
              { 
                accessor: 'montant', 
                title: <Text fw={600} size="sm">Montant</Text>,
                textAlign: 'center',
                sortable: true,
                render: (data: any) => (
                  <Text fw={600} className="text-blue-600 dark:text-blue-400">
                    {formatN(data?.montant)} FCFA
                  </Text>
                ),
                footer: (
                  <Group gap="xs" className="flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 py-2 rounded-md">
                    <Box mb={-4}>
                      <TbSum size={20} className="text-blue-600 dark:text-blue-400" />
                    </Box>
                    <Text fw={700} size="sm" className="text-blue-600 dark:text-blue-400">
                      {formatN(records.reduce((acc: any, cur: { montant: any; }) => acc + cur.montant, 0))} FCFA
                    </Text>
                  </Group>
                )
              }
            ]}
            records={records}
            idAccessor="_id"
            fetching={isLoading}
            emptyState={
              <div className="flex flex-col items-center justify-center py-12">
                <FaBoxOpen size={48} className="text-slate-300 mb-4" />
                <Text c="dimmed" ta="center" size="sm">
                  Aucun approvisionnement trouvé
                </Text>
              </div>
            }
            totalRecords={filtered(data?.achats)?.length}
            recordsPerPage={10}
            page={page}
            onPageChange={(p) => {
              setSearchParams({'page': p.toString()});
              setPage(p);
            }}
            sortStatus={sortStatus}
            onSortStatusChange={setSortStatus}
            sortIcons={{
              sorted: <FaSortAlphaDownAlt size={14} className="text-indigo-500" />,
              unsorted: <FaSortAlphaDown size={14} className="text-slate-400" />,
            }}
            className="border-none shadow-none"
            rowClassName={() => "hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors duration-150"}
            paginationActiveBackgroundColor="#FF5D14"
            bodyRef={bodyRef}
          />
        </div>
      </div>
    </div>
  )
}

export default Inventori