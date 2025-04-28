import { App, Button, Checkbox, Form, Input } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { authclient } from "../../../lib/auth-client";
import { LoginInterface } from "../../interfaces/login.interface";
import { Title, Divider, Paper, Text } from "@mantine/core";
import { FaLock, FaEnvelope, FaUsers, FaChartLine, FaFileInvoice, FaMoneyBillWave, FaArrowRight } from "react-icons/fa";

const SignIn: React.FC = () => {
  const { message } = App.useApp();
  const [isPending, setIsPending] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("ges_com_token");

  useEffect(() => {
if (token &&token !== 'null') {
      navigate('/dashboard', { replace: true });
    }
  }, [token]);
  
  // Nous n'utilisons plus Mantine Form car il y a un conflit avec Ant Design Form

const onLogin = async (values: LoginInterface) => {
    setIsPending(true);
    try {
      const res = await authclient.signIn.email({
        email: values.email,
        password: values.password,
        callbackURL: '/dashboard',
       
      },{
        onSuccess: (ctx)=>{
          const authToken = ctx.response.headers.get("set-auth-token") // get the token from the response headers
          // Store the token securely (e.g., in localStorage)
          localStorage.setItem("ges_com_token", authToken!);
        }
      });
      
      if(res?.error) {
        // Vérifier si l'erreur est due à un email non vérifié
        if(res.error.code === "EMAIL_NOT_VERIFIED") {
          message.warning("Votre email n'a pas été vérifié. Vous allez être redirigé pour demander un nouvel email de vérification.");
          navigate(`/auth/verify-email?email=${encodeURIComponent(values.email)}`);
        } else {
          message.error("Identifiants incorrects");
        }
      } else {
        message.success("Connexion réussie !");
        navigate('/dashboard');
      }
    } catch (error) {
      console.error(error);
      message.error("Une erreur s'est produite lors de la connexion");
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
                Connectez-vous à votre compte
              </Title>
              <Text size="sm" className="text-gray-600 dark:text-gray-400 mt-2">
                Ou{" "}
                <Link
                  to="/auth/signup"
                  className="font-medium text-[#FF5D14] hover:text-orange-600 transition-colors duration-300"
                >
                  créez un nouveau compte
                </Link>
              </Text>
            </div>

            <Divider className="my-6" />

            <Form
              name="login"
              layout="vertical"
              onFinish={(values) => {
                // Utiliser directement les valeurs d'Ant Design au lieu de passer par Mantine
                onLogin(values);
              }}
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

              <Form.Item
                label={<span className="text-gray-700 dark:text-gray-300 font-medium">Mot de passe</span>}
                name="password"
                rules={[
                  {
                    required: true,
                    message: "Veuillez entrer votre mot de passe",
                  },
                ]}
              >
                <Input.Password
                  prefix={<FaLock className="text-[#FF5D14]" />}
                  placeholder="Entrez votre mot de passe"
                  size="large"
                  className="rounded-md border-gray-300 dark:border-gray-600 focus:border-[#FF5D14] focus:shadow-md transition-all duration-300"
                />
              </Form.Item>

              <Form.Item>
                <div className="flex items-center justify-between">
                  <Checkbox className="text-gray-600 dark:text-gray-400">
                    <span className="ml-1">Se souvenir de moi</span>
                  </Checkbox>
                  <Link
                    to="/auth/forgot-password"
                    className="text-sm font-medium text-[#FF5D14] hover:text-orange-600 transition-colors duration-300"
                  >
                    Mot de passe oublié?
                  </Link>
                </div>
              </Form.Item>

              <Form.Item>
                <Button
                  htmlType="submit"
                  className="w-full h-12 flex items-center justify-center bg-gradient-to-r from-[#FF5D14] to-[#FF7A40] hover:from-[#FF7A40] hover:to-[#FF5D14] border-none rounded-md shadow-md hover:shadow-lg transition-all duration-300 text-base font-medium text-white"
                  loading={isPending}
                >
                  <span className="mr-2">Se connecter</span>
                  {!isPending && <FaArrowRight />}
                </Button>
              </Form.Item>
            </Form>
          </Paper>
        </div>
      </div>

      <div className="relative flex-1 hidden w-0 lg:block">
        <div className="absolute inset-0 object-cover w-full h-full bg-gradient-to-br from-[#FF5D14] to-[#FF7A40]">
          <div className="flex flex-col justify-center h-full p-12 text-white">
            <Title order={1} className="text-4xl font-bold mb-6 text-white">Gestion Commerciale</Title>
            <Text size="xl" className="mb-10 text-white opacity-90">Gérez efficacement votre activité commerciale</Text>

            <div className="space-y-8">
              <div className="flex items-start gap-6 transform transition-transform duration-300 hover:translate-x-2">
                <div className="p-4 bg-white/20 backdrop-blur-md rounded-xl shadow-lg">
                  <FaFileInvoice className="text-white text-2xl" />
                </div>
                <div>
                  <Title order={3} className="font-semibold text-white mb-1">Facturation simplifiée</Title>
                  <Text className="text-white/80">Créez et gérez vos factures facilement</Text>
                </div>
              </div>

              <div className="flex items-start gap-6 transform transition-transform duration-300 hover:translate-x-2">
                <div className="p-4 bg-white/20 backdrop-blur-md rounded-xl shadow-lg">
                  <FaMoneyBillWave className="text-white text-2xl" />
                </div>
                <div>
                  <Title order={3} className="font-semibold text-white mb-1">Suivi des paiements</Title>
                  <Text className="text-white/80">Gardez un œil sur vos entrées et sorties d'argent</Text>
                </div>
              </div>

              <div className="flex items-start gap-6 transform transition-transform duration-300 hover:translate-x-2">
                <div className="p-4 bg-white/20 backdrop-blur-md rounded-xl shadow-lg">
                  <FaUsers className="text-white text-2xl" />
                </div>
                <div>
                  <Title order={3} className="font-semibold text-white mb-1">Gestion des clients</Title>
                  <Text className="text-white/80">Centralisez vos données clients</Text>
                </div>
              </div>

              <div className="flex items-start gap-6 transform transition-transform duration-300 hover:translate-x-2">
                <div className="p-4 bg-white/20 backdrop-blur-md rounded-xl shadow-lg">
                  <FaChartLine className="text-white text-2xl" />
                </div>
                <div>
                  <Title order={3} className="font-semibold text-white mb-1">Tableaux de bord</Title>
                  <Text className="text-white/80">Visualisez vos performances commerciales</Text>
                </div>
              </div>
            </div>

            <div className="mt-12 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
              <Text className="text-white/90 italic">
                "Une interface moderne et intuitive pour gérer efficacement votre entreprise."
              </Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
