import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Text, Paper, Title, Center, Group, Divider } from '@mantine/core';
import { FaTimesCircle, FaArrowRight, FaRedo } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Cancel: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const packName = searchParams.get('pack_name');

  const handleRetry = () => {
    // Rediriger vers la page d'abonnement
    const userId = localStorage.getItem('userId');
    navigate(`/subscription/${userId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Paper
          p="xl"
          radius="lg"
          className="bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700"
          style={{
            backgroundImage: "linear-gradient(to right bottom, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9))",
            backdropFilter: "blur(10px)"
          }}
        >
          {/* Bande décorative en haut */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 to-red-600 rounded-t-lg"></div>
          
          <Center className="mb-8 mt-4">
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 260, 
                damping: 20,
                delay: 0.2
              }}
              className="w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center"
            >
              <FaTimesCircle className="text-red-500 text-5xl" />
            </motion.div>
          </Center>
          
          <Title order={1} className="text-gray-800 dark:text-white font-bold tracking-tight text-center mb-2">
            Paiement annulé
          </Title>
          
          <Text className="text-gray-600 dark:text-gray-400 text-center mb-8">
            Votre paiement a été annulé. Aucun montant n'a été prélevé de votre compte.
          </Text>
          
          <Divider className="my-6" />
          
          {/* Détails de la tentative */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 mb-8">
            <Text fw={600} size="lg" className="text-gray-800 dark:text-white mb-4">
              Informations
            </Text>
            
            <div className="space-y-3">
              {paymentId && (
                <div className="flex justify-between">
                  <Text className="text-gray-600 dark:text-gray-300">Référence</Text>
                  <Text className="text-gray-800 dark:text-white font-medium">{paymentId}</Text>
                </div>
              )}
              
              {packName && (
                <div className="flex justify-between">
                  <Text className="text-gray-600 dark:text-gray-300">Forfait</Text>
                  <Text className="text-gray-800 dark:text-white font-medium">{packName}</Text>
                </div>
              )}
              
              <div className="flex justify-between">
                <Text className="text-gray-600 dark:text-gray-300">Statut</Text>
                <Text className="text-red-500 font-medium">Annulé</Text>
              </div>
              
              <div className="flex justify-between">
                <Text className="text-gray-600 dark:text-gray-300">Date</Text>
                <Text className="text-gray-800 dark:text-white font-medium">{new Date().toLocaleDateString()}</Text>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/30 rounded-lg p-4 mb-8">
            <Text size="sm" className="text-orange-700 dark:text-orange-300">
              Vous pouvez réessayer de souscrire à un abonnement à tout moment. Si vous rencontrez des difficultés, n'hésitez pas à contacter notre service client.
            </Text>
          </div>
          
          <Group justify="center" className="mt-8">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                radius="md"
                className="bg-gradient-to-r from-[#FF5D14] to-[#FF7A40] hover:from-[#FF7A40] hover:to-[#FF5D14] border-none shadow-md hover:shadow-lg transition-all duration-300"
                onClick={handleRetry}
                leftSection={<FaRedo />}
              >
                Réessayer
              </Button>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                radius="md"
                variant="outline"
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
                onClick={() => navigate('/')}
                rightSection={<FaArrowRight />}
              >
                Retour à l'accueil
              </Button>
            </motion.div>
          </Group>
        </Paper>
        
        <Text size="xs" className="text-gray-500 dark:text-gray-400 text-center mt-6">
          Besoin d'aide ? Contactez notre équipe de support à support@gallis.com
        </Text>
      </motion.div>
    </div>
  );
};

export default Cancel;
