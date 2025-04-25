import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PaymentService } from '../../services/payment.service';
import { Tooltip } from 'antd';
import { FaClock, FaCheckCircle } from 'react-icons/fa';
import { authclient } from '../../../lib/auth-client';

interface SubscriptionData {
  pack: {
    _id: string;
    nom: string;
    description: string;
  };
  daysRemaining: number;
  expirationDate: string;
}

const SubscriptionInfo = () => {
    const { 
      data: session, 
    } = authclient.useSession() 
  
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);

  // Récupérer l'abonnement actif de l'utilisateur
  const { data: activeSubscription, isLoading } = useQuery({
    queryKey: ['activeSubscription', session?.user.id],
    queryFn: () => new PaymentService().getByUser(session!.user.id),
    enabled: !!session,
  });

  useEffect(() => {
    if (activeSubscription) {
      // Calculer le nombre de jours restants
      const endDate = new Date(activeSubscription.date_fin);
      const today = new Date();
      const timeDiff = endDate.getTime() - today.getTime();
      const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

      setSubscriptionData({
        pack: activeSubscription.pack,
        daysRemaining: daysRemaining,
        expirationDate: new Date(activeSubscription.date_fin).toLocaleDateString()
      });
    }
  }, [activeSubscription]);

  if (isLoading || !subscriptionData) {
    return null;
  }

  // La couleur est maintenant définie directement dans le className

  return (
    <Tooltip title={`Expire le ${subscriptionData.expirationDate}`} placement="bottom">
      <div className="flex items-center gap-2 rounded-xl px-3 py-2 bg-white/80 dark:bg-slate-800/80 shadow-sm border border-slate-100 dark:border-slate-700 backdrop-blur-sm transition-all duration-300 hover:shadow-md">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-r from-[#FF5D14] to-[#FF7A40] text-white">
            <FaCheckCircle className="text-sm" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {subscriptionData.pack.nom}
            </span>
            <div className="flex items-center gap-1">
              <FaClock className="text-xs text-slate-500 dark:text-slate-400" />
              <span 
                className={`text-xs font-medium ${subscriptionData.daysRemaining <= 5 ? 'text-red-500' : subscriptionData.daysRemaining <= 15 ? 'text-orange-500' : 'text-green-500'}`}
              >
                {subscriptionData.daysRemaining} jour{subscriptionData.daysRemaining > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Tooltip>
  );
};

export default SubscriptionInfo;
