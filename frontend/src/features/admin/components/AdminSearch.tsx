interface AdminSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function AdminSearch({
  value,
  onChange,
  placeholder = "Search...",
}: AdminSearchProps) {
  return (
    <div className="admin-search-wrapper">

      <span className="admin-search-icon">
        ⌕
      </span>

      <input
        type="search"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="admin-search"
      />

    </div>
  );
}