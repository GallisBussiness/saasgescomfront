import Api from "./Api";


export const  checkSubscription = (userId: string) => Api.get(`/payment/subscription/verify/${userId}`).then(res => res.data);

export const updateUserSubscription = (paymentId: string, subscriptionData: { statut: string }) => 
  Api.patch(`/payment/${paymentId}`, subscriptionData).then(res => res.data);