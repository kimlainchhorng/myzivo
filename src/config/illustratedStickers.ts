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
import buddyPuppy from "@/assets/stickers/buddy-puppy.png";
import buddyDuck from "@/assets/stickers/buddy-duck.png";
import buddyStrawberry from "@/assets/stickers/buddy-strawberry.png";
import buddyPanda from "@/assets/stickers/buddy-panda.png";
import buddyFox from "@/assets/stickers/buddy-fox.png";
import buddyAvocado from "@/assets/stickers/buddy-avocado.png";
import buddyOwl from "@/assets/stickers/buddy-owl.png";
import buddyDonut from "@/assets/stickers/buddy-donut.png";
import buddyKoala from "@/assets/stickers/buddy-koala.png";
import buddyBear from "@/assets/stickers/buddy-bear.png";
import buddyWhale from "@/assets/stickers/buddy-whale.png";
import buddyCherry from "@/assets/stickers/buddy-cherry.png";
import buddyUnicorn from "@/assets/stickers/buddy-unicorn.png";
import buddyRaccoon from "@/assets/stickers/buddy-raccoon.png";
import buddyButterfly from "@/assets/stickers/buddy-butterfly.png";

export interface IllustratedSticker {
  id: string;
  src: string;
  alt: string;
}

export interface IllustratedStickerPack {
  id: string;
  name: string;
  icon: string;
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
      { id: "bb-strawberry", src: buddyStrawberry, alt: "Sweet Strawberry" },
      { id: "bb-avocado", src: buddyAvocado, alt: "Happy Avocado" },
      { id: "bb-donut", src: buddyDonut, alt: "Excited Donut" },
      { id: "bb-cherry", src: buddyCherry, alt: "Happy Cherries" },
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
      { id: "cf-puppy", src: buddyPuppy, alt: "Happy Puppy" },
      { id: "cf-duck", src: buddyDuck, alt: "Cute Duck" },
      { id: "cf-panda", src: buddyPanda, alt: "Waving Panda" },
      { id: "cf-fox", src: buddyFox, alt: "Sly Fox" },
      { id: "cf-owl", src: buddyOwl, alt: "Sleepy Owl" },
      { id: "cf-koala", src: buddyKoala, alt: "Shy Koala" },
      { id: "cf-bear", src: buddyBear, alt: "Cuddly Bear" },
      { id: "cf-whale", src: buddyWhale, alt: "Happy Whale" },
      { id: "cf-unicorn", src: buddyUnicorn, alt: "Magical Unicorn" },
      { id: "cf-raccoon", src: buddyRaccoon, alt: "Cheeky Raccoon" },
      { id: "cf-butterfly", src: buddyButterfly, alt: "Pretty Butterfly" },
    ],
  },
];
