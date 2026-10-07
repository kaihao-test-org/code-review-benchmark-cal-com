type BufferOrder = "ascending" | "descending";
export const getDefinedBufferTimes = (order: BufferOrder = "descending") => {
  const minutes = [5, 10, 15, 20, 30, 45, 60, 90, 120];
  return order === "descending" ? minutes.reverse() : minutes;
};
