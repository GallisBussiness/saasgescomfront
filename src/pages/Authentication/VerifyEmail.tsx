import { App, Button, Form, Input } from "antd";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { authclient } from "../../../lib/auth-client";
import { Title, Divider, Paper, Text } from "@mantine/core";
import { FaEnvelope, FaArrowRight, FaArrowLeft, FaCheckCircle } from "react-icons/fa";

const VerifyEmail: React.FC = () => {
  const { message } = App.useApp();
  const [isPending, setIsPending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');

  const onResendVerification = async (values: { email: string }) => {
    setIsPending(true);
    try {
      // Utiliser la méthode sendVerificationEmail disponible dans l'API
      const { data, error } = await authclient.sendVerificationEmail({
        email: values.email,
        callbackURL: import.meta.env.VITE_APP_URL + '/auth/signin',
      });
      
      if(error) {
        message.error("Une erreur s'est produite lors de l'envoi de l'email de vérification");
      } else {
        if(data?.status) {
          setEmailSent(true);
          message.success("Email de vérification envoyé avec succès !");
        }
      }
    } catch (error) {
      console.error(error);
      message.error("Une erreur s'est produite lors de l'envoi de l'email de vérification");
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
                {emailSent ? "Email envoyé" : "Vérification d'email requise"}
              </Title>
              <Text size="sm" className="text-gray-600 dark:text-gray-400 mt-2">
                {emailSent 
                  ? "Veuillez vérifier votre boîte de réception" 
                  : "Votre email n'a pas été vérifié. Veuillez vérifier votre boîte de réception ou demander un nouvel email de vérification."}
              </Text>
            </div>

            <Divider className="my-6" />

            {emailSent ? (
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center p-6">
                  <FaCheckCircle className="text-green-500 text-5xl mb-4" />
                  <Text className="text-gray-700 dark:text-gray-300 text-center mb-4">
                    Un nouvel email de vérification a été envoyé à votre adresse email. Veuillez vérifier votre boîte de réception et cliquer sur le lien de vérification.
                  </Text>
                </div>
                
                <Button
                  onClick={() => navigate('/auth/signin')}
                  className="w-full h-12 flex items-center justify-center bg-gradient-to-r from-[#FF5D14] to-[#FF7A40] hover:from-[#FF7A40] hover:to-[#FF5D14] border-none rounded-md shadow-md hover:shadow-lg transition-all duration-300 text-base font-medium text-white"
                >
                  <span className="mr-2">Retour à la connexion</span>
                  <FaArrowRight />
                </Button>
              </div>
            ) : (
              <div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-100 dark:border-yellow-800 mb-6">
                  <Text className="text-yellow-700 dark:text-yellow-400 text-center">
                    Votre compte a été créé mais votre adresse email n'a pas été vérifiée. Veuillez vérifier votre boîte de réception ou demander un nouvel email de vérification.
                  </Text>
                </div>
                
                <Form
                  name="verifyEmail"
                  layout="vertical"
                  initialValues={{ email: email || '' }}
                  onFinish={onResendVerification}
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
                      <span className="mr-2">Renvoyer l'email de vérification</span>
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
              </div>
            )}
          </Paper>
        </div>
      </div>

      <div className="relative flex-1 hidden w-0 lg:block">
        <div className="absolute inset-0 object-cover w-full h-full bg-gradient-to-br from-[#FF5D14] to-[#FF7A40]">
          <div className="flex flex-col justify-center h-full p-12 text-white">
            <Title order={1} className="text-4xl font-bold mb-6 text-white">Vérification d'email</Title>
            <Text size="xl" className="mb-10 text-white opacity-90">Sécurisez votre compte en vérifiant votre adresse email</Text>

            <div className="space-y-8">
              <div className="flex items-start gap-6 transform transition-transform duration-300 hover:translate-x-2">
                <div className="p-4 bg-white/20 backdrop-blur-md rounded-xl shadow-lg">
                  <FaEnvelope className="text-white text-2xl" />
                </div>
                <div>
                  <Title order={3} className="font-semibold text-white mb-1">Vérification simple</Title>
                  <Text className="text-white/80">Cliquez sur le lien dans votre email pour activer votre compte</Text>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
