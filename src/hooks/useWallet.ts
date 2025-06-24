import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  isInitializing: boolean;
  balance: string;
}

export interface UseWalletReturn {
  wallet: WalletState;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  sendTransaction: (to: string, value: string) => Promise<string | null>;
}

export const useWallet = (): UseWalletReturn => {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    isConnected: false,
    isConnecting: false,
    isInitializing: true,
    balance: '0'
  });

  const sendTransaction = useCallback(async (to: string, value: string): Promise<string | null> => {
    if (!wallet.isConnected || typeof window.ethereum === 'undefined') {
      alert('Please connect your wallet first.');
      return null;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const tx = {
        to: to,
        value: ethers.parseEther(value)
      };

      const transactionResponse = await signer.sendTransaction(tx);
      console.log('Transaction response:', transactionResponse);
      
      const receipt = await transactionResponse.wait();
      
      if (receipt && receipt.status === 1) {
          console.log('Transaction successful!');
          return receipt.hash;
      } else {
          console.error('Transaction failed!');
          return null;
      }

    } catch (error) {
      console.error('Failed to send transaction:', error);
      return null;
    }
  }, [wallet.isConnected]);

  useEffect(() => {
    const checkConnection = async () => {
      const connectedAddress = localStorage.getItem('walletAddress');
      if (connectedAddress && typeof window.ethereum !== 'undefined') {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const balance = await provider.getBalance(connectedAddress);
          setWallet({
            address: connectedAddress,
            isConnected: true,
            isConnecting: false,
            isInitializing: false,
            balance: ethers.formatEther(balance)
          });
        } catch (error) {
          console.error("Failed to reconnect automatically:", error);
          localStorage.removeItem('walletAddress');
          setWallet(prev => ({ ...prev, isConnected: false, isInitializing: false }));
        }
      } else {
        setWallet(prev => ({ ...prev, isInitializing: false }));
      }
    };
    checkConnection();
  }, []);

  const connectWallet = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask to use BlockFlow!');
      return;
    }

    try {
      setWallet(prev => ({ ...prev, isConnecting: true }));
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);
      
      localStorage.setItem('walletAddress', address);
      setWallet({
        address,
        isConnected: true,
        isConnecting: false,
        isInitializing: false,
        balance: ethers.formatEther(balance)
      });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setWallet(prev => ({ ...prev, isConnecting: false, isInitializing: false }));
    }
  }, []);

  const disconnectWallet = useCallback(async () => {
    if (typeof window.ethereum?.request === 'function') {
      try {
        await window.ethereum.request({
          method: "wallet_revokePermissions",
          params: [{ eth_accounts: {} }],
        });
      } catch (error) {
        console.error("Failed to revoke permissions:", error);
      }
    }

    localStorage.removeItem('walletAddress');
    setWallet({
      address: null,
      isConnected: false,
      isConnecting: false,
      isInitializing: false,
      balance: '0'
    });
  }, []);

  return {
    wallet,
    connectWallet,
    disconnectWallet,
    sendTransaction
  };
};