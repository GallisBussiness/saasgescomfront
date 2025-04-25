import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Text, Paper, Title, Center, Group, Divider } from '@mantine/core';
import { FaCheckCircle, FaArrowRight, FaHome } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Success: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const packName = searchParams.get('pack_name');
  const amount = searchParams.get('amount');

  useEffect(() => {
    // Ici, vous pourriez vérifier le statut du paiement avec votre backend
    // Par exemple, faire une requête API pour confirmer que le paiement est bien validé
    console.log('Payment ID:', paymentId);
  }, [paymentId]);

  const handleGoToDashboard = () => {
    navigate('/dashboard');
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
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#FF5D14] to-[#FF7A40] rounded-t-lg"></div>
          
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
              className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
            >
              <FaCheckCircle className="text-green-500 text-5xl" />
            </motion.div>
          </Center>
          
          <Title order={1} className="text-gray-800 dark:text-white font-bold tracking-tight text-center mb-2">
            Paiement réussi !
          </Title>
          
          <Text className="text-gray-600 dark:text-gray-400 text-center mb-8">
            Votre abonnement a été activé avec succès. Vous pouvez maintenant accéder à toutes les fonctionnalités.
          </Text>
          
          <Divider className="my-6" />
          
          {/* Détails du paiement */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 mb-8">
            <Text fw={600} size="lg" className="text-gray-800 dark:text-white mb-4">
              Détails de la transaction
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
              
              {amount && (
                <div className="flex justify-between">
                  <Text className="text-gray-600 dark:text-gray-300">Montant</Text>
                  <Text className="text-gray-800 dark:text-white font-medium">{parseInt(amount).toLocaleString()} FCFA</Text>
                </div>
              )}
              
              <div className="flex justify-between">
                <Text className="text-gray-600 dark:text-gray-300">Statut</Text>
                <Text className="text-green-500 font-medium">Payé</Text>
              </div>
              
              <div className="flex justify-between">
                <Text className="text-gray-600 dark:text-gray-300">Date</Text>
                <Text className="text-gray-800 dark:text-white font-medium">{new Date().toLocaleDateString()}</Text>
              </div>
            </div>
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
                onClick={handleGoToDashboard}
                rightSection={<FaArrowRight />}
              >
                Accéder au tableau de bord
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
                leftSection={<FaHome />}
              >
                Retour à l'accueil
              </Button>
            </motion.div>
          </Group>
        </Paper>
        
        <Text size="xs" className="text-gray-500 dark:text-gray-400 text-center mt-6">
          Un reçu détaillé a été envoyé à votre adresse e-mail.
        </Text>
      </motion.div>
    </div>
  );
};

export default Success;
