// Ambient types for the AG Grid Community global loaded via CDN <script> tag.

interface CellRendererParams {
  value: unknown;
  valueFormatted?: string;
}

interface ValueFormatterParams {
  value: number | undefined;
}

interface ColumnDef {
  headerName?: string;
  field?: string;
  pinned?: "left" | "right";
  type?: string;
  width?: number;
  cellRenderer?: (params: CellRendererParams) => HTMLElement | string;
  cellStyle?: Record<string, string>;
  valueFormatter?: (params: ValueFormatterParams) => string | undefined;
}

interface DefaultColDef {
  sortable?: boolean;
  resizable?: boolean;
  filter?: boolean;
  cellRenderer?: (params: CellRendererParams) => HTMLElement | string;
  minWidth?: number;
}

interface GridApi {
  setRowData?(data: unknown[]): void;
  showNoRowsOverlay?(): void;
  hideOverlay?(): void;
  showLoadingOverlay?(): void;
  setQuickFilter?(value: string): void;
}

interface GridOptions {
  columnDefs: ColumnDef[];
  rowData: unknown[];
  rowHeight?: number;
  headerHeight?: number;
  defaultColDef?: DefaultColDef;
  enableRangeSelection?: boolean;
  rowSelection?: string;
  overlayNoRowsTemplate?: string;
  api?: GridApi;
}

declare const agGrid: {
  Grid: new (element: HTMLElement, gridOptions: GridOptions) => unknown;
};
