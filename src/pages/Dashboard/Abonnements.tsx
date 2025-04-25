import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authclient } from '../../../lib/auth-client';
import SubscriptionService from '../../services/subscription.service';
import { 
  LoadingOverlay, 
  Paper, 
  Title, 
  Text, 
  Group, 
  Badge, 
  Button, 
  Divider,
  Card,
  SimpleGrid,
  Box,
  Modal
} from '@mantine/core';
import { 
  FaCalendarAlt, 
  FaCreditCard, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaHourglassHalf,
  FaRocket,
  FaHistory,
  FaInfoCircle,
  FaSync,
  FaRegCreditCard
} from 'react-icons/fa';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatN } from '../../lib/helpers';
import { useDisclosure } from '@mantine/hooks';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { App } from 'antd';

// Interface pour les abonnements
interface Subscription {
  _id: string;
  user: string;
  pack: {
    _id: string;
    nom: string;
    prix: number;
    duree_mois: number;
  };
  date_debut?: string;
  date_fin?: string;
  status: 'actif' | 'en_attente' | 'expiré' | 'annulé';
  paymentMethod?: string;
  ref?: string;
  createdAt: string;
  updatedAt: string;
}

const Abonnements: React.FC = () => {
  const { message } = App.useApp();
  const { data: session } = authclient.useSession();
  const userId = session?.user?.id;
  const subscriptionService = new SubscriptionService();
  
  // État pour le modal de détails
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  
  // Récupérer tous les abonnements de l'utilisateur
  const { 
    data: subscriptions, 
    isLoading: loadingSubscriptions,
    refetch: refetchSubscriptions
  } = useQuery({
    queryKey: ['subscriptions', userId],
    queryFn: () => subscriptionService.getAllByUser(userId!),
    enabled: !!userId,
  });
  
  console.log(subscriptions)  // Récupérer l'abonnement actif de l'utilisateur
  const { 
    data: activeSubscription,
    isLoading: loadingActiveSubscription
  } = useQuery({
    queryKey: ['activeSubscription', userId],
    queryFn: () => subscriptionService.getActiveByUser(userId!),
    enabled: !!userId,
  });

  
  // Fonction pour obtenir la couleur du badge en fonction du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'actif':
        return 'green';
      case 'en_attente':
        return 'yellow';
      case 'expiré':
        return 'gray';
      case 'annulé':
        return 'red';
      default:
        return 'blue';
    }
  };
  
  // Fonction pour obtenir l'icône du statut
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'actif':
        return <FaCheckCircle size={16} />;
      case 'en_attente':
        return <FaHourglassHalf size={16} />;
      case 'expiré':
        return <FaTimesCircle size={16} />;
      case 'annulé':
        return <FaTimesCircle size={16} />;
      default:
        return <FaInfoCircle size={16} />;
    }
  };
  
  // Fonction pour traduire le statut
  const translateStatus = (status: string) => {
    switch (status) {
      case 'actif':
        return 'Actif';
      case 'en_attente':
        return 'En attente';
      case 'expiré':
        return 'Expiré';
      case 'annulé':
        return 'Annulé';
      default:
        return status;
    }
  };
  
  // Fonction pour renouveler un abonnement
  const handleRenewSubscription = async (subscriptionId: string) => {
    try {
      await subscriptionService.renewSubscription(subscriptionId);
      message.success('Demande de renouvellement envoyée avec succès');
      refetchSubscriptions();
    } catch (error) {
      console.error('Erreur lors du renouvellement:', error);
      message.error('Erreur lors du renouvellement de l\'abonnement');
    }
  };
  
  // Fonction pour annuler un abonnement
  const handleCancelSubscription = async (subscriptionId: string) => {
    try {
      await subscriptionService.cancelSubscription(subscriptionId);
      message.success('Abonnement annulé avec succès');
      refetchSubscriptions();
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
      message.error('Erreur lors de l\'annulation de l\'abonnement');
    }
  };
  
  // Fonction pour ouvrir le modal de détails
  const openDetailsModal = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    open();
  };
  
  return (
    <div className="mx-auto p-4">
      <Breadcrumb pageName="Mes abonnements" />
      
      <LoadingOverlay
        visible={loadingSubscriptions || loadingActiveSubscription}
        zIndex={1000}
        overlayProps={{ radius: 'md', blur: 3 }}
        loaderProps={{ color: '#FF5D14', type: 'bars' }}
      />
      
      {/* Abonnement actif */}
      {activeSubscription && (
        <Paper 
          p="md" 
          radius="md" 
          className="bg-white dark:bg-gray-800 shadow-xl mb-6"
          style={{
            backgroundImage: "linear-gradient(to right bottom, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9))",
            backdropFilter: "blur(10px)"
          }}
        >
          <div className="mb-4">
            <Group justify="space-between" className="mb-2">
              <Group>
                <div className="flex flex-col items-center justify-center bg-orange-50 dark:bg-orange-900/20 p-3 rounded-full">
                  <FaRocket size={24} className="text-orange-500" />
                </div>
                <div>
                  <Title order={4} className="text-gray-800 dark:text-gray-200">
                    Abonnement actif
                  </Title>
                  <Text size="sm" color="dimmed">
                    Votre forfait actuel
                  </Text>
                </div>
              </Group>
              
              <Badge 
                size="lg" 
                radius="md"
                color={getStatusColor(activeSubscription.status)}
                leftSection={getStatusIcon(activeSubscription.status)}
                className="px-3 py-2"
              >
                {translateStatus(activeSubscription.status)}
              </Badge>
            </Group>
            
            <Divider className="my-4" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <Box className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  <Group gap="xs">
                    <FaRegCreditCard className="text-blue-500" />
                    <Text size="sm" fw={500} className="text-blue-700 dark:text-blue-300">Forfait</Text>
                  </Group>
                  <Text size="sm" className="mt-1 font-medium">
                    {activeSubscription.pack?.nom || 'N/A'}
                  </Text>
                </Box>
              </div>
              
              <div>
                <Box className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                  <Group gap="xs">
                    <FaCalendarAlt className="text-green-500" />
                    <Text size="sm" fw={500} className="text-green-700 dark:text-green-300">Date d'expiration</Text>
                  </Group>
                  <Text size="sm" className="mt-1">
                    {activeSubscription.date_fin 
                      ? format(new Date(activeSubscription.date_fin), 'dd MMMM yyyy', { locale: fr }) 
                      : 'N/A'}
                  </Text>
                </Box>
              </div>
              
              <div>
                <Box className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-md">
                  <Group gap="xs">
                    <FaCreditCard className="text-purple-500" />
                    <Text size="sm" fw={500} className="text-purple-700 dark:text-purple-300">Montant</Text>
                  </Group>
                  <Text size="sm" className="mt-1">
                    {formatN(activeSubscription.pack?.prix || 0)} FCFA
                  </Text>
                </Box>
              </div>
            </div>
            
            <Group justify="flex-end" mt="md">
              <Button
                variant="outline"
                color="orange"
                leftSection={<FaInfoCircle size={16} />}
                onClick={() => openDetailsModal(activeSubscription)}
                className="transition-all hover:shadow-md"
              >
                Détails
              </Button>
              
              {activeSubscription.status === 'actif' && (
                <Button
                  variant="outline"
                  color="red"
                  leftSection={<FaTimesCircle size={16} />}
                  onClick={() => handleCancelSubscription(activeSubscription._id)}
                  className="transition-all hover:shadow-md"
                >
                  Annuler
                </Button>
              )}
              
              {activeSubscription.status === 'expiré' && (
                <Button
                  variant="filled"
                  color="orange"
                  leftSection={<FaSync size={16} />}
                  onClick={() => handleRenewSubscription(activeSubscription._id)}
                  className="transition-all hover:shadow-md"
                >
                  Renouveler
                </Button>
              )}
            </Group>
          </div>
        </Paper>
      )}
      
      {/* Historique des abonnements */}
      <Paper 
        p="md" 
        radius="md" 
        className="bg-white dark:bg-gray-800 shadow-xl"
        style={{
          backgroundImage: "linear-gradient(to right bottom, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9))",
          backdropFilter: "blur(10px)"
        }}
      >
        <Group className="mb-4">
          <div className="flex flex-col items-center justify-center bg-orange-50 dark:bg-orange-900/20 p-3 rounded-full">
            <FaHistory size={24} className="text-orange-500" />
          </div>
          <div>
            <Title order={4} className="text-gray-800 dark:text-gray-200">
              Historique des abonnements
            </Title>
            <Text size="sm" color="dimmed">
              Vos abonnements précédents
            </Text>
          </div>
        </Group>
        
        <Divider className="my-4" />
        
        {subscriptions && subscriptions.length > 0 ? (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
            {subscriptions.map((subscription: Subscription) => (
              <Card 
                key={subscription._id} 
                shadow="sm" 
                padding="md" 
                radius="md" 
                className="border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-300"
              >
                <Card.Section className="p-3 bg-gradient-to-r from-orange-500 to-orange-600">
                  <Group justify="space-between">
                    <Text fw={700} size="lg" className="text-white">
                      {subscription.pack?.nom || 'Forfait'}
                    </Text>
                    <Badge 
                      color={getStatusColor(subscription.status)}
                      leftSection={getStatusIcon(subscription.status)}
                    >
                      {translateStatus(subscription.status)}
                    </Badge>
                  </Group>
                </Card.Section>
                
                <Group mt="md" mb="xs">
                  <FaCalendarAlt className="text-gray-500" />
                  <Text fw={500}>Période</Text>
                </Group>
                
                <Text size="sm" color="dimmed" className="mb-3">
                  Du {subscription.date_debut 
                    ? format(new Date(subscription.date_debut), 'dd/MM/yyyy', { locale: fr }) 
                    : 'N/A'} au {subscription.date_fin 
                    ? format(new Date(subscription.date_fin), 'dd/MM/yyyy', { locale: fr }) 
                    : 'N/A'}
                </Text>
                
                <Group mt="md" mb="xs">
                  <FaCreditCard className="text-gray-500" />
                  <Text fw={500}>Montant</Text>
                </Group>
                
                <Text size="sm" color="dimmed" className="mb-3">
                  {formatN(subscription.pack?.prix || 0)} FCFA
                </Text>
                
                <Button
                  variant="light"
                  color="orange"
                  fullWidth
                  mt="md"
                  radius="md"
                  onClick={() => openDetailsModal(subscription)}
                  className="transition-all hover:shadow-md"
                >
                  Voir les détails
                </Button>
              </Card>
            ))}
          </SimpleGrid>
        ) : (
          <div className="text-center py-10">
            <FaInfoCircle size={40} className="text-gray-400 mx-auto mb-4" />
            <Text size="lg" fw={500} className="text-gray-600 dark:text-gray-400">
              Aucun historique d'abonnement
            </Text>
            <Text size="sm" className="text-gray-500 dark:text-gray-500 mt-2">
              Vous n'avez pas encore d'historique d'abonnement.
            </Text>
          </div>
        )}
      </Paper>
      
      {/* Modal de détails */}
      <Modal 
        opened={opened} 
        onClose={close} 
        title={<Title order={4}>Détails de l'abonnement</Title>}
        size="lg"
        centered
      >
        {selectedSubscription && (
          <div>
            <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-lg mb-4">
              <Group justify="space-between">
                <Text fw={700} size="lg">
                  {selectedSubscription.pack?.nom || 'Forfait'}
                </Text>
                <Badge 
                  size="lg"
                  color={getStatusColor(selectedSubscription.status)}
                  leftSection={getStatusIcon(selectedSubscription.status)}
                >
                  {translateStatus(selectedSubscription.status)}
                </Badge>
              </Group>
            </div>
            
            <SimpleGrid cols={2} spacing="md" className="mb-4">
              <div>
                <Text fw={500} size="sm" className="text-gray-600 dark:text-gray-400">
                  Date de début
                </Text>
                <Text>
                  {selectedSubscription.date_debut 
                    ? format(new Date(selectedSubscription.date_debut), 'dd MMMM yyyy', { locale: fr }) 
                    : 'N/A'}
                </Text>
              </div>
              
              <div>
                <Text fw={500} size="sm" className="text-gray-600 dark:text-gray-400">
                  Date de fin
                </Text>
                <Text>
                  {selectedSubscription.date_fin 
                    ? format(new Date(selectedSubscription.date_fin), 'dd MMMM yyyy', { locale: fr }) 
                    : 'N/A'}
                </Text>
              </div>
              
              <div>
                <Text fw={500} size="sm" className="text-gray-600 dark:text-gray-400">
                  Montant
                </Text>
                <Text>{formatN(selectedSubscription.pack?.prix || 0)} FCFA</Text>
              </div>
              
              <div>
                <Text fw={500} size="sm" className="text-gray-600 dark:text-gray-400">
                  Durée
                </Text>
                <Text>{selectedSubscription.pack?.duree_mois || 0} mois</Text>
              </div>
              
              <div>
                <Text fw={500} size="sm" className="text-gray-600 dark:text-gray-400">
                  Méthode de paiement
                </Text>
                <Text>{selectedSubscription.paymentMethod || 'N/A'}</Text>
              </div>
              
              <div>
                <Text fw={500} size="sm" className="text-gray-600 dark:text-gray-400">
                  ID de transaction
                </Text>
                <Text className="font-mono text-sm">
                  {selectedSubscription.ref || 'N/A'}
                </Text>
              </div>
            </SimpleGrid>
            
            <Divider className="my-4" />
            
            <Text fw={700} className="mb-2">Fonctionnalités incluses</Text>
            
            {/* {selectedSubscription.pack?.features && selectedSubscription.pack.features.length > 0 ? (
              <div className="space-y-2">
                {selectedSubscription.pack.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                    <Text size="sm">{feature}</Text>
                  </div>
                ))}
              </div>
            ) : (
              <Text size="sm" color="dimmed">Aucune fonctionnalité spécifiée</Text>
            )} */}
            
            <Group justify="flex-end" mt="xl">
              {selectedSubscription.status === 'actif' && (
                <Button
                  variant="outline"
                  color="red"
                  leftSection={<FaTimesCircle size={16} />}
                  onClick={() => {
                    handleCancelSubscription(selectedSubscription._id);
                    close();
                  }}
                >
                  Annuler l'abonnement
                </Button>
              )}
              
              {selectedSubscription.status === 'expiré' && (
                <Button
                  variant="filled"
                  color="orange"
                  leftSection={<FaSync size={16} />}
                  onClick={() => {
                    handleRenewSubscription(selectedSubscription._id);
                    close();
                  }}
                >
                  Renouveler l'abonnement
                </Button>
              )}
              
              <Button variant="subtle" onClick={close}>Fermer</Button>
            </Group>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Abonnements;
