import { Link } from "react-router-dom";

/** Landing-page hero card. */
function Hero() {
  return (
    <div className="w-[500px] max-w-full rounded-xl bg-white p-12 text-center shadow-lg">
      <h1 className="mb-5 text-4xl leading-tight font-bold text-gray-900 sm:text-5xl">
        B2B SaaS
        <br />
        Collaboration
        <br />
        Workspace
      </h1>

      <p className="mb-9 text-lg text-gray-500">
        Collaborate with your team in real time.
      </p>

      <div className="flex justify-center gap-4">
        <Link
          to="/login"
          className="rounded-lg bg-blue-600 px-7 py-3 font-bold text-white transition hover:bg-blue-700"
        >
          Login
        </Link>

        <Link
          to="/register"
          className="rounded-lg border-2 border-blue-600 bg-white px-7 py-3 font-bold text-blue-600 transition hover:bg-blue-50"
        >
          Register
        </Link>
      </div>
    </div>
  );
}

export default Hero;
