import { App, Button, Checkbox, Form, Input } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { authclient } from "../../../lib/auth-client";
import { RegisterInterface } from "../../interfaces/register.interface";
import { Title, Divider, Paper, Text } from "@mantine/core";
import { FaLock, FaEnvelope, FaUser, FaArrowRight, FaCloud, FaChartLine, FaLaptopCode } from "react-icons/fa";
import { FaShield } from "react-icons/fa6";


const SignUp: React.FC = () => {
  const { message } = App.useApp();
  const [isPending, setIsPending] = useState(false);
  const navigate = useNavigate();

  const token  = localStorage.getItem("ges_com_token");
  
  useEffect(() => {
  if (Boolean(token) === true && token !== 'null') {
      navigate('/dashboard', { replace: true });
    }
  }, [token]);

  const onRegister = async (values: RegisterInterface) => {
    setIsPending(true);
    try {
      const res = await authclient.signUp.email({
        email: values.email,
        password: values.password,
        name: values.name,
      },{
        onSuccess: (ctx)=>{
          const authToken = ctx.response.headers.get("set-auth-token") // get the token from the response headers
          // Store the token securely (e.g., in localStorage)
          localStorage.setItem("ges_com_token", authToken!);
        }
      });
      if (res?.error) {
        message.error(res.error.message);
      } else {
        message.warning("Votre email n'a pas été vérifié. Vous allez être redirigé pour demander un nouvel email de vérification.");
        navigate(`/auth/verify-email?email=${encodeURIComponent(values.email)}`);
      }
    } catch (error: any) {
      console.error(error);
      message.error(error?.message || "Une erreur s'est produite lors de l'inscription");
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
                Créez votre compte
              </Title>
              <Text size="sm" className="text-gray-600 dark:text-gray-400 mt-2">
                Ou{" "}
                <Link
                  to="/auth/signin"
                  className="font-medium text-[#FF5D14] hover:text-orange-600 transition-colors duration-300"
                >
                  connectez-vous à votre compte existant
                </Link>
              </Text>
            </div>

            <Divider className="my-6" />

            <Form
              name="register"
              layout="vertical"
              onFinish={(values) => {
                // Utiliser directement les valeurs d'Ant Design au lieu de passer par Mantine
                onRegister(values);
              }}
              autoComplete="off"
              className="space-y-4"
            >
              <Form.Item
                label={<span className="text-gray-700 dark:text-gray-300 font-medium">Nom</span>}
                name="name"
                rules={[
                  {
                    required: true,
                    message: "Veuillez entrer votre nom",
                  },
                ]}
              >
                <Input
                  prefix={<FaUser className="text-[#FF5D14]" />}
                  placeholder="Entrez votre nom"
                  size="large"
                  className="rounded-md border-gray-300 dark:border-gray-600 focus:border-[#FF5D14] focus:shadow-md transition-all duration-300"
                  name="name"
                />
              </Form.Item>

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
                  name="email"
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
                  {
                    min: 8,
                    message: "Le mot de passe doit contenir au moins 8 caractères",
                  },
                ]}
              >
                <Input.Password
                  prefix={<FaLock className="text-[#FF5D14]" />}
                  placeholder="Entrez votre mot de passe"
                  size="large"
                  className="rounded-md border-gray-300 dark:border-gray-600 focus:border-[#FF5D14] focus:shadow-md transition-all duration-300"
                  name="password"
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
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Les mots de passe ne correspondent pas")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<FaShield className="text-[#FF5D14]" />}
                  placeholder="Confirmez votre mot de passe"
                  size="large"
                  className="rounded-md border-gray-300 dark:border-gray-600 focus:border-[#FF5D14] focus:shadow-md transition-all duration-300"
                  name="confirmPassword"
                />
              </Form.Item>

              <Form.Item
                name="terms"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, value) =>
                      value
                        ? Promise.resolve()
                        : Promise.reject(new Error('Veuillez accepter les conditions d\'utilisation')),
                  },
                ]}
              >
                <Checkbox className="text-gray-700 dark:text-gray-300">
                  J'accepte les <Link to="/auth/terms" className="text-[#FF5D14] hover:text-orange-600 transition-colors duration-300">conditions d'utilisation</Link>
                </Checkbox>
              </Form.Item>
              <Form.Item>
                <Button
                  htmlType="submit"
                  className="w-full h-12 flex items-center justify-center bg-gradient-to-r from-[#FF5D14] to-[#FF7A40] hover:from-[#FF7A40] hover:to-[#FF5D14] border-none rounded-md shadow-md hover:shadow-lg transition-all duration-300 text-base font-medium text-white"
                  loading={isPending}
                >
                  <span className="mr-2">S'inscrire</span>
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
                  <FaLaptopCode className="text-white text-2xl" />
                </div>
                <div>
                  <Title order={3} className="font-semibold text-white mb-1">Interface intuitive</Title>
                  <Text className="text-white/80">Une expérience utilisateur moderne et fluide</Text>
                </div>
              </div>

              <div className="flex items-start gap-6 transform transition-transform duration-300 hover:translate-x-2">
                <div className="p-4 bg-white/20 backdrop-blur-md rounded-xl shadow-lg">
                  <FaChartLine className="text-white text-2xl" />
                </div>
                <div>
                  <Title order={3} className="font-semibold text-white mb-1">Tableaux de bord</Title>
                  <Text className="text-white/80">Suivez vos performances commerciales</Text>
                </div>
              </div>

              <div className="flex items-start gap-6 transform transition-transform duration-300 hover:translate-x-2">
                <div className="p-4 bg-white/20 backdrop-blur-md rounded-xl shadow-lg">
                  <FaCloud className="text-white text-2xl" />
                </div>
                <div>
                  <Title order={3} className="font-semibold text-white mb-1">Sauvegarde cloud</Title>
                  <Text className="text-white/80">Accédez à vos données depuis n'importe où</Text>
                </div>
              </div>
            </div>

            <div className="mt-12 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
              <Text className="text-white/90 italic">
                "Rejoignez notre communauté d'entrepreneurs et simplifiez votre gestion commerciale dès aujourd'hui."
              </Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
