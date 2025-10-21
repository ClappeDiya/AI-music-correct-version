import { BaseService } from "./base.service";
import {
  Subscription,
  SubscriptionCreate,
  SubscriptionUpdate,
} from "@/types/billing/SubscriptionTypes";

export class SubscriptionService extends BaseService<
  Subscription,
  SubscriptionCreate,
  SubscriptionUpdate
> {
  constructor() {
    super("/api/subscriptions");
  }

  async cancel(
    subscriptionId: string,
    immediately: boolean = false,
  ): Promise<Subscription> {
    const response = await api.post(
      `${this.baseUrl}/${subscriptionId}/cancel`,
      {
        immediately,
      },
    );
    return response.data;
  }

  async resume(subscriptionId: string): Promise<Subscription> {
    const response = await api.post(`${this.baseUrl}/${subscriptionId}/resume`);
    return response.data;
  }
}
