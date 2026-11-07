// ============================================================================
// SHARED AG GRID FRAMEWORK FOR ZSUN APPS
// ============================================================================

export interface GridManagerConfig {
  appName: string;
  dataUrl: string;
  fallbackData: unknown[];
  baseColumnDefs: ColumnDef[];
  rowHeight: number;
  headerHeight: number;
  defaultColWidth: number;
  sortable: boolean;
  resizable: boolean;
  filterable: boolean;
  minWidth: number;
}

export interface IGridManager {
  config: GridManagerConfig;
  initialize(): void;
  loadData(url?: string): void;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
function escapeHtml(str: unknown): string {
  if (str == null) return "";
  const s = String(str);
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function generateColumnDefs(baseColumnDefs: ColumnDef[], defaultWidth: number): ColumnDef[] {
  return baseColumnDefs.map((cd) => {
    const cloned: ColumnDef = Object.assign({}, cd);
    if (!cloned.width) {
      cloned.width = defaultWidth;
    }
    return cloned;
  });
}

// ============================================================================
// CLIPBOARD FUNCTIONS
// ============================================================================
function copyTextToClipboard(text: unknown): void {
  const str = text == null ? "" : String(text);
  if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    navigator.clipboard.writeText(str).catch(() => fallbackCopyExecCommand(str));
    return;
  }
  fallbackCopyExecCommand(str);
}

// Writes two clipboard representations at once: a rich text/html table for
// apps that understand it (Excel, Sheets, Word - they split into real columns
// from the table markup, not by delimiter) and a plain-text fallback (e.g.
// comma-delimited CSV) for apps that only read text/plain (Notepad, a
// <textarea>, a terminal). Falls back to plain-text-only copy if the
// multi-format Clipboard API is unavailable or rejects the write.
function copyTableToClipboard(plainText: string, htmlText: string): void {
  if (typeof ClipboardItem !== "undefined" && typeof navigator.clipboard?.write === "function") {
    try {
      const item = new ClipboardItem({
        "text/plain": new Blob([plainText], { type: "text/plain" }),
        "text/html": new Blob([htmlText], { type: "text/html" }),
      });
      navigator.clipboard.write([item]).catch(() => copyTextToClipboard(plainText));
      return;
    } catch (e) {
      console.warn("Multi-format clipboard write failed, falling back to plain text", e);
    }
  }
  copyTextToClipboard(plainText);
}

function fallbackCopyExecCommand(text: string): void {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  } catch (e) {
    console.warn("Clipboard copy failed", e);
  }
}

function copyableCellRenderer(params: CellRendererParams): HTMLElement {
  const span = document.createElement("span");
  span.className = "copyable-cell";
  span.tabIndex = 0;
  const text =
    params.valueFormatted != null
      ? String(params.valueFormatted)
      : params.value == null
        ? ""
        : String(params.value);
  span.textContent = text;

  span.addEventListener("keydown", (ev) => {
    if ((ev.ctrlKey || ev.metaKey) && (ev.key === "c" || ev.key === "C")) {
      ev.preventDefault();
      copyTextToClipboard(text);
    }
  });

  span.addEventListener("dblclick", () => {
    copyTextToClipboard(text);
  });

  span.title = "Double-click to copy. Or focus and press Ctrl+C (Cmd+C on Mac).";
  return span;
}

// ============================================================================
// GRID MANAGER CLASS
// ============================================================================
export class GridManager implements IGridManager {
  config: GridManagerConfig;
  gridOptions: GridOptions | null;
  private _currentData: unknown[];
  private _abortController: AbortController | null;
  private _requestId: number;

  constructor(config: GridManagerConfig) {
    this.config = config;
    this.gridOptions = null;
    this._currentData = [];
    this._abortController = null;
    this._requestId = 0;
  }

  createGridOptions(): GridOptions {
    return {
      columnDefs: generateColumnDefs(this.config.baseColumnDefs, this.config.defaultColWidth),
      rowData: [],
      rowHeight: this.config.rowHeight,
      headerHeight: this.config.headerHeight,
      defaultColDef: {
        sortable: this.config.sortable,
        resizable: this.config.resizable,
        filter: this.config.filterable,
        cellRenderer: copyableCellRenderer,
        minWidth: this.config.minWidth,
      },
      enableRangeSelection: true,
      rowSelection: "multiple",
      overlayNoRowsTemplate: "",
    };
  }

  safeSetRowData(data: unknown): void {
    this._currentData = Array.isArray(data) ? data : [];
    if (this.gridOptions?.api?.setRowData) {
      this.gridOptions.api.setRowData(this._currentData);
    } else {
      console.warn("AG Grid API not ready for setRowData");
    }
  }

  showGridError(message: string): void {
    const safe = escapeHtml(message);
    const template = `
            <div class="grid-overlay">
                <strong>Error loading data</strong>
                <div class="grid-error-message">${safe}</div>
                <div class="grid-overlay-actions">
                    <button id="gridRetryBtn" class="btn">Retry</button>
                    <a id="gridHelpLink" href="https://github.com/jghughes/Zwift-Solution-2025" target="_blank">Help / Docs</a>
                </div>
            </div>`;

    if (this.gridOptions) this.gridOptions.overlayNoRowsTemplate = template;
    if (this.gridOptions?.api?.showNoRowsOverlay) {
      this.gridOptions.api.showNoRowsOverlay();
      setTimeout(() => {
        const retry = document.getElementById("gridRetryBtn");
        if (retry && !retry.dataset.bound) {
          retry.dataset.bound = "1";
          retry.addEventListener("click", () => {
            this.hideGridError();
            this.loadData();
          });
        }
      }, 0);
    }
  }

  hideGridError(): void {
    if (this.gridOptions?.api?.hideOverlay) {
      try {
        this.gridOptions.api.hideOverlay();
      } catch (e) {
        console.warn("hideOverlay failed", e);
      }
    }
  }

  private csvEscapeField(value: unknown): string {
    if (value == null) return "";
    const str = String(value);
    if (/[",\r\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  // Returns the selected rows' data in display order, or null if fewer than 2
  // rows are selected (in which case the single-cell copy handler should run instead).
  private getSelectedRowsInOrder(): unknown[] | null {
    const api = this.gridOptions?.api;
    if (!api?.getSelectedNodes || !api.forEachNodeAfterFilterAndSort) return null;

    if (api.getSelectedNodes().length < 2) return null;

    const orderedRows: unknown[] = [];
    api.forEachNodeAfterFilterAndSort((node) => {
      if (node.isSelected()) orderedRows.push(node.data);
    });
    return orderedRows;
  }

  // Plain-text representation (comma-delimited CSV) for consumers that only
  // understand text/plain, e.g. Notepad or a <textarea>.
  private buildCsvFromRows(rows: unknown[]): string {
    const columns = this.config.baseColumnDefs;
    const header = columns.map((c) => this.csvEscapeField(c.headerName)).join(",");
    const lines = rows.map((row) =>
      columns
        .map((c) => this.csvEscapeField(c.field ? (row as Record<string, unknown>)[c.field] : ""))
        .join(",")
    );
    return [header, ...lines].join("\r\n");
  }

  // Rich text/html representation for consumers that split clipboard data
  // into real columns/cells from table markup, e.g. Excel, Sheets, Word.
  private buildHtmlTableFromRows(rows: unknown[]): string {
    const columns = this.config.baseColumnDefs;
    const headerCells = columns.map((c) => `<th>${escapeHtml(c.headerName)}</th>`).join("");
    const bodyRows = rows
      .map((row) => {
        const cells = columns
          .map(
            (c) => `<td>${escapeHtml(c.field ? (row as Record<string, unknown>)[c.field] : "")}</td>`
          )
          .join("");
        return `<tr>${cells}</tr>`;
      })
      .join("");
    return `<table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>`;
  }

  private handleGridKeyDown = (ev: KeyboardEvent): void => {
    if (!(ev.ctrlKey || ev.metaKey) || (ev.key !== "c" && ev.key !== "C")) return;
    const rows = this.getSelectedRowsInOrder();
    if (rows == null) return; // fewer than 2 rows selected; let the per-cell handler copy instead
    ev.preventDefault();
    ev.stopPropagation();
    copyTableToClipboard(this.buildCsvFromRows(rows), this.buildHtmlTableFromRows(rows));
  };

  initializeGrid(): void {
    const eGridDiv = document.getElementById("myGrid");
    if (!eGridDiv) {
      console.error("Grid container element not found");
      return;
    }

    eGridDiv.innerHTML = "";
    // Capture phase so multi-row copy runs before the per-cell copy handler sees the event.
    eGridDiv.addEventListener("keydown", this.handleGridKeyDown, true);
    this.gridOptions = this.createGridOptions();

    try {
      new agGrid.Grid(eGridDiv, this.gridOptions);
      console.log("AG Grid initialized successfully");
    } catch (err) {
      this.showGridError(err instanceof Error ? err.message : "Error initializing AG Grid");
      console.error("Error initializing AG Grid:", err);
    }
  }

  loadData(url?: string): void {
    if (url) {
      this.config.dataUrl = url;
    }

    // Cancel any in-flight request so its response can never overwrite a newer one.
    this._abortController?.abort();
    const controller = new AbortController();
    this._abortController = controller;
    const requestId = ++this._requestId;
    const isStale = (): boolean => requestId !== this._requestId;

    if (this.gridOptions?.api?.showLoadingOverlay) {
      try {
        this.gridOptions.api.showLoadingOverlay();
      } catch (e) {
        console.warn("showLoadingOverlay failed", e);
      }
    }

    fetch(this.config.dataUrl, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          let message = "";
          switch (response.status) {
            case 401:
            case 403:
              message = "Authorization error: You do not have permission to access this data.";
              break;
            case 404:
              message = "File not found: The requested data file does not exist.";
              break;
            case 500:
              message = "Server error: There was a problem with the server.";
              break;
            default:
              message = `HTTP error: ${response.status} ${response.statusText}`;
          }
          throw new Error(message);
        }
        return response.json();
      })
      .then((data) => {
        if (isStale()) return;
        this.safeSetRowData(data);
      })
      .catch((err: unknown) => {
        if (isStale() || (err instanceof DOMException && err.name === "AbortError")) return;

        let errorMsg = err instanceof Error ? err.message : String(err);
        if (err instanceof TypeError && errorMsg.includes("Failed to fetch")) {
          errorMsg =
            "Unable to fetch data. This may be due to a network issue or a CORS restriction.";
        } else if (errorMsg.includes("Unexpected token")) {
          errorMsg = "Format error: Data file is not valid JSON.";
        }
        this.safeSetRowData(this.config.fallbackData);
        this.showGridError(errorMsg);
        console.error("Error loading data:", err);
      });
  }

  initialize(): void {
    console.log(`Initializing ${this.config.appName} Grid...`);
    this.initializeGrid();

    const filterInput = document.getElementById("filterInput") as HTMLInputElement | null;
    if (filterInput) {
      filterInput.addEventListener("input", () => {
        if (this.gridOptions?.api?.setQuickFilter) {
          this.gridOptions.api.setQuickFilter(filterInput.value);
        }
      });
    }

    this.loadData();
    console.log("Grid initialization complete");
  }
}