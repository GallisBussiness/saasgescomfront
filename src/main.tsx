import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { App as AntdApp } from 'antd';
import App from './App';
import '@mantine/core/styles.css';
import 'mantine-datatable/styles.css';
import '@mantine/dropzone/styles.css';
import './css/style.css';
import '@mantine/dates/styles.css';
// import AuthProvider from 'react-auth-kit';
// import createStore from 'react-auth-kit/createStore';
import { fr } from 'date-fns/locale';
import 'dayjs/locale/fr';
import { Toaster, toast } from 'sonner';

setDefaultOptions({ locale: fr })

// const store = createStore({
//   authName: import.meta.env.VITE_TOKENSTORAGENAME,
//   authType:'localstorage',
//   cookieDomain: window.location.hostname,
//   cookieSecure: window.location.protocol === 'https:',
// });

import { createTheme, MantineProvider } from '@mantine/core';
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DatesProvider } from '@mantine/dates';
import { setDefaultOptions } from 'date-fns';

const theme = createTheme({

});
function getSuccessMessage() {
  return "Opération réussie : la requête a été traitée avec succès.";
}

function getErrorMessage(statusCode: number) {
  switch (statusCode) {
    case 400:
      return "Erreur de requête : la syntaxe de la requête est incorrecte.";
    case 401:
      return "Erreur d'authentification : vous n'avez pas les droits d'accès.";
    case 403:
      return "Accès refusé : vous n'avez pas la permission d'accéder à cette ressource.";
    case 404:
      return "Erreur 404 : la page demandée n'a pas été trouvée.";
    case 500:
      return "Erreur interne du serveur : une erreur inattendue est survenue.";
    case 502:
      return "Erreur de passerelle : le serveur a reçu une réponse invalide.";
    case 503:
      return "Service indisponible : le serveur est actuellement en maintenance.";
    default:
      return "Erreur inconnue : veuillez réessayer plus tard.";
  }
}
const queryClient = new QueryClient(
  {
    mutationCache: new MutationCache({
      onSuccess:()=> {
        toast.success(getSuccessMessage())
      },
      onError: (error: any) => {
        if(error?.response?.data?.statusCode){
          toast.error(getErrorMessage(error.response.data.statusCode))
        } else {
          toast.error(getErrorMessage(error))
        }
      }
    }),
    queryCache: new QueryCache({
      onError: (error: any) => {
        if(error?.response?.data?.statusCode){
          toast.error(getErrorMessage(error.response.data.statusCode))
        } else {
          toast.error(getErrorMessage(error))
        }
      }
    })
  }
)


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <MantineProvider theme={theme}>
    <Toaster />
    <DatesProvider settings={{ locale: 'fr' }}>
      <QueryClientProvider client={queryClient}>
       <Router>
        <AntdApp>
           <App />
        </AntdApp>
    </Router>
    </QueryClientProvider>
    </DatesProvider>
   
    </MantineProvider>
   
  </React.StrictMode>,
);
