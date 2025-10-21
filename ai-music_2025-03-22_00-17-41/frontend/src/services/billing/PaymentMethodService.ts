import { BaseService } from "./base.service";
import {
  PaymentMethod,
  PaymentMethodCreate,
  PaymentMethodUpdate,
} from "@/types/billing/PaymentMethodTypes";

export class PaymentMethodService extends BaseService<
  PaymentMethod,
  PaymentMethodCreate,
  PaymentMethodUpdate
> {
  constructor() {
    super("/api/payment-methods");
  }

  async attachToCustomer(
    paymentMethodId: string,
    customerId: string,
  ): Promise<PaymentMethod> {
    const response = await api.post(
      `${this.baseUrl}/${paymentMethodId}/attach`,
      {
        customer_id: customerId,
      },
    );
    return response.data;
  }

  async detachFromCustomer(paymentMethodId: string): Promise<void> {
    await api.post(`${this.baseUrl}/${paymentMethodId}/detach`);
  }
}
