import "@rainbow-me/rainbowkit/styles.css";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";
// import { publicKey, privateKey, encrypt, decrypt } from "~~/crypto/fhe";

export const metadata = getMetadata({ title: "IXH24", description: "Powered by Ripple & De Cifris" });

// const x = BigInt(123456789);
// const x_encrypted = await encrypt(publicKey, x);
// const x_decrypted = await decrypt(privateKey, x_encrypted);
// console.log("x:", x);
// console.log("x_encrypted:", x_encrypted);
// console.log("x_decrypted:", x_decrypted);

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider enableSystem>
          <ScaffoldEthAppWithProviders>{children}</ScaffoldEthAppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
