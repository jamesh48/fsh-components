/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react'
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { type ReactElement, useMemo, useState } from "react";
import MuiPagination from "@mui/material/Pagination";

import { When } from "react-if";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type GroupingState,
  type InitialTableState,
  type OnChangeFn,
  type RowSelectionState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";

import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import MuiTable from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { styled, Typography, type SxProps } from "@mui/material";

// import NotFound from "@components/dataDisplay/table/components/NotFound";
// import Pagination from "@components/dataDisplay/table/components/Pagination";
// import Skeletons from "@components/dataDisplay/table/components/Skeletons";
export interface TablePropsInterface {
  tableName?: string;
  data: any[];
  columns: ColumnDef<any, any>[];
  pageCount?: number;
  tabIndex?: number;
  page?: number;
  setCurrentPage?: (page: number) => void;
  updateFilter?: (key: string, value: string) => void;
  currentPage?: number;
  isFetching?: boolean;
  rowCount?: number;
  headerButtons?: ReactElement;
  rowSelection?: RowSelectionState;
  setRowSelection?: OnChangeFn<RowSelectionState>;
  resetRowSelections?: () => void;
  rowId?: string;
  initialState?: InitialTableState;
  fullWidth?: boolean;
  sort?: SortingState;
  setSort?: React.Dispatch<React.SetStateAction<SortingState>>;
  noDataFoundAction?: React.ReactNode;

  activeRow?: number;
  enableHotkeyXNavigation?: boolean;

  styleRowOnProperty?: {
    property: string;
    condition: boolean;
    sx: SxProps;
  };

  sx?: {
    row?: SxProps;
    header?: SxProps
  };

  styles?: {
    paper?: React.CSSProperties;
    table?: React.CSSProperties;
    row?: React.CSSProperties;
    headerCell?: React.CSSProperties;
    cell?: React.CSSProperties;
  };

  // DynamoDB-style cursor-based pagination
  paginationType?: "numbered" | "cursor";
  nextToken?: string | null; // Similar to DynamoDB's LastEvaluatedKey (for display/debugging)
  hasMore?: boolean; // Indicates if there are more items
  onNextPage?: () => void;
  onPreviousPage?: () => void;
  canGoBack?: boolean; // Indicates if we can go to previous page
}

// Pagination.tsx

const Pagination = styled(MuiPagination)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  marginTop: "1rem",
  ".Mui-selected.MuiPaginationItem-page": {
    background: theme.palette.primary.main,
    color: "white",
  },
  paddingBottom: "1.4rem",
}));

// Cursor-based pagination component for DynamoDB-style pagination
const CursorPagination = ({
  hasMore,
  canGoBack,
  onNextPage,
  onPreviousPage,
}: {
  hasMore?: boolean;
  canGoBack?: boolean;
  onNextPage?: () => void;
  onPreviousPage?: () => void;
}) => {
  return (
    <Stack
      direction="row"
      justifyContent="center"
      spacing={2}
      sx={{ marginTop: "1rem", paddingBottom: "1.4rem" }}
    >
      <button
        onClick={() => onPreviousPage?.()}
        disabled={!canGoBack}
        style={{
          padding: "8px 16px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          cursor: canGoBack ? "pointer" : "not-allowed",
          opacity: canGoBack ? 1 : 0.5,
        }}
      >
        Previous
      </button>
      <button
        onClick={() => onNextPage?.()}
        disabled={!hasMore}
        style={{
          padding: "8px 16px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          cursor: hasMore ? "pointer" : "not-allowed",
          opacity: hasMore ? 1 : 0.5,
        }}
      >
        Next
      </button>
    </Stack>
  );
};

const getPageErrorProps = ({
  header,
  subheader,
  type = "default",
  icon,
}: {
  header?: string;
  subheader?: React.ReactNode;
  type?: string;
  icon?: React.ReactNode;
}) => {
  switch (type) {
    default:
      header = header;
      subheader = subheader;
      icon = <ErrorOutlineIcon color="error" fontSize="large" />;
  }
  return { header, subheader, icon };
};

export const StyledHeadRow = styled(TableRow)(() => ({
  ".MuiTableCell-head div": {
    fontFamily: "Source Serif Pro",
    fontSize: "0.875rem",
    fontWeight: 600,
  },
  ".MuiTableCell-head": {
    verticalAlign: "bottom",
  },
  // Default position for the TableRow is static, which meant that it would sit on top of modal footers.
  // Since static positioning doesn't respond to z-index, we needed to change it to sticky.
  position: "sticky",
}));
export const StyledTableRow = styled(TableRow)((_props) => ({
  // '&:last-child td': {
  //   border: 0
  // },
  "&:nth-of-type(odd)": {
    backgroundColor: "gray",
  },
  "&:last-child th": {
    border: 0,
  },
  ":hover": {
    backgroundColor: "blue",
  },
  ".MuiTableCell-body": {
    fontSize: "0.875rem",
    ".f-10": {
      fontSize: "12px",
    },
  },
}));

const Container = styled("div")({
  padding: "2rem 0",
});

const PageError = ({
  header: pageErrorHeader,
  headerSize,
  subheader: pageErrorSubheader,
  type,
  icon: pageErrorIcon,
  extra,
  sx,
}: {
  header?: string;
  headerSize?: string;
  subheader?: React.ReactNode;
  type?: string;
  icon?: React.ReactNode;
  extra?: React.ReactNode;
  sx?: any;
}) => {
  const { header, subheader, icon } = getPageErrorProps({
    header: pageErrorHeader,
    subheader: pageErrorSubheader,
    type,
    icon: pageErrorIcon,
  });

  return (
    <Stack
      direction="column"
      alignItems="center"
      justifyContent="center"
      width="100%"
      height="100%"
      sx={{ backgroundColor: "white", ...sx }}
    >
      <When condition={!!icon}>{icon}</When>
      <Typography fontSize={headerSize ? headerSize : "1.6rem"}>{header}</Typography>
      <Typography fontSize="1rem">{subheader}</Typography>
      <When condition={!!extra}>{extra}</When>
    </Stack>
  );
};

const NoRecordsFound = ({ ...props }) => (
  <PageError {...props} type="default" headerSize="1.3rem" />
);

const NotFound = () => {
  return (
    <Container className="not-found-container">
      <NoRecordsFound />
    </Container>
  );
};

const Table = ({
  data,
  columns,
  pageCount,
  setCurrentPage,
  currentPage,
  isFetching,

  rowSelection = {},
  setRowSelection = () => {},

  initialState = {},
  fullWidth = true,
  sort,
  setSort,
  noDataFoundAction = <NotFound />,

  tabIndex = 0,
  styles = {},

  // Cursor-based pagination props
  paginationType = "numbered",
  nextToken,
  sx,
  hasMore = false,
  onNextPage,
  onPreviousPage,
  canGoBack = false,
}: TablePropsInterface) => {
  const memoizedColumns = useMemo(() => columns, [columns]);
  const memoizedData = useMemo(() => data, [data]);

  const noDataFound = !isFetching && (!memoizedData || memoizedData?.length === 0);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [grouping, setGrouping] = useState<GroupingState>([]);

  const {
    getHeaderGroups,
    getRowModel,
    getSelectedRowModel: _,
  } = useReactTable({
    data: memoizedData,
    columns: memoizedColumns,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting: sort ? sort : sorting,
      rowSelection,
      grouping,
    },
    getFilteredRowModel: getFilteredRowModel(),
    onGroupingChange: setGrouping,
    onSortingChange: !!setSort ? setSort : setSorting,
    enableMultiSort: true,
    pageCount,
    onRowSelectionChange: setRowSelection,
    getGroupedRowModel: getGroupedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // getRowId: (originalRow, index) => (rowId ? originalRow[rowId] : index),
    autoResetPageIndex: true,

    manualPagination: true,
    initialState: initialState,
  });

  const renderTableBody = () => {
    return getRowModel().rows.map((row, idx) => {
      return (
        <StyledTableRow
          data-cy="table-row"
          data-row-index={idx}
          key={row.id}
          style={styles?.row}
          sx={sx?.row}
        >
          {row.getVisibleCells().map((cell, index) => {
            const minWidth = `${cell.column.columnDef.minSize ?? 0}px`;
            const maxWidth = `${cell.column.columnDef.maxSize ?? 0}px`;
            const width = `${cell.column.columnDef.size ?? 0}px`;
            return (
              <TableCell
                key={row?.id + cell.id + idx + index}
                data-cy={`table-cell-${cell.column.id}`}
                sx={{
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  minWidth,
                  maxWidth,
                  width,
                }}
                tabIndex={tabIndex}
                className={cell.column.id}
                style={styles?.cell}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            );
          })}
        </StyledTableRow>
      );
    });
  };

  const handlePageChange = (
    _event: React.ChangeEvent<unknown> | KeyboardEvent,
    nextPage: number = 1,
  ) => {
    setCurrentPage?.(nextPage === 0 ? 1 : nextPage);
    // resetRowSelection()
  };

  return (
    <Paper elevation={0} sx={{ width: "100%", ...styles?.paper }} tabIndex={tabIndex}>
      {/* {headerButtons &&
        cloneElement(headerButtons!, {
          getSelectedRowModel,
          currentPage,
          setCurrentPage,
        })} */}

      <TableContainer component={Paper} elevation={0}>
        <MuiTable
          data-cy="table"
          aria-label="table"
          stickyHeader
          size="small"
          sx={{ width: fullWidth ? "100%" : "auto" }}
          style={styles?.table}
        >
          {!isFetching && (
            <TableHead>
              {getHeaderGroups().map((headerGroup) => (
                <StyledHeadRow key={headerGroup.id}>
                  {headerGroup.headers.map((header, idx) => {
                    return (
                      <TableCell
                        key={header.id + idx}
                        sx={{
                          cursor: header.column.getCanSort() ? "pointer" : "",
                          background: "gray",
                          ...sx?.header
                        }}
                        colSpan={header.colSpan}
                        style={styles?.headerCell}
                        tabIndex={tabIndex}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <Stack direction="row" alignItems={"center"}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <ArrowDropDownIcon />,
                            desc: <ArrowDropUpIcon />,
                          }[header.column.getIsSorted() as string] ?? null}
                        </Stack>
                      </TableCell>
                    );
                  })}
                </StyledHeadRow>
              ))}
            </TableHead>
          )}
          <TableBody data-cy="table-body">
            {renderTableBody()}
            {/* <Skeletons rowCount={rowCount} columnCount={columnCount} isFetching={isFetching}>

            </Skeletons> */}
          </TableBody>
        </MuiTable>
      </TableContainer>
      <When condition={noDataFound}>{noDataFoundAction}</When>

      {/* Numbered pagination (original) */}
      <When condition={paginationType === "numbered" && (pageCount ?? 0) > 1 && !!setCurrentPage}>
        <Pagination
          count={pageCount ?? 0}
          page={currentPage}
          variant="outlined"
          shape="rounded"
          onChange={handlePageChange}
        />
      </When>

      {/* Cursor-based pagination (DynamoDB-style) */}
      <When condition={paginationType === "cursor" && (hasMore || canGoBack)}>
        <CursorPagination
          hasMore={hasMore}
          canGoBack={canGoBack}
          onNextPage={onNextPage}
          onPreviousPage={onPreviousPage}
        />
      </When>
    </Paper>
  );
};

export default Table;
