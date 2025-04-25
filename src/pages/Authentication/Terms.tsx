import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Paper, Title, Text, Divider, Button } from '@mantine/core';
import { FaArrowLeft, FaShieldAlt, FaUserLock, FaFileContract, FaGavel, FaUserSecret } from 'react-icons/fa';

const Terms: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="subtle" 
          leftSection={<FaArrowLeft />} 
          onClick={() => navigate(-1)}
          className="mb-6 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300"
        >
          Retour
        </Button>

        <Paper 
          p="xl" 
          radius="lg" 
          className="bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700"
          style={{
            backgroundImage: "linear-gradient(to right bottom, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9))",
            backdropFilter: "blur(10px)"
          }}
        >
          <div className="text-center mb-8">
            <Title order={1} className="text-gray-800 dark:text-white font-bold tracking-tight">
              Conditions Générales d'Utilisation
            </Title>
            <Text size="sm" className="text-gray-500 dark:text-gray-400 mt-2">
              Dernière mise à jour : 20 avril 2025
            </Text>
          </div>

          <Divider className="my-6" />

          <div className="space-y-8">
            {/* Section 1 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                  <FaFileContract className="text-[#FF5D14] text-xl" />
                </div>
                <Title order={2} className="text-gray-800 dark:text-white text-xl">
                  1. Introduction
                </Title>
              </div>
              <Text className="text-gray-700 dark:text-gray-300 leading-relaxed pl-12">
                Bienvenue sur Gallis, une application de gestion commerciale. Les présentes Conditions Générales d'Utilisation régissent votre utilisation de notre application et de tous les services associés. En utilisant notre application, vous acceptez d'être lié par ces conditions. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre application.
              </Text>
            </div>

            {/* Section 2 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <FaUserLock className="text-blue-500 text-xl" />
                </div>
                <Title order={2} className="text-gray-800 dark:text-white text-xl">
                  2. Comptes Utilisateurs
                </Title>
              </div>
              <Text className="text-gray-700 dark:text-gray-300 leading-relaxed pl-12">
                Pour utiliser certaines fonctionnalités de notre application, vous devez créer un compte. Vous êtes responsable de maintenir la confidentialité de vos informations de compte et de toutes les activités qui se produisent sous votre compte. Vous acceptez de nous informer immédiatement de toute utilisation non autorisée de votre compte. Nous nous réservons le droit de refuser le service, de supprimer ou de modifier le contenu, ou de résilier des comptes à notre seule discrétion.
              </Text>
            </div>

            {/* Section 3 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <FaUserSecret className="text-green-500 text-xl" />
                </div>
                <Title order={2} className="text-gray-800 dark:text-white text-xl">
                  3. Confidentialité
                </Title>
              </div>
              <Text className="text-gray-700 dark:text-gray-300 leading-relaxed pl-12">
                Votre confidentialité est importante pour nous. Notre Politique de Confidentialité explique comment nous collectons, utilisons, protégeons et divulguons les informations résultant de votre utilisation de notre application. En utilisant notre application, vous consentez à la collecte et à l'utilisation de ces informations conformément à notre Politique de Confidentialité.
              </Text>
            </div>

            {/* Section 4 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                  <FaShieldAlt className="text-purple-500 text-xl" />
                </div>
                <Title order={2} className="text-gray-800 dark:text-white text-xl">
                  4. Sécurité des Données
                </Title>
              </div>
              <Text className="text-gray-700 dark:text-gray-300 leading-relaxed pl-12">
                Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données contre l'accès non autorisé, l'altération, la divulgation ou la destruction. Cependant, aucune méthode de transmission sur Internet ou de stockage électronique n'est 100% sécurisée, et nous ne pouvons garantir une sécurité absolue.
              </Text>
            </div>

            {/* Section 5 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <FaGavel className="text-red-500 text-xl" />
                </div>
                <Title order={2} className="text-gray-800 dark:text-white text-xl">
                  5. Limitation de Responsabilité
                </Title>
              </div>
              <Text className="text-gray-700 dark:text-gray-300 leading-relaxed pl-12">
                Dans toute la mesure permise par la loi applicable, nous ne serons pas responsables des dommages indirects, accessoires, spéciaux, consécutifs ou punitifs, ou de toute perte de profits ou de revenus, que ces dommages soient prévisibles ou non, et même si nous avons été informés de la possibilité de tels dommages.
              </Text>
            </div>

            {/* Section 6 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                  <FaFileContract className="text-yellow-600 text-xl" />
                </div>
                <Title order={2} className="text-gray-800 dark:text-white text-xl">
                  6. Modifications des Conditions
                </Title>
              </div>
              <Text className="text-gray-700 dark:text-gray-300 leading-relaxed pl-12">
                Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications prendront effet dès leur publication sur notre application. Votre utilisation continue de l'application après la publication des modifications constitue votre acceptation de ces modifications.
              </Text>
            </div>

            {/* Section 7 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                  <FaGavel className="text-indigo-500 text-xl" />
                </div>
                <Title order={2} className="text-gray-800 dark:text-white text-xl">
                  7. Loi Applicable
                </Title>
              </div>
              <Text className="text-gray-700 dark:text-gray-300 leading-relaxed pl-12">
                Ces conditions sont régies et interprétées conformément aux lois françaises, sans égard aux principes de conflits de lois. Tout litige découlant de ou lié à ces conditions sera soumis à la compétence exclusive des tribunaux de Paris, France.
              </Text>
            </div>
          </div>

          <Divider className="my-8" />

          <div className="text-center">
            <Text className="text-gray-600 dark:text-gray-400 italic">
              En utilisant notre application, vous reconnaissez avoir lu, compris et accepté ces Conditions Générales d'Utilisation.
            </Text>
            <div className="mt-8 flex justify-center gap-4">
              <Button 
                onClick={() => navigate(-1)}
                className="bg-gradient-to-r from-[#FF5D14] to-[#FF7A40] hover:from-[#FF7A40] hover:to-[#FF5D14] border-none rounded-md shadow-md hover:shadow-lg transition-all duration-300 text-white"
              >
                J'accepte et je retourne
              </Button>
            </div>
          </div>
        </Paper>
      </div>
    </div>
  );
};

export default Terms;
