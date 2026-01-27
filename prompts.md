I have uploaded:
- 2 JSON files containing funeral home data
- An existing SQLite table with overlapping funeral home records (table: funeral_homes)

Help me write a python notebook to inspect and analyze the data (use pandas dataframes and any other packages as needed).

My task then is to:
- Ingest both sources
- Normalize them into a single internal schema
- Deduplicate records (assume names and addresses may differ slightly)
- Store the unified data in a SQLite database


use pypostal (or other similar packages) for address parsing/normalization



