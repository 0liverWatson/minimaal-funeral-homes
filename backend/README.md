## Funeral Homes API (FastAPI + SQLite) 

- Verify/configure DATABASE_URL in the .env file to point to the unifed db 

- Run:
```bash
uvicorn app.main:app --reload --port 8081
```
  

#### Endpoints:

- GET /health

- GET /funeral-homes?name=smith&region=CA&limit=25&offset=0

- GET /funeral-homes-count

  

#### Examples:
- Partial name match:
	/funeral-homes?name=memorial  

- Exact filters:
	/funeral-homes?city=San%20Jose&region=CA  

- Sorting:
	/funeral-homes?sort_by=cluster_size&sort_dir=desc