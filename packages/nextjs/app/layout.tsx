import { DynamicContextProvider, DynamicWagmiConnector, EthereumWalletConnectors } from "../lib/dynamic";
import "@rainbow-me/rainbowkit/styles.css";
import { Metadata } from "next";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
import "~~/styles/root.css";

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : `http://localhost:${process.env.PORT || 3000}`;
const imageUrl = `${baseUrl}/thumbnail.jpg`;

const title = "Dollar Chad Averajoooor";
const titleTemplate = "%s | DCA";
const description = "Dollar Chad Averaging";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: title,
    template: titleTemplate,
  },
  description,
  openGraph: {
    title: {
      default: title,
      template: titleTemplate,
    },
    description,
    images: [
      {
        url: imageUrl,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [imageUrl],
    title: {
      default: title,
      template: titleTemplate,
    },
    description,
  },
  icons: {
    icon: [{ url: "/favicon.png", sizes: "32x32", type: "image/png" }],
  },
};

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning>
      <DynamicContextProvider
        theme="dark"
        settings={{
          environmentId: "08561cd5-d9ce-4db4-8d10-1ddc9a053fcc",
          walletConnectors: [EthereumWalletConnectors],
        }}
      >
        <DynamicWagmiConnector>
          <body>
            <ThemeProvider enableSystem>
              <ScaffoldEthAppWithProviders>{children}</ScaffoldEthAppWithProviders>
            </ThemeProvider>
          </body>
        </DynamicWagmiConnector>
      </DynamicContextProvider>
    </html>
  );
};

export default ScaffoldEthApp;
