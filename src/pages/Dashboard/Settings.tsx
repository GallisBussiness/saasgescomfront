import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { FaCog, FaRuler, FaTags } from "react-icons/fa";
import { Tabs, Paper, Text, Divider } from '@mantine/core';
import Unites from './Unites';
import Familles from './Familles';
import Parametres from './Params/Parametres';


const Settings = () => {
  return (
    <div className="mx-auto p-4">
      <Breadcrumb pageName="Paramétrage" />
      
      <Paper 
        p="md" 
        radius="md" 
        className="bg-white dark:bg-gray-800 shadow-xl mb-4"
        style={{
          backgroundImage: "linear-gradient(to right bottom, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9))",
          backdropFilter: "blur(10px)"
        }}
      >
        <div className="mb-4">
          <Text fw={600} size="lg" className="text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <FaCog className="text-orange-500" /> Configuration du système
          </Text>
          <Text size="sm" color="dimmed" className="mt-1">
            Gérez les paramètres de votre entreprise, les unités de mesure et les familles d'articles
          </Text>
          <Divider className="my-3" />
        </div>
        
        <Tabs 
          defaultValue="parametres"
          variant="pills"
          styles={{
            root: { width: '100%' },
            list: { marginBottom: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.25rem' },
            tab: { fontWeight: 500, transition: 'all 0.2s' },
            panel: { paddingTop: '1rem' }
          }}
          classNames={{
            tab: "font-medium transition-all duration-200 text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400"
          }}
        >
          <Tabs.List>
            <Tabs.Tab 
              value="parametres" 
              leftSection={<FaCog className="text-orange-500" />}
              className="data-[active=true]:bg-gradient-to-r data-[active=true]:from-orange-500 data-[active=true]:to-orange-600 data-[active=true]:text-white"
            >
              Paramètres
            </Tabs.Tab>
            <Tabs.Tab 
              value="unites" 
              leftSection={<FaRuler className="text-orange-500" />}
              className="data-[active=true]:bg-gradient-to-r data-[active=true]:from-orange-500 data-[active=true]:to-orange-600 data-[active=true]:text-white"
            >
              Unités
            </Tabs.Tab>
            <Tabs.Tab 
              value="familles" 
              leftSection={<FaTags className="text-orange-500" />}
              className="data-[active=true]:bg-gradient-to-r data-[active=true]:from-orange-500 data-[active=true]:to-orange-600 data-[active=true]:text-white"
            >
              Familles
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="parametres">
            <Parametres />
          </Tabs.Panel>

          <Tabs.Panel value="unites">
            <Unites />
          </Tabs.Panel>

          <Tabs.Panel value="familles">
            <Familles />
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </div>
  );
};

export default Settings;
