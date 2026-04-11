/** Illustrated sticker packs — kawaii character stickers */

import buddySunflower from "@/assets/stickers/buddy-sunflower.png";
import buddyPear from "@/assets/stickers/buddy-pear.png";
import buddySushi from "@/assets/stickers/buddy-sushi.png";
import buddyPig from "@/assets/stickers/buddy-pig.png";
import buddyBeet from "@/assets/stickers/buddy-beet.png";
import buddyCoffee from "@/assets/stickers/buddy-coffee.png";
import buddyCupcake from "@/assets/stickers/buddy-cupcake.png";
import buddyPenguin from "@/assets/stickers/buddy-penguin.png";
import buddyHamster from "@/assets/stickers/buddy-hamster.png";
import buddyLemon from "@/assets/stickers/buddy-lemon.png";
import buddyTomato from "@/assets/stickers/buddy-tomato.png";
import buddyCarrot from "@/assets/stickers/buddy-carrot.png";
import buddyCatLove from "@/assets/stickers/buddy-cat-love.png";
import buddyMushroom from "@/assets/stickers/buddy-mushroom.png";
import buddyPotato from "@/assets/stickers/buddy-potato.png";
import buddyBunny from "@/assets/stickers/buddy-bunny.png";
import buddyHedgehog from "@/assets/stickers/buddy-hedgehog.png";
import buddyToast from "@/assets/stickers/buddy-toast.png";
import buddyOctopus from "@/assets/stickers/buddy-octopus.png";

export interface IllustratedSticker {
  id: string;
  src: string;
  alt: string;
}

export interface IllustratedStickerPack {
  id: string;
  name: string;
  icon: string; // emoji used as pack tab icon
  stickers: IllustratedSticker[];
}

export const ILLUSTRATED_PACKS: IllustratedStickerPack[] = [
  {
    id: "buddy-buddies",
    name: "Buddy Buddies",
    icon: "🌻",
    stickers: [
      { id: "bb-sunflower", src: buddySunflower, alt: "Angry Sunflower" },
      { id: "bb-pear", src: buddyPear, alt: "Sad Pear" },
      { id: "bb-sushi", src: buddySushi, alt: "Happy Sushi" },
      { id: "bb-pig", src: buddyPig, alt: "Crying Pig" },
      { id: "bb-beet", src: buddyBeet, alt: "Grumpy Beet" },
      { id: "bb-coffee", src: buddyCoffee, alt: "Sleepy Coffee" },
      { id: "bb-cupcake", src: buddyCupcake, alt: "Angry Cupcake" },
      { id: "bb-lemon", src: buddyLemon, alt: "Sour Lemon" },
      { id: "bb-tomato", src: buddyTomato, alt: "Shy Tomato" },
      { id: "bb-carrot", src: buddyCarrot, alt: "Excited Carrot" },
    ],
  },
  {
    id: "cozy-friends",
    name: "Cozy Friends",
    icon: "🐧",
    stickers: [
      { id: "cf-penguin", src: buddyPenguin, alt: "Cozy Penguin" },
      { id: "cf-hamster", src: buddyHamster, alt: "Munching Hamster" },
      { id: "cf-cat-love", src: buddyCatLove, alt: "Love Cat" },
      { id: "cf-mushroom", src: buddyMushroom, alt: "Happy Mushroom" },
      { id: "cf-potato", src: buddyPotato, alt: "Sleepy Potato" },
      { id: "cf-bunny", src: buddyBunny, alt: "Sad Bunny" },
      { id: "cf-hedgehog", src: buddyHedgehog, alt: "Surprised Hedgehog" },
      { id: "cf-toast", src: buddyToast, alt: "Happy Toast" },
      { id: "cf-octopus", src: buddyOctopus, alt: "Angry Octopus" },
    ],
  },
];
