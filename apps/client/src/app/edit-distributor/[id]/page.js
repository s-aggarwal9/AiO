"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";

const editDistributor = () => {
  const router = useRouter();
  const { id } = useParams();

  const [distributor, setDistributor] = useState({});

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // console.log("enter useeffect", "id:", id);
    const fetchDistributor = async () => {
      try {
        const response = await axios.get(`/api/v1/distributors/${id}`, {
          withCredentials: true,
        });
        // console.log("respone in useeffect", response);
        const fetchedDistributor = response.data.data;
        setDistributor(fetchedDistributor);
      } catch (error) {
        setError(
          error.response?.data?.message || "failed to fetch distributor"
        );
      }
    };
    if (id) fetchDistributor();
  }, [id, router]);

  return (
    <>
      <div>hello</div>
      <div>hi</div>
      <div>{distributor.name || "name"}</div>
    </>
  );
};

export default editDistributor;
