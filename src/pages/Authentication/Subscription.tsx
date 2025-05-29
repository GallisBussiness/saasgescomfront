import { useLayoutEffect, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { App } from 'antd';
import { Button, Text, Card, Group, Badge, Loader, Center, Paper, Title, Divider } from '@mantine/core';
import { useQuery, useMutation } from '@tanstack/react-query';
import { FaCheck, FaCrown, FaRocket, FaLeaf, FaShieldAlt, FaHeadset, FaUsers, FaChartLine, FaRegCreditCard } from 'react-icons/fa';
import { PackService } from '../../services/pack.service';
import { PaymentService } from '../../services/payment.service';
import { Pack } from '../../interfaces/pack.interface';
import { Payment } from '../../interfaces/payment.interface';
import { checkSubscription } from '../../services/authservice';

const Subscription: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
     
      const token  = localStorage.getItem("ges_com_token");
      useLayoutEffect(() => {
        if (Boolean(token) === false || token === 'null') {
          navigate('/auth/signin', { replace: true });
        }
      }, [token]);
  const { message } = App.useApp();
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);

  // Check if user already has an active subscription
  const { data: subscriptionData, isLoading: checkingSubscription } = useQuery({
    queryKey: ['subscription', userId],
    queryFn: () => userId ? checkSubscription(userId) : null,
    enabled: !!userId,
  });


  useEffect(() => {
    if (subscriptionData?.subscription) {
      // Si l'abonnement est actif, rediriger vers le tableau de bord
      if (subscriptionData.hasActiveSubscription) {
        navigate('/dashboard', { replace: true });
      } 
      // Si l'abonnement est en attente, rediriger vers la page d'attente
      else if (subscriptionData.subscription.status === "en_attente") {
        navigate('/auth/pending-subscription', { replace: true });
      }
    }
  },[subscriptionData]);

  // Fetch available packs
  const { data: packs, isLoading: loadingPacks } = useQuery({
    queryKey: ['packs'],
    queryFn: () => new PackService().getAll(),
  });

  // Calculate payment amount based on subscription type

  // Create payment mutation
  const { mutate: createPayment, isPending: processingPayment } = useMutation({
    mutationFn: async ({ pack }: { pack: Pack}) => {
      if (!userId) throw new Error("ID utilisateur non trouvé");
      const paymentData: Omit<Payment, '_id'> = {
        user: userId,
        pack: pack._id,
      };
      
      return new PaymentService().create(paymentData);
    },
    onSuccess: (data) => {
      const {redirect_url} = data;
      console.log('Redirect URL:', redirect_url);
      const global:any = window;
      
      // Utiliser les URLs de redirection configurées dans le service
      (new global.PayTech({ })).withOption({
        tokenUrl: redirect_url,
        presentationMode: global.PayTech.OPEN_IN_POPUP,
        onClose: () => {
          console.log('Paiement fermé par l\'utilisateur');
          navigate('/cancel?payment_id=' + userId + '&pack_name=' + selectedPack?.nom);
        },
      }).send();
      // if (data && data._id && selectedPack) {
      //   // Simulate payment verification (in a real app, this would be handled by a payment gateway)
      //   // simulatePaymentVerification(data._id);

      //   // Redirect to Paytech

        
        
      // } else {
      //   message.error("Erreur lors de la création du paiement");
      // }
    },
    onError: (error) => {
      console.error(error);
      message.error("Erreur lors du traitement du paiement");
    }
  });

  // Handle pack selection
  const handleSelectPack = (pack: Pack) => {
    setSelectedPack(pack);
  };

  // Handle payment submission
  const handleSubmitPayment = () => {
    if (!selectedPack) {
      message.warning("Veuillez sélectionner un forfait d'abonnement");
      return;
    }
    createPayment({ pack: selectedPack });
  };

  // Generate features array from description if not provided
  const getPackFeatures = (pack: Pack): string[] => {
    if (pack.features && pack.features.length > 0) {
      return pack.features;
    }
    
    // Default features based on subscription type
    const defaultFeatures = [
      "Accès à toutes les fonctionnalités de base",
      `Validité: ${pack.duree_mois} mois`,
      "Support par email"
    ];
    
    if (pack.nom.toLowerCase().includes('premium')) {
      defaultFeatures.push("Support prioritaire");
      defaultFeatures.push("Accès aux fonctionnalités avancées");
    }
    
    return defaultFeatures;
  };

  if (checkingSubscription || loadingPacks) {
    return (
      <Center style={{ height: '100vh' }}>
        <Loader size="xl" />
      </Center>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <Paper
          p="xl"
          radius="lg"
          className="bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700 mb-10"
          style={{
            backgroundImage: "linear-gradient(to right bottom, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9))",
            backdropFilter: "blur(10px)"
          }}
        >
          <div className="text-center mb-8">
            <img src='/img/gallis.png' alt="Logo" className='w-24 h-24 mx-auto mb-4 drop-shadow-md' />
            <Title order={1} className="text-gray-800 dark:text-white font-bold tracking-tight mb-2">
              Choisissez votre forfait
            </Title>
            <Text className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Sélectionnez le forfait qui correspond le mieux à vos besoins et commencez à utiliser Gallis dès aujourd'hui.
            </Text>
          </div>
          
          <Divider className="my-6" />

        {/* Subscription Packs */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {packs && packs.map((pack: Pack) => {
            // Déterminer l'icône et la couleur en fonction du type de forfait
            const isPremium = pack.nom.toLowerCase().includes('premium');
            const isBusiness = pack.nom.toLowerCase().includes('business');
            // const isBasic = !isPremium && !isBusiness;
            
            const packIcon = isPremium ? <FaCrown size={24} /> : isBusiness ? <FaRocket size={24} /> : <FaLeaf size={24} />;
            const gradientColors = isPremium 
              ? 'from-[#FF5D14] to-[#FF7A40]' 
              : isBusiness 
                ? 'from-blue-500 to-blue-600' 
                : 'from-green-500 to-green-600';
            
            return (
              <Card 
                key={pack._id} 
                shadow="sm" 
                padding="xl" 
                radius="lg" 
                withBorder={false}
                className={`transition-all duration-300 overflow-hidden ${selectedPack?._id === pack._id 
                  ? 'ring-2 ring-[#FF5D14] transform scale-105 shadow-xl' 
                  : 'hover:shadow-xl hover:transform hover:scale-102'}`}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: selectedPack?._id === pack._id 
                    ? '0 10px 25px -5px rgba(255, 93, 20, 0.3)' 
                    : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              >
                {/* Header avec gradient */}
                <div className={`absolute top-0 left-0 right-0 h-24 bg-gradient-to-r ${gradientColors} -mt-6 -mx-6 rounded-t-lg`}></div>
                
                {/* Badge et icône */}
                <div className="relative text-center mb-6 mt-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-lg mb-4">
                    <div className={`text-${isPremium ? '[#FF5D14]' : isBusiness ? 'blue-500' : 'green-500'}`}>
                      {packIcon}
                    </div>
                  </div>
                  <Badge 
                    size="lg" 
                    className={`text-white bg-gradient-to-r ${gradientColors} border-0 px-4 py-2 shadow-md`}
                    radius="md"
                  >
                    {pack.nom}
                  </Badge>
                </div>

                {/* Prix */}
                <div className="text-center mb-4">
                  <Text fw={800} size="2xl" className="text-gray-800 dark:text-white">
                    {pack.prix.toLocaleString()} FCFA
                  </Text>
                  <Text size="sm" className="text-gray-500 dark:text-gray-400">
                    pour {pack.duree_mois} mois
                  </Text>
                </div>

                <Divider className="my-4" />

                {/* Description */}
                <Text size="sm" className="text-gray-600 dark:text-gray-300 text-center mb-6 italic">
                  {pack.description}
                </Text>

                {/* Caractéristiques */}
                <div className="space-y-4 mb-8">
                  {getPackFeatures(pack).map((feature, index) => (
                    <Group key={index} className="items-start">
                      <div className={`p-1.5 rounded-full ${isPremium ? 'bg-orange-100 dark:bg-orange-900/30' : isBusiness ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                        <FaCheck className={`${isPremium ? 'text-[#FF5D14]' : isBusiness ? 'text-blue-500' : 'text-green-500'}`} />
                      </div>
                      <Text size="sm" className="text-gray-700 dark:text-gray-300 flex-1">{feature}</Text>
                    </Group>
                  ))}
                </div>

                {/* Bouton */}
                <Button
                  fullWidth
                  size="lg"
                  radius="md"
                  className={`${selectedPack?._id === pack._id 
                    ? 'bg-gradient-to-r from-[#FF5D14] to-[#FF7A40] text-white' 
                    : isPremium 
                      ? 'bg-gradient-to-r from-[#FF5D14] to-[#FF7A40] opacity-80 hover:opacity-100 text-white' 
                      : isBusiness 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                        : 'bg-gradient-to-r from-green-500 to-green-600 text-white'} 
                    transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1`}
                  onClick={() => handleSelectPack(pack)}
                  disabled={!pack.actif}
                >
                  {!pack.actif ? 'Non disponible' : selectedPack?._id === pack._id ? 'Sélectionné' : 'Sélectionner'}
                </Button>
              </Card>
            );
          })}
        </div>

        {/* Payment Section */}
        {selectedPack && (
          <Paper
            p="xl"
            radius="lg"
            className="max-w-2xl mx-auto overflow-hidden relative"
            style={{
              backgroundImage: "linear-gradient(to right bottom, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9))",
              backdropFilter: "blur(10px)",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
            }}
          >
            {/* Bande décorative en haut */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#FF5D14] to-[#FF7A40]"></div>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <FaRegCreditCard className="text-[#FF5D14] text-xl" />
              </div>
              <Title order={2} className="text-gray-800 dark:text-white">
                Finaliser votre abonnement
              </Title>
            </div>
            
            <Divider className="my-6" />
            
            {/* Récapitulatif de l'abonnement */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <Text className="text-gray-500 dark:text-gray-400 text-sm">Forfait sélectionné</Text>
                  <Text fw={700} className="text-gray-800 dark:text-white text-lg">{selectedPack.nom}</Text>
                </div>
                <Badge 
                  size="lg" 
                  className="text-white bg-gradient-to-r from-[#FF5D14] to-[#FF7A40] border-0 px-3 py-1.5 shadow-sm"
                  radius="md"
                >
                  {selectedPack.duree_mois} mois
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Text className="text-gray-600 dark:text-gray-300">Prix du forfait</Text>
                  <Text className="text-gray-800 dark:text-white">{selectedPack.prix.toLocaleString()} FCFA</Text>
                </div>
                <div className="flex justify-between">
                  <Text className="text-gray-600 dark:text-gray-300">Taxes</Text>
                  <Text className="text-gray-800 dark:text-white">Incluses</Text>
                </div>
              </div>
            </div>
            
            {/* Ligne de séparation */}
            <div className="relative my-8">
              <Divider />
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 px-4 text-gray-400 text-sm">
                RÉCAPITULATIF
              </div>
            </div>
            
            {/* Total et bouton de paiement */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-6">
                <Text fw={500} size="lg" className="text-gray-700 dark:text-gray-300">Montant total:</Text>
                <Text fw={800} size="xl" className="text-[#FF5D14]">{selectedPack.prix.toLocaleString()} FCFA</Text>
              </div>

              <Button
                fullWidth
                size="xl"
                radius="md"
                className="bg-gradient-to-r from-[#FF5D14] to-[#FF7A40] hover:from-[#FF7A40] hover:to-[#FF5D14] border-none shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                loading={processingPayment}
                onClick={handleSubmitPayment}
                leftSection={!processingPayment && <FaShieldAlt />}
              >
                {processingPayment ? 'Traitement en cours...' : 'Payer maintenant'}
              </Button>
              
              <Text size="xs" className="text-gray-500 dark:text-gray-400 text-center mt-3">
                Paiement 100% sécurisé. Vos informations sont protégées.  
              </Text>
            </div>
          </Paper>
        )}

        <div className="text-center mt-12 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 bg-white dark:bg-gray-800/80 p-4 rounded-lg shadow-sm">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <FaHeadset className="text-blue-500 text-xl" />
              </div>
              <div className="text-left">
                <Text fw={600} className="text-gray-800 dark:text-white">Support client</Text>
                <Text size="sm" className="text-gray-600 dark:text-gray-400">Nous sommes là pour vous aider</Text>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-white dark:bg-gray-800/80 p-4 rounded-lg shadow-sm">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <FaUsers className="text-purple-500 text-xl" />
              </div>
              <div className="text-left">
                <Text fw={600} className="text-gray-800 dark:text-white">Communauté</Text>
                <Text size="sm" className="text-gray-600 dark:text-gray-400">Rejoignez nos utilisateurs</Text>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-white dark:bg-gray-800/80 p-4 rounded-lg shadow-sm">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <FaChartLine className="text-green-500 text-xl" />
              </div>
              <div className="text-left">
                <Text fw={600} className="text-gray-800 dark:text-white">Croissance</Text>
                <Text size="sm" className="text-gray-600 dark:text-gray-400">Développez votre activité</Text>
              </div>
            </div>
          </div>
          
          <Text className="text-gray-600 dark:text-gray-400 mt-8">
            Vous avez des questions ? <a href="#" className="text-[#FF5D14] hover:text-orange-600 transition-colors duration-300 font-medium">Contactez notre support</a>
          </Text>
        </div>
        </Paper>
      </div>
    </div>
  );
};

export default Subscription;
