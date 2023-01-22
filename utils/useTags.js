import useSWR from "swr";

export function useTags(space_id) {
  // Session fetcher function
  async function fetcher(url) {
    return fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }).then((res) => res.json());
  }

  // Get user data with useSWR
  const { data, error } = useSWR(
    space_id ? `/api/spaces/${space_id}/tags` : null,
    fetcher
  );

  return {
    tags: space_id ? data : [],
    loading: !data && !error,
    error,
  };
}
