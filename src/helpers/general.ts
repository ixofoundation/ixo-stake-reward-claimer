export const chunkArray = <T>(arr: T[], size: number): T[][] =>
  [...Array(Math.ceil(arr.length / size))].map((_, i) =>
    arr.slice(size * i, size + size * i),
  );

export const timeout = async (timeoutMS = 1000) => {
  const promise = new Promise((res) =>
    setTimeout(() => res('Waaa'), timeoutMS),
  );
  return await promise;
};

export const addDays = (date: Date, days: number) => {
  // eslint-disable-next-line no-var
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const formatDates = (
  startDate: string | number,
  endDate?: string | number,
): string[] => {
  // Parse the start date into a Date object
  const start = new Date(startDate);

  // If the startDate is invalid, return an error message
  if (isNaN(start.getTime())) throw new Error('Invalid start date');

  // If an endDate is provided, use it; otherwise, set it to the end of the day
  // eslint-disable-next-line no-var
  var end = endDate ? new Date(endDate) : new Date(start);

  if (isNaN(end.getTime())) throw new Error('Invalid end date');
  if (!endDate) end.setHours(23, 59, 59, 999);

  // Format the startDate and endDate to the desired format
  const formattedStartDate = start.toISOString();
  const formattedEndDate = end.toISOString();

  return [formattedStartDate.slice(0, -1), formattedEndDate.slice(0, -1)];
};
