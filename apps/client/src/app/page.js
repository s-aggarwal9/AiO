"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <Image
        src="/logo.png" // replace with your logo or remove if not needed
        alt="Store Logo"
        width={100}
        height={100}
        className="mb-6"
      />

      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        Welcome to My Grocery Store
      </h1>
      <p className="text-gray-600 mb-8 text-center">
        Manage products, invoices, and inventory all in one place.
      </p>

      <div className="flex gap-4">
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          onClick={() => router.push("/login")}
        >
          Login
        </button>
        <button
          className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
          onClick={() => router.push("/register")}
        >
          Register
        </button>
      </div>
    </div>
  );
}
