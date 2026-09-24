/// <reference path="../../shared-mastercopies/src/ag-grid-types.d.ts" />
import { GridManager } from "../../shared-mastercopies/dist/base-grid.js";

// ============================================================================
// CONFIGURATION
// ============================================================================
interface RaceOption {
  label: string;
  url: string;
}

const RACE_OPTIONS: RaceOption[] = [
  {
    label: "stage 0 - points - Prologue: London 8 Reverse",
    url: "https://customerzsun.blob.core.windows.net/dirt/13-s0-ZSUN.json",
  },
  {
    label: "stage 1 - points - Cobbled Crown",
    url: "https://customerzsun.blob.core.windows.net/dirt/13-s1-ZSUN.json",
  },
  {
    label: "stage 2 - TTR - BRAEk-fast Crits and Grits",
    url: "https://customerzsun.blob.core.windows.net/dirt/13-s2-ZSUN.json",
  },
  {
    label: "stage 3 - points - Seaside Sprint",
    url: "https://customerzsun.blob.core.windows.net/dirt/13-s3-ZSUN.json",
  },
  {
    label: "stage 4 - points - Three Sisters",
    url: "https://customerzsun.blob.core.windows.net/dirt/13-s4-ZSUN.json",
  },
  {
    label: "stage 5 - points - Avon Flyer",
    url: "https://customerzsun.blob.core.windows.net/dirt/13-s5-ZSUN.json",
  },
  {
    label: "stage 6 - iTT - Crepe Escape",
    url: "https://customerzsun.blob.core.windows.net/dirt/13-s6-ZSUN.json",
  },
  {
    label: "Series 13 - totals",
    url: "https://customerzsun.blob.core.windows.net/dirt/13-series-ZSUN.json",
  },
];
// The following block is a commented-out duplicate of RACE_OPTIONS, possibly for reference or backup
// This is a commented-out duplicate of RACE_OPTIONS, possibly for reference or backup
// const RACE_OPTIONS: RaceOption[] = [
//{
//    label: "stage 1 - points - Peaky Pave",
//    url: "https://customerzsun.blob.core.windows.net/dirt/12-s1-ZSUN.json",
//  },
// {
//    label: "stage 2 - TTR - ZG25 Queen",
//    url: "https://customerzsun.blob.core.windows.net/dirt/12-s2-ZSUN.json",
//  },
 // {
//    label: "stage 3 - points - Coast Crusher",
//    url: "https://customerzsun.blob.core.windows.net/dirt/12-s3-ZSUN.json",
//  },
//  {
//    label: "stage 4 - points - Temples and Towers",
//    url: "https://customerzsun.blob.core.windows.net/dirt/12-s4-ZSUN.json",
//  },
//  {
//    label: "stage 5 - points - Downtown Dolphins",
//    url: "https://customerzsun.blob.core.windows.net/dirt/12-s5-ZSUN.json",
//  },
//  {
//    label: "stage 6 - iTT - Harrowgate Circuit Reverse",
//    url: "https://customerzsun.blob.core.windows.net/dirt/12-s6-ZSUN.json",
//  },
//  {
//    label: "Series - totals",
//    url: "https://customerzsun.blob.core.windows.net/dirt/12-series-ZSUN.json",
//  },
//];

const FALLBACK_DATA: unknown[] = [{ finishingPlacePoints: 0, rider: "John Doe" }];

const BASE_COLUMN_DEFS: ColumnDef[] = [
  {
    headerName: "Default rank",
    field: "tableRowNumber",
    pinned: "left",
    type: "numericColumn",
    width: 60,
  },
  { headerName: "Name", field: "rider", pinned: "left", width: 150 },
  { headerName: "Team", field: "team", width: 150 },
  { headerName: "Zone", field: "timeZone" },
  { headerName: "KOM-pts", field: "pointsKom", type: "numericColumn" },
  { headerName: "Sprint-pts", field: "pointsSprint", type: "numericColumn" },
  { headerName: "Finish-pts", field: "pointsFinish", type: "numericColumn" },
  { headerName: "Total-pts", field: "pointsTotal", type: "numericColumn" },
  { headerName: "Place-points", field: "prettyFinishingPlaceInDivisionByPoints", width: 60},
  { headerName: "Time", field: "finishTimeHHMMSS" },
  { headerName: "Place-time", field: "finishingPlaceTime", type: "numericColumn", width: 60 },
  { headerName: "League", field: "league", width: 150 },
  { headerName: "ZwiftID", field: "zwiftId" },
];

// ============================================================================
// INITIALIZE GRID USING SHARED FRAMEWORK
// ============================================================================
document.addEventListener("DOMContentLoaded", function () {
  // Populate the race selector dropdown
  const raceSelector = document.getElementById("raceSelector") as HTMLSelectElement;
  RACE_OPTIONS.forEach((option) => {
    const opt = document.createElement("option");
    opt.value = option.url;
    opt.textContent = option.label;
    raceSelector.appendChild(opt);
  });
  // Default to first race
  raceSelector.value = RACE_OPTIONS[0]!.url;

  const gridManager = new GridManager({
    appName: "ZRL 2026 Round 3",
    dataUrl: raceSelector.value,
    fallbackData: FALLBACK_DATA,
    baseColumnDefs: BASE_COLUMN_DEFS,
    rowHeight: 25,
    headerHeight: 32,
    defaultColWidth: 80,
    sortable: true,
    resizable: true,
    filterable: true,
    minWidth: 40,
  });

  gridManager.initialize();

  // Reload grid data when a different race is selected
  raceSelector.addEventListener("change", function () {
    gridManager.loadData(raceSelector.value);
  });
});
