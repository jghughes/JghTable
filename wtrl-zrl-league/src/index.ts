/// <reference path="../../shared-mastercopies/src/ag-grid-types.d.ts" />
import { GridManager } from "../../shared-mastercopies/dist/base-grid.js";

// ============================================================================
// APP CONFIGURATION
// ============================================================================

interface SeasonRoundOption {
  label: string;
  seasonRoundNumber: string;
}

interface RaceOption {
  label: string;
  url: string;
}

const SEASON_ROUND_OPTIONS: SeasonRoundOption[] = [
  { label: "Season/Round 20: 2026/27 Round 1", seasonRoundNumber: "20" },
  { label: "Season/Round 19: 2025/26 Round 4", seasonRoundNumber: "19" },
  { label: "Season 18: 2025/26 Round 3", seasonRoundNumber: "18" },
];

const RACE_OPTIONS_BY_SEASON: Record<string, RaceOption[]> = {
  "20": [
    {
      label: "Race 1 - Scratch - Innsbruckring, Austria",
      url: "https://customerzsun.blob.core.windows.net/wtrl-zrl/sr20-r1-ZSUN.json",
    },
    {
      label: "Race 2 - Points - Urumaze, Watopia",
      url: "https://customerzsun.blob.core.windows.net/wtrl-zrl/sr20-r2-ZSUN.json",
    },
    {
      label: "Race 3 - TTT - Figure 8 Reverse, Watopia",
      url: "https://customerzsun.blob.core.windows.net/wtrl-zrl/sr20-r3-ZSUN.json",
    },
    {
      label: "Race 4 - Scratch - Green to Screen, NYC",
      url: "https://customerzsun.blob.core.windows.net/wtrl-zrl/sr20-r4-ZSUN.json",
    },
    {
      label: "Race 5 - Points - Spiral Summit, Watopia",
      url: "https://customerzsun.blob.core.windows.net/wtrl-zrl/sr20-r5-ZSUN.json",
    },
    {
      label: "Series - Cumulative time",
      url: "https://customerzsun.blob.core.windows.net/wtrl-zrl/sr20-yellow-jersey-ZSUN.json",
    },
    {
      label: "Series - Total points",
      url: "https://customerzsun.blob.core.windows.net/wtrl-zrl/sr20-green-jersey-ZSUN.json",
    },
  ],
  "19": [
    {
      label: "Race 1 - TTT - Hell of the North, France",
      url: "https://customerzsun.blob.core.windows.net/wtrl-zrl/sr19-r1-ZSUN.json",
    },
    {
      label: "Race 2 - Points - The Classic, Watopia",
      url: "https://customerzsun.blob.core.windows.net/wtrl-zrl/sr19-r2-ZSUN.json",
    },
    {
      label: "Race 3 - Scratch - Croissant, France",
      url: "https://customerzsun.blob.core.windows.net/wtrl-zrl/sr19-r3-ZSUN.json",
    },
    {
      label: "Race 4 - Points - Double Span Spin, New York",
      url: "https://customerzsun.blob.core.windows.net/wtrl-zrl/sr19-r4-ZSUN.json",
    },
    {
      label: "Series - Cumulative time",
      url: "https://customerzsun.blob.core.windows.net/wtrl-zrl/sr19-yellow-jersey-ZSUN.json",
    },
    {
      label: "Series - Total points",
      url: "https://customerzsun.blob.core.windows.net/wtrl-zrl/sr19-green-jersey-ZSUN.json",
    },
  ],
  "18": [
    {
      label: "Race 1 - TTT - Neon Shore Loop, Makuri Islands",
      url: "https://customerzsun.blob.core.windows.net/wtrl-zrl/sr18-r1-ZSUN.json",
    },
    {
      label: "Race 2 - Points - 2019 World's Harrogate Circuit, Yorkshire",
      url: "https://customerzsun.blob.core.windows.net/wtrl-zrl/sr18-r2-ZSUN.json",
    },
    {
      label: "Race 3 - Scratch - Countryside Tour, Makuri Islands",
      url: "https://customerzsun.blob.core.windows.net/wtrl-zrl/sr18-r3-ZSUN.json",
    },
    {
      label: "Race 4 - TTT - Roule Ma Poule, France",
      url: "https://customerzsun.blob.core.windows.net/wtrl-zrl/sr18-r4-ZSUN.json",
    },
    {
      label: "Race 5 - Points - Cobbled Climbs, Richmond",
      url: "https://customerzsun.blob.core.windows.net/wtrl-zrl/sr18-r5-ZSUN.json",
    },
    {
      label: "Race 6 - Scratch - Greatest London Loop, London",
      url: "https://customerzsun.blob.core.windows.net/wtrl-zrl/sr18-r6-ZSUN.json",
    },
    {
      label: "Series - Cumulative time",
      url: "https://customerzsun.blob.core.windows.net/wtrl-zrl/sr18-yellow-jersey-ZSUN.json",
    },
    {
      label: "Series - Total points",
      url: "https://customerzsun.blob.core.windows.net/wtrl-zrl/sr18-green-jersey-ZSUN.json",
    },
  ],
};

const FALLBACK_DATA: unknown[] = [
  {
    row: 1,
    route: "long",
    place: 99999,
    time: "00:00:00",
    "rider-name": "John Doe",
    "rider-flag": "USA",
    gender: "O",
    competition: "Open regular",
    league: "Cherry",
    division: "B1",
    "team-name": "Team A",
  },
];

const BASE_COLUMN_DEFS: ColumnDef[] = [
  { headerName: "row", field: "row", pinned: "left", type: "numericColumn", width: 60 },
  { headerName: "Name", field: "rider-name", pinned: "left", width: 150 },
  { headerName: "Team", field: "team-name", width: 150 },
  { headerName: "Div", field: "division" },
  { headerName: "Place", field: "place", type: "numericColumn" },
  { headerName: "Time", field: "time" },
  { headerName: "FAL", field: "rider-falrp" },
  { headerName: "FTS", field: "rider-ftsrp" },
  { headerName: "FIN", field: "rider-finrp" },
  { headerName: "BONUS", field: "rider-pbprp" },
  { headerName: "TOTAL", field: "rider-totrp" },
  { headerName: "Route", field: "route" },
  { headerName: "Gender", field: "gender" },
  { headerName: "Competition", field: "competition", width: 150 },
  { headerName: "League", field: "league" },
  { headerName: "Flag", field: "rider-flag" },
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
    appName: "WTRL Zwift Racing League app",
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
