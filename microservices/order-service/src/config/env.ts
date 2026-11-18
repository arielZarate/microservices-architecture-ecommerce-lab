
const requiredEnvs = [
  'PORT',  
  'DATASOURCE_USERNAME',
  'DATASOURCE_PASSWORD',
  'DATASOURCE_PORT',
  'DATASOURCE_HOST',
  'DATASOURCE_NAME_DATABASE',
  'JWT_SECRET',
  'TIMEOUT_MS',
  'KAFKA_BROKER',
  'KAFKA_GROUP_ID',
  'PRODUCT_SERVICE_HOST',   
  'EXTERNAL_API_KEY',
  'EXTERNAL_DEVICE_ID',
];

export function validateEnv() {
  requiredEnvs.forEach((env) => {
    if (!process.env[env]) {
      throw new Error(`Missing required environment variable: ${env}`);
    }
  });
}   
