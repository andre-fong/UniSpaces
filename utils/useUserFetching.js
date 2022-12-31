import { useState, useEffect } from "react";

export function useUserFetching(user_id) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (user_id) {
      const promise = fetch(`/api/users/${user_id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      promise
        .then((res) => {
          if (res.status !== 200)
            throw new Error(`Error fetching data: ${res.status}`);
          return res.json();
        })
        .then((data) => {
          setUser(data);
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      setUser(null);
    }
  }, [user_id]);

  return user;
}
