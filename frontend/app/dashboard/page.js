"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBooks, addBook, updateBook, deleteBook } from "../../services/bookService";
import { issueBook, returnBook, getMyTransactions, getAllTransactions } from "../../services/transactionService";

export default function Dashboard() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [books, setBooks] = useState([]);
  const [myLoans, setMyLoans] = useState([]);
  const [allLoans, setAllLoans] = useState([]);
  const [activeTab, setActiveTab] = useState("catalog");
  const [searchQuery, setSearchQuery] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookForm, setBookForm] = useState({
    title: "",
    author: "",
    genre: "",
    isbn: "",
    totalCopies: 1,
    image: "",
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    if (parsedUser.role === "admin") {
      setActiveTab("manage-books");
    } else {
      setActiveTab("catalog");
    }

    loadDashboardData(parsedUser);
  }, []);

  const loadDashboardData = async (userData) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const booksData = await getBooks();
      setBooks(booksData.books || []);

      if (userData.role === "admin") {
        const loansData = await getAllTransactions();
        setAllLoans(loansData.transactions || []);
      } else {
        const myLoansData = await getMyTransactions();
        setMyLoans(myLoansData.transactions || []);
      }
    } catch (error) {
      console.error(error);
      setErrorMsg("Failed to load library data. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, msg) => {
    if (type === "success") {
      setSuccessMsg(msg);
      setErrorMsg("");
      setTimeout(() => setSuccessMsg(""), 5000);
    } else {
      setErrorMsg(msg);
      setSuccessMsg("");
      setTimeout(() => setErrorMsg(""), 5000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBookForm((prev) => ({
          ...prev,
          image: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      await addBook(bookForm);
      showNotification("success", "Book added successfully!");
      setIsAddModalOpen(false);
      setBookForm({ title: "", author: "", genre: "", isbn: "", totalCopies: 1, image: "" });
      loadDashboardData(user);
    } catch (error) {
      showNotification("error", error.response?.data?.message || "Failed to add book");
    }
  };

  const handleOpenEditModal = (book) => {
    setSelectedBook(book);
    setBookForm({
      title: book.title,
      author: book.author,
      genre: book.genre,
      isbn: book.isbn,
      totalCopies: book.totalCopies,
      image: book.image || "",
    });
    setIsEditModalOpen(true);
  };

  const handleEditBook = async (e) => {
    e.preventDefault();
    try {
      await updateBook(selectedBook._id, bookForm);
      showNotification("success", "Book updated successfully!");
      setIsEditModalOpen(false);
      setSelectedBook(null);
      loadDashboardData(user);
    } catch (error) {
      showNotification("error", error.response?.data?.message || "Failed to update book");
    }
  };

  const handleDeleteBook = async (id) => {
    if (!confirm("Are you sure you want to delete this book?")) return;
    try {
      await deleteBook(id);
      showNotification("success", "Book deleted successfully!");
      loadDashboardData(user);
    } catch (error) {
      showNotification("error", error.response?.data?.message || "Failed to delete book");
    }
  };

  const handleIssueBook = async (bookId) => {
    try {
      await issueBook(bookId);
      showNotification("success", "Book issued successfully! You have 14 days to return it.");
      loadDashboardData(user);
    } catch (error) {
      showNotification("error", error.response?.data?.message || "Failed to issue book");
    }
  };

  const handleReturnBook = async (transactionId) => {
    try {
      const res = await returnBook(transactionId);
      showNotification("success", res.message || "Book returned successfully!");
      loadDashboardData(user);
    } catch (error) {
      showNotification("error", error.response?.data?.message || "Failed to return book");
    }
  };

  const calculateLiveFine = (dueDateStr) => {
    const dueDate = new Date(dueDateStr);
    const now = new Date();
    const timeDiff = now.getTime() - dueDate.getTime();
    if (timeDiff > 0) {
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      return daysDiff * 5;
    }
    return 0;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const filteredBooks = books.filter((book) => {
    const query = searchQuery.toLowerCase();
    return (
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query) ||
      book.genre.toLowerCase().includes(query) ||
      book.isbn.toLowerCase().includes(query)
    );
  });

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-100 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-zinc-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-12">
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg">
            L
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight block">
              Athena Library
            </span>
            <span className="text-xs text-zinc-500 uppercase tracking-widest font-semibold block">
              {isAdmin ? "Admin Console" : "Student Dashboard"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-sm font-semibold text-zinc-200">{user?.name}</span>
            <span className="text-xs text-zinc-400">{user?.email}</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-blue-400">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-8">
        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded-xl text-sm shadow-lg">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-950 border border-red-800 text-red-300 rounded-xl text-sm shadow-lg">
            {errorMsg}
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="p-6 bg-zinc-900 border border-zinc-850 rounded-2xl relative overflow-hidden">
            <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Total Collection</span>
            <h2 className="text-3xl font-extrabold text-zinc-100 mt-2">{books.length} Books</h2>
          </div>
          
          {isAdmin ? (
            <>
              <div className="p-6 bg-zinc-900 border border-zinc-850 rounded-2xl relative overflow-hidden">
                <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Total Issued Books</span>
                <h2 className="text-3xl font-extrabold text-zinc-100 mt-2">
                  {allLoans.filter((l) => l.status === "issued").length} Copies
                </h2>
              </div>
              <div className="p-6 bg-zinc-900 border border-zinc-850 rounded-2xl relative overflow-hidden">
                <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Fines Collected</span>
                <h2 className="text-3xl font-extrabold text-emerald-400 mt-2">
                  ₹{allLoans.reduce((acc, curr) => acc + (curr.fine || 0), 0)}
                </h2>
              </div>
              <div className="p-6 bg-zinc-900 border border-zinc-850 rounded-2xl relative overflow-hidden">
                <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Pending Returns</span>
                <h2 className="text-3xl font-extrabold text-amber-400 mt-2">
                  {allLoans.filter((l) => l.status === "issued" && new Date(l.dueDate) < new Date()).length} Overdue
                </h2>
              </div>
            </>
          ) : (
            <>
              <div className="p-6 bg-zinc-900 border border-zinc-850 rounded-2xl relative overflow-hidden">
                <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">My Active Loans</span>
                <h2 className="text-3xl font-extrabold text-zinc-100 mt-2">
                  {myLoans.filter((l) => l.status === "issued").length} Borrowed
                </h2>
              </div>
              <div className="p-6 bg-zinc-900 border border-zinc-850 rounded-2xl relative overflow-hidden">
                <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Overdue Fines</span>
                <h2 className="text-3xl font-extrabold text-amber-400 mt-2">
                  ₹{myLoans.reduce((acc, curr) => {
                    if (curr.status === "issued") {
                      return acc + calculateLiveFine(curr.dueDate);
                    }
                    return acc;
                  }, 0)}
                </h2>
              </div>
              <div className="p-6 bg-zinc-900 border border-zinc-850 rounded-2xl relative overflow-hidden">
                <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Fines Paid</span>
                <h2 className="text-3xl font-extrabold text-emerald-400 mt-2">
                  ₹{myLoans.reduce((acc, curr) => acc + (curr.status === "returned" ? curr.fine : 0), 0)}
                </h2>
              </div>
            </>
          )}
        </section>

        <section className="flex border-b border-zinc-900 mb-8 gap-6">
          {isAdmin ? (
            <>
              <button
                onClick={() => setActiveTab("manage-books")}
                className={`pb-4 text-sm font-semibold tracking-wide transition border-b-2 cursor-pointer ${
                  activeTab === "manage-books"
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Manage Books Catalog
              </button>
              <button
                onClick={() => setActiveTab("logs")}
                className={`pb-4 text-sm font-semibold tracking-wide transition border-b-2 cursor-pointer ${
                  activeTab === "logs"
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Transaction Logs ({allLoans.length})
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab("catalog")}
                className={`pb-4 text-sm font-semibold tracking-wide transition border-b-2 cursor-pointer ${
                  activeTab === "catalog"
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Library Catalog
              </button>
              <button
                onClick={() => setActiveTab("my-loans")}
                className={`pb-4 text-sm font-semibold tracking-wide transition border-b-2 cursor-pointer ${
                  activeTab === "my-loans"
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-zinc-400 hover:text-zinc-200"
                }`}
              >
                My Loans & History ({myLoans.length})
              </button>
            </>
          )}
        </section>

        {activeTab === "manage-books" && isAdmin && (
          <section>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div className="relative w-full max-w-md">
                <input
                  type="text"
                  placeholder="Search catalog..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-850 rounded-xl outline-none text-sm text-zinc-200 focus:border-blue-500 transition-all placeholder-zinc-500"
                />
              </div>
              <button
                onClick={() => {
                  setBookForm({ title: "", author: "", genre: "", isbn: "", totalCopies: 1, image: "" });
                  setIsAddModalOpen(true);
                }}
                className="w-full md:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-950 transition cursor-pointer flex items-center justify-center gap-2"
              >
                Add New Book
              </button>
            </div>

            {filteredBooks.length === 0 ? (
              <div className="p-12 text-center bg-zinc-900 border border-zinc-900 rounded-2xl">
                <p className="text-zinc-500 mb-2">No books found in the collection.</p>
                <p className="text-xs text-zinc-650">Try checking ISBN or adding a new book.</p>
              </div>
            ) : (
              <div className="overflow-x-auto bg-zinc-900 border border-zinc-900 rounded-2xl shadow-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-850 bg-zinc-900/50 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                      <th className="p-4">Title & Author</th>
                      <th className="p-4">Genre</th>
                      <th className="p-4">ISBN</th>
                      <th className="p-4 text-center">Available / Total</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850 text-sm">
                    {filteredBooks.map((book) => (
                      <tr key={book._id} className="hover:bg-zinc-850/30 transition-all">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {book.image ? (
                              <img src={book.image} alt="" className="w-9 h-11 object-cover rounded bg-zinc-950 border border-zinc-800 flex-shrink-0" />
                            ) : (
                              <div className="w-9 h-11 rounded bg-zinc-850 border border-zinc-800 flex items-center justify-center font-bold text-zinc-500 text-xs uppercase flex-shrink-0 select-none">
                                {book.title.charAt(0)}
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-zinc-200">{book.title}</div>
                              <div className="text-xs text-zinc-400 mt-0.5">{book.author}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-zinc-300">{book.genre}</td>
                        <td className="p-4 font-mono text-xs text-zinc-400">{book.isbn}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            book.availableCopies === 0 
                              ? "bg-red-950 text-red-400 border border-red-900" 
                              : "bg-blue-950 text-blue-400 border border-blue-900"
                          }`}>
                            {book.availableCopies} / {book.totalCopies}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="inline-flex gap-2.5">
                            <button
                              onClick={() => handleOpenEditModal(book)}
                              className="text-blue-400 hover:text-blue-300 font-medium text-xs border border-blue-900 bg-blue-950/20 px-2.5 py-1 rounded-md hover:bg-blue-950/40 transition cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteBook(book._id)}
                              className="text-red-400 hover:text-red-300 font-medium text-xs border border-red-900 bg-red-950/20 px-2.5 py-1 rounded-md hover:bg-red-950/40 transition cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {activeTab === "logs" && isAdmin && (
          <section>
            <h3 className="text-lg font-semibold mb-4 text-zinc-300">Global Borrowing Logs</h3>
            {allLoans.length === 0 ? (
              <div className="p-12 text-center bg-zinc-900 border border-zinc-900 rounded-2xl">
                <p className="text-zinc-500">No loan transactions registered in the system.</p>
              </div>
            ) : (
              <div className="overflow-x-auto bg-zinc-900 border border-zinc-900 rounded-2xl shadow-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-850 bg-zinc-900/50 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                      <th className="p-4">Student</th>
                      <th className="p-4">Book</th>
                      <th className="p-4">Dates (Issue / Due)</th>
                      <th className="p-4">Return Date</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right">Fine</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850 text-sm">
                    {allLoans.map((loan) => {
                      const overdue = loan.status === "issued" && new Date(loan.dueDate) < new Date();
                      const fineAmount = loan.status === "returned" ? loan.fine : calculateLiveFine(loan.dueDate);

                      return (
                        <tr key={loan._id} className="hover:bg-zinc-850/30 transition-all">
                          <td className="p-4">
                            <div className="font-semibold text-zinc-200">{loan.studentId?.name || "Deleted Student"}</div>
                            <div className="text-xs text-zinc-400 mt-0.5">{loan.studentId?.email}</div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {loan.bookId?.image ? (
                                <img src={loan.bookId.image} alt="" className="w-9 h-11 object-cover rounded bg-zinc-950 border border-zinc-800 flex-shrink-0" />
                              ) : (
                                <div className="w-9 h-11 rounded bg-zinc-850 border border-zinc-800 flex items-center justify-center font-bold text-zinc-500 text-xs uppercase flex-shrink-0 select-none">
                                  {loan.bookId?.title ? loan.bookId.title.charAt(0) : "?"}
                                </div>
                              )}
                              <div>
                                <div className="font-medium text-zinc-200">{loan.bookId?.title || "Deleted Book"}</div>
                                <div className="text-xs text-zinc-400 mt-0.5">{loan.bookId?.author}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-xs text-zinc-300 leading-normal">
                            <div>Issued: {formatDate(loan.issueDate)}</div>
                            <div className="text-zinc-400 mt-0.5">Due: {formatDate(loan.dueDate)}</div>
                          </td>
                          <td className="p-4 text-xs text-zinc-300">
                            {loan.status === "returned" ? formatDate(loan.returnDate) : "Not returned"}
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                              loan.status === "returned"
                                ? "bg-emerald-950 text-emerald-400 border-emerald-900"
                                : overdue
                                ? "bg-red-950 text-red-400 border-red-900 animate-pulse"
                                : "bg-blue-950 text-blue-400 border-blue-900"
                            }`}>
                              {loan.status === "returned" ? "Returned" : overdue ? "Overdue" : "Issued"}
                            </span>
                          </td>
                          <td className="p-4 text-right font-mono font-semibold">
                            {fineAmount > 0 ? (
                              <span className="text-amber-400">₹{fineAmount}</span>
                            ) : (
                              <span className="text-zinc-500">₹0</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {activeTab === "catalog" && !isAdmin && (
          <section>
            <div className="relative w-full max-w-md mb-8">
              <input
                type="text"
                placeholder="Search by title, author, genre or ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-850 rounded-xl outline-none text-sm text-zinc-200 focus:border-blue-500 transition-all placeholder-zinc-500"
              />
            </div>

            {filteredBooks.length === 0 ? (
              <div className="p-12 text-center bg-zinc-900 border border-zinc-900 rounded-2xl">
                <p className="text-zinc-500">No books match your search query.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredBooks.map((book) => {
                  const hasIssued = myLoans.some(
                    (l) => l.bookId?._id === book._id && l.status === "issued"
                  );
                  const isAvailable = book.availableCopies > 0;

                  return (
                    <div
                      key={book._id}
                      className="bg-zinc-900 border border-zinc-850 rounded-2xl hover:border-zinc-750 transition overflow-hidden flex flex-col justify-between shadow-lg"
                    >
                      <div>
                        {book.image ? (
                          <img src={book.image} alt={book.title} className="w-full h-56 object-cover border-b border-zinc-850" />
                        ) : (
                          <div className="w-full h-56 bg-zinc-950 border-b border-zinc-850 flex items-center justify-center font-black text-zinc-850 text-6xl select-none uppercase">
                            {book.title.charAt(0)}
                          </div>
                        )}

                        <div className="p-6">
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 border border-zinc-700 text-xs rounded-full uppercase tracking-wider font-semibold">
                              {book.genre}
                            </span>
                            <span className={`text-xs font-semibold ${
                              isAvailable ? "text-emerald-400" : "text-red-400"
                            }`}>
                              {isAvailable ? `Available: ${book.availableCopies}` : "Out of Stock"}
                            </span>
                          </div>
                          <h4 className="text-lg font-bold text-zinc-100 line-clamp-1">{book.title}</h4>
                          <p className="text-sm text-zinc-400 mt-1">by {book.author}</p>
                          <p className="text-xs text-zinc-500 font-mono mt-3">ISBN: {book.isbn}</p>
                        </div>
                      </div>

                      <div className="px-6 pb-6">
                        <div className="pt-4 border-t border-zinc-850/50">
                          {hasIssued ? (
                            <button
                              disabled
                              className="w-full py-2 bg-zinc-800 border border-zinc-700 text-zinc-500 text-xs font-semibold rounded-lg cursor-not-allowed text-center"
                            >
                              Already Issued
                            </button>
                          ) : isAvailable ? (
                            <button
                              onClick={() => handleIssueBook(book._id)}
                              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow transition-all cursor-pointer text-center"
                            >
                              Issue Book
                            </button>
                          ) : (
                            <button
                              disabled
                              className="w-full py-2 bg-zinc-800 text-zinc-650 text-xs font-semibold rounded-lg cursor-not-allowed text-center"
                            >
                              Unavailable
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {activeTab === "my-loans" && !isAdmin && (
          <section className="space-y-10">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-zinc-300">My Active Loans</h3>
              {myLoans.filter((l) => l.status === "issued").length === 0 ? (
                <div className="p-8 text-center bg-zinc-900 border border-zinc-900 rounded-2xl text-zinc-500 text-sm">
                  You do not have any actively issued books. Explore the catalog to borrow books.
                </div>
              ) : (
                <div className="overflow-x-auto bg-zinc-900 border border-zinc-900 rounded-2xl shadow-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-850 bg-zinc-900/50 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                        <th className="p-4">Book Title</th>
                        <th className="p-4">Issue Date</th>
                        <th className="p-4">Due Date</th>
                        <th className="p-4">Live Late Fine</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850 text-sm">
                      {myLoans
                        .filter((loan) => loan.status === "issued")
                        .map((loan) => {
                          const fine = calculateLiveFine(loan.dueDate);
                          const isOverdue = fine > 0;

                          return (
                            <tr key={loan._id} className="hover:bg-zinc-850/30 transition-all">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  {loan.bookId?.image ? (
                                    <img src={loan.bookId.image} alt="" className="w-8 h-10 object-cover rounded bg-zinc-950 border border-zinc-800 flex-shrink-0" />
                                  ) : (
                                    <div className="w-8 h-10 rounded bg-zinc-850 border border-zinc-800 flex items-center justify-center font-bold text-zinc-500 text-xs uppercase flex-shrink-0 select-none">
                                      {loan.bookId?.title ? loan.bookId.title.charAt(0) : "?"}
                                    </div>
                                  )}
                                  <div>
                                    <div className="font-semibold text-zinc-200">{loan.bookId?.title}</div>
                                    <div className="text-xs text-zinc-400 mt-0.5">{loan.bookId?.author}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-zinc-300">{formatDate(loan.issueDate)}</td>
                              <td className="p-4">
                                <div className={isOverdue ? "text-red-400 font-medium animate-pulse" : "text-zinc-300"}>
                                  {formatDate(loan.dueDate)} {isOverdue && "(Overdue)"}
                                </div>
                              </td>
                              <td className="p-4">
                                {isOverdue ? (
                                  <span className="px-2.5 py-0.5 bg-red-950 border border-red-900 text-red-400 font-mono font-bold rounded">
                                    ₹{fine}
                                  </span>
                                ) : (
                                  <span className="text-zinc-500 font-mono">₹0</span>
                                )}
                              </td>
                              <td className="p-4 text-right">
                                <button
                                  onClick={() => handleReturnBook(loan._id)}
                                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition-all shadow cursor-pointer"
                                >
                                  Return Book
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-zinc-300">Loan & Return History</h3>
              {myLoans.filter((l) => l.status === "returned").length === 0 ? (
                <div className="p-8 text-center bg-zinc-900 border border-zinc-900 rounded-2xl text-zinc-500 text-sm">
                  No return transactions registered.
                </div>
              ) : (
                <div className="overflow-x-auto bg-zinc-900 border border-zinc-900 rounded-2xl shadow-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-850 bg-zinc-900/50 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                        <th className="p-4">Book Title</th>
                        <th className="p-4">Issue Date</th>
                        <th className="p-4">Due Date</th>
                        <th className="p-4">Return Date</th>
                        <th className="p-4 text-right">Fine Paid</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850 text-sm">
                      {myLoans
                        .filter((loan) => loan.status === "returned")
                        .map((loan) => (
                          <tr key={loan._id} className="hover:bg-zinc-850/30 transition-all opacity-80">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                {loan.bookId?.image ? (
                                  <img src={loan.bookId.image} alt="" className="w-8 h-10 object-cover rounded bg-zinc-950 border border-zinc-800 flex-shrink-0" />
                                ) : (
                                  <div className="w-8 h-10 rounded bg-zinc-850 border border-zinc-800 flex items-center justify-center font-bold text-zinc-500 text-xs uppercase flex-shrink-0 select-none">
                                    {loan.bookId?.title ? loan.bookId.title.charAt(0) : "?"}
                                  </div>
                                )}
                                <div>
                                  <div className="font-semibold text-zinc-300">{loan.bookId?.title}</div>
                                  <div className="text-xs text-zinc-500 mt-0.5">{loan.bookId?.author}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-zinc-400">{formatDate(loan.issueDate)}</td>
                            <td className="p-4 text-zinc-400">{formatDate(loan.dueDate)}</td>
                            <td className="p-4 text-zinc-300">{formatDate(loan.returnDate)}</td>
                            <td className="p-4 text-right font-mono font-semibold">
                              {loan.fine > 0 ? (
                                <span className="text-amber-400">₹{loan.fine}</span>
                              ) : (
                                <span className="text-zinc-500">₹0</span>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <h3 className="text-lg font-bold text-zinc-100 mb-5">Add New Book to Collection</h3>
            <form onSubmit={handleAddBook} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Book Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Great Gatsby"
                  value={bookForm.title}
                  onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm outline-none focus:border-blue-500 text-zinc-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Author</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. F. Scott Fitzgerald"
                    value={bookForm.author}
                    onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm outline-none focus:border-blue-500 text-zinc-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Genre</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fiction"
                    value={bookForm.genre}
                    onChange={(e) => setBookForm({ ...bookForm, genre: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm outline-none focus:border-blue-500 text-zinc-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">ISBN Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9780743273565"
                    value={bookForm.isbn}
                    onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm outline-none focus:border-blue-500 text-zinc-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Total Copies</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="1"
                    value={bookForm.totalCopies}
                    onChange={(e) => setBookForm({ ...bookForm, totalCopies: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm outline-none focus:border-blue-500 text-zinc-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Book Cover Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-300 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 outline-none focus:border-blue-500 cursor-pointer"
                />
                {bookForm.image && (
                  <div className="mt-3">
                    <img src={bookForm.image} alt="Preview" className="h-24 w-20 object-cover rounded border border-zinc-800" />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  Add Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <h3 className="text-lg font-bold text-zinc-100 mb-5">Edit Book Details</h3>
            <form onSubmit={handleEditBook} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Book Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Great Gatsby"
                  value={bookForm.title}
                  onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm outline-none focus:border-blue-500 text-zinc-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Author</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. F. Scott Fitzgerald"
                    value={bookForm.author}
                    onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm outline-none focus:border-blue-500 text-zinc-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Genre</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fiction"
                    value={bookForm.genre}
                    onChange={(e) => setBookForm({ ...bookForm, genre: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm outline-none focus:border-blue-500 text-zinc-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">ISBN Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9780743273565"
                    value={bookForm.isbn}
                    onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm outline-none focus:border-blue-500 text-zinc-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Total Copies</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="1"
                    value={bookForm.totalCopies}
                    onChange={(e) => setBookForm({ ...bookForm, totalCopies: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm outline-none focus:border-blue-500 text-zinc-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Book Cover Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-300 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 outline-none focus:border-blue-500 cursor-pointer"
                />
                {bookForm.image && (
                  <div className="mt-3">
                    <img src={bookForm.image} alt="Preview" className="h-24 w-20 object-cover rounded border border-zinc-800" />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedBook(null);
                  }}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}