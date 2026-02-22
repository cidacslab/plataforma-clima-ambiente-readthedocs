##############################
MODIS Land Surface Temperature
##############################
Updated: 2026-02-21

.. contents::
   :local:
   :depth: 1

========================================
Introduction: What is MODIS LST?
========================================

Land Surface Temperature (LST) is a key variable for understanding the surface energy balance, urban heat islands, droughts and other climate‑related impacts. The Moderate Resolution Imaging Spectroradiometer (MODIS) sensors on board NASA’s **Terra** (launched in 1999) and **Aqua** (launched in 2002) satellites provide global LST observations with high temporal frequency and moderate spatial resolution, enabling detailed monitoring of surface thermal patterns at global and regional scales.

MODIS LST products are generated from thermal infrared measurements and distributed in different temporal aggregations:

* **Daily (overpass-based, clear-sky) products** – MOD11A1 (Terra) and MYD11A1 (Aqua),
* **8‑day composite products** – MOD11A2 (Terra) and MYD11A2 (Aqua).

These products include daytime and nighttime LST at **1 km spatial resolution**, organized in tiles in a sinusoidal projection and distributed in HDF‑EOS format, with subdatasets such as ``LST_Day_1km`` and ``LST_Night_1km`` and associated quality information. <sources>[1,5]</sources>

.. note::

   MODIS LST retrievals are primarily **clear-sky**: pixels/days affected by clouds may have missing
   or low-quality retrievals. Therefore, municipal means reflect conditions for available clear-sky
   observations and may not represent “all-weather” daily temperature. <sources>[5]</sources>

In this project, these four products were used to construct municipal‑level daily and 8‑day mean LST series (day, night and average) for all municipalities in continental Brazil.

===================================
How to access MODIS LST products
===================================

MODIS LST data are freely available through NASA and USGS platforms:

* `NASA Earthdata <https://earthdata.nasa.gov/>`_ – Central access point for MODIS products (Earthdata Login required).
* `LP DAAC (Land Processes Distributed Active Archive Center) <https://lpdaac.usgs.gov/>`_ – Official repository for MODIS land products, including the MOD11/MYD11 LST families. <sources>[1]</sources>
* `USGS Earth Explorer <https://earthexplorer.usgs.gov/>`_ – Graphical interface for search and download.

In this project, data were accessed programmatically via APIs, with authentication through Earthdata Login and spatial filtering for tiles intersecting Brazil.

================================================
MODIS LST products used in this project
================================================

The following four MODIS LST products (Collection 6.1, version 061) were used for Brazil:

.. list-table::
   :header-rows: 1
   :widths: 20 20 20 20 20
   :align: center

   * - Product
     - Platform
     - Temporal resolution
     - Pixel size
     - Main variables used
   * - MOD11A1
     - Terra
     - Daily
     - 1 km
     - LST_Day_1km, LST_Night_1km
   * - MYD11A1
     - Aqua
     - Daily
     - 1 km
     - LST_Day_1km, LST_Night_1km
   * - MOD11A2
     - Terra
     - 8‑day composite
     - 1 km
     - LST_Day_1km, LST_Night_1km
   * - MYD11A2
     - Aqua
     - 8‑day composite
     - 1 km
     - LST_Day_1km, LST_Night_1km

Key technical characteristics (common to these LST products) include: <sources>[1,5]</sources>

.. list-table::
   :header-rows: 1
   :widths: 30 70
   :align: center

   * - Field
     - Value
   * - File format
     - HDF‑EOS
   * - Map projection
     - Sinusoidal grid
   * - Geographic dimensions (per tile)
     - ~1200 km × 1200 km
   * - Spatial resolution
     - 1 000 m
   * - Spatial extent
     - Global (land areas)
   * - Native units
     - Kelvin (scaled)
   * - Scale factor
     - 0.02 (LST = stored value × 0.02)
   * - Temporal extent (Terra LST)
     - Late February 2000 onwards (availability depends on product and processing)
   * - Temporal extent (Aqua LST)
     - Early July 2002 onwards (availability depends on product and processing)

The HDF‑EOS files contain multiple subdatasets. For this project, only the LST subdatasets were used:

* ``LST_Day_1km`` – Daytime Land Surface Temperature,
* ``LST_Night_1km`` – Nighttime Land Surface Temperature.

==================================
Data Downloading (MODIS LST)
==================================

MODIS LST data for Brazil were obtained by:

* Authenticating with NASA Earthdata,
* Querying the MOD11A1, MYD11A1, MOD11A2 and MYD11A2 collections (version 061),
* Selecting all tiles whose spatial extent intersects the Brazilian territory,
* Downloading granules for the target period.

This process ensures that all daily and 8‑day LST observations covering continental Brazil are available locally for subsequent spatial aggregation, while avoiding duplication of previously downloaded files.

==================================
Data Processing (MODIS LST)
==================================

The processing workflow transforms global gridded LST products into municipal‑level time series in degrees Celsius (°C). The main steps are summarized below.

1. Subdataset extraction and reprojection
-----------------------------------------

For each downloaded HDF file:

* The LST subdatasets ``LST_Day_1km`` and ``LST_Night_1km`` are extracted.
* These subdatasets, originally gridded in the MODIS Sinusoidal projection and stored as scaled integers, are reprojected to the **WGS 84 geographic coordinate system (EPSG:4326)** to ensure compatibility with the Brazilian municipal boundaries and other geospatial datasets.
* The original pixel values (scaled Kelvin) are preserved during reprojection.

2. Temporal harmonization, gap filling and scaling
--------------------------------------------------

For each observation date and product:

* The scale factor **0.02** provided in the MODIS LST products is applied to convert stored integer values to **Kelvin**:

  .. math::

     LST\_{K} = DN \times 0.02

* **Gap filling using Terra + Aqua (same calendar date)**:

 * Terra and Aqua have different local overpass times; therefore, Terra/Aqua LST values are not the
    same physical observation time.
 * In this project, combining Terra and Aqua is used primarily to **increase spatial completeness**
    under cloud-driven missingness (i.e., to **fill gaps**) rather than to represent a true “daily mean”.
 * When both Terra and Aqua provide valid (good-quality) values for the same pixel/date, a **pixel-wise average** is computed; when only one platform provides a valid value, the available one is used.

.. note::

   Because of different overpass times and clear-sky sampling, any combined Terra+Aqua layer should be
   interpreted as a **coverage-enhanced composite** for that date (gap-filled), not as a 24-hour mean.

3. Municipal-level aggregation
-------------------------------

Using the official Brazilian municipal boundary layer (IBGE 2022, continental Brazil):

* For each date (daily or 8‑day composite) and for each LST field (day and night), the average LST is calculated within each municipal polygon.
* Pixels flagged as fill/nodata and pixels not meeting retrieval quality criteria (using the product quality information, e.g., QC layers) are excluded from the calculation.
* The resulting average LST in Kelvin is converted to **degrees Celsius**:

  .. math::

     LST\_{^\circ C} = LST\_{K} - 273.15

This procedure yields, for every municipality and date, an estimate of mean daytime and nighttime land surface temperature in degrees Celsius.

4. Aggregated products (day, night and mean)
--------------------------------------------

Based on the municipal averages, three types of LST metrics are produced:

* **Daytime LST (°C)** – Mean of ``LST_Day_1km`` within each municipality for each date;
* **Nighttime LST (°C)** – Mean of ``LST_Night_1km`` within each municipality for each date;
* **Mean LST (°C)** – For each date and municipality, the simple average of daytime and nighttime LST, when both are available.

These metrics are computed separately for:

* **Daily products** (derived from MOD11A1 and MYD11A1),
* **8‑day composites** (derived from MOD11A2 and MYD11A2).

==================================
Processing results: data structure
==================================

The processed MODIS LST dataset is provided as municipal‑level tables in CSV format. For each temporal aggregation (daily and 8‑day) and each temperature type, the general structure is:

* **Rows** – Municipalities in continental Brazil (IBGE 2022).
* **Columns**:
  * A column identifying the municipality (e.g., municipality name, and/or municipal code when joined),
  * One column per date (YYYY‑MM‑DD) containing the average LST for that municipality and date, in degrees Celsius (°C).

Separate tables are provided for:

* **Daytime LST** – Daily and 8‑day,
* **Nighttime LST** – Daily and 8‑day,
* **Mean LST (day–night average)** – Daily and 8‑day.

These tables can be linked to other municipal‑level datasets (e.g., health, socio‑economic, environmental indicators) using municipality identifiers to support integrated analyses of thermal exposure.

==================================
Conclusion
==================================

The MODIS LST dataset derived from the Terra and Aqua MOD11A1/MYD11A1 (daily) and MOD11A2/MYD11A2 (8‑day) products provides a long-term, high-frequency and spatially consistent description of land surface temperature across Brazilian municipalities. Through the processing steps described above, global LST products are transformed into municipal‑level time series of daytime, nighttime and mean LST in degrees Celsius.

This dataset can be used to:

* Characterize spatial and temporal patterns of surface temperature (e.g., heatwaves, urban heat islands),
* Link thermal exposure with health outcomes and socio‑environmental conditions,
* Integrate LST information with land use, atmospheric and socio‑economic datasets in epidemiological and environmental studies.

.. rubric:: References

.. [1] NASA LP DAAC. MODIS Land Surface Temperature and Emissivity (MOD11) – Product information [Internet]. U.S. Geological Survey; [cited 2025 Feb 15]. Available from: https://lpdaac.usgs.gov

.. [2] NASA Earthdata. MODIS Land Surface Temperature products – Access and documentation [Internet]. NASA; [cited 2025 Feb 15]. Available from: https://earthdata.nasa.gov

.. [3] USGS. MODIS Land Surface Temperature (LST) Version 6.1 – Product overview [Internet]. U.S. Geological Survey; [cited 2025 Feb 15]. Available from: https://lpdaac.usgs.gov/products

**Contributors**

.. list-table::
   :header-rows: 1
   :widths: 25 75
   :align: center

   * - Name
     - Affiliation
   * - Henrique Ferreira dos Santos
     - Center for Data and Knowledge Integration for Health (CIDACS), Instituto Gonçalo Moniz, Fundação Oswaldo Cruz, Salvador, Brazil
   * - José Vinicius Alves
     - Center for Data and Knowledge Integration for Health (CIDACS), Instituto Gonçalo Moniz, Fundação Oswaldo Cruz, Salvador, Brazil