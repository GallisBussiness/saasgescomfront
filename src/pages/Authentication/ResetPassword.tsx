import { App, Button, Form, Input } from "antd";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { authclient } from "../../../lib/auth-client";
import { Title, Divider, Paper, Text } from "@mantine/core";
import { FaLock, FaArrowRight, FaArrowLeft, FaCheckCircle } from "react-icons/fa";

const ResetPassword: React.FC = () => {
  const { message } = App.useApp();
  const [isPending, setIsPending] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  if (!token) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col justify-center flex-1 px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="w-full max-w-md mx-auto">
            <Paper 
              p="xl" 
              radius="lg" 
              className="bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700"
              style={{
                backgroundImage: "linear-gradient(to right bottom, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9))",
                backdropFilter: "blur(10px)"
              }}
            >
              <div className="text-center mb-6">
                <img
                  className="w-auto h-16 mx-auto mb-4"
                  src="/img/gallis.png"
                  alt="Gestion Commerciale"
                />
                <Title order={2} className="text-gray-800 dark:text-white font-bold tracking-tight">
                  Lien invalide
                </Title>
              </div>

              <Divider className="my-6" />

              <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-100 dark:border-red-800 mb-6">
                <Text className="text-red-700 dark:text-red-400 text-center">
                  Le lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.
                </Text>
              </div>
              
              <Button
                onClick={() => navigate('/auth/forgot-password')}
                className="w-full h-12 flex items-center justify-center bg-gradient-to-r from-[#FF5D14] to-[#FF7A40] hover:from-[#FF7A40] hover:to-[#FF5D14] border-none rounded-md shadow-md hover:shadow-lg transition-all duration-300 text-base font-medium text-white"
              >
                <span className="mr-2">Demander un nouveau lien</span>
                <FaArrowRight />
              </Button>
            </Paper>
          </div>
        </div>
      </div>
    );
  }

  const onResetPassword = async (values: { password: string; confirmPassword: string }) => {
    if (values.password !== values.confirmPassword) {
      message.error("Les mots de passe ne correspondent pas");
      return;
    }

    setIsPending(true);
    try {
      // Utiliser l'API d'authentification existante pour réinitialiser le mot de passe
      const { data} = await authclient.resetPassword({
        token,
        newPassword: values.password,
      });
      if(data?.status) {
        setResetComplete(true);
        message.success("Votre mot de passe a été réinitialisé avec succès !");
        navigate('/auth/signin');
      }
    } catch (error) {
      console.error(error);
      message.error("Une erreur s'est produite lors de la réinitialisation du mot de passe");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex flex-col justify-center flex-1 px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="w-full max-w-md mx-auto">
          <Paper 
            p="xl" 
            radius="lg" 
            className="bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700"
            style={{
              backgroundImage: "linear-gradient(to right bottom, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9))",
              backdropFilter: "blur(10px)"
            }}
          >
            <div className="text-center mb-6">
              <img
                className="w-auto h-16 mx-auto mb-4"
                src="/img/gallis.png"
                alt="Gestion Commerciale"
              />
              <Title order={2} className="text-gray-800 dark:text-white font-bold tracking-tight">
                {resetComplete ? "Mot de passe réinitialisé" : "Créer un nouveau mot de passe"}
              </Title>
              <Text size="sm" className="text-gray-600 dark:text-gray-400 mt-2">
                {resetComplete 
                  ? "Votre mot de passe a été mis à jour avec succès" 
                  : "Veuillez entrer votre nouveau mot de passe"}
              </Text>
            </div>

            <Divider className="my-6" />

            {resetComplete ? (
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center p-6">
                  <FaCheckCircle className="text-green-500 text-5xl mb-4" />
                  <Text className="text-gray-700 dark:text-gray-300 text-center mb-4">
                    Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
                  </Text>
                </div>
                
                <Button
                  onClick={() => navigate('/auth/signin')}
                  className="w-full h-12 flex items-center justify-center bg-gradient-to-r from-[#FF5D14] to-[#FF7A40] hover:from-[#FF7A40] hover:to-[#FF5D14] border-none rounded-md shadow-md hover:shadow-lg transition-all duration-300 text-base font-medium text-white"
                >
                  <span className="mr-2">Se connecter</span>
                  <FaArrowRight />
                </Button>
              </div>
            ) : (
              <Form
                name="resetPassword"
                layout="vertical"
                onFinish={onResetPassword}
                autoComplete="off"
                className="space-y-4"
              >
                <Form.Item
                  label={<span className="text-gray-700 dark:text-gray-300 font-medium">Nouveau mot de passe</span>}
                  name="password"
                  rules={[
                    {
                      required: true,
                      message: "Veuillez entrer votre nouveau mot de passe",
                    },
                    {
                      min: 8,
                      message: "Le mot de passe doit contenir au moins 8 caractères",
                    },
                  ]}
                >
                  <Input.Password
                    prefix={<FaLock className="text-[#FF5D14]" />}
                    placeholder="Entrez votre nouveau mot de passe"
                    size="large"
                    className="rounded-md border-gray-300 dark:border-gray-600 focus:border-[#FF5D14] focus:shadow-md transition-all duration-300"
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="text-gray-700 dark:text-gray-300 font-medium">Confirmer le mot de passe</span>}
                  name="confirmPassword"
                  rules={[
                    {
                      required: true,
                      message: "Veuillez confirmer votre mot de passe",
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Les deux mots de passe ne correspondent pas'));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<FaLock className="text-[#FF5D14]" />}
                    placeholder="Confirmez votre mot de passe"
                    size="large"
                    className="rounded-md border-gray-300 dark:border-gray-600 focus:border-[#FF5D14] focus:shadow-md transition-all duration-300"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    htmlType="submit"
                    className="w-full h-12 flex items-center justify-center bg-gradient-to-r from-[#FF5D14] to-[#FF7A40] hover:from-[#FF7A40] hover:to-[#FF5D14] border-none rounded-md shadow-md hover:shadow-lg transition-all duration-300 text-base font-medium text-white"
                    loading={isPending}
                  >
                    <span className="mr-2">Réinitialiser le mot de passe</span>
                    {!isPending && <FaArrowRight />}
                  </Button>
                </Form.Item>

                <div className="text-center mt-4">
                  <Link
                    to="/auth/signin"
                    className="text-sm font-medium text-[#FF5D14] hover:text-orange-600 transition-colors duration-300 flex items-center justify-center"
                  >
                    <FaArrowLeft className="mr-1" />
                    <span>Retour à la connexion</span>
                  </Link>
                </div>
              </Form>
            )}
          </Paper>
        </div>
      </div>

      <div className="relative flex-1 hidden w-0 lg:block">
        <div className="absolute inset-0 object-cover w-full h-full bg-gradient-to-br from-[#FF5D14] to-[#FF7A40]">
          <div className="flex flex-col justify-center h-full p-12 text-white">
            <Title order={1} className="text-4xl font-bold mb-6 text-white">Sécurité de votre compte</Title>
            <Text size="xl" className="mb-10 text-white opacity-90">Créez un mot de passe fort pour protéger vos données</Text>

            <div className="space-y-8">
              <div className="flex items-start gap-6 transform transition-transform duration-300 hover:translate-x-2">
                <div className="p-4 bg-white/20 backdrop-blur-md rounded-xl shadow-lg">
                  <FaLock className="text-white text-2xl" />
                </div>
                <div>
                  <Title order={3} className="font-semibold text-white mb-1">Mot de passe sécurisé</Title>
                  <Text className="text-white/80">Utilisez un mot de passe fort avec des caractères variés</Text>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
