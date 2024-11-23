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
  '0xD5A77B2dc5425A0fEe17378A4ff4EF21Fea86426': 'Universita\' Sapienza',
  '0x515509DDa4d8e81a90211b5a98e208a908b6Ad47': 'Universita\' Roma Tre',
  '0x8a4A043F9fe15880Ce92a78e2ED32384aAEeaB49': 'Universita\' della Strada'
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
