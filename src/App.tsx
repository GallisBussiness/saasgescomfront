import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import SignIn from './pages/Authentication/SignIn';
import SignUp from './pages/Authentication/SignUp';
import ForgotPassword from './pages/Authentication/ForgotPassword';
import ResetPassword from './pages/Authentication/ResetPassword';
import VerifyEmail from './pages/Authentication/VerifyEmail';
import Subscription from './pages/Authentication/Subscription';
import PendingSubscription from './pages/Authentication/PendingSubscription';
import Success from './pages/Authentication/Success';
import Cancel from './pages/Authentication/Cancel';
import Terms from './pages/Authentication/Terms';
import Gescom from './pages/Dashboard/Gescom';
import P404 from './pages/P404';
import Clients from './pages/Dashboard/Clients';
import Articles from './pages/Dashboard/Articles';
import Settings from './pages/Dashboard/Settings';
import Fournisseurs from './pages/Dashboard/Fournisseurs';
import Achats from './pages/Dashboard/Achats';
import Ventes from './pages/Dashboard/Ventes';
import Achat from './pages/Dashboard/Achat';
import Inventory from './pages/Dashboard/Inventory';
import Inventori from './pages/Dashboard/Inventori';
import Client from './pages/Dashboard/Client';
import Overview from './pages/Dashboard/Overview';
import AnnualReport from './pages/Dashboard/AnnualReport';
import Vente from './pages/Dashboard/Vente';
import Fournisseur from './pages/Dashboard/Fournisseur';
import Depots from './pages/Dashboard/Depots';
import DepotDetails from './pages/Dashboard/DepotDetails';
import Abonnements from './pages/Dashboard/Abonnements';
import InventaireVentes from './pages/Dashboard/InventaireVentes';

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <>
      <Routes>
        <Route
          index
          element={
            <>
              <PageTitle title="Se Connecter" />
              <SignIn />
            </>
          }
        />
        
        <Route
          path="/auth/signin"
          element={
            <>
              <PageTitle title="Se Connecter" />
              <SignIn />
            </>
          }
        />

        <Route
          path="/auth/signup"
          element={
            <>
              <PageTitle title="S'inscrire" />
              <SignUp />
            </>
          }
        />
        
        <Route
          path="/auth/forgot-password"
          element={
            <>
              <PageTitle title="Mot de passe oublié" />
              <ForgotPassword />
            </>
          }
        />
        
        <Route
          path="/auth/reset-password"
          element={
            <>
              <PageTitle title="Réinitialiser le mot de passe" />
              <ResetPassword />
            </>
          }
        />
        
        <Route
          path="/auth/verify-email"
          element={
            <>
              <PageTitle title="Vérification d'email" />
              <VerifyEmail />
            </>
          }
        />

        <Route
          path="/subscription/:userId"
          element={
            <>
              <PageTitle title="Choisir un abonnement" />
              <Subscription />
            </>
          }
        />
        
        <Route
          path="/auth/terms"
          element={
            <>
              <PageTitle title="Conditions d'utilisation" />
              <Terms />
            </>
          }
        />
        
        <Route
          path="/auth/pending-subscription"
          element={
            <>
              <PageTitle title="Abonnement en attente" />
              <PendingSubscription />
            </>
          }
        />
        
        <Route
          path="/success"
          element={
            <>
              <PageTitle title="Paiement réussi" />
              <Success />
            </>
          }
        />
        
        <Route
          path="/cancel"
          element={
            <>
              <PageTitle title="Paiement annulé" />
              <Cancel />
            </>
          }
        />
      <Route
          path="/dashboard/*"
          element={
            <>
              <PageTitle title="Gallis" />
              <Gescom />
            </>
          }
        >
          <Route
          index
          element={
            <>
              <PageTitle title="Gallis/Tableau de bord" />
             <Overview />
            </>
          }
        />
         <Route
          path="settings"
          element={
            <>
              <PageTitle title="Gallis/settings" />
             <Settings />
            </>
          }
        />
        <Route
          path="abonnements"
          element={
            <>
              <PageTitle title="Gallis/Mes abonnements" />
             <Abonnements />
            </>
          }
        />
         <Route
          path="clients"
          element={
            <>
              <PageTitle title="Gallis/Clients" />
             <Clients />
            </>
          }
        />
         <Route
          path="clients/:id"
          element={
            <>
              <PageTitle title="Gallis/Client" />
             <Client />
            </>
          }
        />
         <Route
          path="fournisseurs"
          element={
            <>
              <PageTitle title="Gallis/Fournisseurs" />
             <Fournisseurs />
            </>
          }
        />
        <Route
          path="fournisseurs/:id"
          element={
            <>
              <PageTitle title="Gallis/Fournisseur" />
             <Fournisseur />
            </>
          }
        />
         <Route
          path="depots"
          element={
            <>
              <PageTitle title="Gallis/Dépôts de stockage" />
             <Depots />
            </>
          }
        />
        <Route
          path="depots/:id"
          element={
            <>
              <PageTitle title="Gallis/Détails du dépôt" />
             <DepotDetails />
            </>
          }
        />
         <Route
          path="articles"
          element={
            <>
              <PageTitle title="Gallis/Articles" />
             <Articles />
            </>
          }
        />

      <Route
          path="approvisionnements"
          element={
            <>
              <PageTitle title="Gallis/Achats" />
             <Achats />
            </>
          }
        />
        <Route
          path="approvisionnements/:id"
          element={
            <>
              <PageTitle title="Gallis/achat" />
             <Achat />
            </>
          }
        />
         <Route
          path="ventes"
          element={
            <>
              <PageTitle title="Gallis/Ventes" />
             <Ventes />
            </>
          }
        />
        <Route
          path="ventes/:id"
          element={
            <>
              <PageTitle title="Gallis/Vente" />
             <Vente />
            </>
          }
        />
        <Route
          path="inventaire-ventes"
          element={
            <>
              <PageTitle title="Gallis/Inventaire des Ventes" />
             <InventaireVentes />
            </>
          }
        />

<Route
          path="stock"
          element={
            <>
              <PageTitle title="Gallis/stock" />
             <Inventory />
            </>
          }
        />
        <Route
          path="stock/:id"
          element={
            <>
              <PageTitle title="Gallis/stock" />
             <Inventori />
            </>
          }
        />
        <Route
          path="annual-report"
          element={
            <>
              <PageTitle title="Gallis/Rapport Annuel" />
             <AnnualReport />
            </>
          }
        />
       
    </Route>
    <Route
          path="*"
          element={
            <>
              <PageTitle title="Page Non Trouve" />
              <P404 />
            </>
          }
        />
      </Routes>
    </>
  );
}

export default App;
