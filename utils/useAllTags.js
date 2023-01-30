import useSWR from "swr";

export function useAllTags() {
  // Session fetcher function
  async function fetcher(url) {
    return fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }).then((res) => res.json());
  }

  // Get user data with useSWR
  const { data, error } = useSWR(`/api/tags`, fetcher);

  return {
    tags: data,
    loading: !data && !error,
    error,
  };
}
