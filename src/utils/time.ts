export const delay = (seconds: number) => new Promise((resolve) => {
  const timeout = setTimeout(() => {
    resolve(undefined);
    clearTimeout(timeout);
  }, seconds * 1000);
});
