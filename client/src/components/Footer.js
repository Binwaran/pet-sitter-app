import Image from "next/image";
import sitterlogowhite from "/public/assets/sitter-logo-white.svg";

const Footer = () => {
  return (
    <footer>
      <div className="flex flex-col items-center justify-center md:h-70 w-full py-20 gap-6 bg-black">
        <Image
          src={sitterlogowhite}
          alt="sister-logo-white"
          width={212}
          height={64}
        />
        <p className="text-white text-lg md:text-2xl font-medium md:font-bold leading-6.5 md:leading-8 tracking-normal text-center">
          Find your perfect pet sitter with us.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
