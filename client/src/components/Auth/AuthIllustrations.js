export default function AuthIllustrations() {
    return (
      <>
        <div className="hidden md:block absolute left-0 bottom-0 z-0">
          <img src="/assets/element1.svg" alt="Element 1" className="h-auto max-w-xs" />
        </div>
        <div className="hidden md:block absolute right-0 top-0 z-0">
          <img src="/assets/element2.svg" alt="Element 2" className="h-auto max-w-xs" />
        </div>
        <div className="absolute right-0 top-0 md:hidden pointer-events-none">
          <img src="/assets/element3.svg" alt="Element 3" className="h-auto w-full" />
        </div>
      </>
    );
  }
  