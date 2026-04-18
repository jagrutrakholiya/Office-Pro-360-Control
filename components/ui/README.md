# UI Components & Conventions

Shared primitives for the OfficePro360 control-panel. Use these instead of reinventing markup per page.

## Components

### `<PageHeader>`
Standard top-of-page header with title, description, and optional action buttons.

```tsx
import PageHeader from "@/components/ui/PageHeader";

<PageHeader
  title="Reviews"
  description="Manage testimonials displayed on the marketing site"
  actions={<button onClick={...}>+ Add Review</button>}
/>
```

### `<DataTable>`
Responsive table with loading state, empty state, and optional row click.

```tsx
import DataTable, { Column } from "@/components/ui/DataTable";

const columns: Column<Review>[] = [
  { key: "author", header: "Author", render: (r) => r.author },
  { key: "rating", header: "Rating", render: (r) => r.rating, width: "100px" },
];

<DataTable<Review>
  columns={columns}
  data={reviews}
  loading={loading}
  rowKey={(r) => r._id}
  emptyMessage="No reviews yet"
/>
```

### `<EmptyState>`
Consistent empty-state pattern for list pages.

```tsx
import EmptyState from "@/components/ui/EmptyState";
import { FaCommentDots } from "react-icons/fa";

<EmptyState
  icon={<FaCommentDots className="w-6 h-6" />}
  title="No reviews yet"
  description="Add your first testimonial."
  action={{ label: "+ Add Review", onClick: () => router.push("/reviews/new") }}
/>
```

### `useToast()` — Toast notifications
Non-blocking feedback for user actions. Replace all `alert()` calls with these.

```tsx
import { useToast } from "@/components/ui/Toast";

function MyPage() {
  const toast = useToast();

  const save = async () => {
    try {
      await api.post(...);
      toast.success("Saved");
    } catch {
      toast.error("Failed to save", "Check your connection and try again.");
    }
  };
}
```

Four types: `toast.success()`, `toast.error()`, `toast.info()`, `toast.warning()`.

## CSS conventions (defined in `app/globals.css`)

Use these utility classes — don't reinvent them:

| Class | Purpose |
|---|---|
| `.btn-primary` | Primary action button (slate, high-contrast) |
| `.btn-secondary` | Secondary action (white + border) |
| `.btn-danger` | Destructive actions (red) |
| `.btn-primary-small`, `.btn-secondary-small` | Compact variants |
| `.input`, `.input-small` | Text input fields |
| `.select`, `.select-small` | Dropdowns |
| `.card`, `.card-small`, `.card-interactive` | Panel containers |
| `.table-wrapper`, `.table-header`, `.table-row` | Table parts |
| `.badge`, `.badge-active`, `.badge-view-only`, `.badge-suspended`, `.badge-pending` | Status pills |

## Checklist for new pages

- [ ] Use `<PageHeader>` — no custom H1/description combo
- [ ] Use `<DataTable>` for lists — no inline `<table>` markup
- [ ] Use `<EmptyState>` when list is empty — no "No data" inline message
- [ ] Use `useToast()` instead of `alert()` for user feedback
- [ ] Use `.btn-primary` / `.btn-secondary` — no inline button Tailwind
- [ ] Use `.input` / `.select` — no inline form input Tailwind
- [ ] Support dark mode (`dark:` prefixes on any custom colors you add)
- [ ] Use icons from `react-icons/fa` (standard across the app)

## Example: minimal list page

```tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "../../components/Layout";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import DataTable, { Column } from "../../components/ui/DataTable";
import { useToast } from "../../components/ui/Toast";

export default function MyPage() {
  const router = useRouter();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // ... load items

  return (
    <Layout>
      <PageHeader
        title="My Page"
        description="Short description"
        actions={
          <button onClick={() => router.push("/new")} className="btn-primary-small">
            + Add
          </button>
        }
      />
      {!loading && items.length === 0 ? (
        <EmptyState title="Nothing yet" />
      ) : (
        <DataTable columns={columns} data={items} loading={loading} rowKey={(r) => r._id} />
      )}
    </Layout>
  );
}
```
