import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { yupResolver } from 'mantine-form-yup-resolver';
import * as yup from 'yup';
import { ParamService } from '../../../services/paramservice';
import { useDisclosure } from '@mantine/hooks';
import { Modal, NumberInput, TextInput, Button, LoadingOverlay, Text, Avatar, Textarea, Paper, Title, Badge, Group, Card, Divider, ActionIcon, Tooltip } from '@mantine/core';
import { FileCard, FileUploader, Pane } from 'evergreen-ui';
import { useForm } from '@mantine/form';
import { useCallback, useState } from 'react';
import { authclient } from '../../../../lib/auth-client';
import { FaBuilding, FaPhone, FaEnvelope, FaMapMarkerAlt, FaEdit, FaFileInvoice, FaInfoCircle, FaUpload, FaPercentage, FaIdCard, FaFileAlt, FaSave, FaCheck } from 'react-icons/fa';

const schema = yup.object().shape({
  nom: yup.string().required('Nom invalide'),
  tva: yup.number(),
  num_siret: yup.string(),
  ninea: yup.string(),
  email: yup.string().email('Email invalide'),
  tel: yup.string(),
  addr: yup.string(),
  desc: yup.string(),
  userId: yup.string().required('Utilisateur invalide'),
});

function Parametres() {
  const { data: session } = authclient.useSession() 
  const paramService = new ParamService();
  const [opened, { open, close }] = useDisclosure(false);
  const [openedU, { open:openU, close:closeU }] = useDisclosure(false);
  const [openedM, { open:openM, close:closeM }] = useDisclosure(false);
  const [files, setFiles] = useState<any>([])
  const [fileRejections, setFileRejections] = useState<any>([])
  const handleChange = useCallback((files: any[]) => setFiles([files[0]]), [])
  const handleRejected = useCallback((fileRejections: any[]) => setFileRejections([fileRejections[0]]), [])
  const handleRemove = useCallback(() => {
    setFiles([])
    setFileRejections([])
  }, [])
  const qc = useQueryClient();
  const key = ['param', session?.user.id];
  const {data:param,isLoading} = useQuery({ 
    queryKey: key, 
    queryFn:() => paramService.getByUser(session!.user.id),
    enabled: !!session
  });

  // Mutation pour créer des paramètres
  const {mutate:createParam,isPending:loadingCreate} = useMutation({
    mutationFn: (data: any) => paramService.create(data),
    onSuccess: () => {
     close();
     qc.invalidateQueries({queryKey:key});
     form.reset()
    }
  });
  
  // Mutation pour mettre à jour des paramètres
  const {mutate:updateParam,isPending:loadingUpdate} = useMutation({
    mutationFn:(data:{id:string,data:any}) => paramService.update(data.id, data.data),
    onSuccess: () => {
     closeU();
     closeM();
     qc.invalidateQueries({queryKey:key});
    }
  });

  // Formulaire pour la création
  const form = useForm({
    initialValues: {
      nom: '',
      tva: 20,
      num_siret: '',
      ninea: '',
      email: '',
      tel: '',
      addr: '',
      desc: '',
      userId: session?.user.id || ''
    },
    validate: yupResolver(schema),
  });

  // Formulaire pour la mise à jour
  const formU = useForm({
    initialValues: {
      nom: '',
      tva: 20,
      num_siret: '',
      ninea: '',
      email: '',
      tel: '',
      addr: '',
      desc: '',
      userId: session?.user.id || ''
    },
    validate: yupResolver(schema),
  });

  // Fonction pour mettre à jour les paramètres
  const handleUpdateParam = (values:any) => {
    const {_id, createdAt, updatedAt, __v, ...rest} = values;
    updateParam({id: _id, data: {...rest}});
  }

  // Fonction pour ouvrir le modal de mise à jour avec les données existantes
  const handleUpdate = (data: any) => {
    const {createdAt, updatedAt, __v, logo, user, ...rest} = data;
    formU.setValues(rest);
    openU();
  }

  // Fonction pour créer des paramètres
  const handleCreateParam = (data:any) => {
    createParam(data);
  }

  // Fonction pour mettre à jour le logo
  const handleLogo = () => {
    if (files.length > 0) {
      const fd = new FormData();
      fd.append("logo", files[0]);
      updateParam({ id: param._id, data: fd });
    }
  }

  return (
  <>
  <LoadingOverlay
         visible={isLoading || loadingCreate || loadingUpdate}
         zIndex={1000}
         overlayProps={{ radius: 'sm', blur: 2 }}
         loaderProps={{ color: '#FF5D14', type: 'dots' }}
       />

  {/* Modal de création de paramètres */}
  <Modal 
    opened={opened} 
    onClose={close} 
    title="Créer les paramètres de l'entreprise" 
    centered 
    size="lg" 
    overlayProps={{ blur: 3 }}
  >
    <form onSubmit={form.onSubmit((values) => handleCreateParam(values))}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="md:col-span-2">
          <TextInput 
            label="Nom de l'entreprise" 
            placeholder="Saisissez le nom de votre entreprise" 
            leftSection={<FaBuilding />}
            {...form.getInputProps('nom')} 
            className="mb-2"
            styles={{ input: { '&:focus': { borderColor: '#FF5D14' } } }}
          />
        </div>
        <TextInput 
          label="Email" 
          placeholder="contact@entreprise.com" 
          leftSection={<FaEnvelope />}
          {...form.getInputProps('email')} 
          className="mb-2"
          styles={{ input: { '&:focus': { borderColor: '#FF5D14' } } }}
        />
        <TextInput 
          label="Téléphone" 
          placeholder="+33 1 23 45 67 89" 
          leftSection={<FaPhone />}
          {...form.getInputProps('tel')} 
          className="mb-2"
          styles={{ input: { '&:focus': { borderColor: '#FF5D14' } } }}
        />
        <div className="md:col-span-2">
          <TextInput 
            label="Adresse" 
            placeholder="Adresse complète" 
            leftSection={<FaMapMarkerAlt />}
            {...form.getInputProps('addr')} 
            className="mb-2"
            styles={{ input: { '&:focus': { borderColor: '#FF5D14' } } }}
          />
        </div>
        <NumberInput 
          label="TVA (%)" 
          placeholder="20" 
          leftSection={<FaPercentage />}
          {...form.getInputProps('tva')} 
          className="mb-2"
          styles={{ input: { '&:focus': { borderColor: '#FF5D14' } } }}
        />
        <TextInput 
          label="NINEA" 
          placeholder="Numéro NINEA" 
          leftSection={<FaIdCard />}
          {...form.getInputProps('ninea')} 
          className="mb-2"
          styles={{ input: { '&:focus': { borderColor: '#FF5D14' } } }}
        />
        <TextInput 
          label="Numéro SIRET" 
          placeholder="123 456 789 00012" 
          leftSection={<FaIdCard />}
          {...form.getInputProps('num_siret')} 
          className="mb-2"
          styles={{ input: { '&:focus': { borderColor: '#FF5D14' } } }}
        />
        <div className="md:col-span-2">
          <Textarea 
            label="Description" 
            placeholder="Description de votre entreprise" 
            {...form.getInputProps('desc')} 
            minRows={4}
            className="mb-2"
            styles={{ input: { '&:focus': { borderColor: '#FF5D14' } } }}
          />
        </div>
      </div>
      <Divider my="md" label="Informations importantes" labelPosition="center" />
      <Text size="sm" color="dimmed" className="mb-4">
        Ces informations apparaîtront sur vos factures et documents commerciaux. Assurez-vous qu'elles soient correctes.  
      </Text>
      <div className="flex justify-end gap-3 mt-4">
        <Button variant="light" onClick={close}>Annuler</Button>
        <Button 
          type="submit" 
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
          leftSection={<FaSave />}
        >
          Enregistrer
        </Button>
      </div>
    </form>
  </Modal>

  {/* Modal de mise à jour des paramètres */}
  <Modal 
    opened={openedU} 
    onClose={closeU} 
    title="Modifier les paramètres de l'entreprise" 
    centered 
    size="lg" 
    overlayProps={{ blur: 3 }}
  >
    <form onSubmit={formU.onSubmit((values) => handleUpdateParam(values))}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="md:col-span-2">
          <TextInput 
            label="Nom de l'entreprise" 
            placeholder="Saisissez le nom de votre entreprise" 
            leftSection={<FaBuilding />}
            {...formU.getInputProps('nom')} 
            className="mb-2"
            styles={{ input: { '&:focus': { borderColor: '#FF5D14' } } }}
          />
        </div>
        <TextInput 
          label="Email" 
          placeholder="contact@entreprise.com" 
          leftSection={<FaEnvelope />}
          {...formU.getInputProps('email')} 
          className="mb-2"
          styles={{ input: { '&:focus': { borderColor: '#FF5D14' } } }}
        />
        <TextInput 
          label="Téléphone" 
          placeholder="+33 1 23 45 67 89" 
          leftSection={<FaPhone />}
          {...formU.getInputProps('tel')} 
          className="mb-2"
          styles={{ input: { '&:focus': { borderColor: '#FF5D14' } } }}
        />
        <div className="md:col-span-2">
          <TextInput 
            label="Adresse" 
            placeholder="Adresse complète" 
            leftSection={<FaMapMarkerAlt />}
            {...formU.getInputProps('addr')} 
            className="mb-2"
            styles={{ input: { '&:focus': { borderColor: '#FF5D14' } } }}
          />
        </div>
        <NumberInput 
          label="TVA (%)" 
          placeholder="20" 
          leftSection={<FaPercentage />}
          {...formU.getInputProps('tva')} 
          className="mb-2"
          styles={{ input: { '&:focus': { borderColor: '#FF5D14' } } }}
        />
        <TextInput 
          label="NINEA" 
          placeholder="Numéro NINEA" 
          leftSection={<FaIdCard />}
          {...formU.getInputProps('ninea')} 
          className="mb-2"
          styles={{ input: { '&:focus': { borderColor: '#FF5D14' } } }}
        />
        <TextInput 
          label="Numéro SIRET" 
          placeholder="123 456 789 00012" 
          leftSection={<FaIdCard />}
          {...formU.getInputProps('num_siret')} 
          className="mb-2"
          styles={{ input: { '&:focus': { borderColor: '#FF5D14' } } }}
        />
        <div className="md:col-span-2">
          <Textarea 
            label="Description" 
            placeholder="Description de votre entreprise" 
            {...formU.getInputProps('desc')} 
            minRows={4}
            className="mb-2"
            styles={{ input: { '&:focus': { borderColor: '#FF5D14' } } }}
          />
        </div>
      </div>
      <Divider my="md" label="Informations importantes" labelPosition="center" />
      <Text size="sm" color="dimmed" className="mb-4">
        Ces informations apparaîtront sur vos factures et documents commerciaux. Assurez-vous qu'elles soient correctes.  
      </Text>
      <div className="flex justify-end gap-3 mt-4">
        <Button variant="light" onClick={closeU}>Annuler</Button>
        <Button 
          type="submit" 
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
          leftSection={<FaCheck />}
        >
          Mettre à jour
        </Button>
      </div>
    </form>
  </Modal>

  {/* Modal de mise à jour du logo */}
  <Modal 
    opened={openedM} 
    onClose={closeM} 
    title="Modifier le logo de l'entreprise" 
    centered 
    size="md" 
    overlayProps={{ blur: 3 }}
  >
    <div className="flex flex-col space-y-4">
      <Paper p="md" radius="md" className="bg-blue-50 dark:bg-gray-700 border border-blue-100 dark:border-gray-600">
        <Group justify="space-between" mb="xs">
          <Text fw={600} className="text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <FaUpload className="text-blue-500" /> Téléchargement du logo
          </Text>
        </Group>
        <Divider mb="md" />
        <Pane className="bg-white dark:bg-gray-800 p-4 rounded-md">
          <FileUploader
            label="Glisser et déposer votre logo ici"
            description="Limité à 1 fichier. Formats recommandés: PNG, JPG, SVG"
            maxFiles={1}
            maxSizeInBytes={50 * 1024 ** 2}
            onChange={handleChange}
            onRejected={handleRejected}
            renderFile={(file) => {
              const { name, size, type } = file
              const fileRejection = fileRejections.find(
                (fileRej: any) => fileRej.file.name === name
              )
              const { message } = fileRejection || {}

              return (
                <FileCard
                  key={name}
                  isInvalid={fileRejection != null}
                  name={name}
                  onRemove={handleRemove}
                  sizeInBytes={size}
                  type={type}
                  validationMessage={message}
                />
              )
            }}
            values={files}
          />
        </Pane>
      </Paper>
      <Text size="sm" color="dimmed" className="italic">
        Le logo apparaîtra sur vos documents commerciaux et dans l'interface. Pour un meilleur résultat, utilisez une image carrée avec un fond transparent.  
      </Text>
      <div className="flex justify-end gap-3 mt-4">
        <Button variant="light" onClick={closeM}>Annuler</Button>
        <Button 
          onClick={handleLogo} 
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
          leftSection={<FaUpload />}
        >
          Télécharger le logo
        </Button>
      </div>
    </div>
  </Modal>

  {param ? (
    <div className="container mx-auto px-4 py-8">
      <Paper 
        p="xl" 
        radius="md" 
        className="bg-white dark:bg-gray-800 shadow-xl"
        style={{
          backgroundImage: "linear-gradient(to right bottom, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9))",
          backdropFilter: "blur(10px)"
        }}
      >
        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar
                src={`${import.meta.env.VITE_BACKURL}/uploads/${param?.logo}`}
                size={180}
                radius="xl"
                className="border-4 border-orange-100 shadow-lg dark:border-gray-700"
                styles={{
                  root: {
                    background: 'linear-gradient(45deg, #FF5D14, #FF8A50)',
                  }
                }}
              />
              <Tooltip label="Modifier le logo">
                <ActionIcon
                  variant="filled"
                  color="blue"
                  className="cursor-pointer hover:scale-110 transition-transform absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-500 to-blue-600 shadow-md"
                  size="lg"
                  radius="xl"
                  onClick={openM}
                >
                  <FaUpload size={16} />
                </ActionIcon>
              </Tooltip>
            </div>
          </div>

          {/* Information Section */}
          <div className="flex-1 space-y-6">
            <div>
              <Title order={2} className="text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                <FaBuilding className="text-orange-500" /> {param.nom}
              </Title>
              <Badge size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 text-white mb-4">
                Paramètres de l'entreprise
              </Badge>
            </div>
            
            <Card p="md" radius="md" className="bg-blue-50 dark:bg-gray-700 border border-blue-100 dark:border-gray-600 shadow-sm mb-4">
              <Group justify="space-between" mb="xs">
                <Text fw={600} className="text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <FaInfoCircle className="text-blue-500" /> Informations Principales
                </Text>
              </Group>
              <Divider mb="md" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <FaPhone className="text-blue-500 mt-1" />
                  <div>
                    <Text size="sm" color="dimmed">Téléphone</Text>
                    <Text size="lg" fw={600} className="text-gray-800 dark:text-gray-200">{param?.tel || 'Non renseigné'}</Text>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <FaEnvelope className="text-blue-500 mt-1" />
                  <div>
                    <Text size="sm" color="dimmed">Email</Text>
                    <Text size="lg" fw={600} className="text-gray-800 dark:text-gray-200">{param.email || 'Non renseigné'}</Text>
                  </div>
                </div>
                <div className="flex items-start gap-2 md:col-span-2">
                  <FaMapMarkerAlt className="text-blue-500 mt-1" />
                  <div>
                    <Text size="sm" color="dimmed">Adresse</Text>
                    <Text size="lg" fw={600} className="text-gray-800 dark:text-gray-200">{param.addr || 'Non renseignée'}</Text>
                  </div>
                </div>
              </div>
            </Card>

            <Card p="md" radius="md" className="bg-green-50 dark:bg-gray-700 border border-green-100 dark:border-gray-600 shadow-sm mb-4">
              <Group justify="space-between" mb="xs">
                <Text fw={600} className="text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <FaFileInvoice className="text-green-500" /> Informations Légales
                </Text>
              </Group>
              <Divider mb="md" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-2">
                  <FaPercentage className="text-green-500 mt-1" />
                  <div>
                    <Text size="sm" color="dimmed">TVA</Text>
                    <Badge color="green" size="lg" radius="sm">{param.tva}%</Badge>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <FaIdCard className="text-green-500 mt-1" />
                  <div>
                    <Text size="sm" color="dimmed">Numéro SIRET</Text>
                    <Text size="lg" fw={600} className="text-gray-800 dark:text-gray-200">{param.num_siret || 'Non renseigné'}</Text>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <FaIdCard className="text-green-500 mt-1" />
                  <div>
                    <Text size="sm" color="dimmed">NINEA</Text>
                    <Text size="lg" fw={600} className="text-gray-800 dark:text-gray-200">{param.ninea || 'Non renseigné'}</Text>
                  </div>
                </div>
              </div>
            </Card>

            <Card p="md" radius="md" className="bg-purple-50 dark:bg-gray-700 border border-purple-100 dark:border-gray-600 shadow-sm mb-4">
              <Group justify="space-between" mb="xs">
                <Text fw={600} className="text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <FaFileAlt className="text-purple-500" /> Description
                </Text>
              </Group>
              <Divider mb="md" />
              <Text size="md" className="text-gray-700 dark:text-gray-300 leading-relaxed p-2 bg-white dark:bg-gray-800 rounded-md">
                {param.desc || 'Aucune description disponible'}
              </Text>
            </Card>

            <div className="mt-6">
              <Button 
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-md"
                leftSection={<FaEdit />}
                onClick={() => handleUpdate(param)}
              >
                Modifier les paramètres
              </Button>
            </div>
          </div>
        </div>
      </Paper>
    </div>
  ) : (
    <div className="container mx-auto px-4 py-16">
      <Paper 
        p="xl" 
        radius="md" 
        className="bg-white dark:bg-gray-800 shadow-lg"
        style={{
          backgroundImage: "linear-gradient(to right bottom, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.8))",
          backdropFilter: "blur(10px)"
        }}
      >
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <FaBuilding size={60} className="text-orange-500 mb-4" />
          <Title order={2} className="text-gray-800 dark:text-gray-200 mb-2">Configuration des paramètres</Title>
          <Text size="lg" className="text-gray-600 dark:text-gray-400 mb-6 max-w-lg">
            Vous n'avez pas encore configuré les paramètres de votre entreprise. Ces informations seront utilisées dans vos documents commerciaux.
          </Text>
          <Button 
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-md"
            leftSection={<FaEdit />}
            size="lg"
            onClick={open}
          >
            Configurer maintenant
          </Button>
        </div>
      </Paper>
    </div>
  )}

  <Modal opened={openedM} onClose={closeM} title="MIS A JOUR PHOTO">
  <Pane maxWidth={654}>
      <FileUploader
        label="Uploader une Image"
        description="veuillez uploader une image qui ne depasse pas 5MB !"
        maxSizeInBytes={5 * 1024 ** 2}
        maxFiles={1}
        onChange={handleChange}
        onRejected={handleRejected}
        renderFile={(file) => {
          const { name, size, type } = file
          const fileRejection = fileRejections.find((fileRejection: { file: File; }) => fileRejection.file === file)
          const { message } = fileRejection || {}
          return (
            <FileCard
              key={name}
              isInvalid={fileRejection != null}
              name={name}
              onRemove={handleRemove}
              sizeInBytes={size}
              type={type}
              validationMessage={message}
            />
          )
        }}
        values={files}
      />
    </Pane>
    <Text size="sm" color="dimmed" className="italic">
      Le logo apparaîtra sur vos documents commerciaux et dans l'interface. Pour un meilleur résultat, utilisez une image carrée avec un fond transparent.  
    </Text>
    <div className="flex justify-end gap-3 mt-4">
      <Button variant="light" onClick={closeM}>Annuler</Button>
      <Button 
        onClick={handleLogo} 
        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
        leftSection={<FaUpload />}
      >
        Télécharger le logo
      </Button>
    </div>
  </Modal>
  </>
  );
}

export default Parametres;