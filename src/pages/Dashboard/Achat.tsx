import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { AchatService } from "../../services/achat.service";
import { WeeklyRevenue } from "./WeeklyRevenue";
import { LoadingOverlay, Table, Paper, Text, Group, Badge, Box, Divider, Title } from "@mantine/core";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { formatN } from "../../lib/helpers";
import { FaShoppingBag, FaUser, FaCalendarAlt, FaFileInvoiceDollar, FaTag, FaBoxes } from "react-icons/fa";
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

function Achat() {
  const { id } = useParams();
  const key = ['achat', id];
  const achatService = new AchatService();
  const { data, isLoading } = useQuery({
    queryKey: key,
    queryFn: () => achatService.getOne(id!),
  })
  
  // Calculer le total des produits
  const calculateTotal = () => {
    if (!data?.produits) return 0;
    return data.produits.reduce((acc: number, item: any) => acc + (item.pu * item.qte), 0);
  }

  return (
    <div className="mx-auto p-4">
      <Breadcrumb pageName="Détails de l'achat" />
      
      <LoadingOverlay
        visible={isLoading}
        zIndex={1000}
        overlayProps={{ radius: 'md', blur: 3 }}
        loaderProps={{ color: '#FF5D14', type: 'bars' }}
      />
      
      {data && (
        <WeeklyRevenue add={''}>
          <Paper 
            p="md" 
            radius="md" 
            className="bg-white dark:bg-gray-800 shadow-xl mb-4"
            style={{
              backgroundImage: "linear-gradient(to right bottom, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9))",
              backdropFilter: "blur(10px)"
            }}
          >
            {/* En-tête avec informations de l'achat */}
            <div className="mb-6">
              <Group justify="space-between" className="mb-3">
                <Group>
                  <div className="flex flex-col items-center justify-center bg-orange-50 dark:bg-orange-900/20 p-3 rounded-full">
                    <FaShoppingBag size={24} className="text-orange-500" />
                  </div>
                  <div>
                    <Text fw={700} size="lg" className="text-gray-800 dark:text-gray-200">
                      Achat #{data.ref}
                    </Text>
                    <Text size="sm" color="dimmed">
                      Détails de la commande d'achat
                    </Text>
                  </div>
                </Group>
                
                <Badge 
                  size="lg" 
                  radius="md"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-2"
                >
                  {formatN(calculateTotal() - (data.remise || 0))} FCFA
                </Badge>
              </Group>
              
              <Divider className="my-4" />
              
              {/* Informations de l'achat */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <Box className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                    <Group gap="xs">
                      <FaCalendarAlt className="text-blue-500" />
                      <Text size="sm" fw={500} className="text-blue-700 dark:text-blue-300">Date</Text>
                    </Group>
                    <Text size="sm" className="mt-1">
                      {data.date ? format(new Date(data.date), 'dd MMMM yyyy', { locale: fr }) : 'N/A'}
                    </Text>
                  </Box>
                </div>
                
                <div>
                  <Box className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                    <Group gap="xs">
                      <FaUser className="text-green-500" />
                      <Text size="sm" fw={500} className="text-green-700 dark:text-green-300">Fournisseur</Text>
                    </Group>
                    <Text size="sm" className="mt-1">
                      {data.fournisseur?.nom || 'N/A'}
                    </Text>
                  </Box>
                </div>
                
                <div>
                  <Box className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-md">
                    <Group gap="xs">
                      <FaBoxes className="text-purple-500" />
                      <Text size="sm" fw={500} className="text-purple-700 dark:text-purple-300">Articles</Text>
                    </Group>
                    <Text size="sm" className="mt-1">
                      {data.produits?.length || 0} produit(s)
                    </Text>
                  </Box>
                </div>
                
                <div>
                  <Box className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md">
                    <Group gap="xs">
                      <FaTag className="text-amber-500" />
                      <Text size="sm" fw={500} className="text-amber-700 dark:text-amber-300">Remise</Text>
                    </Group>
                    <Text size="sm" className="mt-1">
                      {formatN(data.remise || 0)} FCFA
                    </Text>
                  </Box>
                </div>
              </div>
              
              {/* Résumé financier */}
              <Box className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-md mb-4">
                <Group className="mb-2">
                  <FaFileInvoiceDollar className="text-orange-500" />
                  <Title order={5} className="text-gray-800 dark:text-gray-200">
                    Résumé financier
                  </Title>
                </Group>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Text size="sm" className="text-gray-500 dark:text-gray-400">Montant total:</Text>
                    <Text fw={600}>{formatN(calculateTotal())} FCFA</Text>
                  </div>
                  
                  <div>
                    <Text size="sm" className="text-gray-500 dark:text-gray-400">Remise:</Text>
                    <Text fw={600}>{formatN(data.remise || 0)} FCFA</Text>
                  </div>
                  
                  <div>
                    <Text size="sm" className="text-gray-500 dark:text-gray-400">Net à payer:</Text>
                    <Text fw={600} className="text-orange-600 dark:text-orange-400">
                      {formatN(calculateTotal() - (data.remise || 0))} FCFA
                    </Text>
                  </div>
                </div>
              </Box>
            </div>
            
            {/* Tableau des produits */}
            <Box>
              <Title order={4} className="mb-4 flex items-center gap-2">
                <FaBoxes className="text-orange-500" /> 
                <span className="text-gray-800 dark:text-gray-200">Liste des produits</span>
              </Title>
              
              <Table 
                striped 
                highlightOnHover 
                withColumnBorders
                className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-700"
              >
                <Table.Thead className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                  <Table.Tr>
                    <Table.Th className="text-white font-medium">N°</Table.Th>
                    <Table.Th className="text-white font-medium">Référence</Table.Th>
                    <Table.Th className="text-white font-medium">Quantité</Table.Th>
                    <Table.Th className="text-white font-medium">Unité</Table.Th>
                    <Table.Th className="text-white font-medium">Description</Table.Th>
                    <Table.Th className="text-white font-medium">Prix unitaire</Table.Th>
                    <Table.Th className="text-white font-medium">Total</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {data?.produits.map((el: any, i: number) => (
                    <Table.Tr 
                      key={el.ref} 
                      className="transition-colors hover:bg-orange-50 dark:hover:bg-orange-900/10"
                    >
                      <Table.Td className="font-medium text-gray-700 dark:text-gray-300">{i + 1}</Table.Td>
                      <Table.Td>
                        <Badge 
                          variant="light" 
                          color="blue"
                          className="font-mono"
                        >
                          {el.ref}
                        </Badge>
                      </Table.Td>
                      <Table.Td className="font-medium">{el.qte}</Table.Td> 
                      <Table.Td>{el.unite}</Table.Td>
                      <Table.Td>{el.nom}</Table.Td>
                     
                      <Table.Td>{formatN(el.pu)} FCFA</Table.Td>
                      <Table.Td className="font-medium text-orange-600 dark:text-orange-400">
                        {formatN(el.pu * el.qte)} FCFA
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
                <Table.Tfoot className="bg-gray-50 dark:bg-gray-800/50">
                  <Table.Tr>
                    <Table.Td colSpan={5}></Table.Td>
                    <Table.Td className="font-bold">Total:</Table.Td>
                    <Table.Td className="font-bold text-orange-600 dark:text-orange-400">
                      {formatN(calculateTotal())} FCFA
                    </Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td colSpan={5}></Table.Td>
                    <Table.Td className="font-bold">Remise:</Table.Td>
                    <Table.Td className="font-bold text-orange-600 dark:text-orange-400">
                      {formatN(data.remise || 0)} FCFA
                    </Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td colSpan={5}></Table.Td>
                    <Table.Td className="font-bold">Net à payer:</Table.Td>
                    <Table.Td className="font-bold text-orange-600 dark:text-orange-400">
                      {formatN(calculateTotal() - (data.remise || 0))} FCFA
                    </Table.Td>
                  </Table.Tr>
                </Table.Tfoot>
              </Table>
            </Box>
          </Paper>
        </WeeklyRevenue>
      )}
    </div>
  )
}

export default Achat