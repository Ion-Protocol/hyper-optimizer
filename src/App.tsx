import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { WagmiProvider } from "wagmi";
import "./App.css";
import { AppRouter } from "./AppRouter";
import { AppFooter } from "./components/AppFooter";
import { AppHeader } from "./components/AppHeader";
import { queryClient, wagmiConfig } from "./config/wagmi";

function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <BrowserRouter>
            <div className="absolute w-[403px] h-[403px] left-[550px] -top-[283px] bg-[#FF6C15] opacity-100 blur-[500px] z-0" />
            <div className="mx-auto w-[85%] min-w-[500px] max-w-[1500px] relative z-10">
              <AppHeader />
              <AppRouter />
              <AppFooter />
            </div>
          </BrowserRouter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
