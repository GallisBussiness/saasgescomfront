import Api from "./Api";
import { Service } from "./Service";

/**
 * Service for managing user subscriptions
 */
export class SubscriptionService extends Service {
  constructor() {
    super(Api, 'payment');
  }

  /**
   * Get all subscriptions for a user
   * @param userId User ID
   * @returns Promise with all user's subscriptions (active and historical)
   */
  async getAllByUser(userId: string) {
    return this.api.get(`/${this.ressource}/user/${userId}`).then(res => res.data);
  }

  /**
   * Get active subscription for a user
   * @param userId User ID
   * @returns Promise with the user's active subscription
   */
  async getActiveByUser(userId: string) {
    return this.api.get(`/${this.ressource}/subscription/active/${userId}`).then(res => res.data);
  }

  /**
   * Get subscription details
   * @param subscriptionId Subscription ID
   * @returns Promise with the subscription details
   */
  async getDetails(subscriptionId: string) {
    return this.api.get(`/${this.ressource}/subscription/${subscriptionId}`).then(res => res.data);
  }

  /**
   * Cancel a subscription
   * @param subscriptionId Subscription ID
   * @returns Promise with the cancellation result
   */
  async cancelSubscription(subscriptionId: string) {
    return this.api.post(`/${this.ressource}/subscription/cancel/${subscriptionId}`).then(res => res.data);
  }

  /**
   * Renew a subscription
   * @param subscriptionId Subscription ID
   * @returns Promise with the renewal result
   */
  async renewSubscription(subscriptionId: string) {
    return this.api.post(`/${this.ressource}/subscription/renew/${subscriptionId}`).then(res => res.data);
  }
}

export default SubscriptionService;
