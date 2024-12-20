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
  '0x904362203af32398c5F50E1Ac9C9F1e164888cE9': 'Universita\' Sapienza',
  '0xA4dB1a53a8b538462F66dEAed1B73375357F602a': 'Universita\' Roma Tre',
  '0x481709C180f3B285618ddfdBCf51ecc3Be6999eB': 'Universita\' della Strada'
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
