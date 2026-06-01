export const retry = async <T extends object>(
  f: () => Promise<T>,
  totalRetries = 10,
  retryCount = 0,
) => {
  try {
    return await f();
  } catch (e: any) {
    if (retryCount < totalRetries) {
      await retry(f, totalRetries, retryCount + 1);
    } else {
      console.log(`Error on fetch spaces ${e}`);
      throw new Error("Could not fetch spaces");
    }
  }
};
