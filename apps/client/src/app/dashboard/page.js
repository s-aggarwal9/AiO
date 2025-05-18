"use client";

import React from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const page = () => {
  const router = useRouter();
  const handleLogout = async () => {
    try {
      const res = await axios.post(`/api/v1/users/logout`, {
        withCredentials: true,
      });
      router.push("/");
    } catch (error) {
      console.log("logout error", error);
    }
  };

  return (
    <>
      <div>dashboard page</div>
      <button onClick={handleLogout}>logout</button>
    </>
  );
};

export default page;
