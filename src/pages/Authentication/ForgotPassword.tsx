import { App, Button, Form, Input } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Title, Divider, Paper, Text } from "@mantine/core";
import { FaEnvelope, FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { authclient } from "../../../lib/auth-client";

const ForgotPassword: React.FC = () => {
  const { message } = App.useApp();
  const [isPending, setIsPending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const onRequestReset = async (values: { email: string }) => {
    setIsPending(true);
    try {
      const { data, error } = await authclient.forgetPassword({
        email: values.email,
        redirectTo: import.meta.env.VITE_APP_URL + "/auth/reset-password",
      });
      if(error) {
        message.error("Une erreur s'est produite. Veuillez vérifier votre email.");
      } else {
        if(data?.status) {
          setEmailSent(true);
          message.success("Instructions de réinitialisation envoyées à votre email !");
        }
      }
    } catch (error) {
      console.error(error);
      message.error("Une erreur s'est produite lors de l'envoi des instructions");
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
                {emailSent ? "Vérifiez votre email" : "Mot de passe oublié"}
              </Title>
              <Text size="sm" className="text-gray-600 dark:text-gray-400 mt-2">
                {emailSent 
                  ? "Nous avons envoyé les instructions de réinitialisation à votre adresse email" 
                  : "Entrez votre email pour recevoir un lien de réinitialisation"}
              </Text>
            </div>

            <Divider className="my-6" />

            {emailSent ? (
              <div className="space-y-6">
                <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                  <Text className="text-green-700 dark:text-green-400 text-center">
                    Veuillez consulter votre boîte de réception et suivre les instructions pour réinitialiser votre mot de passe.
                  </Text>
                </div>
                
                <Button
                  onClick={() => navigate('/auth/signin')}
                  className="w-full h-12 flex items-center justify-center bg-gradient-to-r from-[#FF5D14] to-[#FF7A40] hover:from-[#FF7A40] hover:to-[#FF5D14] border-none rounded-md shadow-md hover:shadow-lg transition-all duration-300 text-base font-medium text-white"
                >
                  <FaArrowLeft className="mr-2" />
                  <span>Retour à la connexion</span>
                </Button>
              </div>
            ) : (
              <Form
                name="forgotPassword"
                layout="vertical"
                onFinish={onRequestReset}
                autoComplete="off"
                className="space-y-4"
              >
                <Form.Item
                  label={<span className="text-gray-700 dark:text-gray-300 font-medium">Email</span>}
                  name="email"
                  rules={[
                    {
                      required: true,
                      message: "Veuillez entrer votre email",
                    },
                    {
                      type: "email",
                      message: "Veuillez entrer un email valide",
                    },
                  ]}
                >
                  <Input
                    prefix={<FaEnvelope className="text-[#FF5D14]" />}
                    placeholder="Entrez votre email"
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
                    <span className="mr-2">Envoyer les instructions</span>
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
            <Title order={1} className="text-4xl font-bold mb-6 text-white">Réinitialisation de mot de passe</Title>
            <Text size="xl" className="mb-10 text-white opacity-90">Récupérez l'accès à votre compte en quelques étapes simples</Text>

            <div className="space-y-8">
              <div className="flex items-start gap-6 transform transition-transform duration-300 hover:translate-x-2">
                <div className="p-4 bg-white/20 backdrop-blur-md rounded-xl shadow-lg">
                  <FaEnvelope className="text-white text-2xl" />
                </div>
                <div>
                  <Title order={3} className="font-semibold text-white mb-1">Vérification par email</Title>
                  <Text className="text-white/80">Nous vous envoyons un lien sécurisé par email</Text>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
