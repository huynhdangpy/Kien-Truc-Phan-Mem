import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();

  return (
    <section className="max-w-md bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-2xl font-semibold">Profile</h2>
      <div className="mt-4 space-y-2 text-sm">
        <p>
          <span className="font-semibold">Name:</span> {user?.name}
        </p>
        <p>
          <span className="font-semibold">Email:</span> {user?.email}
        </p>
        <p>
          <span className="font-semibold">Role:</span> {user?.role}
        </p>
      </div>
    </section>
  );
}
