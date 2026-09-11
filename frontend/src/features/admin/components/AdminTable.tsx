import type { ReactNode } from "react";

interface AdminTableColumn<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
}

interface AdminTableProps<T extends { id: string | number }> {
  columns: AdminTableColumn<T>[];
  data: T[];
  emptyMessage?: string;
}

export default function AdminTable<
  T extends { id: string | number }
>({
  columns,
  data,
  emptyMessage = "No records found.",
}: AdminTableProps<T>) {
  return (
    <div className="admin-table-wrapper">

      <table className="admin-table">

        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>

          {data.map((item) => (
            <tr key={item.id}>

              {columns.map((column) => (
                <td key={column.key}>

                  {column.render
                    ? column.render(item)
                    : String(
                        item[
                          column.key as keyof T
                        ] ?? ""
                      )}

                </td>
              ))}

            </tr>
          ))}

          {data.length === 0 && (
            <tr>

              <td
                colSpan={columns.length}
                className="admin-empty"
              >
                <div className="admin-empty-state">

                  <strong>
                    {emptyMessage}
                  </strong>

                  <span>
                    Try adjusting your search
                    or filter criteria.
                  </span>

                </div>
              </td>

            </tr>
          )}

        </tbody>

      </table>

    </div>
  );
}
