import { useState } from 'react';
import { App, Button, Table, Modal, Form, Input, Switch, Tooltip, Popconfirm } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Paper, Title, Text, Divider } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaWarehouse, 
  FaMapMarkerAlt, 
  FaUser, 
  FaSearch,
  FaCheck,
  FaTimes,
  FaEye
} from 'react-icons/fa';
import { authclient } from '../../../lib/auth-client';
import { DepotService } from '../../services/depot.service';
import { Depot } from '../../interfaces/depot.interface';

const Depots: React.FC = () => {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDepot, setCurrentDepot] = useState<Partial<Depot> | null>(null);
  const [form] = Form.useForm();

  // Session utilisateur
  const { data: session } = authclient.useSession();
  const userId = session?.user?.id;

  // Service
  const depotService = new DepotService();

  // Récupération des dépôts
  const { 
    data: depots, 
    isLoading: loadingDepots,
    isError: errorDepots
  } = useQuery({
    queryKey: ['depots', userId],
    queryFn: () => depotService.getByUser(userId!),
    enabled: !!userId,
  });
  
  // Naviguer vers la page de détails du dépôt
  const navigateToDepotDetails = (depot: Depot) => {
    navigate(`/dashboard/depots/${depot._id}`);
  };

  // Mutation pour créer un dépôt
  const { mutate: createDepot, isPending: creatingDepot } = useMutation({
    mutationFn: (depot: Omit<Depot, '_id'>) => depotService.create(depot),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['depots', userId] });
      message.success('Dépôt créé avec succès');
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (error: any) => {
      message.error(error?.message || 'Erreur lors de la création du dépôt');
    }
  });

  // Mutation pour mettre à jour un dépôt
  const { mutate: updateDepot, isPending: updatingDepot } = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Depot> }) => depotService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['depots', userId] });
      message.success('Dépôt mis à jour avec succès');
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (error: any) => {
      message.error(error?.message || 'Erreur lors de la mise à jour du dépôt');
    }
  });

  // Mutation pour supprimer un dépôt
  const { mutate: deleteDepot, isPending: deletingDepot } = useMutation({
    mutationFn: (id: string) => depotService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['depots', userId] });
      message.success('Dépôt supprimé avec succès');
    },
    onError: (error: any) => {
      message.error(error?.message || 'Erreur lors de la suppression du dépôt');
    }
  });

  // Mutation pour changer le statut d'un dépôt
  const { mutate: toggleDepotStatus, isPending: togglingStatus } = useMutation({
    mutationFn: ({ id, actif }: { id: string, actif: boolean }) => depotService.toggleStatus(id, actif),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['depots', userId] });
      message.success('Statut du dépôt mis à jour avec succès');
    },
    onError: (error: any) => {
      message.error(error?.message || 'Erreur lors de la mise à jour du statut');
    }
  });

  // Ouvrir le modal pour ajouter un dépôt
  const openAddModal = () => {
    setIsEditing(false);
    setCurrentDepot({
      nom: '',
      adresse: '',
      description: '',
      actif: true,
      userId
    });
    form.resetFields();
    setIsModalOpen(true);
  };

  // Ouvrir le modal pour éditer un dépôt
  const openEditModal = (depot: Depot) => {
    setIsEditing(true);
    setCurrentDepot(depot);
    form.setFieldsValue({
      ...depot
    });
    setIsModalOpen(true);
  };

  // Fermer le modal
  const closeModal = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  // Soumettre le formulaire
  const handleSubmit = (values: any) => {
    if (isEditing && currentDepot?._id) {
      updateDepot({
        id: currentDepot._id,
        data: {
          ...values,
          userId: userId
        }
      });
    } else {
      createDepot({
        ...values,
        userId: userId!
      });
    }
  };

  // Filtrer les dépôts par recherche
  const filteredDepots = depots?.filter(depot => 
    depot.nom.toLowerCase().includes(searchText.toLowerCase()) ||
    depot.adresse.toLowerCase().includes(searchText.toLowerCase()) ||
    (depot.responsable && depot.responsable.toLowerCase().includes(searchText.toLowerCase()))
  );

  // Colonnes du tableau
  const columns = [
    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
      render: (text: string) => (
        <div className="flex items-center">
          <FaWarehouse className="text-[#FF5D14] mr-2" />
          <span className="font-medium">{text}</span>
        </div>
      ),
    },
    {
      title: 'Adresse',
      dataIndex: 'adresse',
      key: 'adresse',
      render: (text: string) => (
        <div>
          <div className="flex items-center">
            <FaMapMarkerAlt className="text-gray-500 mr-2" />
            <span>{text}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Responsable',
      dataIndex: 'responsable',
      key: 'responsable',
      render: (text: string) => text ? (
        <div className="flex items-center">
          <FaUser className="text-gray-500 mr-2" />
          <span>{text}</span>
        </div>
      ) : <span className="text-gray-400 italic">Non défini</span>,
    },
    {
      title: 'Statut',
      dataIndex: 'actif',
      key: 'actif',
      render: (text: boolean, record: Depot) => (
        <Switch
          checked={Boolean(text)}
          onChange={(checked) => toggleDepotStatus({ id: record._id!, actif: checked })}
          loading={togglingStatus}
          checkedChildren={<FaCheck />}
          unCheckedChildren={<FaTimes />}
          className={text ? "bg-[#FF5D14]" : ""}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Depot) => (
        <div className="flex space-x-2">
          <Tooltip title="Voir les achats">
            <Button
              icon={<FaEye />}
              onClick={() => navigateToDepotDetails(record)}
              type="text"
              className="text-green-500 hover:text-green-700"
            />
          </Tooltip>
          <Tooltip title="Modifier">
            <Button
              icon={<FaEdit />}
              onClick={() => openEditModal(record)}
              type="text"
              className="text-blue-500 hover:text-blue-700"
            />
          </Tooltip>
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer ce dépôt?"
            onConfirm={() => deleteDepot(record._id!)}
            okText="Oui"
            cancelText="Non"
            okButtonProps={{ danger: true }}
          >
            <Button
              icon={<FaTrash />}
              type="text"
              className="text-red-500 hover:text-red-700"
              loading={deletingDepot}
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="p-4 md:p-6 2xl:p-10">
        <Paper
          p="xl"
          radius="lg"
          className="bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700"
          style={{
            backgroundImage: "linear-gradient(to right bottom, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9))",
            backdropFilter: "blur(10px)"
          }}
        >
          {/* En-tête */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                  <FaWarehouse className="text-[#FF5D14] text-xl" />
                </div>
                <Title order={2} className="text-gray-800 dark:text-white">
                  Gestion des Dépôts de Stockage
                </Title>
              </div>
              <Text className="text-gray-600 dark:text-gray-400 mt-2">
                Gérez vos différents emplacements de stockage pour vos achats
              </Text>
            </div>
            <div className="mt-4 md:mt-0">
              <Button
                type="primary"
                icon={<FaPlus />}
                onClick={openAddModal}
                className="bg-gradient-to-r from-[#FF5D14] to-[#FF7A40] hover:from-[#FF7A40] hover:to-[#FF5D14] border-none shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                Nouveau Dépôt
              </Button>
            </div>
          </div>

          <Divider className="my-6" />

          {/* Barre de recherche */}
          <div className="mb-6">
            <Input
              placeholder="Rechercher un dépôt..."
              prefix={<FaSearch className="text-gray-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="rounded-md border-gray-300 dark:border-gray-600 focus:border-[#FF5D14] focus:shadow-md transition-all duration-300"
              allowClear
            />
          </div>

          {/* Tableau des dépôts */}
          <Table
            columns={columns}
            dataSource={filteredDepots}
            rowKey="_id"
            loading={loadingDepots}
            pagination={{ pageSize: 10 }}
            className="custom-table"
            locale={{
              emptyText: errorDepots ? (
                <div className="text-center py-8">
                  <div className="text-red-500 text-xl mb-2">Erreur lors du chargement des dépôts</div>
                  <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['depots', userId] })}>
                    Réessayer
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-2">Aucun dépôt trouvé</div>
                  <Button type="primary" onClick={openAddModal}>
                    Créer un dépôt
                  </Button>
                </div>
              )
            }}
          />
        </Paper>
      </div>

      {/* Modal pour ajouter/éditer un dépôt */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
              <FaWarehouse className="text-[#FF5D14]" />
            </div>
            <span>{isEditing ? 'Modifier le dépôt' : 'Ajouter un nouveau dépôt'}</span>
          </div>
        }
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={currentDepot || {}}
          className="mt-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="nom"
              label="Nom du dépôt"
              rules={[{ required: true, message: 'Veuillez entrer le nom du dépôt' }]}
            >
              <Input placeholder="Ex: Entrepôt principal" />
            </Form.Item>

            <Form.Item
              name="responsable"
              label="Responsable"
            >
              <Input placeholder="Ex: Jean Dupont" />
            </Form.Item>

            <Form.Item
              name="adresse"
              label="Adresse"
              rules={[{ required: true, message: 'Veuillez entrer l\'adresse' }]}
            >
              <Input placeholder="Ex: 123 Rue Principale" />
            </Form.Item>
            <Form.Item
              name="actif"
              label="Statut"
              valuePropName="checked"
            >
              <Switch 
                checkedChildren={<FaCheck />} 
                unCheckedChildren={<FaTimes />}
                className="bg-gray-300 checked:bg-[#FF5D14]"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={4} placeholder="Description du dépôt..." />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end">
            <Button onClick={closeModal} className="mr-2">
              Annuler
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={creatingDepot || updatingDepot}
              className="bg-gradient-to-r from-[#FF5D14] to-[#FF7A40] hover:from-[#FF7A40] hover:to-[#FF5D14] border-none"
            >
              {isEditing ? 'Mettre à jour' : 'Créer'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Depots;
