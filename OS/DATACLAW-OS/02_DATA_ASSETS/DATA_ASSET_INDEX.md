# Data Asset Index

## Purpose
To serve as a master directory of all core data assets within the DataClaw OS. This provides a single point of reference for understanding what data we own, its status, and who is responsible for it.

## Required Fields
- `Asset ID`: A unique identifier for the data asset.
- `Asset Name`: The human-readable name of the asset.
- `Description`: A brief explanation of the data it contains.
- `Owner`: The agent or role responsible for its integrity.
- `Status`: On Track / Needs Attention / Stale.
- `Record Count`: The number of records in the asset.
- `Last Updated`: The date of the last significant update.

## AI Usage Rules
- The `Librarian Agent` is responsible for keeping this index updated.
- AI can be used to automatically update the `Record Count` and `Last Updated` fields after a research pipeline completes.
- AI can flag assets where `Last Updated` is more than 30 days ago and change the `Status` to "Stale" for review.

## Practical Template
| Asset ID | Asset Name | Description | Owner | Status | Record Count | Last Updated |
|---|---|---|---|---|---|---|
| DA-001 | Company Database | Core firmographic data on companies we track. | `Librarian Agent` | 🟢 On Track | 1,250 | {{DATE}} |
| DA-002 | Brand Database | Data on specific consumer and B2B brands. | `Librarian Agent` | 🟢 On Track | 3,400 | {{DATE}} |
| DA-003 | Product Database | SKU-level data on products, including features and specs. | `Librarian Agent` | 🟡 Needs Attention| 10,500 | {{DATE-7}} |
| DA-004 | Retail Database | Data on physical and online retail locations. | `Librarian Agent` | 🔴 Stale | 800 | {{DATE-35}}|
| DA-005 | Trend Database | A registry of macro and micro trends being tracked. | `Analyst Agent` | 🟢 On Track | 150 | {{DATE-1}} |
| DA-006 | Funding Database| A log of all venture capital and funding events. | `Librarian Agent` | 🟢 On Track | 450 | {{DATE-2}} |
| DA-007 | Pricing Database | A time-series database of product pricing information. | `Scout Agent` | 🟡 Needs Attention| 25,000 | {{DATE-15}}|
| DA-008 | Source Registry| A master list of all information sources and their quality scores. | `Validator Agent`| 🟢 On Track | 600 | {{DATE-3}} |

## Success Metrics
- `Asset Coverage`: The percentage of priority markets that have corresponding data assets with >1000 records.
- `Asset Freshness`: The average number of days since an asset was last updated. (Lower is better).
- `Asset Usage`: The number of intelligence products that are generated using a specific data asset per quarter.
