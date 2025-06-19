"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { ButtonOrange } from "@/components/buttons/OrangeButtons";
import image404 from "/public/assets/404/404.svg";
import star from "/public/assets/element1.svg";
import paw from "/public/assets/element2.svg";

export default function Custom404() {
  const router = useRouter();

  return (
      <div className="h-full w-full flex justify-center relative">
        <div className="max-lg:hidden">
          <Image
            src={star}
            alt="star"
            className="min-sm:w-[15%] max-lg:hidden absolute bottom-0 left-0"
          />
          <Image
            src={paw}
            alt="paw"
            className="w-[244px] max-lg:w-[23%] max-sm:w-[120px] absolute top-[10%] max-lg:top-[-55px] right-0 z-1"
          />
        </div>
        <div className="flex flex-col justify-center items-center mt-32 max-sm:mt-48 gap-5 px-10 pb-20">
          <Image src={image404} alt="image-404" width={600} height={500} />
          <div className="flex flex-col justify-center items-center gap-5">
            <div className="flex flex-col gap-1 w-full">
              <h2 className="text-h2 max-sm:text-h3 text-center">
                Something went wrong.
              </h2>
              <h3 className="text-b1max-sm:text-b2 text-center">
                Sorry, We can not find the page you are looking for.
              </h3>
            </div>
            <ButtonOrange
              text="Back to Home"
              width="w-fit"
              onClick={() => {
                router.push("/");
              }}
            />
          </div>
        </div>
      </div>
  );
}
