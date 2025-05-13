import SearchBar from "../components/home/SearchBar";
import Image from "next/image";
import Link from "next/link";
import {
  ButtonOrangeLight,
  ButtonOrange,
} from "@/components/buttons/OrangeButtons";
import elementhome1 from "/public/assets/home/element-home-1.svg";
import elementhome2 from "/public/assets/home/element-home-2.svg";
import elementhome3 from "/public/assets/home/element-home-3.svg";
import elementhome4 from "/public/assets/home/element-home-4.svg";
import elementhome5 from "/public/assets/home/element-home-5.svg";
import elementhome6 from "/public/assets/home/element-home-6.svg";
import starbulletblue from "/public/assets/home/star-bullet-blue.svg";
import starbulletpink from "/public/assets/home/star-bullet-pink.svg";
import starbulletgreen from "/public/assets/home/star-bullet-green.svg";
import starbulletyellow from "/public/assets/home/star-bullet-yellow.svg";
import connect from "/public/assets/home/connect.svg";
import calling from "/public/assets/home/calling.svg";
import better from "/public/assets/home/better.svg";

export default function Home() {
  return (
    <section className="w-full flex-col items-center pt-20">
      <header className="max-w-[1440px] mx-auto w-full md:flex flex-col items-center justify-center md:h-[441px] h-[565] gap-5 relative">
        <div>
          <p className="lg:text-[88px] sm:text-[68px] text-[48px] lg:leading-[96px] md:leading-[76px] leading-[56px] font-[900] text-center break-words max-w-[90vw] mx-auto text-shadow-lg text-shadow-gray-700/30">
            Pet Sitter
            <span className="text-[var(--primary-orange-color-500)]">,</span>
            <br /> Perfect
            <span className="text-[var(--secondary-blue-color-100)]">,</span>
            <br /> For Your Pet
            <span className="text-[var(--secondary-yellow-color-100)]">.</span>
          </p>
          <p className="text-[var(--primary-gray-color-300)] md:text-[24px] text-[20px] text-center pt-8 font-bold">
            Find your perfect pet sitter with us.
          </p>
        </div>
        <div className="flex gap-4 mt-[50px] md:mt-0 relative h-[255px] md:h-auto overflow-hidden md:w-full md:justify-between md:absolute md:left-0 md:pt-0 pt-[50px] -z-10">
          <div className=" w-[255px] lg:w-[428px] aspect-square absolute right-[calc(50%+8px)] top-0 md:static">
            <Image
              src={elementhome1}
              alt="element-home-1"
              sizes="100%"
              width={428}
              className="object-cover"
            />
          </div>
          <div className="w-[255px] lg:w-[428px] aspect-square absolute left-[calc(50%+8px)] top-0 md:static">
            <Image
              src={elementhome2}
              alt="element-home-2"
              sizes="100%"
              width={428}
              className="object-cover"
            />
          </div>
        </div>
      </header>

      {/* SearchBar */}
      <div className="w-full lg:my-16 h-auto flex justify-center">
        <SearchBar />
      </div>

      {/* content */}
      <div className="w-full max-w-[1440px] flex-col mx-auto lg:p-20 md:px-8 px-4 md:py-10 bg-white z-10">
        <p className="w-full lg:text-[36px] text-[24px] text-center lg:mb-[120px] mb-10 font-bold">
          {'"Your Pets, Our Priority: Perfect Care, Anytime, Anywhere."'}
        </p>
        <div className="max-w-[1064px] w-full mx-auto md:flex-row flex flex-col gap-6 md:justify-between mb-[120px]">
          <div className="flex-col md:w-[504px] px-4 md:px-0">
            <div className="flex md:pb-[55px] pb-6 h-auto">
              <Image
                src={starbulletblue}
                alt="star"
                width={24}
                className="self-start"
              />
              <div className="pl-3">
                <p className="md:text-[24px] text-[20px] font-bold pb-3">
                  Boarding
                </p>
                <p className="md:text-[18px] text-[16px] font-medium text-[var(--primary-gray-color-400)] text-wrap">
                  Your pets stay overnight in your sitter’s home. They’ll be
                  treated like part of the family in a comfortable environment.
                </p>
              </div>
            </div>
            <div className="flex md:pb-[55px] pb-6">
              <Image
                src={starbulletpink}
                width={24}
                alt="star"
                className="self-start"
              />
              <div className="pl-3">
                <p className="md:text-[24px] text-[20px] font-bold pb-3">
                  House Sitting
                </p>
                <p className="md:text-[18px] text-[16px] font-medium text-[var(--primary-gray-color-400)]">
                  Your sitter takes care of your pets and your home. Your pets
                  will get all the attention they need without leaving home.
                </p>
              </div>
            </div>
            <div className="flex md:pb-[55px] pb-6">
              <Image
                src={starbulletgreen}
                alt="star"
                width={24}
                className="self-start"
              />
              <div className="pl-3">
                <p className="md:text-[24px] text-[20px] font-bold pb-3">
                  Dog Walking
                </p>
                <p className="md:text-[18px] text-[16px] font-medium text-[var(--primary-gray-color-400)]">
                  Your dog gets a walk around your neighborhood. Perfect for
                  busy days and dogs with extra energy to burn.
                </p>
              </div>
            </div>
            <div className="flex lg:pb-0 pb-10">
              <Image
                src={starbulletyellow}
                alt="star"
                width={24}
                className="self-start"
              />
              <div className="pl-3">
                <p className="md:text-[24px] text-[20px] font-bold pb-3">
                  Drop-In Visits
                </p>
                <p className="md:text-[18px] text-[16px] font-medium text-[var(--primary-gray-color-400)]">
                  Your sitter drops by your home to play with your pets, offer
                  food, and give potty breaks or clean the litter box.
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <Image src={elementhome3} alt="element-home" width={455} />
          </div>
        </div>

        <div className="w-full max-w-[1280px] flex flex-wrap gap-4 gap-y-10 justify-center">
          <div className="w-[416px] flex-col">
            <div className="w-full flex justify-center pb-[46px]">
              <Image
                src={connect}
                alt="Connect With Sitters"
                width={268}
                height={268}
              />
            </div>
            <div className="px-6 text-center">
              <p className="text-[24px] pb-3 font-bold">
                <span className="text-[var(--secondary-green-color-100)]">
                  Connect
                </span>{" "}
                With Sitters
              </p>
              <p className="font-medium text-[18px] text-[var(--primary-gray-color-400)]">
                Find a verified and reviewed sitter who’ll keep your pets
                company and give time.
              </p>
            </div>
          </div>
          <div className="w-[416px] flex-col">
            <div className="flex justify-center pb-[46px]">
              <Image
                src={calling}
                alt="Connect With Sitters"
                width={268}
                height={268}
              />
            </div>
            <div className="px-6 text-center">
              <p className="text-[24px] pb-3 font-bold">
                <span className="text-[var(--secondary-blue-color-100)]">
                  Better
                </span>{" "}
                For Your Pets
              </p>
              <p className="font-medium text-[18px] text-[var(--primary-gray-color-400)]">
                Pets stay happy at home with a sitter who gives them loving care
                and companionship.
              </p>
            </div>
          </div>
          <div className="w-[416px] flex-col">
            <div className="flex justify-center pb-[46px]">
              <Image
                src={better}
                alt="Connect With Sitters"
                width={268}
                height={268}
              />
            </div>
            <div className="px-6 text-center">
              <p className="text-[24px] pb-3 font-bold">
                <span className="text-[var(--primary-orange-color-500)]">
                  Calling
                </span>{" "}
                All Pets
              </p>
              <p className="font-medium text-[18px] text-[var(--primary-gray-color-400)]">
                Stay for free with adorable animals in unique homes around the
                world.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Find A Pet Sitter */}
      <div className="w-full max-w-[1440px] mx-auto md:p-20 -z-10">
        <div className="w-full h-[448px] bg-[var(--secondary-yellow-color-50)] md:rounded-2xl relative flex justify-center items-center">
          <div className="absolute md:bottom-0 md:left-0 -z-0 md:w-[337px] md:-translate-x-0 max-w-[248px] w-full bottom-0 left-0 -translate-x-5">
            <Image
              src={elementhome4}
              alt="element-home"
              width={337}
              className="rounded-l-2xl"
            />
          </div>
          <div className="absolute -z-0 md:w-[327px] w-[200px] top-0 right-0 sm:flex hidden">
            <Image
              src={elementhome5}
              alt="element-home"
              width={327}
              className="rounded-2xl"
            />
          </div>
          <div className="absolute -z-0 w-[188px] top-0 right-0 sm:hidden">
            <Image
              src={elementhome6}
              alt="element-home"
              width={327}
              className="rounded-2xl"
            />
          </div>
          <div className="w-full max-w-[457px] text-center z-10 md:p-0 p-4 md:pt-0 pt-16">
            <p className="md:text-[56px] text-[36px] font-bold pb-10">
              Perfect Pet Sitter For Your Pet
            </p>
            <div className="flex flex-col md:flex-row justify-between items-center w-full sm:h-[72px] gap-4 px-4 sm:px-9">
              <Link href="/register/sitter" className="w-full md:w-auto">
                <ButtonOrangeLight text="Register" width="w-full md:w-auto" />
              </Link>
              <Link href="/pet-sitters" className="w-full md:w-auto">
                <ButtonOrange
                  text="Find A Pet Sitter"
                  width="w-full md:w-auto"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
