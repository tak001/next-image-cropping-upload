import axios from 'axios';
import applyCaseMiddleware from 'axios-case-converter';

const baseHttpClient = applyCaseMiddleware(
  axios.create({
    baseURL: process.env.NEXT_PUBLIC_DOMAIN,
    responseType: 'json',
    headers: { 'x-application-key': process.env.NEXT_PUBLIC_APPLICATION_KEY! },
  }),
  { ignoreHeaders: true }
);

delete baseHttpClient.defaults.headers.common['X-Requested-With'];

export default baseHttpClient;
