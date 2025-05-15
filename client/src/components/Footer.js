import Image from "next/image";
import sitterlogowhite from "/public/assets/sitter-logo-white.svg";

const Footer = () => {
  return (
    <footer className="w-full flex justify-center bg-black md:h-[280px] text-white">
      <div className="flex-col items-center text-center max-w-[1440px] min-w-0 w-full md:px-20 py-20 bg-black">
        <div className="flex justify-center items-center bg-black">
          <Image
            src={sitterlogowhite}
            alt="sister-logo-white"
            width={210}
            className="mb-6 w-[210px] bg-black"
          />
        </div>
        <p className="sm:text-[24px] sm:bg-black text-white text-[18px] font-bold">
          Find your perfect pet sitter with us.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
