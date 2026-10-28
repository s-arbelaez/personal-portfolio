import argparse
import sqlite3
from pathlib import Path


TABLES = (
    "profiles",
    "skill_groups",
    "skills",
    "projects",
    "certificates",
    "experiences",
    "educations",
    "contact_messages",
    "availability_windows",
    "bookings",
)


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
    parser = argparse.ArgumentParser(description="Export portfolio content from SQLite to D1-compatible SQL.")
    parser.add_argument("database", type=Path, help="Path to the Prisma SQLite database file")
    parser.add_argument("--output", type=Path, default=Path("d1-content-import.sql"))
    args = parser.parse_args()

    if not args.database.is_file():
        parser.error(f"Database file does not exist: {args.database}")

    connection = sqlite3.connect(args.database)
    connection.row_factory = sqlite3.Row
    statements = ["PRAGMA foreign_keys = ON;"]
    try:
        for table in TABLES:
            columns = connection.execute(f"PRAGMA table_info({quote_identifier(table)})").fetchall()
            if not columns:
                continue
            column_names = [column["name"] for column in columns]
            rows = connection.execute(f"SELECT * FROM {quote_identifier(table)}").fetchall()
            for row in rows:
                names = ", ".join(quote_identifier(name) for name in column_names)
                values = ", ".join(quote_value(row[name]) for name in column_names)
                statements.append(f"INSERT OR REPLACE INTO {quote_identifier(table)} ({names}) VALUES ({values});")
    finally:
        connection.close()

    args.output.write_text("\n".join(statements) + "\n", encoding="utf-8")
    print(f"Exported portfolio content to {args.output}. Admin users and sessions are intentionally excluded.")


if __name__ == "__main__":
    main()
