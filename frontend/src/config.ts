const API_BASE_URL = import.meta.env.PROD 
  ? 'https://4rt3daxws4.us-west-2.awsapprunner.com' 
  : 'http://localhost:3001';

export { API_BASE_URL };
