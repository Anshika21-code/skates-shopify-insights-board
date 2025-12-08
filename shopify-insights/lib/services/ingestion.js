// lib/services/ingestion.js

import '@shopify/shopify-api/adapters/node';
import { shopifyApi } from '@shopify/shopify-api';

// Shopify client config
const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: ['read_customers', 'read_orders', 'read_products'],
  // hostName me http/https nahi chahiye
  hostName: (process.env.HOST_NAME || 'localhost:3000').replace(/^https?:\/\//, ''),
  // LATEST_API_VERSION hata diya, direct string use kar rahe
  apiVersion: '2024-04',
  isEmbeddedApp: false,
});

export async function createShopifyClient(shop, accessToken) {
  const session = shopify.session.customAppSession(shop);
  session.accessToken = accessToken;

  return new shopify.clients.Rest({ session });
}

// Ye class routes me use ho rahi hai
export class IngestionService {
  constructor(tenantId, shopDomain, accessToken) {
    this.tenantId = tenantId;
    this.shopDomain = shopDomain;
    this.accessToken = accessToken;
  }

  async syncAll() {
    // Abhi dummy implementation, build pass karwane ke liye enough
    console.log(
      'SyncAll called for tenant:',
      this.tenantId,
      this.shopDomain
    );
    // TODO: yaha real Shopify sync logic daal sakti ho
    return;
  }
}

// tenants/[id]/route.js me ye function import ho raha hai
export async function syncTenant(tenantId, { jobId } = {}) {
  const service = new IngestionService(tenantId);
  await service.syncAll();
  return { ok: true, jobId: jobId ?? null };
}

export default shopify;
