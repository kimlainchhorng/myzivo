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
import buddyElephant from "@/assets/stickers/buddy-elephant.png";
import buddyGiraffe from "@/assets/stickers/buddy-giraffe.png";
import buddyLion from "@/assets/stickers/buddy-lion.png";
import buddyTurtle from "@/assets/stickers/buddy-turtle.png";
import buddyFrog from "@/assets/stickers/buddy-frog.png";
import buddySloth from "@/assets/stickers/buddy-sloth.png";
import buddyIcecream from "@/assets/stickers/buddy-icecream.png";
import buddyCookie from "@/assets/stickers/buddy-cookie.png";
import buddyWatermelon from "@/assets/stickers/buddy-watermelon.png";
import buddyChick from "@/assets/stickers/buddy-chick.png";
import buddyDeer from "@/assets/stickers/buddy-deer.png";
import buddyDragon from "@/assets/stickers/buddy-dragon.png";
// New — Tiny Bugs & Ocean Pals
import buddyBee from "@/assets/stickers/buddy-bee.png";
import buddySnail from "@/assets/stickers/buddy-snail.png";
import buddyCrab from "@/assets/stickers/buddy-crab.png";
import buddyJellyfish from "@/assets/stickers/buddy-jellyfish.png";
import buddyLadybug from "@/assets/stickers/buddy-ladybug.png";
import buddyStarfish from "@/assets/stickers/buddy-starfish.png";
import buddySeahorse from "@/assets/stickers/buddy-seahorse.png";
import buddyClownfish from "@/assets/stickers/buddy-clownfish.png";
import buddySquid from "@/assets/stickers/buddy-squid.png";
import buddyDolphin from "@/assets/stickers/buddy-dolphin.png";

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
      { id: "bb-icecream", src: buddyIcecream, alt: "Melty Ice Cream" },
      { id: "bb-cookie", src: buddyCookie, alt: "Happy Cookie" },
      { id: "bb-watermelon", src: buddyWatermelon, alt: "Fresh Watermelon" },
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
      { id: "cf-chick", src: buddyChick, alt: "Curious Chick" },
      { id: "cf-deer", src: buddyDeer, alt: "Gentle Deer" },
      { id: "cf-sloth", src: buddySloth, alt: "Lazy Sloth" },
    ],
  },
  {
    id: "magic-squad",
    name: "Magic Squad",
    icon: "🐉",
    stickers: [
      { id: "ms-unicorn", src: buddyUnicorn, alt: "Magical Unicorn" },
      { id: "ms-dragon", src: buddyDragon, alt: "Baby Dragon" },
      { id: "ms-butterfly", src: buddyButterfly, alt: "Pretty Butterfly" },
      { id: "ms-raccoon", src: buddyRaccoon, alt: "Cheeky Raccoon" },
      { id: "ms-elephant", src: buddyElephant, alt: "Sweet Elephant" },
      { id: "ms-giraffe", src: buddyGiraffe, alt: "Tall Giraffe" },
      { id: "ms-lion", src: buddyLion, alt: "Brave Lion" },
      { id: "ms-turtle", src: buddyTurtle, alt: "Slow Turtle" },
      { id: "ms-frog", src: buddyFrog, alt: "Happy Frog" },
    ],
  },
  {
    id: "tiny-bugs",
    name: "Tiny Bugs",
    icon: "🐝",
    stickers: [
      { id: "tb-bee", src: buddyBee, alt: "Buzzy Bee" },
      { id: "tb-snail", src: buddySnail, alt: "Happy Snail" },
      { id: "tb-ladybug", src: buddyLadybug, alt: "Cute Ladybug" },
    ],
  },
  {
    id: "ocean-pals",
    name: "Ocean Pals",
    icon: "🐬",
    stickers: [
      { id: "op-crab", src: buddyCrab, alt: "Snappy Crab" },
      { id: "op-jellyfish", src: buddyJellyfish, alt: "Floaty Jellyfish" },
      { id: "op-starfish", src: buddyStarfish, alt: "Twinkle Starfish" },
      { id: "op-seahorse", src: buddySeahorse, alt: "Royal Seahorse" },
      { id: "op-clownfish", src: buddyClownfish, alt: "Happy Clownfish" },
      { id: "op-squid", src: buddySquid, alt: "Waving Squid" },
      { id: "op-dolphin", src: buddyDolphin, alt: "Playful Dolphin" },
    ],
  },
];
