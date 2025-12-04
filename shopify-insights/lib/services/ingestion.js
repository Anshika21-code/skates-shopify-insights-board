import '@shopify/shopify-api/adapters/node';
import { shopifyApi, LATEST_API_VERSION } from '@shopify/shopify-api';

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: ['read_customers', 'read_orders', 'read_products'],
  hostName: process.env.HOST_NAME || 'localhost:3000',
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: false,
});

export async function createShopifyClient(shop, accessToken) {
  const session = shopify.session.customAppSession(shop);
  session.accessToken = accessToken;
  
  return new shopify.clients.Rest({ session });
}

export default shopify;