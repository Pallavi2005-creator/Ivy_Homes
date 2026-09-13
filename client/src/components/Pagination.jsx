export default function Pagination({ page, limit, total, hasMore, onPageChange }) {
  const maxPage = Math.ceil(total / limit);
  
  return (
    <div className="pagination">
      <button 
        className="page-btn" 
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        ← Prev
      </button>
      <div className="page-info">
        Page {page} {total > 0 && `of ${maxPage}`}
      </div>
      <button 
        className="page-btn" 
        disabled={!hasMore && page >= maxPage}
        onClick={() => onPageChange(page + 1)}
      >
        Next →
      </button>
    </div>
  );
}
