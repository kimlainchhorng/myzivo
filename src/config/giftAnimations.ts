/**
 * Gift animation video mapping
 * Maps gift names to their full-screen animation videos
 * Sorted low → high by coin value
 */
import luckyCatVid from "@/assets/gifts/animations/lucky-cat.mp4.asset.json";
import cutePandaVid from "@/assets/gifts/animations/cute-panda.mp4.asset.json";
import babyDragonVid from "@/assets/gifts/animations/baby-dragon.mp4.asset.json";
import icePenguinVid from "@/assets/gifts/animations/ice-penguin.mp4.asset.json";
import kingCobraVid from "@/assets/gifts/animations/king-cobra.mp4.asset.json";
import rainbowButterflyVid from "@/assets/gifts/animations/rainbow-butterfly.mp4.asset.json";
import starFoxVid from "@/assets/gifts/animations/star-fox.mp4.asset.json";
import crystalUnicornVid from "@/assets/gifts/animations/crystal-unicorn.mp4.asset.json";
import magicRabbitVid from "@/assets/gifts/animations/magic-rabbit.mp4.asset.json";
import snakeDanceVid from "@/assets/gifts/animations/snake-dance.mp4.asset.json";
import neonDolphinVid from "@/assets/gifts/animations/neon-dolphin.mp4.asset.json";
import mysticWolfVid from "@/assets/gifts/animations/mystic-wolf.mp4.asset.json";
import phoenixRisingVid from "@/assets/gifts/animations/phoenix-rising.mp4.asset.json";
import diamondBearVid from "@/assets/gifts/animations/diamond-bear.mp4.asset.json";
import thunderTigerVid from "@/assets/gifts/animations/thunder-tiger.mp4.asset.json";
import fireDragonVid from "@/assets/gifts/animations/fire-dragon.mp4.asset.json";
import pandaPartyVid from "@/assets/gifts/animations/panda-party.mp4.asset.json";
import sapphireSwanVid from "@/assets/gifts/animations/sapphire-swan.mp4.asset.json";
import royalCrownVid from "@/assets/gifts/animations/royal-crown.mp4.asset.json";
import goldFountainVid from "@/assets/gifts/animations/gold-fountain.mp4.asset.json";
import emeraldEagleVid from "@/assets/gifts/animations/emerald-eagle.mp4.asset.json";
import diamondRainVid from "@/assets/gifts/animations/diamond-rain.mp4.asset.json";
import platinumPandaVid from "@/assets/gifts/animations/platinum-panda.mp4.asset.json";
import luxuryLamboVid from "@/assets/gifts/animations/luxury-lambo.mp4.asset.json";
import treasureDragonVid from "@/assets/gifts/animations/treasure-dragon.mp4.asset.json";
import goldFerrariVid from "@/assets/gifts/animations/gold-ferrari.mp4.asset.json";
import goldHelicopterVid from "@/assets/gifts/animations/gold-helicopter.mp4.asset.json";
import rollsRoyceVid from "@/assets/gifts/animations/rolls-royce.mp4.asset.json";
import blackPantherVid from "@/assets/gifts/animations/black-panther.mp4.asset.json";
import bugattiVid from "@/assets/gifts/animations/bugatti.mp4.asset.json";
import diamondDragonVid from "@/assets/gifts/animations/diamond-dragon.mp4.asset.json";
import luxuryYachtVid from "@/assets/gifts/animations/luxury-yacht.mp4.asset.json";
import privateIslandVid from "@/assets/gifts/animations/private-island.mp4.asset.json";
import galaxyCrownVid from "@/assets/gifts/animations/galaxy-crown.mp4.asset.json";
import goldenCastleVid from "@/assets/gifts/animations/golden-castle.mp4.asset.json";

export const giftAnimationVideos: Record<string, string> = {
  // ── Gifts tab ──
  // Gifts 1-199 coins: NO video animations (icon-only)
  // Lv.4 — 299 coins (first gift with video)
  "Fire Dragon": fireDragonVid.url,

  // ── Interactive tab ──
  // Lv.4 — 100 coins
  "Panda Party": pandaPartyVid.url,
  // Lv.5 — 699 coins
  "Sapphire Swan": sapphireSwanVid.url,
  // Lv.5 — 888 coins
  "Royal Crown": royalCrownVid.url,
  // Lv.5 — 999 coins
  "Gold Fountain": goldFountainVid.url,
  // Lv.6 — 1200 coins
  "Emerald Eagle": emeraldEagleVid.url,
  // Lv.6 — 1500 coins
  "Diamond Rain": diamondRainVid.url,
  // Lv.6 — 1999 coins
  "Platinum Panda": platinumPandaVid.url,
  // Lv.6 — 2000 coins
  "Luxury Lambo": luxuryLamboVid.url,
  // Lv.6 — 2500 coins
  "Treasure Dragon": treasureDragonVid.url,
  // Lv.6 — 3000 coins
  "Gold Ferrari": goldFerrariVid.url,
  // Lv.6 — 3500 coins
  "Gold Helicopter": goldHelicopterVid.url,
  // Lv.7 — 5000 coins
  "Rolls Royce": rollsRoyceVid.url,

  // ── Exclusive tab ──
  // Lv.7 — 4999 coins
  "Black Panther": blackPantherVid.url,
  // Lv.7 — 9999 coins
  "Bugatti": bugattiVid.url,
  // Lv.8 — 15000 coins
  "Diamond Dragon": diamondDragonVid.url,
  // Lv.8 — 19999 coins
  "Luxury Yacht": luxuryYachtVid.url,
  // Lv.9 — 29999 coins
  "Private Island": privateIslandVid.url,
  // Lv.9 — 49999 coins
  "Galaxy Crown": galaxyCrownVid.url,
  // Lv.10 — 59999 coins
  "Golden Castle": goldenCastleVid.url,
};
