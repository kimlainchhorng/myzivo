/**
 * Animated sticker video URLs — maps sticker IDs to their animated mp4 CDN paths.
 * These are used in both the sticker picker (StickerKeyboard) and chat bubbles (ChatMessageBubble).
 */

import beetAnim from "@/assets/stickers/anim/buddy-beet-anim.mp4.asset.json";
import bunnyAnim from "@/assets/stickers/anim/buddy-bunny-anim.mp4.asset.json";
import carrotAnim from "@/assets/stickers/anim/buddy-carrot-anim.mp4.asset.json";
import catLoveAnim from "@/assets/stickers/anim/buddy-cat-love-anim.mp4.asset.json";
import coffeeAnim from "@/assets/stickers/anim/buddy-coffee-anim.mp4.asset.json";
import cupcakeAnim from "@/assets/stickers/anim/buddy-cupcake-anim.mp4.asset.json";
import hamsterAnim from "@/assets/stickers/anim/buddy-hamster-anim.mp4.asset.json";
import hedgehogAnim from "@/assets/stickers/anim/buddy-hedgehog-anim.mp4.asset.json";
import lemonAnim from "@/assets/stickers/anim/buddy-lemon-anim.mp4.asset.json";
import mushroomAnim from "@/assets/stickers/anim/buddy-mushroom-anim.mp4.asset.json";
import octopusAnim from "@/assets/stickers/anim/buddy-octopus-anim.mp4.asset.json";
import pearAnim from "@/assets/stickers/anim/buddy-pear-anim.mp4.asset.json";
import penguinAnim from "@/assets/stickers/anim/buddy-penguin-anim.mp4.asset.json";
import pigAnim from "@/assets/stickers/anim/buddy-pig-anim.mp4.asset.json";
import potatoAnim from "@/assets/stickers/anim/buddy-potato-anim.mp4.asset.json";
import sunflowerAnim from "@/assets/stickers/anim/buddy-sunflower-anim.mp4.asset.json";
import sushiAnim from "@/assets/stickers/anim/buddy-sushi-anim.mp4.asset.json";
import toastAnim from "@/assets/stickers/anim/buddy-toast-anim.mp4.asset.json";
import tomatoAnim from "@/assets/stickers/anim/buddy-tomato-anim.mp4.asset.json";

/** Map from sticker id (e.g. "bb-sunflower") to animated video URL */
export const ANIMATED_STICKER_MAP: Record<string, string> = {
  "bb-sunflower": sunflowerAnim.url,
  "bb-pear": pearAnim.url,
  "bb-sushi": sushiAnim.url,
  "bb-pig": pigAnim.url,
  "bb-beet": beetAnim.url,
  "bb-coffee": coffeeAnim.url,
  "bb-cupcake": cupcakeAnim.url,
  "bb-lemon": lemonAnim.url,
  "bb-tomato": tomatoAnim.url,
  "bb-carrot": carrotAnim.url,
  "cf-penguin": penguinAnim.url,
  "cf-hamster": hamsterAnim.url,
  "cf-cat-love": catLoveAnim.url,
  "cf-mushroom": mushroomAnim.url,
  "cf-potato": potatoAnim.url,
  "cf-bunny": bunnyAnim.url,
  "cf-hedgehog": hedgehogAnim.url,
  "cf-toast": toastAnim.url,
  "cf-octopus": octopusAnim.url,
};

/** Get animated video URL for a sticker ID, or undefined if not available */
export function getAnimatedStickerUrl(stickerId: string): string | undefined {
  return ANIMATED_STICKER_MAP[stickerId];
}
