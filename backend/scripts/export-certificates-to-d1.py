import argparse
import sqlite3
from pathlib import Path, PurePosixPath


CERTIFICATE_COLUMNS = (
    "id",
    "title",
    "categoryGroup",
    "category",
    "issuer",
    "description",
    "issuedAt",
    "durationMinutes",
    "url",
    "createdAt",
    "updatedAt",
)
MAX_FILE_SIZE = 1024 * 1024


def quote_identifier(value):
    return '"' + value.replace('"', '""') + '"'


def quote_value(value):
    if value is None:
        return "NULL"
    if isinstance(value, bytes):
        return "X'" + value.hex() + "'"
    if isinstance(value, str):
        return "'" + value.replace("'", "''") + "'"
    return str(value)


def main():
    parser = argparse.ArgumentParser(description="Export local certificates and PDFs to D1-compatible SQL.")
    parser.add_argument("database", type=Path, help="Path to the Prisma SQLite database file")
    parser.add_argument("--uploads", type=Path, default=Path("backend/uploads/certificates"))
    parser.add_argument("--output", type=Path, default=Path("backend/d1-certificates-import.sql"))
    args = parser.parse_args()

    if not args.database.is_file():
        parser.error(f"Database file does not exist: {args.database}")
    if not args.uploads.is_dir():
        parser.error(f"Certificate upload directory does not exist: {args.uploads}")

    connection = sqlite3.connect(args.database)
    connection.row_factory = sqlite3.Row
    try:
        rows = connection.execute(
            f"SELECT {', '.join(quote_identifier(column) for column in CERTIFICATE_COLUMNS)} "
            'FROM "certificates" ORDER BY "createdAt", "id"'
        ).fetchall()
    finally:
        connection.close()

    statements = ["PRAGMA foreign_keys = ON;"]
    for row in rows:
        names = ", ".join(quote_identifier(name) for name in CERTIFICATE_COLUMNS)
        values = ", ".join(quote_value(row[name]) for name in CERTIFICATE_COLUMNS)
        statements.append(f'INSERT OR IGNORE INTO "certificates" ({names}) VALUES ({values});')

    file_count = 0
    for row in rows:
        url = row["url"]
        if not url:
            continue
        prefix = "/uploads/certificates/"
        if not url.startswith(prefix):
            continue

        filename = url[len(prefix):]
        relative_path = PurePosixPath(filename)
        if not filename or len(relative_path.parts) != 1 or relative_path.name != filename:
            parser.error(f"Unsafe certificate file path in database: {url}")

        file_path = args.uploads / filename
        if not file_path.is_file():
            parser.error(f"Certificate PDF referenced by {row['title']!r} is missing: {file_path}")
        data = file_path.read_bytes()
        if len(data) > MAX_FILE_SIZE:
            parser.error(f"Certificate PDF exceeds the 1 MiB D1 upload limit: {file_path}")
        if not data.startswith(b"%PDF-"):
            parser.error(f"Certificate file is not a PDF: {file_path}")

        statements.append(
            'INSERT OR IGNORE INTO "certificate_files" ("key", "contentType", "data", "createdAt") '
            f"VALUES ({quote_value(f'certificates/{filename}')}, 'application/pdf', "
            f"{quote_value(data)}, CURRENT_TIMESTAMP);"
        )
        file_count += 1

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text("\n".join(statements) + "\n", encoding="utf-8")
    print(f"Exported {len(rows)} certificate records and {file_count} PDFs to {args.output}.")
    print("Existing D1 rows are preserved by INSERT OR IGNORE.")


if __name__ == "__main__":
    main()
