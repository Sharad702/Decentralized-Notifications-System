import axios from 'axios';

export const sendWebhookNotification = async (url: string, payload: any) => {
  try {
    await axios.post(url, payload);
    console.log(`Successfully sent webhook to ${url}`);
  } catch (error: any) {
    console.error(`Failed to send webhook to ${url}:`, error.message);
    // Re-throw the error to be handled by the caller
    throw error;
  }
}; 