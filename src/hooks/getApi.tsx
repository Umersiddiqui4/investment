import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

 const fetchUsers = async (role: string) => 
  {  // @ts-ignore
     const apiUrl = import.meta.env.VITE_BE_URL;


  const token = localStorage.getItem("token")?.replace(/"/g, "");
  console.log("token", token);
      const userResponse = await axios.get(`${apiUrl}/api/v1/users`, {
        // params: { page: 1, take: 10}, // pass role if needed
        params: { page: 1, take: 10, role },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

  return userResponse.data.data; // or response.data.data depending on API
};

const useUsers = (role: any) => {
  return useQuery({
    queryKey: ['users', role],
    queryFn: () => fetchUsers(role),
  });
};

export default useUsers;
