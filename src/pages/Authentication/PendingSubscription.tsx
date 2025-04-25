import React from 'react';
import { Link } from 'react-router-dom';
import { Title, Text, Paper, Button, Group, Box } from '@mantine/core';
import { FaHourglassHalf, FaCheckCircle, FaHome } from 'react-icons/fa';

const PendingSubscription: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Paper 
        p="xl" 
        radius="lg" 
        className="w-full max-w-lg bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700"
        style={{
          backgroundImage: "linear-gradient(to right bottom, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9))",
          backdropFilter: "blur(10px)"
        }}
      >
        <div className="text-center mb-6">
          <Box 
            className="mx-auto mb-6 w-20 h-20 flex items-center justify-center rounded-full bg-orange-50 dark:bg-orange-900/20"
          >
            <FaHourglassHalf className="text-[#FF5D14] text-4xl animate-pulse" />
          </Box>
          
          <Title order={2} className="text-gray-800 dark:text-white font-bold tracking-tight">
            Abonnement en attente
          </Title>
          
          <Text size="lg" className="text-gray-600 dark:text-gray-400 mt-4">
            Votre abonnement est en cours de traitement. Veuillez patienter pendant que nous validons votre paiement.
          </Text>
        </div>
        
        <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-lg my-6 border-l-4 border-[#FF5D14]">
          <Text className="text-gray-700 dark:text-gray-300">
            <span className="font-medium">Note :</span> Ce processus peut prendre jusqu'à 24 heures. Vous recevrez une notification par email dès que votre abonnement sera activé.
          </Text>
        </div>
        
        <div className="space-y-4 mt-8">
          <div className="flex items-start gap-3">
            <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
            <Text className="text-gray-700 dark:text-gray-300">
              Votre demande a bien été enregistrée
            </Text>
          </div>
          <div className="flex items-start gap-3">
            <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
            <Text className="text-gray-700 dark:text-gray-300">
              Vous serez notifié par email dès que votre abonnement sera actif
            </Text>
          </div>
          <div className="flex items-start gap-3">
            <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
            <Text className="text-gray-700 dark:text-gray-300">
              Vous pourrez accéder à toutes les fonctionnalités une fois l'abonnement validé
            </Text>
          </div>
        </div>
        
        <Group justify="center" className="mt-8">
          <Button
            component={Link}
            to="/"
            leftSection={<FaHome />}
            className="bg-gradient-to-r from-[#FF5D14] to-[#FF7A40] hover:from-[#FF7A40] hover:to-[#FF5D14] border-none rounded-md shadow-md hover:shadow-lg transition-all duration-300"
          >
            Retour à l'accueil
          </Button>
        </Group>
      </Paper>
    </div>
  );
};

export default PendingSubscription;
