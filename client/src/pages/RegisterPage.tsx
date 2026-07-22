/**
 * Register page (presentational).
 * Form state, validation and API submission are implemented in Phase 1.
 */
function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-[400px] max-w-full rounded-xl bg-white p-10 shadow-lg">
        <h2 className="mb-8 text-center text-2xl font-semibold">Register</h2>

        <input
          type="text"
          placeholder="Full Name"
          className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="email"
          placeholder="Email"
          className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="password"
          placeholder="Password"
          className="mb-5 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button className="w-full rounded-lg bg-blue-600 py-3 font-bold text-white transition hover:bg-blue-700">
          Register
        </button>
      </div>
    </div>
  );
}

export default RegisterPage;
