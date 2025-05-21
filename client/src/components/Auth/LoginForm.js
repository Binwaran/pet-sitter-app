export default function LoginForm({
  email,
  password,
  setEmail,
  setPassword,
  handleLogin,
  emailError,
  passwordError,
}) {
  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="email@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`mt-1 w-full border p-2 rounded text-sm focus:outline-none focus:ring-2 ${
            emailError
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-200 focus:ring-orange-500"
          }`}
        />
        {emailError && (
          <p className="text-sm text-red-500 mt-1">Incorrect email</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`mt-1 w-full border p-2 rounded text-sm focus:outline-none focus:ring-2 ${
            passwordError
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-200 focus:ring-orange-500"
          }`}
        />
        {passwordError && (
          <p className="text-sm text-red-500 mt-1">Incorrect password</p>
        )}
      </div>

      {/* Remember and Forgot */}
      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center">
          <input
            type="checkbox"
            className="mr-2 h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
          />
          Remember?
        </label>
        <a href="#" className="text-orange-500 hover:underline">
          Forget Password?
        </a>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600">
        Login
      </button>
      {/* {error && <p className="text-sm text-red-500">{error}</p>} */}
    </form>
  );
}
