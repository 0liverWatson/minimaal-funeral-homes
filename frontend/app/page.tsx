"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Divider,
  Chip,
  Stack,
  Alert,
  Skeleton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import PlaceIcon from "@mui/icons-material/Place";
import PhoneIcon from "@mui/icons-material/Phone";
import PublicIcon from "@mui/icons-material/Public";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import { fetchFuneralHomes, fetchFuneralHomesCount, FuneralHome } from "@/lib/api";

const PAGE_SIZE = 15;

type FormState = {
  name: string;
  city: string;
  region: string;
  postal_code: string;
};

const initialForm: FormState = {
  name: "",
  city: "",
  region: "",
  postal_code: "",
};

function fmt(v: string | null | undefined) {
  const s = (v ?? "").trim();
  return s.length ? s : null;
}

function buildAddress(r: FuneralHome) {
  const street = fmt(r.street);
  const city = fmt(r.city);
  const region = fmt(r.region);
  const postal = fmt(r.postal_code);

  const line1 = street;
  const line2Parts = [city, region, postal].filter(Boolean) as string[];
  const line2 = line2Parts.length ? line2Parts.join(", ") : null;

  return { line1, line2 };
}

function normalizeWebsite(url: string) {
  const u = url.trim();
  if (!u) return "";
  return u.startsWith("http://") || u.startsWith("https://") ? u : `https://${u}`;
}

function ResultCard({ r }: { r: FuneralHome }) {
  const name = fmt(r.name) ?? "Unnamed listing";
  const { line1, line2 } = buildAddress(r);
  const phone = fmt(r.phone);
  const website = fmt(r.website);

  return (
    <Card className="shadow-sm">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Typography variant="h6" sx={{ fontWeight: 700 }} className="truncate">
              {name}
            </Typography>

            <div className="mt-1 flex flex-wrap gap-1.5">
              {r.region ? <Chip size="small" label={r.region} /> : null}
              {r.city ? <Chip size="small" label={r.city} /> : null}
              {r.postal_code ? <Chip size="small" label={r.postal_code} /> : null}
              {r.cluster_size ? <Chip size="small" variant="outlined" label={`Cluster ${r.cluster_size}`} /> : null}
            </div>
          </div>

          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            ID {r.internal_id}
          </Typography>
        </div>

        {(line1 || line2) && (
          <div className="flex gap-2">
            <PlaceIcon fontSize="small" className="mt-0.5 text-slate-500" />
            <div className="min-w-0">
              {line1 && (
                <Typography variant="body2" className="truncate">
                  {line1}
                </Typography>
              )}
              {line2 && (
                <Typography variant="body2" sx={{ color: "text.secondary" }} className="truncate">
                  {line2}
                </Typography>
              )}
            </div>
          </div>
        )}

        {(phone || website) && <Divider />}

        {phone && (
          <div className="flex items-center gap-2">
            <PhoneIcon fontSize="small" className="text-slate-500" />
            <Typography variant="body2">{phone}</Typography>
          </div>
        )}

        {website && (
          <div className="flex items-center gap-2">
            <PublicIcon fontSize="small" className="text-slate-500" />
            <a
              className="text-sky-700 hover:underline text-sm truncate"
              href={normalizeWebsite(website)}
              target="_blank"
              rel="noreferrer"
              title={website}
            >
              {website}
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <Card key={i} className="shadow-sm">
          <CardContent className="flex flex-col gap-3">
            <Skeleton variant="text" height={30} width="70%" />
            <div className="flex gap-2">
              <Skeleton variant="rounded" height={22} width={80} />
              <Skeleton variant="rounded" height={22} width={90} />
              <Skeleton variant="rounded" height={22} width={70} />
            </div>
            <Skeleton variant="text" />
            <Skeleton variant="text" width="85%" />
            <Divider />
            <Skeleton variant="text" width="55%" />
            <Skeleton variant="text" width="80%" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function HomePage() {
  const [form, setForm] = React.useState<FormState>(initialForm);
  const [submitted, setSubmitted] = React.useState<FormState>(initialForm);

  const [page, setPage] = React.useState(0); // 0-based
  const [rows, setRows] = React.useState<FuneralHome[]>([]);
  const [total, setTotal] = React.useState<number>(0);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    Promise.all([
      fetchFuneralHomes({
        ...submitted,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
        sort_by: "internal_id",
        sort_dir: "asc",
      }),
      fetchFuneralHomesCount(submitted),
    ])
      .then(([data, count]) => {
        if (!alive) return;
        setRows(data);
        setTotal(count);
      })
      .catch((e: unknown) => {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "Unknown error");
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [submitted, page]);

  const hasFilters = Object.values(submitted).some((v) => v.trim().length > 0);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const canPrev = page > 0;
  const canNext = page + 1 < pageCount;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    setSubmitted(form);
  };

  const onReset = () => {
    setForm(initialForm);
    setPage(0);
    setSubmitted(initialForm);
  };

  return (
    <main className="mx-auto max-w-7xl p-4 md:p-8">
      <div className="mb-6">
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Funeral Homes Search
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary", mt: 1 }}>
        </Typography>
      </div>

      <Card className="shadow-sm">
        <CardContent>
          <form onSubmit={onSubmit}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:gap-4">
              <div className="md:col-span-6">
                <TextField
                  label="Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  fullWidth
                  size="small"
                />
              </div>
              <div className="md:col-span-2">
                <TextField
                  label="City"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  fullWidth
                  size="small"
                />
              </div>
              <div className="md:col-span-2">
                <TextField
                  label="Region"
                  value={form.region}
                  onChange={(e) => setForm({ ...form, region: e.target.value })}
                  fullWidth
                  size="small"
                />
              </div>
              <div className="md:col-span-2">
                <TextField
                  label="Postal code"
                  value={form.postal_code}
                  onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
                  fullWidth
                  size="small"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <Button type="submit" variant="contained" startIcon={<SearchIcon />}>
                  Search
                </Button>
                <Button type="button" variant="outlined" startIcon={<RestartAltIcon />} onClick={onReset}>
                  Reset
                </Button>

                {hasFilters && <Chip label="Filters active" size="small" sx={{ ml: 1 }} />}
              </div>

              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Page size: {PAGE_SIZE}. Total matches: {total.toLocaleString()}.
              </Typography>
            </div>
          </form>

          {error && (
            <div className="mt-4">
              <Alert severity="error">{error}</Alert>
            </div>
          )}

          <Divider sx={{ my: 3 }} />

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Page {page + 1} of {pageCount}
              </Typography>

              <div className="flex gap-2">
                <Button
                  variant="outlined"
                  startIcon={<ChevronLeftIcon />}
                  disabled={!canPrev || loading}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  Prev
                </Button>
                <Button
                  variant="outlined"
                  endIcon={<ChevronRightIcon />}
                  disabled={!canNext || loading}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>

            {loading ? (
              <LoadingGrid />
            ) : rows.length === 0 ? (
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="body1" sx={{ color: "text.secondary" }}>
                    No results found.
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {rows.map((r) => (
                  <ResultCard key={r.internal_id} r={r} />
                ))}
              </div>
            )}

            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Showing {rows.length} results on this page.
              </Typography>

              <div className="flex gap-2">
                <Button
                  variant="outlined"
                  startIcon={<ChevronLeftIcon />}
                  disabled={!canPrev || loading}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  Prev
                </Button>
                <Button
                  variant="outlined"
                  endIcon={<ChevronRightIcon />}
                  disabled={!canNext || loading}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
