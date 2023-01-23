import useSWR from "swr";

export function useSpaceLiked(space_id) {
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
    space_id ? `/api/spaces/${space_id}/likes` : null,
    fetcher
  );

  return {
    liked: space_id ? data?.message === true : null,
    loading: !data && !error,
    error,
  };
}
