import Api from "./Api";
import { Service } from "./Service";


/**
 * Service for managing payment operations
 */
export class PaymentService extends Service {
  constructor() {
    super(Api, 'payment');
  }

  /**
   * Verify a payment status
   * @param id Payment ID
   * @returns Promise with the payment verification result
   */
  async verifyPayment(id: string) {
    return this.api.get(`/${this.ressource}/subscription/verify/${id}`).then(res => res.data);
  }

  /**
   * Get payments by user ID
   * @param userId User ID
   * @returns Promise with the user's payments
   */
  async getByUser(userId: string) {
    return this.api.get(`/${this.ressource}/subscription/active/${userId}`).then(res => res.data);
  }
}

export default PaymentService;