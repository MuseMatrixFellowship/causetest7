import { useAccount } from "wagmi";

const ProtectedRoutes = (WrappedComponent: React.FC<any>) => {
  const HOC = (props: any) => {
    const { isConnected } = useAccount();


    // If logged in, render the protected component
    return isConnected ? <WrappedComponent {...props} /> : null;
  };

  return HOC;
};

export default ProtectedRoutes;
