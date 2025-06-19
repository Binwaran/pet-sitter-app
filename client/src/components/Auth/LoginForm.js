import React from "react";

export default function LoginForm({
  email,
  password,
  setEmail,
  setPassword,
  handleLogin,
  emailError,
  passwordError,
}) {
  const [isRemembered, setIsRemembered] = React.useState(false);
  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-8">
      {/* Email */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="email"
          className="text-base font-medium text-black leading-[150%]"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="email@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`w-full h-12 border px-4 py-3 rounded-lg text-base placeholder-[#7B7E8F] focus:outline-none focus:ring-2 transition ${
            emailError
              ? "border-red-500 focus:ring-red-500"
              : "border-[#DCDFED] focus:ring-orange-500"
          }`}
        />
        {emailError && <p className="text-sm text-red-500">Incorrect email</p>}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="password"
          className="text-base font-medium text-black leading-[150%]"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`w-full h-12 border px-4 py-3 rounded-lg text-base placeholder-[#7B7E8F] focus:outline-none focus:ring-2 ${
            passwordError
              ? "border-red-500 focus:ring-red-500"
              : "border-[#DCDFED] focus:ring-orange-500"
          }`}
        />
        {passwordError && (
          <p className="text-sm text-red-500">Incorrect password</p>
        )}
      </div>

      {/* Remember and Forgot */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <div className="group relative flex items-center w-6 h-6">
            <input
              type="checkbox"
              id="remember"
              checked={isRemembered}
              onChange={(e) => setIsRemembered(e.target.checked)}
              className="absolute w-6 h-6 opacity-0 cursor-pointer z-20 peer"
            />
            <span
              className={`
                flex items-center justify-center w-6 h-6 rounded-md border transition-all
                peer-checked:bg-[#FF7037] peer-checked:border-[#FFB899]
                bg-white border-[#DCDFED]
                group-hover:border-[#FFB899] hover:border-[#FFB899]
              `}
            >
              {isRemembered && (
                <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
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
          </div>
          <p className="font-medium text-[#3A3B46] w-[88px]">Remember?</p>
        </label>
        <button
          href="#"
          className="text-[#FF7037] hover:text-[#FF986F] active:text-[#E44A0C] hover:underline w-[137px] h-8 flex items-center justify-center px-0.5 py-1 rounded-full gap-1"
        >
          <p className="font-bold w-[133px] leading-[150%] text-base">
            Forget Password?
          </p>
        </button>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="flex justify-center items-center w-full min-w-30 bg-[#FF7037] hover:bg-[#FF986F] active:bg-[#E44A0C] h-12 px-6 py-3 gap-2 rounded-full transition"
      >
        <p className="text-white text-base font-bold w-[59px]">Login</p>
      </button>
      {/* {error && <p className="text-sm text-red-500">{error}</p>} */}
    </form>
  );
}
