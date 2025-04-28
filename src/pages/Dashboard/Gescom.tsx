import React, { useEffect, useLayoutEffect } from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import { Outlet} from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Center, Loader, LoadingOverlay } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { checkSubscription } from '../../services/authservice';
import { authclient } from '../../../lib/auth-client';

const GesCom: React.FC = () => {
  const navigate = useNavigate();
 
  const { 
    data: session, 
    isPending,
  } = authclient.useSession()

  const token  = localStorage.getItem("ges_com_token");

  useLayoutEffect(() => {
    if (token === null) {
      navigate('/auth/signin', { replace: true });
    }
  }, [token]);

  const { data: subscriptionData, isLoading: checkingSubscription  } = useQuery({
    queryKey: ['subscription', session?.user.id],
    queryFn: () => checkSubscription(session?.user?.id!),
    enabled: !!session,
  });

  // console.log(subscriptionData, session);

  useEffect(() => {
    if (session && subscriptionData?.subscription == null && !subscriptionData?.hasActiveSubscription) {
      navigate('/subscription/' + session?.user.id, { replace: true });
    }
    return () => {}
  },[subscriptionData]);


  if (checkingSubscription) {
    return (
      <Center style={{ height: '100vh' }}>
        <Loader size="xl" />
      </Center>
    );
  }

  return (
    <>
    {session ? <DefaultLayout>
     <Outlet />
    </DefaultLayout> :  <LoadingOverlay
    visible={isPending}
    zIndex={1000}
    overlayProps={{ radius: 'sm', blur: 2 }}
    loaderProps={{ color: '#FF5D14', type: 'bars' }}
  />}
    </>
  );
};

export default GesCom;
