# minimaal-funeral-homes  

## Requirements 

Python 3.14 
  

## Quick Start 

### Install python dependencies

```bash
python -m pip install -r requirements.txt
```
 
The unified DB has already been built using the jupyter notebook, and placed in the data folder.

### Backend (Flask + SQLite):

```bash
cd backend
uvicorn app.main:app --reload --port 8081
```
Verify: http://127.0.0.1:8081/health


### Frontend (NextJS, MaterialUI, Tailwind CSS)
```bash
cd frontend
npm install
npm run dev
```


## Extension
Split the app into backend and frontend, with a cleaner Web UI for searching instead of simple Flask

## Assumptions
-   One real-world funeral home can appear multiple times across sources with minor variations in name, address, or formatting.    
-   Region + postal prefix or region + city is a sufficiently strong blocking signal to reduce comparisons without losing most true duplicates.    
-   Phone numbers and websites, when present and normalized, are strong unique identifiers and can be trusted for high-confidence matches.    
-   Missing or noisy fields (e.g. address line variations, PO boxes) are common and must not automatically disqualify matches.    
-   The canonical database is primarily read-heavy, optimized for search and inspection rather than frequent writes.

## Trade-offs
- Used rule-based fuzzy matching instead of ML/NLP, smaller complexity
- Chose conservative similarity thresholds
- Performed blocking + O(n²) comparisons within blocks

## Improvements with more time
- Use LibPostal for normalization and matching duplicate adresses
- Indexing for better search
- interface to verify and choose merges in webapp for low confidence duplicates

## Did not choose to build
- Perfect global recall across badly malformed or missing addresses.
- map based UI
- API endpoints to write/edit records
- Authentication and admin management in the API.

## Area I struggled with the most
- Balancing precision/recall in deduplication - prioritized avoiding false merges
