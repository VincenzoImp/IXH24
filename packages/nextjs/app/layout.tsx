import "@rainbow-me/rainbowkit/styles.css";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
// import { publicKey, privateKey, encrypt, decrypt, sum_encrypted } from "~~/crypto/fhe";

// const x = BigInt(123456789);
// const x_encrypted = await encrypt(publicKey, x);
// const x_decrypted = await decrypt(privateKey, x_encrypted);
// console.log("x:", x);
// console.log("x_encrypted:", x_encrypted);
// console.log("x_decrypted:", x_decrypted);
// const y = BigInt(1);
// const y_encrypted = await encrypt(publicKey, y);
// const sum = sum_encrypted(publicKey, x_encrypted, y_encrypted);
// const sum_decrypted = await decrypt(privateKey, sum);
// console.log("y:", y);
// console.log("y_encrypted:", y_encrypted);
// console.log("sum:", sum);
// console.log("sum_decrypted:", sum_decrypted);

export const universities: Record<string, string> = {
  '0x6044f21C9A63c70b0E694c3403A8247C2571De2a': 'Universita\' Sapienza',
  '0x7fE6d8A75cc46A3f28DbdafC180eA86330d3bA67': 'Universita\' Roma Tre',
  '0x9a7b2A38FeC15Bc72b8f75027EE4d6089765c0ff': 'Universita\' della Strada'
}

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
