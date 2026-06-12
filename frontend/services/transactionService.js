import api from "./api";

export const issueBook = async (bookId) => {
  const response = await api.post("/transactions/issue", { bookId });
  return response.data;
};

export const returnBook = async (transactionId) => {
  const response = await api.post("/transactions/return", { transactionId });
  return response.data;
};

export const getMyTransactions = async () => {
  const response = await api.get("/transactions/my-loans");
  return response.data;
};

export const getAllTransactions = async () => {
  const response = await api.get("/transactions");
  return response.data;
};
