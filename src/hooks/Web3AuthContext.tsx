"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  CHAIN_NAMESPACES,
  IAdapter,
  IProvider,
  WEB3AUTH_NETWORK,
} from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { getDefaultExternalAdapters } from "@web3auth/default-evm-adapter";
import { Web3Auth, Web3AuthOptions } from "@web3auth/modal";
import RPC from "@/lib/ethersRPC";

// Define the context type
interface Web3AuthContextType {
  loggedIn: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getUserInfo: () => Promise<Partial<any> | null>;
  getAccounts: () => Promise<string[] | null>;
  getBalance: () => Promise<string | null>;
  signMessage: (message: string) => Promise<string | null>;
  sendTransaction: () => Promise<any | null>;
}

// Create a default value for the context
const defaultContext: Web3AuthContextType = {
  loggedIn: false,
  login: async () => {},
  logout: async () => {},
  getUserInfo: async () => null,
  getAccounts: async () => null,
  getBalance: async () => null,
  signMessage: async () => null,
  sendTransaction: async () => null,
};

const clientId = process.env.WEB3AUTH_CLIENT_ID || 'BPi5PB_UiIZ-cPz1GtV5i1I2iOSOHuimiXBI0e-Oe_u6X3oVAbCiAZOTEBtTXw4tsluTITPqA8zMsfxIKMjiqNQ'

// IMP START - Chain Config
const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0xaa36a7",
  rpcTarget: "https://rpc.ankr.com/eth_sepolia",
  // Avoid using public rpcTarget in production.
  // Use services like Infura, Quicknode etc
  displayName: "Ethereum Sepolia Testnet",
  blockExplorerUrl: "https://sepolia.etherscan.io",
  ticker: "ETH",
  tickerName: "Ethereum",
  logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
};

// IMP START - SDK Initialization
const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
});

const web3AuthOptions: Web3AuthOptions = {
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
  uiConfig: {
    appName: "causality.network",
    // appLogo: "https://web3auth.io/images/w3a-L-Favicon-1.svg", // Your App Logo Here
    theme: {
      primary: '#2826FF',
    },
    mode: "dark",
    logoLight: "https://web3auth.io/images/w3a-L-Favicon-1.svg",
    logoDark: "https://web3auth.io/images/w3a-D-Favicon-1.svg",
    defaultLanguage: "en", // en, de, ja, ko, zh, es, fr, pt, nl
    loginGridCol: 3,
    primaryButton: "externalLogin",
  },
  privateKeyProvider,
};
const web3auth = new Web3Auth(web3AuthOptions);

// Context creation with the correct type
const Web3AuthContext = createContext<Web3AuthContextType>(defaultContext);

// Custom Hook
export const useWeb3Auth = () => {
  return useContext(Web3AuthContext);
};

// Provider component
export const Web3AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        // IMP START - Configuring External Wallets
        const adapters = await getDefaultExternalAdapters({
          options: web3AuthOptions,
        });
        adapters.forEach((adapter: IAdapter<unknown>) => {
          web3auth.configureAdapter(adapter);
        });
        // IMP END - Configuring External Wallets
        // IMP START - SDK Initialization
        await web3auth.initModal();
        // IMP END - SDK Initialization
        setProvider(web3auth.provider);

        if (web3auth.connected) {
          setLoggedIn(true);
        }
      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

  const login = async () => {
    try {
      console.log("Login button clicked");
      const web3authProvider = await web3auth.connect();
      console.log("Connected: ", web3auth.connected);
      setProvider(web3authProvider);

      if (web3auth.connected) {
        setLoggedIn(true);
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = async () => {
    try {
      await web3auth.logout();
      setProvider(null);
      setLoggedIn(false);
      console.log("Successfully logged out");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getUserInfo = async () => {
    return await web3auth.getUserInfo();
  };

  const getAccounts = async () => {
    if (!provider) return null;
    return await RPC.getAccounts(provider);
  };

  const getBalance = async () => {
    if (!provider) return null;
    return await RPC.getBalance(provider);
  };

  const signMessage = async () => {
    if (!provider) return null;
    return await RPC.signMessage(provider);
  };

  const sendTransaction = async () => {
    if (!provider) return null;
    return await RPC.sendTransaction(provider);
  };

  return (
    <Web3AuthContext.Provider
      value={{
        loggedIn,
        login,
        logout,
        getUserInfo,
        getAccounts,
        getBalance,
        signMessage,
        sendTransaction,
      }}
    >
      {children}
    </Web3AuthContext.Provider>
  );
};
