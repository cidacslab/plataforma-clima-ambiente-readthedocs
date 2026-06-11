####################
CAMS datasets
####################
Updated: 2026-02-21

.. contents::
   :local:
   :depth: 2

================================================
Introduction: What is CAMS?
================================================

The Copernicus Atmosphere Monitoring Service (CAMS) provides detailed data and analyses on atmospheric composition and related environmental variables. It is part of the Copernicus Earth Observation Programme of the European Union and delivers global and regional datasets that support monitoring of:

* Air quality and atmospheric pollution,
* Greenhouse gas concentrations,
* Ozone layer dynamics,
* Aerosol optical properties,
* Other atmospheric conditions relevant to climate and public health research.

The CAMS global reanalysis product — **EAC4 (ECMWF Atmospheric Composition Reanalysis 4)** — is the fourth generation global reanalysis of atmospheric composition produced by the European Centre for Medium-Range Weather Forecasts (ECMWF). It combines model data with observations from across the world into a globally complete and consistent dataset, using data assimilation based on the laws of physics and chemistry. This approach produces temporally consistent three-dimensional atmospheric composition fields — including aerosols, reactive gases and greenhouse gases — from 2003 onwards. <sources>[1,4]</sources>

CAMS delivers data at different spatial resolutions and temporal scales, organized into two main categories of variables: **single-level** and **multi-level**.

Single-level variables
-----------------------

Single-level variables are surface-based or vertically integrated quantities that do not vary across atmospheric layers. They provide information on conditions at the Earth's surface or represent a single aggregated value over the full atmospheric column. Examples include surface concentrations of particulate matter (PM1, PM2.5, PM10).

Multi-level variables
----------------------

Multi-level variables are defined across multiple vertical layers of the atmosphere, from the surface up to the stratosphere (60 model levels, also interpolated to 25 pressure levels). They are essential for characterizing processes that occur at different altitudes, such as vertical transport, chemical transformations and mixing of trace gases and aerosols. Examples include concentrations of carbon monoxide (CO), nitrogen monoxide (NO) and ozone (O₃). <sources>[1]</sources>

Further information about the CAMS EAC4 reanalysis is available at the `CAMS EAC4 dataset page <https://ads.atmosphere.copernicus.eu/datasets/cams-global-reanalysis-eac4?tab=overview>`_.

================================================
How to access CAMS data
================================================

CAMS provides free access to its datasets through different channels:

* The `CAMS Atmosphere Data Store (ADS) <https://ads.atmosphere.copernicus.eu/>`_ portal, which offers interactive access, data visualization and download tools.
* Application Programming Interfaces (APIs), which allow programmatic and reproducible retrieval of specific variables, time periods and spatial domains.
* Direct download services integrated with the ADS, enabling batch retrieval of large datasets.

In this documentation, we focus on the CAMS global reanalysis product (EAC4), which was used to obtain atmospheric composition variables for Brazil over the period **2003 to 2022**.

================================================
CAMS variables: summary
================================================

The CAMS EAC4 reanalysis provides a broad set of atmospheric variables at global scale. In this project, the following variables were retrieved and processed:

Single-level variables
-----------------------

.. list-table::
   :header-rows: 1
   :widths: 40 15 45
   :align: center

   * - Name
     - Units
     - Standard name
   * - Particulate matter d < 1 µm (PM1)
     - kg/m³
     - Mass concentration of pm1 ambient aerosol particles in air
   * - Particulate matter d < 2.5 µm (PM2.5)
     - kg/m³
     - Mass concentration of pm2p5 ambient aerosol particles in air
   * - Particulate matter d < 10 µm (PM10)
     - kg/m³
     - Mass concentration of pm10 ambient aerosol particles in air

Multi-level variables
----------------------

.. list-table::
   :header-rows: 1
   :widths: 40 15 45
   :align: center

   * - Name
     - Units
     - Standard name
   * - Carbon monoxide (CO)
     - kg/kg
     - Mass fraction of carbon monoxide in air
   * - Nitrogen monoxide (NO)
     - kg/kg
     - Mass fraction of nitrogen monoxide in air
   * - Ozone (O\ :sub:`3`)
     - kg/kg
     - Mass fraction of ozone in air

Data description
-----------------

.. list-table::
   :header-rows: 1
   :widths: 40 60
   :align: center

   * - Field
     - Value
   * - Horizontal resolution
     - ~80 km (0.75° × 0.75°)
   * - Vertical coverage
     - Surface, total column, 60 model levels and 25 pressure levels
   * - Temporal coverage
     - 2003 to 2022
   * - Native temporal resolution
     - 3-hourly (00h; 03h; 06h; 09h; 12h; 15h; 18h; 21h)
   * - File format
     - NetCDF (converted from GRIB)
   * - Update frequency
     - Twice a year, with a 4–6 month delay

================================================
CAMS Data Downloading
================================================

The CAMS EAC4 reanalysis data were obtained through the Atmosphere Data Store (ADS) API, which enables programmatic and reproducible access to specific variables, time periods and spatial domains. Both single-level and multi-level variables were retrieved via this interface.

The datasets used in this project cover:

* **2003 to 2022** – Annual series of atmospheric composition variables for Brazil, at approximately 80 km horizontal resolution and 3-hourly temporal resolution.

The data are distributed in NetCDF format (converted from the native GRIB format), organized locally by variable type (single-level or multi-level) and year. These files serve as the basis for all subsequent processing steps.

For further details on the data access procedure, please refer to the `CAMS CIDACS GitHub repository <https://github.com/cidacslab/wclimate-data-processing/tree/main/ecmwf-eac4-data-processing>`_.

================================================
CAMS Data Processing
================================================

The CAMS data processing workflow transforms gridded atmospheric reanalysis fields into **daily municipal-level time series** for all municipalities in continental Brazil. The workflow comprises two main steps.

**1. Pre-processing of NetCDF files**

Each downloaded NetCDF file contains gridded atmospheric data on a global regular grid (0.75° × 0.75°, approximately 80 km) with 3-hourly temporal resolution. The pre-processing involves:

* **Coordinate conversion** – The original longitude grid ranges from 0° to 360°. Longitudes are rescaled to the conventional range of −180° to 180° to ensure spatial consistency with Brazilian municipal boundary datasets and other geospatial layers used in the project.

* **Temporal resampling** – The 3-hourly values (00h, 03h, 06h, 09h, 12h, 15h, 18h and 21h) are aggregated into **daily averages** for each grid point. The resulting daily fields serve as input for the spatial extraction step.

**2. Extraction of municipal-level time series**

Daily average fields are spatially associated with all municipalities in continental Brazil. Because the CAMS grid (~80 km resolution) is considerably coarser than Brazilian municipal boundaries, the spatial relationship between grid points and municipalities varies. Three approaches are applied:

1. **Municipality intersected by a single grid point** – The value of the intersecting grid point is directly assigned to the municipality for that day.

2. **Municipality intersected by multiple grid points** – The spatial mean of all intersecting grid points is computed and assigned as the municipal daily value.

3. **Municipality not intersected by any grid point** – The value of the nearest grid point (identified by minimum geodesic distance) is used as a proxy for the municipal value.

This procedure generates, for each variable and each day, a single representative value per municipality, covering all municipalities in continental Brazil. Multiple variables are processed simultaneously to optimize computational efficiency.

For further details on the processing steps, see the `CAMS CIDACS GitHub repository <https://github.com/cidacslab/wclimate-data-processing/tree/main/ecmwf-eac4-data-processing>`_.

================================================
Processing results
================================================

The main output of the CAMS processing is a set of tabular datasets in CSV format, one per atmospheric variable, structured as follows:

* **Columns** – Municipal codes according to the IBGE classification, identifying each Brazilian municipality.
* **Rows** – Sequential days from **2003 to 2022**, where each row corresponds to a calendar date and contains the daily average value of the variable for every municipality.

This structure allows direct integration with other municipal-level datasets (e.g., health records, socio-economic indicators, land use data) using the IBGE municipal code as the linking key.

Missing values may occur where grid coverage or data availability is limited for a given period.

================================================
Conclusion
================================================

The CAMS EAC4 reanalysis dataset provides a consistent and long-term record of atmospheric composition variables at global scale, enabling the characterization of air quality and atmospheric exposure conditions across Brazilian municipalities from 2003 to 2022. By transforming gridded reanalysis fields into daily municipal-level time series, this processed dataset supports integration of atmospheric data with health, environmental and socio-economic indicators.

The workflow described here ensures:

* Transparent and reproducible access to CAMS reanalysis products.
* Harmonized spatial units (municipalities) for integration with other datasets.
* A flexible structure to extend the time series as new CAMS reanalysis years become available.

Researchers and public managers can use this dataset to assess atmospheric exposure, support epidemiological analyses and evaluate the impact of air quality on public health outcomes across Brazil.

.. rubric:: References

.. [1]  Copernicus Atmosphere Monitoring Service (CAMS). Copernicus Atmosphere Monitoring Service – Overview [Internet]. European Union; [cited 2025 Feb 15]. Available from: https://atmosphere.copernicus.eu/

.. [2] Copernicus Atmosphere Monitoring Service (CAMS). CAMS Global Reanalysis (EAC4) [Internet]. European Centre for Medium-Range Weather Forecasts (ECMWF); [cited 2025 Feb 15]. Available from: https://ads.atmosphere.copernicus.eu/datasets/cams-global-reanalysis-eac4

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


