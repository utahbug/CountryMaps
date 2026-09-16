# Africa practice subsets

Primary regions use the existing UN M49-based assignments in `lib/regions.mjs`, with each of the 54 countries assigned exactly once. `lib/practice-subsets.mjs` defines reusable ID-only learning subsets; these never duplicate the country manifest or geometry.

- Islands (6): Cabo Verde, Comoros, Madagascar, Mauritius, São Tomé and Príncipe, Seychelles.
- Small countries (16): The Gambia, Togo, Benin, Rwanda, Burundi, Djibouti, Eswatini, Lesotho, Malawi, Cabo Verde, Comoros, Mauritius, Seychelles, São Tomé and Príncipe, Equatorial Guinea, Guinea-Bissau.

Islands means geographically island countries, not UN Small Island Developing States (which includes mainland Guinea-Bissau and excludes Madagascar). Verified against the existing canonical geography and the island-country grouping in the UN Economic Commission for Africa statistical publication: https://digitallibrary.un.org/record/583399/files/12103.pdf . No dependencies or disputed areas are included.

Small countries is an explicit practical learning set, not a land-area ranking; edit its IDs as teaching needs change. Filtering affects only the piece tray, never the 54-country engine, geometry or score. Reset retains the chosen filter but clears all placements. Answer preview and return retain the filter and placements. Subset progress includes completed pieces; total progress always counts all 54 countries.
