import { useQuery } from "@tanstack/react-query";
import { InventoryService } from "../../services/Inventory.service";
import { Badge, Box, Button, Group, HoverCard, LoadingOverlay, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { Input, Tooltip } from "antd";
import { DataTable } from "mantine-datatable";
import { useDebouncedValue } from "@mantine/hooks";
import { FaEye, FaSortAlphaDown, FaSortAlphaDownAlt, FaSearch, FaBoxOpen, FaArrowUp, FaArrowDown, FaWarehouse } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { sortBy } from "lodash";
import { TbSum } from "react-icons/tb";
import { authclient } from '../../../lib/auth-client';
import { formatN } from "../../lib/helpers";

const PAGE_SIZE = 10;

function Inventory() {
  const { data: session } = authclient.useSession() 
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebouncedValue(query, 200);
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState<any>([]);
  const [bodyRef] = useAutoAnimate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortStatus, setSortStatus] = useState<any>({
      columnAccessor: 'type',
      direction: 'asc',
    });
  const navigate = useNavigate();
  const inventoryService = new InventoryService();
  const key = ['get_inventory'];
  const {data:invs,isLoading} = useQuery({ queryKey: key, queryFn:() => inventoryService.getByUser(session!.user.id), enabled: !!session })

  const filtered = (Achat:any[] = []) => {
    return Achat?.filter(({ ref }) => {
      if (
        debouncedQuery !== '' &&
        !`${ref}`.toLowerCase().includes(debouncedQuery.trim().toLowerCase())
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
    const data = sortBy(invs, sortStatus.columnAccessor);
  setRecords(sortStatus.direction === 'desc' ? (filtered(data).slice(from, to) ?? []).reverse() : filtered(data).slice(from, to) ?? []);
  }, [searchParams,page,invs,debouncedQuery,sortStatus]);
  

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
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Inventaire</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Suivez vos stocks et mouvements de produits</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-full">
                <FaWarehouse size={24} className="text-blue-500" />
              </div>
              <div>
                <Text size="xs" className="text-slate-500 dark:text-slate-400">Valeur du stock</Text>
                <Text size="xl" fw={700} className="text-slate-800 dark:text-white">
                  {formatN(invs?.reduce((acc: any, cur: { mr: any; }) => acc + cur.mr, 0) || 0)} FCFA
                </Text>
              </div>
            </div>

            <div className="relative w-full md:w-1/3">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400 dark:text-gray-600" />
              </div>
              <Input 
                value={query} 
                onChange={(e) => setQuery(e.currentTarget.value)} 
                placeholder="Rechercher par référence..." 
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
                accessor: 'qa', 
                title: <Text fw={600} size="sm" className="flex items-center gap-1"><FaArrowDown size={12} className="text-green-500" /> Entrant</Text>,
                textAlign: 'center',
                render: (data: any) => (
                  <Text fw={500} className="text-green-600 dark:text-green-400">
                    {data.qa}
                  </Text>
                )
              },
              { 
                accessor: 'qv', 
                title: <Text fw={600} size="sm" className="flex items-center gap-1"><FaArrowUp size={12} className="text-red-500" /> Sortant</Text>,
                textAlign: 'center',
                render: (data: any) => (
                  <Text fw={500} className="text-red-600 dark:text-red-400">
                    {data.qv}
                  </Text>
                )
              },
              { 
                accessor: 'qr', 
                title: <Text fw={600} size="sm">Stock Restant</Text>,
                textAlign: 'center',
                sortable: true,
                render: (row: any) => (
                  <div className="flex items-center justify-center">
                    <HoverCard width={200} shadow="md" withArrow openDelay={200} closeDelay={100}>
                      <HoverCard.Target>
                        <Badge 
                          color={row.stock_seuil >= row.qr ? 'red' : row.stock_seuil + 5 >= row.qr ? 'yellow': 'teal'} 
                          size="lg" 
                          className="cursor-pointer transition-transform hover:scale-110 duration-200"
                        >
                          {row?.qr}
                        </Badge>
                      </HoverCard.Target>
                      <HoverCard.Dropdown className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                        <div className="p-2">
                          <Text fw={600} size="sm" className="text-slate-800 dark:text-white mb-2">Information de stock</Text>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="text-slate-500 dark:text-slate-400">Seuil d'alerte:</div>
                            <div className="text-slate-700 dark:text-slate-300 font-medium">{row.stock_seuil}</div>
                            <div className="text-slate-500 dark:text-slate-400">Statut:</div>
                            <div className={`font-medium ${row.stock_seuil >= row.qr ? 'text-red-600 dark:text-red-400' : row.stock_seuil + 5 >= row.qr ? 'text-yellow-600 dark:text-yellow-400': 'text-teal-600 dark:text-teal-400'}`}>
                              {row.stock_seuil >= row.qr ? 'Critique' : row.stock_seuil + 5 >= row.qr ? 'Attention': 'Normal'}
                            </div>
                          </div>
                        </div>
                      </HoverCard.Dropdown>
                    </HoverCard>
                  </div>
                )
              },
              { 
                accessor: 'ma', 
                title: <Text fw={600} size="sm">Montant Entrant</Text>,
                textAlign: 'center',
                sortable: true,
                render: (data: any) => (
                  <Text fw={500} className="text-green-600 dark:text-green-400">
                    {formatN(data?.ma)} FCFA
                  </Text>
                ),
                footer: (
                  <Group gap="xs" className="flex items-center justify-center bg-green-50 dark:bg-green-900/20 py-2 rounded-md">
                    <Box mb={-4}>
                      <TbSum size={20} className="text-green-600 dark:text-green-400" />
                    </Box>
                    <Text fw={700} size="sm" className="text-green-600 dark:text-green-400">
                      {formatN(records.reduce((acc: any, cur: { ma: any; }) => acc + cur.ma, 0))} FCFA
                    </Text>
                  </Group>
                )
              },
              { 
                accessor: 'mv', 
                title: <Text fw={600} size="sm">Montant Sortant</Text>,
                textAlign: 'center',
                sortable: true,
                render: (data: any) => (
                  <Text fw={500} className="text-red-600 dark:text-red-400">
                    {formatN(data?.mv)} FCFA
                  </Text>
                ),
                footer: (
                  <Group gap="xs" className="flex items-center justify-center bg-red-50 dark:bg-red-900/20 py-2 rounded-md">
                    <Box mb={-4}>
                      <TbSum size={20} className="text-red-600 dark:text-red-400" />
                    </Box>
                    <Text fw={700} size="sm" className="text-red-600 dark:text-red-400">
                      {formatN(records.reduce((acc: any, cur: { mv: any; }) => acc + cur.mv, 0))} FCFA
                    </Text>
                  </Group>
                )
              },
              { 
                accessor: 'mr', 
                title: <Text fw={600} size="sm">Montant Restant</Text>,
                textAlign: 'center',
                sortable: true,
                render: (data: any) => (
                  <Text fw={600} className="text-blue-600 dark:text-blue-400">
                    {formatN(data?.mr)} FCFA
                  </Text>
                ),
                footer: (
                  <Group gap="xs" className="flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 py-2 rounded-md">
                    <Box mb={-4}>
                      <TbSum size={20} className="text-blue-600 dark:text-blue-400" />
                    </Box>
                    <Text fw={700} size="sm" className="text-blue-600 dark:text-blue-400">
                      {formatN(records.reduce((acc: any, cur: { mr: any; }) => acc + cur.mr, 0))} FCFA
                    </Text>
                  </Group>
                )
              },
              {
                accessor: 'actions',
                title: <Text fw={600} size="sm" ta="center">Actions</Text>,
                textAlign: 'center',
                render: (rowData: any) => (
                  <Tooltip title="Voir les détails" placement="top">
                    <Button
                      variant="light"
                      color="blue"
                      size="xs"
                      onClick={() => navigate(rowData._id)}
                      leftSection={<FaEye size={14} />}
                      className="shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                    >
                      Détails
                    </Button>
                  </Tooltip>
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
                  Aucun article en inventaire trouvé
                </Text>
              </div>
            }
            totalRecords={filtered(invs)?.length}
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

export default Inventory