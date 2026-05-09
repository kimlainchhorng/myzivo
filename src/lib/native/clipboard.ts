import { Capacitor } from "@capacitor/core";
import { Clipboard } from "@capacitor/clipboard";

export async function copyText(text: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await Clipboard.write({ string: text });
    return;
  }
  await navigator.clipboard.writeText(text);
}

export async function readText(): Promise<string> {
  if (Capacitor.isNativePlatform()) {
    const { value } = await Clipboard.read();
    return value;
  }
  return navigator.clipboard.readText();
}
