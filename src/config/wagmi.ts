import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Web3Flow',
  projectId: '7318bf7cf56e613662344a94cea877d6',
  chains: [baseSepolia],
  ssr: true,
}); 