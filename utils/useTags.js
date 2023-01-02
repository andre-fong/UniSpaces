import { useState, useEffect } from "react";

export function useTags(space_id) {
  const [tags, setTags] = useState(null);

  useEffect(() => {
    if (space_id) {
      const promise = fetch(`/api/spaces/${space_id}/tags`, {
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
          setTags(data);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [space_id]);

  return tags;
}
