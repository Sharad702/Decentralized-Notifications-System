import axios from 'axios';

export const sendDiscordNotification = async (webhookUrl: string, message: object) => {
  if (!webhookUrl) {
    console.error('Discord Webhook URL is not configured.');
    return;
  }

  try {
    await axios.post(webhookUrl, message);
    console.log('Successfully sent notification to Discord.');
  } catch (error) {
    console.error('Error sending Discord notification:', error);
  }
}; 