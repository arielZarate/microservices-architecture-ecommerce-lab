const requiredEnvs = [
  'PORT',
  'DATASOURCE_HOST',
  'DATASOURCE_PORT',
  'DATASOURCE_USERNAME',
  'DATASOURCE_PASSWORD',
  'DATASOURCE_NAME_DATABASE',
  'JWT_SECRET',
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
