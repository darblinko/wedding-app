// IMPORTANT: Don't make it .d.ts, as it will not work with an enum import
enum AssetIssueTypes {
  Temperature_Below = 1,
  Temperature_Above = 2,
  Temperature_NotReceived = 3,
  Humidity_Below = 4,
  Humidity_Above = 5,
  Humidity_NotReceived = 6,
}

export default AssetIssueTypes;