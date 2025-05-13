export default function LoginForm({ email, password, setEmail, setPassword, handleLogin, error }) {
    return (
      <form onSubmit={handleLogin} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            type="email"
            placeholder="email@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full border p-2 rounded text-sm border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
  
        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full border p-2 rounded text-sm border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
  
        {/* Remember and Forgot */}
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2 h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
            Remember?
          </label>
          <a href="#" className="text-orange-500 hover:underline">Forget Password?</a>
        </div>
  
        {/* Submit Button */}
        <button type="submit" className="w-full bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600">
          Login
        </button>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </form>
    );
  }
  