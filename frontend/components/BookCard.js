"use client";

export default function BookCard({ book, hasIssued, onIssue }) {
  const isAvailable = book.availableCopies > 0;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl hover:border-zinc-300 dark:hover:border-zinc-750 transition overflow-hidden flex flex-col justify-between shadow-md hover:shadow-lg duration-300">
      <div>
        {book.image ? (
          <img
            src={book.image}
            alt={book.title}
            className="w-full h-56 object-cover border-b border-zinc-200 dark:border-zinc-850"
          />
        ) : (
          <div className="w-full h-56 bg-zinc-100 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-850 flex items-center justify-center font-black text-zinc-300 dark:text-zinc-850 text-6xl select-none uppercase transition-colors">
            {book.title.charAt(0)}
          </div>
        )}

        <div className="p-6">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 text-xs rounded-full uppercase tracking-wider font-semibold transition-colors">
              {book.genre}
            </span>
            <span
              className={`text-xs font-semibold ${
                isAvailable ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"
              }`}
            >
              {isAvailable ? `Available: ${book.availableCopies}` : "Out of Stock"}
            </span>
          </div>
          <h4 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 line-clamp-1">
            {book.title}
          </h4>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">by {book.author}</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono mt-3">ISBN: {book.isbn}</p>
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-850/50">
          {hasIssued ? (
            <button
              disabled
              className="w-full py-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-450 dark:text-zinc-500 text-xs font-semibold rounded-lg cursor-not-allowed text-center transition-colors"
            >
              Already Issued
            </button>
          ) : isAvailable ? (
            <button
              onClick={() => onIssue(book._id)}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow transition-all cursor-pointer text-center"
            >
              Issue Book
            </button>
          ) : (
            <button
              disabled
              className="w-full py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-450 dark:text-zinc-500 text-xs font-semibold rounded-lg cursor-not-allowed text-center transition-colors"
            >
              Unavailable
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
