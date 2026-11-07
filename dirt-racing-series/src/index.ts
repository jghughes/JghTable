/// <reference path="../../shared-mastercopies/src/ag-grid-types.d.ts" />
import { GridManager } from "../../shared-mastercopies/dist/base-grid.js";

// ============================================================================
// APP CONFIGURATION
// ============================================================================
const APP_NAME : string = "Dirt Racing Series app";

interface SeasonRoundOption {
  label: string;
  seasonRoundNumber: string;
}

interface RaceOption {
  label: string;
  url: string;
}

const SEASON_ROUND_OPTIONS: SeasonRoundOption[] = [
/*   { label: "Double Lucky - Series 14 ", seasonRoundNumber: "14" },
 */  
  { label: "Series EL - Series 13  ", seasonRoundNumber: "13" },
  { label: "A Dirty Dozen - Series 12 ", seasonRoundNumber: "12" },
  { label: "It Goes to 11 - Series 11 ", seasonRoundNumber: "11" },
];

const RACE_OPTIONS_BY_SEASON: Record<string, RaceOption[]> = {

/*   "14": [
  {
    label: "stage 1 - points - Royal Pump Room 8, Yorkshire",
    url: "https://customerzsun.blob.core.windows.net/dirt/14-s1-ZSUN-riders.json",
  },
  {
    label: "stage 2 - points - Double Espresso, Paris",
    url: "https://customerzsun.blob.core.windows.net/dirt/14-s2-ZSUN-riders.json",
  },
  {
    label: "stage 3 - TTR - Outer Scotland, Scotland",
    url: "https://customerzsun.blob.core.windows.net/dirt/14-s3-ZSUN-riders.json",
  },
  {
    label: "stage 4 - points - Snowman with Grade finish, Watopia)",
    url: "https://customerzsun.blob.core.windows.net/dirt/14-s4-ZSUN-riders.json",
  },
  {
    label: "stage 5 - points - Twilight Crit, Watopia",
    url: "https://customerzsun.blob.core.windows.net/dirt/14-s5-ZSUN-riders.json",
  },
  {
    label: "stage 6 - iTT - Island Hopper, Makuri Islands",
    url: "https://customerzsun.blob.core.windows.net/dirt/14-s6-ZSUN-riders.json",
  },
  {
    label: "Series 14 - totals",
    url: "https://customerzsun.blob.core.windows.net/dirt/14-series-ZSUN-riders.json",
  },
  {
    label: "stage 1 - team - Royal Pump Room 8, Yorkshire",
    url: "https://customerzsun.blob.core.windows.net/dirt/14-s1-ZSUN-teams.json",
  },
  {
    label: "stage 2 - team - Double Espresso, Paris",
    url: "https://customerzsun.blob.core.windows.net/dirt/14-s2-ZSUN-teams.json",
  },
  {
    label: "stage 3 - team - Outer Scotland, Scotland",
    url: "https://customerzsun.blob.core.windows.net/dirt/14-s3-ZSUN-teams.json",
  },
  {
    label: "stage 4 - team - Snowman with Grade finish, Watopia",
    url: "https://customerzsun.blob.core.windows.net/dirt/14-s4-ZSUN-teams.json",
  },
  {
    label: "stage 5 - team - Twilight Crit, Watopia",
    url: "https://customerzsun.blob.core.windows.net/dirt/14-s5-ZSUN-teams.json",
  },
  {
    label: "stage 6 - team - Island Hopper, Makuri Islands",
    url: "https://customerzsun.blob.core.windows.net/dirt/14-s6-ZSUN-teams.json",
  },
],
 */
  "13": [
  {
    label: "stage 0 - points - Prologue: London 8 Reverse",
    url: "https://customerzsun.blob.core.windows.net/dirt/13-s0-ZSUN-riders.json",
  },
  {
    label: "stage 1 - points - Cobbled Crown",
    url: "https://customerzsun.blob.core.windows.net/dirt/13-s1-ZSUN-riders.json",
  },
  {
    label: "stage 2 - TTR - BRAEk-fast Crits and Grits",
    url: "https://customerzsun.blob.core.windows.net/dirt/13-s2-ZSUN-riders.json",
  },
  {
    label: "stage 3 - points - Seaside Sprint",
    url: "https://customerzsun.blob.core.windows.net/dirt/13-s3-ZSUN-riders.json",
  },
  {
    label: "stage 4 - points - Three Sisters",
    url: "https://customerzsun.blob.core.windows.net/dirt/13-s4-ZSUN-riders.json",
  },
  {
    label: "stage 5 - points - Avon Flyer",
    url: "https://customerzsun.blob.core.windows.net/dirt/13-s5-ZSUN-riders.json",
  },
  {
    label: "stage 6 - iTT - Crepe Escape",
    url: "https://customerzsun.blob.core.windows.net/dirt/13-s6-ZSUN-riders.json",
  },
  {
    label: "Series 13 - totals",
    url: "https://customerzsun.blob.core.windows.net/dirt/13-series-ZSUN-riders.json",
  },
  {
    label: "stage 0 - team - Prologue: London 8 Reverse",
    url: "https://customerzsun.blob.core.windows.net/dirt/13-s0-ZSUN-teams.json",
  },
  {
    label: "stage 1 - team - Cobbled Crown",
    url: "https://customerzsun.blob.core.windows.net/dirt/13-s1-ZSUN-teams.json",
  },
  {
    label: "stage 2 - team - BRAEk-fast Crits and Grits",
    url: "https://customerzsun.blob.core.windows.net/dirt/13-s2-ZSUN-teams.json",
  },
  {
    label: "stage 3 - team - Seaside Sprint",
    url: "https://customerzsun.blob.core.windows.net/dirt/13-s3-ZSUN-teams.json",
  },
  {
    label: "stage 4 - team - Three Sisters",
    url: "https://customerzsun.blob.core.windows.net/dirt/13-s4-ZSUN-teams.json",
  },
  {
    label: "stage 5 - team - Avon Flyer",
    url: "https://customerzsun.blob.core.windows.net/dirt/13-s5-ZSUN-teams.json",
  },
  {
    label: "stage 6 - team - Crepe Escape",
    url: "https://customerzsun.blob.core.windows.net/dirt/13-s6-ZSUN-teams.json",
  },
],
  "12": [
    {
      label: "stage 1 - points - Peaky Pave",
      url: "https://customerzsun.blob.core.windows.net/dirt/12-s1-ZSUN-riders.json",
    },
    {
      label: "stage 2 - TTR - ZG25 Queen",
      url: "https://customerzsun.blob.core.windows.net/dirt/12-s2-ZSUN-riders.json",
    },
    {
      label: "stage 3 - points - Coast Crusher",
      url: "https://customerzsun.blob.core.windows.net/dirt/12-s3-ZSUN-riders.json",
    },
    {
      label: "stage 4 - points - Temples and Towers",
      url: "https://customerzsun.blob.core.windows.net/dirt/12-s4-ZSUN-riders.json",
    },
    {
      label: "stage 5 - points - Downtown Dolphins",
      url: "https://customerzsun.blob.core.windows.net/dirt/12-s5-ZSUN-riders.json",
    },
    {
      label: "stage 6 - iTT - Harrowgate Circuit Reverse",
      url: "https://customerzsun.blob.core.windows.net/dirt/12-s6-ZSUN-riders.json",
    },
    {
      label: "Series 12 - totals",
      url: "https://customerzsun.blob.core.windows.net/dirt/12-series-ZSUN-riders.json",
    },
  ],
  "11": [
    {
      label: "stage 1 - points",
      url: "https://customerzsun.blob.core.windows.net/dirt/11-s1-ZSUN-riders.json",
    },
    {
      label: "stage 2 - Finish time",
      url: "https://customerzsun.blob.core.windows.net/dirt/11-s2-ZSUN-riders.json",
    },
    {
      label: "stage 3 - points",
      url: "https://customerzsun.blob.core.windows.net/dirt/11-s3-ZSUN-riders.json",
    },
    {
      label: "stage 4 - points",
      url: "https://customerzsun.blob.core.windows.net/dirt/11-s4-ZSUN-riders.json",
    },
    {
      label: "stage 5 - points - Downtown Dolphins",
      url: "https://customerzsun.blob.core.windows.net/dirt/11-s5-ZSUN-riders.json",
    },
    {
      label: "stage 6 - points",
      url: "https://customerzsun.blob.core.windows.net/dirt/11-s6-ZSUN-riders.json",
    },
    {
      label: "Series 12 - totals",
      url: "https://customerzsun.blob.core.windows.net/dirt/11-series-ZSUN-riders.json",
    },
  ]
};

const FALLBACK_DATA: unknown[] = [{ tableRowNumber: 0, rider: "John Doe", team: "Team A", place: 99999 }];

const BASE_COLUMN_DEFS: ColumnDef[] = [
  { headerName: "Rank (default)", field: "tableRowNumber", pinned: "left", type: "numericColumn", width: 60 },
  { headerName: "Rank (time)", field: "finishingPlaceTime", pinned: "left", type: "numericColumn", width: 60 },
  { headerName: "Name", field: "rider", pinned: "left", width: 150 },
  { headerName: "Team", field: "team", width: 150 },
  { headerName: "Zone", field: "timeZone" },
  { headerName: "KOM pts", field: "pointsKom", type: "numericColumn" },
  { headerName: "Sprint pts", field: "pointsSprint", type: "numericColumn" },
  { headerName: "Finish pts", field: "pointsFinish", type: "numericColumn" },
  { headerName: "Total pts", field: "pointsTotal", type: "numericColumn" },
  { headerName: "Place (by points in division)", field: "prettyFinishingPlaceInDivisionByPoints", width: 60},
  { headerName: "Time", field: "finishTimeHHMMSS" },
  { headerName: "Place (by time in division)", field: "prettyFinishingPlaceInDivisionByTime", width: 60},
  { headerName: "League", field: "league", width: 100 },
  { headerName: "Category", field: "divisionCategory", width: 100 },
  { headerName: "ZwiftID", field: "zwiftId" },
];

// ============================================================================
// INITIALIZE GRID USING SHARED FRAMEWORK
// ============================================================================

document.addEventListener("DOMContentLoaded", function () {
  const seasonSelector = document.getElementById("seasonRoundSelector") as HTMLSelectElement;
  const raceSelector = document.getElementById("raceSelector") as HTMLSelectElement;

  SEASON_ROUND_OPTIONS.forEach((season) => {
    const opt = document.createElement("option");
    opt.value = season.seasonRoundNumber;
    opt.textContent = season.label;
    seasonSelector.appendChild(opt);
  });

  seasonSelector.value = SEASON_ROUND_OPTIONS[0]!.seasonRoundNumber; // default to the latest season

  // Returns the URL of the first race, or undefined if the season has no races
  function populateRaceSelector(season: string): string | undefined {
    const races = RACE_OPTIONS_BY_SEASON[season] ?? [];
    raceSelector.innerHTML = "";
    races.forEach((race) => {
      const opt = document.createElement("option");
      opt.value = race.url;
      opt.textContent = race.label;
      raceSelector.appendChild(opt);
    });
    raceSelector.disabled = races.length === 0;
    return races[0]?.url;
  }

  const initialUrl = populateRaceSelector(seasonSelector.value);

  const gridManager = new GridManager({
    appName: APP_NAME,
    dataUrl: initialUrl ?? "",
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

  seasonSelector.addEventListener("change", function () {
    const firstUrl = populateRaceSelector(seasonSelector.value);
    if (firstUrl) gridManager.loadData(firstUrl);
  });

  raceSelector.addEventListener("change", function () {
    gridManager.loadData(raceSelector.value);
  });
});
