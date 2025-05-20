import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import star from "/public/assets/star-rating.svg";
import ExperienceDropdown from "@/components/dropdown/ExperienceDropdown";
import { ButtonOrange, ButtonOrangeLight } from "@/components/buttons/OrangeButtons";

const petTypesList = [
  "Dog",
  "Cat",
  "Bird",
  "Rabbit",
  "Mouse",
  "Turtle",
  "Snake",
];
const ratingList = [5, 4, 3, 2, 1];

const FilterFields = ({
  filters,
  onChange,
  onCheckbox,
  onSearch,
  onClear,
  variant = "sidebar", // 'sidebar' หรือ 'searchbar'
}) => {
  const renderStars = (count) => {
    const stars = [];
    for (let i = 0; i < count; i++) {
      stars.push(
        <FontAwesomeIcon key={i} icon={faStar} className="text-orange-400" />
      );
    }
    return stars;
  };

  const isSidebar = variant === "sidebar";
  const isSearchbar = variant === "searchbar";

  return (
    <>
      {isSearchbar && (
        <div className="w-full max-w-[1064px] px-4 pb-4 lg:px-4 lg:static lg:top-0 lg:left-0 lg:right-0 lg:bottom-0 lg:rounded-3xl flex flex-col m-auto">
          {/* Pet Type */}
          <div className="bg-[#F6F6F9] md:px-6 px-4 w-full flex flex-col sm:flex-row sm:items-center sm:h-[72px] text-[var(--primary-gray-color-500)] rounded-t-3xl">
            <div className="text-[var(--primary-gray-color-500)] font-bold pt-4 pb-2 pr-3 sm:pt-0 sm:pb-0 w-[100px]">
              Pet Type:
            </div>
            <span className="w-full max-w-[700px]">
              <div className="sm:space-x-3 space-x-1 flex justify-start sm:justify-start flex-wrap">
                {petTypesList.map((type) => (
                  <span key={type} className="flex items-center my-2 mx-auto">
                    <label className="group relative flex items-center w-6 h-6">
                      <input
                        id={type.toLowerCase()}
                        type="checkbox"
                        value={type}
                        checked={filters.petTypes.includes(type)}
                        onChange={onCheckbox}
                        className="absolute w-6 h-6 opacity-0 cursor-pointer z-20"
                      />
                      <span
                        className={`
        flex items-center justify-center w-6 h-6 rounded-md border transition-all
        ${
          filters.petTypes.includes(type)
            ? "bg-[#FF7037] border-[#FFB899]"
            : "bg-white border-[#DCDFED]"
        }
        group-hover:border-[#FFB899] hover:border-[#FFB899]"
      `}
                      >
                        {filters.petTypes.includes(type) && (
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 20 20"
                            fill="none"
                          >
                            <path
                              d="M5 10.5L9 14.5L15 7.5"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                    </label>
                    <label
                      htmlFor={type.toLowerCase()}
                      className="text-[16px] font-medium ml-2 mr-3"
                    >
                      {type}
                    </label>
                  </span>
                ))}
              </div>
            </span>
          </div>

          {/* Rating, Experience, Search */}
          <div
            className="flex-col lg:flex-row gap-6 bg-white w-full lg:h-[72px] flex lg:px-4 px-4 py-4 text-[var(--primary-gray-color-500)] rounded-b-3xl justify-between"
            style={{ boxShadow: "4px 4px 24px 0px #0000000A" }}
          >
            {/* Rating */}
            <div className="flex flex-col lg:flex-row lg:items-center">
              <p className="lg:pr-6 pb-3 font-bold">Rating:</p>
              <div className="flex flex-wrap gap-2">
                {ratingList.map((num) => (
                  <button
                    key={num}
                    id={num}
                    role="checkbox"
                    type="button"
                    onClick={() =>
                      onChange({
                        target: {
                          name: "rating",
                          value: filters.rating === num ? "" : num,
                        },
                      })
                    }
                    className={`flex px-2 py-1 items-center justify-center font-medium gap-1 border rounded-lg text-[16px] cursor-pointer ${
                      filters.rating == num
                        ? "border-[var(--primary-orange-color-500)] text-[var(--primary-orange-color-500)]"
                        : "border-[var(--primary-gray-color-100)] text-[var(--primary-gray-color-300)]"
                    } `}
                  >
                    {num}
                    {Array.from({ length: num }).map((_, idx) => (
                      <Image src={star} alt="Star Rating" key={idx} />
                    ))}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div className="w-full lg:w-auto flex flex-col lg:flex-row lg:items-center lg:gap-3">
              <p className="pb-3 lg:pb-0 font-bold">Experience:</p>
              <ExperienceDropdown
                value={filters.experience}
                onChange={(value) =>
                  onChange({
                    target: {
                      name: "experience",
                      value,
                    },
                  })
                }
                className="input border-[#DCDFED]"
              />
            </div>

            {/* Search Button */}
            <button
              onClick={onSearch}
              className="w-full md:w-[80%] lg:w-[120px] bg-[var(--primary-orange-color-500)] hover:bg-[#FF986F] active:bg-[#E44A0C] hover:scale-105 focus:scale-100 transition-transform text-white text-[16px] font-bold rounded-full tracking-wide h-[48px] self-center cursor-pointer"
            >
              Search
            </button>
          </div>
        </div>
      )}

      {isSidebar && (
  <div className="w-full max-w-[350px] rounded-3xl px-4 sm:px-6 flex flex-col m-auto">
    {/* Keyword */}
    <div className="mb-6 w-full relative">
      <input
        type="text"
        name="keyword"
        value={filters.keyword}
        onChange={onChange}
        className="w-full p-2 pr-10 border border-gray-300 rounded-md"
      />
      <Image
        src="/assets/icon=feather_search.png"
        alt="search"
        width={16}
        height={16}
        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70"
      />
    </div>

    {/* Pet Type */}
    <div className="mb-6">
      <p className="font-medium text-[16px] mb-2">Pet Type:</p>
      <div className="flex flex-wrap gap-x-3 gap-y-2">
        {petTypesList.map((type) => (
          <span key={type} className="flex items-center">
            <label className="group relative flex items-center w-6 h-6">
              <input
                id={`sidebar-${type.toLowerCase()}`}
                type="checkbox"
                value={type}
                checked={filters.petTypes.includes(type)}
                onChange={onCheckbox}
                className="absolute w-6 h-6 opacity-0 cursor-pointer z-20"
              />
              <span
                className={`
                  flex items-center justify-center w-6 h-6 rounded-md border transition-all
                  ${filters.petTypes.includes(type)
                    ? "bg-[#FF7037] border-[#FFB899]"
                    : "bg-white border-[#DCDFED]"}
                  group-hover:border-[#FFB899] hover:border-[#FFB899]"
                `}
              >
                {filters.petTypes.includes(type) && (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M5 10.5L9 14.5L15 7.5"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
            </label>
            <label
              htmlFor={`sidebar-${type.toLowerCase()}`}
              className="text-[16px] font-medium ml-2 mr-3 cursor-pointer"
            >
              {type}
            </label>
          </span>
        ))}
      </div>
    </div>

    {/* Rating */}
    <div className="mb-6">
      <p className="font-medium text-[16px] mb-2">Rating:</p>
      <div className="flex flex-wrap gap-2">
        {ratingList.map((num) => (
          <button
            key={num}
            id={`sidebar-rating-${num}`}
            role="checkbox"
            type="button"
            onClick={() =>
              onChange({
                target: {
                  name: "rating",
                  value: filters.rating === num ? "" : num,
                },
              })
            }
            className={`flex px-2 py-1 items-center justify-center font-medium gap-1 border rounded-lg text-[16px] cursor-pointer ${
              filters.rating == num
                ? "border-[var(--primary-orange-color-500)] text-[var(--primary-orange-color-500)]"
                : "border-[var(--primary-gray-color-100)] text-[var(--primary-gray-color-300)]"
            } `}
          >
            {num}
            {Array.from({ length: num }).map((_, idx) => (
              <Image src={star} alt="Star Rating" key={idx} />
            ))}
          </button>
        ))}
      </div>
    </div>

    {/* Experience */}
    <div className="mb-6">
      <label className="font-medium text-[16px] block mb-2">
        Experience:
      </label>
      <ExperienceDropdown
        value={filters.experience}
        onChange={(value) =>
          onChange({
            target: {
              name: "experience",
              value,
            },
          })
        }
        className="w-full border border-gray-200 rounded-md"
      />
    </div>

    {/* Buttons */}
    <div className="flex flex-col sm:flex-row gap-2 justify-around mt-4 w-full [@media(max-width:1320px)]:flex-col">
      <ButtonOrangeLight
        text="Clear"
        onClick={onClear}
        className="flex-1"
      >
        Clear
      </ButtonOrangeLight>
      <ButtonOrange
        text="Search"
        onClick={onSearch}
        className="flex-1"
      >
        Search
      </ButtonOrange>
    </div>
  </div>
)}
    </>
  );
};

export default FilterFields;
