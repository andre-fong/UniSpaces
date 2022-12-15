export default async function getData(url, reqInfo) {
  const response = await fetch(url, reqInfo);

  return response;
}
