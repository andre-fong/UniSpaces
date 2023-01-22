import useSWR from "swr";

export function useUserFetching(user_id) {
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
    user_id ? `/api/users/${user_id}` : null,
    fetcher
  );

  return {
    user: user_id ? data : null,
    loading: !data && !error,
    error,
  };
}
