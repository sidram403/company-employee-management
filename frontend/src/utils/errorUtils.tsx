export const getErrorMessage = (error: any): string => {
  if (error?.response?.status === 404) {
    return "Requested resource not found.";
  }
  if (error?.response?.status === 500) {
    return "Server error. Please try again later.";
  }
  return (
    error?.response?.data?.message || "Something went wrong. Please try again."
  );
};
