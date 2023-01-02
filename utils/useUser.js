import useSWR from "swr";

export function useUser() {
  // Session fetcher function
  async function fetcher(url) {
    return fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }).then((res) => res.json());
  }

  // Get user data with useSWR
  const { data, error } = useSWR(`/api/sessions`, fetcher);

  return {
    user: data?.json,
    loading: !data && !error,
    error,
  };
}
