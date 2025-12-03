# DynamoDB-Style Cursor Pagination

The Table component supports two pagination modes:
1. **Numbered pagination** (default) - Traditional page numbers
2. **Cursor pagination** - DynamoDB-style with Previous/Next buttons

## Why Cursor Pagination?

Cursor-based pagination is ideal for:
- **DynamoDB queries** - Uses LastEvaluatedKey for efficient pagination
- **Large datasets** - More performant than offset-based pagination
- **Real-time data** - Handles data insertions/deletions gracefully
- **Infinite scroll** - Can be adapted for infinite scroll patterns

## Usage

### Basic Example

```tsx
import { Table, useCursorPagination } from 'fsh-components';

function MyComponent() {
  const [data, setData] = useState([]);
  const {
    nextToken,
    hasMore,
    canGoBack,
    handleNextPage,
    handlePreviousPage,
    updatePagination,
    getCurrentToken,
  } = useCursorPagination();

  // Fetch data function
  const fetchData = async (token?: string | null) => {
    const response = await api.query({
      limit: 25,
      exclusiveStartKey: token || undefined,
    });

    setData(response.items);
    updatePagination(response.lastEvaluatedKey, response.items.length > 0);
  };

  // Initial load
  useEffect(() => {
    fetchData(getCurrentToken());
  }, [getCurrentToken()]);

  // Handle page navigation
  const onNextPage = () => {
    handleNextPage();
    fetchData(nextToken);
  };

  const onPreviousPage = () => {
    handlePreviousPage();
    // Token is managed internally, just refetch
    fetchData(getCurrentToken());
  };

  return (
    <Table
      data={data}
      columns={columns}
      paginationType="cursor"
      nextToken={nextToken}
      hasMore={hasMore}
      canGoBack={canGoBack}
      onNextPage={onNextPage}
      onPreviousPage={onPreviousPage}
    />
  );
}
```

### With React Query

```tsx
import { useQuery } from '@tanstack/react-query';
import { Table, useCursorPagination } from 'fsh-components';

function MyComponent() {
  const {
    nextToken,
    hasMore,
    canGoBack,
    handleNextPage,
    handlePreviousPage,
    updatePagination,
    getCurrentToken,
  } = useCursorPagination();

  const { data, isLoading } = useQuery({
    queryKey: ['items', getCurrentToken()],
    queryFn: () => api.getItems({ token: getCurrentToken() }),
    onSuccess: (response) => {
      updatePagination(
        response.lastEvaluatedKey,
        response.items.length > 0
      );
    },
  });

  return (
    <Table
      data={data?.items || []}
      columns={columns}
      paginationType="cursor"
      nextToken={nextToken}
      hasMore={hasMore}
      canGoBack={canGoBack}
      onNextPage={() => {
        handleNextPage();
      }}
      onPreviousPage={() => {
        handlePreviousPage();
      }}
      isFetching={isLoading}
    />
  );
}
```

## API Reference

### Table Props (Cursor Pagination)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `paginationType` | `"numbered" \| "cursor"` | `"numbered"` | Type of pagination to use |
| `nextToken` | `string \| null` | - | Token for the next page (like DynamoDB's LastEvaluatedKey) |
| `hasMore` | `boolean` | `false` | Whether there are more items to fetch |
| `onNextPage` | `(token?: string) => void` | - | Callback when Next button is clicked |
| `onPreviousPage` | `() => void` | - | Callback when Previous button is clicked |
| `canGoBack` | `boolean` | `false` | Whether the Previous button should be enabled |

### useCursorPagination Hook

```tsx
const {
  // State
  nextToken,        // Token for the next page
  hasMore,          // Whether there are more items
  canGoBack,        // Whether we can go back
  currentToken,     // Current token for API calls

  // Actions
  handleNextPage,       // Navigate to next page
  handlePreviousPage,   // Navigate to previous page
  updatePagination,     // Update pagination state after fetch
  reset,                // Reset to initial state
  getCurrentToken,      // Get current token
} = useCursorPagination();
```

#### Methods

**`updatePagination(newNextToken, hasMoreData)`**
- Call this after fetching data to update pagination state
- `newNextToken`: The token from your API response (e.g., `lastEvaluatedKey`)
- `hasMoreData`: Whether there are more items (usually `items.length > 0`)

**`handleNextPage()`**
- Call this when user clicks Next
- Manages the token stack internally
- Then fetch data using `nextToken`

**`handlePreviousPage()`**
- Call this when user clicks Previous
- Moves back in the token stack
- Then fetch data using `getCurrentToken()`

**`reset()`**
- Resets pagination to initial state
- Useful when applying filters or sorting

**`getCurrentToken()`**
- Returns the current token for API calls
- Use this when fetching data

## How It Works

The hook maintains a **token stack** for backward navigation:

1. **Forward navigation**: When you go to the next page, the current `nextToken` is pushed onto the stack
2. **Backward navigation**: When you go back, it pops from the stack
3. **Token management**: The hook tracks your position in the stack

This allows Previous/Next navigation without knowing the total page count, which is perfect for DynamoDB's pagination model.

## DynamoDB Integration Example

```tsx
// DynamoDB query function
const queryItems = async (token?: string | null) => {
  const params = {
    TableName: 'MyTable',
    Limit: 25,
    ...(token && { ExclusiveStartKey: JSON.parse(token) }),
  };

  const result = await dynamoDB.query(params).promise();

  return {
    items: result.Items,
    lastEvaluatedKey: result.LastEvaluatedKey
      ? JSON.stringify(result.LastEvaluatedKey)
      : null,
  };
};

// Component
function MyTable() {
  const pagination = useCursorPagination();
  const [data, setData] = useState([]);

  const fetchData = async () => {
    const result = await queryItems(pagination.getCurrentToken());
    setData(result.items);
    pagination.updatePagination(
      result.lastEvaluatedKey,
      result.items.length > 0
    );
  };

  useEffect(() => {
    fetchData();
  }, [pagination.currentToken]);

  return (
    <Table
      data={data}
      columns={columns}
      paginationType="cursor"
      {...pagination}
      onNextPage={() => pagination.handleNextPage()}
      onPreviousPage={() => pagination.handlePreviousPage()}
    />
  );
}
```

## Migration from Numbered Pagination

To migrate from numbered to cursor pagination:

### Before (Numbered)
```tsx
<Table
  data={data}
  columns={columns}
  pageCount={10}
  currentPage={page}
  setCurrentPage={setPage}
/>
```

### After (Cursor)
```tsx
const pagination = useCursorPagination();

<Table
  data={data}
  columns={columns}
  paginationType="cursor"
  nextToken={pagination.nextToken}
  hasMore={pagination.hasMore}
  canGoBack={pagination.canGoBack}
  onNextPage={() => {
    pagination.handleNextPage();
    // Fetch next page
  }}
  onPreviousPage={() => {
    pagination.handlePreviousPage();
    // Fetch previous page
  }}
/>
```

## Best Practices

1. **Always call `updatePagination`** after fetching data
2. **Use `getCurrentToken()`** in your fetch function's dependencies
3. **Call `reset()`** when filters or sorting changes
4. **Serialize complex tokens** (like DynamoDB objects) to strings
5. **Handle edge cases**: Empty results, errors, etc.

## Troubleshooting

### Previous button doesn't work
- Make sure you're calling `handlePreviousPage()` before fetching data
- Ensure your fetch function uses `getCurrentToken()` not `nextToken`

### Stack grows infinitely
- The stack only grows when moving forward from the latest position
- Going back and then forward reuses existing stack entries

### Lost token on page refresh
- Token stack is in-memory only
- Consider persisting to sessionStorage if needed
