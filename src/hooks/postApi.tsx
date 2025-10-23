import { useState } from 'react';
import axios from 'axios';

type CreateUserPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'GUARANTOR' | 'ADMIN' | 'INVESTOR' | 'CUSTOMER'; // extend if needed
  companyId?: string;
  cnicFrontUrl?: string; // URL of the CNIC front image
  cnicBackUrl?: string; // URL of the CNIC back image
  profilePicture?: string; // URL of the profile picture
  address?: string; // Optional address field
  cnicNumber?: string; // Optional CNIC number field
};

export function useCreateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  // @ts-ignore
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const createUser = async (userData: CreateUserPayload) => {
    const token = localStorage.getItem("token")?.replace(/"/g, "");
    setLoading(true);
    setError(null);
    setSuccess(false);
    console.log("userData", userData);

    try {

      const res = await axios.post(`${apiUrl}/api/v1/users`, userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess(true);
      return res.data; // return created user data if needed
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createUser, loading, error, success };
}
