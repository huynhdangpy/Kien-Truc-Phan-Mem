import { Link } from "react-router-dom";

export default function Home() {
  return (
    <section className="bg-white rounded-xl p-10 shadow-sm text-center">
      <h1 className="text-4xl font-bold text-slate-800">
        Online Food Delivery
      </h1>
      <p className="mt-3 text-slate-600">
        Monolithic architecture with React, Express, MongoDB and Docker.
      </p>
      <Link
        to="/products"
        className="inline-block mt-6 bg-orange-500 text-white px-5 py-2 rounded-lg"
      >
        Browse Foods
      </Link>
    </section>
  );
}
