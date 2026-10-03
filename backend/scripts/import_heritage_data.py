"""
import_heritage_data.py
=======================
One-time script to import heritage_sites.csv into the existing SQLite database.

Usage (from project root, with venv active):
    cd backend
    python scripts/import_heritage_data.py

Rules:
- Reads backend/data/heritage_sites.csv
- Validates required fields before inserting
- Skips any site whose name already exists (case-insensitive)
- Never deletes existing records
- Reports imported / skipped counts
"""

import csv
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Resolve paths relative to this script so it works from any working directory
# ---------------------------------------------------------------------------
SCRIPT_DIR  = Path(__file__).resolve().parent          # backend/scripts/
BACKEND_DIR = SCRIPT_DIR.parent                        # backend/
CSV_PATH    = BACKEND_DIR / "data" / "heritage_sites.csv"

# Add backend/ to sys.path so the app package is importable
sys.path.insert(0, str(BACKEND_DIR))

# ---------------------------------------------------------------------------
# Bootstrap the database (creates tables if they don't exist yet)
# ---------------------------------------------------------------------------
from app.core.database import Base, engine, SessionLocal
from app.models.heritage_site import HeritageSite

Base.metadata.create_all(bind=engine)

# ---------------------------------------------------------------------------
# Required CSV columns
# ---------------------------------------------------------------------------
REQUIRED_FIELDS = {"name", "location", "category"}


def validate_row(row: dict, line_num: int) -> bool:
    """Return True if the row passes basic validation."""
    for field in REQUIRED_FIELDS:
        if not row.get(field, "").strip():
            print(f"  [SKIP] Line {line_num}: missing required field '{field}' — {row}")
            return False
    return True


def coerce_int(value: str):
    """Return int or None."""
    try:
        return int(value.strip()) if value.strip() else None
    except ValueError:
        return None


def coerce_float(value: str):
    """Return float or None."""
    try:
        return float(value.strip()) if value.strip() else None
    except ValueError:
        return None


# ---------------------------------------------------------------------------
# Main import routine
# ---------------------------------------------------------------------------
def run_import():
    if not CSV_PATH.exists():
        print(f"ERROR: CSV file not found at {CSV_PATH}")
        sys.exit(1)

    db = SessionLocal()
    imported = 0
    skipped  = 0
    errors   = 0

    print(f"\nHeritage Sites Data Import")
    print(f"{'=' * 50}")
    print(f"CSV  : {CSV_PATH}")
    print(f"DB   : {BACKEND_DIR / 'heritage_site.db'}")
    print(f"{'=' * 50}\n")

    # Load all existing site names (lower-cased) for duplicate detection
    existing_names = {
        row[0].lower()
        for row in db.query(HeritageSite.name).all()
    }

    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)

        # Verify the CSV has the expected header columns
        missing_cols = REQUIRED_FIELDS - set(reader.fieldnames or [])
        if missing_cols:
            print(f"ERROR: CSV is missing required columns: {missing_cols}")
            db.close()
            sys.exit(1)

        for line_num, row in enumerate(reader, start=2):   # start=2 (row 1 is header)
            name = row.get("name", "").strip()

            # --- Duplicate check ---
            if name.lower() in existing_names:
                print(f"  [SKIP] '{name}' — already exists in database.")
                skipped += 1
                continue

            # --- Validation ---
            if not validate_row(row, line_num):
                errors += 1
                continue

            # --- Build model instance using exact ORM field names ---
            site = HeritageSite(
                name             = name,
                location         = row.get("location", "").strip(),
                category         = row.get("category", "").strip(),
                description      = row.get("description", "").strip() or None,
                year_established = coerce_int(row.get("year_established", "")),
                significance     = row.get("significance", "").strip() or None,
                image_url        = row.get("image_url", "").strip() or None,
                latitude         = coerce_float(row.get("latitude", "")),
                longitude        = coerce_float(row.get("longitude", "")),
            )

            db.add(site)
            existing_names.add(name.lower())   # prevent duplicates within the same CSV
            imported += 1
            print(f"  [OK]   '{name}'")

    try:
        db.commit()
    except Exception as exc:
        db.rollback()
        print(f"\nERROR: Database commit failed — {exc}")
        db.close()
        sys.exit(1)

    db.close()

    print(f"\n{'=' * 50}")
    print(f"Import complete.")
    print(f"  Imported : {imported}")
    print(f"  Skipped  : {skipped}  (already in DB)")
    print(f"  Errors   : {errors}   (validation failures)")
    print(f"{'=' * 50}\n")


if __name__ == "__main__":
    run_import()
