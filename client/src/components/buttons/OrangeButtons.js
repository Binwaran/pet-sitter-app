export function ButtonOrangeLight(props) {
    return (
      <button
        id={props.id}
        type={props.type}
        className={`flex justify-center items-center py-3 px-6 bg-[var(--primary-orange-color-100)] text-[var(--primary-orange-color-500)] hover:text-[#FF986F] active:text-[#E44A0C] rounded-[99px] ${props.width} min-w-[120px] text-base font-bold text-nowrap hover:scale-105 hover:bg-[#FFD5C2] focus:scale-100 transition-transform`}
        onClick={props.onClick}
      >
        {props.text}
      </button>
    );
  }
  
  export function ButtonOrange(props) {
    return (
      <button
        id={props.id}
        type={props.type}
        className={`flex justify-center items-center py-3 px-6 bg-[var(--primary-orange-color-500)] hover:bg-[#FF986F] active:bg-[#E44A0C] text-white rounded-[99px] ${props.width} min-w-[120px] text-base font-bold text-nowrap hover:scale-105 focus:scale-100 transition-transform disabled:bg-[#AEB1C3] disabled:hover:scale-100`}
        onClick={props.onClick}
        disabled={props.disabled}
      >
        {props.text}
      </button>
    );
  }
  
  // -- ตอนเอาไปใช้ใส่ props แบบนี้ ---
  // <ButtonOrange id="button name" text="button text" width="your tailwind width เช่น w-fit" />