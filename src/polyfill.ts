// Harus di-import PALING PERTAMA sebelum modul WDK mana pun.
// WDK (dan dependensi bip39/sodium) mengharapkan Buffer global ala Node.
import { Buffer } from "buffer";

if (typeof globalThis.Buffer === "undefined") {
  globalThis.Buffer = Buffer;
}
