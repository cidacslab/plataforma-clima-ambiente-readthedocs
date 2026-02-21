####################
MapBiomas datasets
####################
Updated: 2025-02-15

.. contents::
   :local:
   :depth: 3

=================================
Introduction: What is MapBiomas?
=================================

MapBiomas is a collaborative initiative focused on mapping and monitoring land use and land cover (LULC) and related processes (such as deforestation and secondary vegetation regeneration) over large temporal and spatial scales. It brings together universities, NGOs, research institutes and technology companies that work jointly to produce annual maps for Brazil and other regions in South America, using satellite imagery and machine learning methods.

The main goal of MapBiomas is to provide consistent, comparable and long-term series of land use and land cover data, supporting:

* Environmental management and land use planning,
* Climate change and ecosystem studies,
* Biodiversity conservation,
* Evaluation and formulation of public policies.

Through its collections, it is possible to analyze historical processes such as deforestation, agricultural expansion, pasture dynamics, urbanization, mining and water surface changes across Brazilian biomes.

=============================
How to access MapBiomas data
=============================

MapBiomas data for Brazil can be accessed through different channels:

* The `MapBiomas Brazil portal <https://brasil.mapbiomas.org/>`_ provides access to the collections, including interactive maps, summary statistics and download links for different thematic products (e.g., LULC, deforestation, secondary vegetation, agriculture, fire, mining, water, soil, urban areas).
* The products are hosted on Google Earth Engine (GEE), which allows programmatic access to the raster collections.
* In some cases, tiles and mosaics are also available via cloud storage and direct download services.

In this documentation, we focus on two MapBiomas datasets that were processed at the municipal level:

* Annual Land Use and Land Cover (LULC) maps.
* Annual Deforestation and Secondary Vegetation maps.

===========================================
MapBiomas Land Use and Land Cover (LULC)
===========================================

Overview of MapBiomas LULC
---------------------------

The MapBiomas Brazil Collection of Land Use and Land Cover provides annual categorical maps from 1985 onwards. These maps are generated primarily from:

* Landsat imagery at 30-meter spatial resolution, and
* Sentinel‑2 imagery at 10-meter resolution for specific themes and periods (beta products).

Each pixel in the LULC maps is assigned an integer code corresponding to a land use or land cover class (e.g., forest, savanna, pasture, agriculture, urban area, mining, water), according to a standardized legend that remains consistent across the time series. This allows:

* Temporal comparisons of LULC at multiple spatial scales,
* Construction of transition matrices (e.g., forest → pasture, pasture → agriculture),
* Integration with other environmental and socio-economic datasets.

The official description of the LULC methodology, classification legend and processing pipeline is available at the `MapBiomas LCLU Methodology <https://brasil.mapbiomas.org/metodo_cobertura_e_uso/>`_.

LULC data coverage used in this project
----------------------------------------

The LULC datasets used here cover:

* **1985 to 2022** – Annual LULC maps generated using Landsat satellite imagery, at 30 m spatial resolution.
* **2016 to 2022** – Annual LULC maps generated using Sentinel‑2 satellite imagery, at 10 m spatial resolution (beta products, for specific themes and regions).

These datasets correspond to the MapBiomas LULC collections current at the time of processing (e.g., Collections 8, 10, 10.1), which incorporate successive improvements in classification and validation.

LULC Data Downloading
---------------------------------

MapBiomas LULC data were obtained through automated procedures that periodically check the official MapBiomas data services for:

* The availability of new LULC collections or versions (identified by collection and version numbers), and
* The inclusion of newly processed years in existing collections.

The datasets used in this project cover:

* **1985 to 2022** – 30 m LULC mosaics for all of continental Brazil (Landsat-based).
* **2016 to 2022** – 10 m LULC mosaics for all of continental Brazil (Sentinel‑2-based, beta).

Whenever a new collection with significant methodological advances becomes available, the full series of annual LULC maps is updated locally to maintain internal consistency. When only additional years are released within the same collection, only the new years are incorporated. This ensures that the local archive of LULC data is synchronized with the most recent MapBiomas releases while avoiding unnecessary duplication.

The downloaded data are stored as national mosaics (one categorical raster per year and per spatial resolution), organized by collection and year. These mosaics are the basis for all municipal-level processing.

LULC Data Processing
--------------------------------

After downloading, the LULC maps underwent processing to extract area information for each land use and land cover class (in square kilometers) at the municipality level, for all municipalities in continental Brazil.

.. note::

   The municipality of Fernando de Noronha was excluded from the processing because it does not have information about LULC in the MapBiomas dataset.

The main processing steps are:

1. Subdividing maps by municipality
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

For each year and spatial resolution (30 m and 10 m), the national LULC mosaic for continental Brazil is intersected with an official municipal boundary layer (5,571 municipalities). Each municipal polygon is used to clip the corresponding portion of the national raster, generating a municipal‑scale LULC subset.

This step produces, for every combination of municipality and year, a raster containing only the pixels within the municipal boundary, with their original LULC class codes preserved.

2. Reprojecting coordinate systems
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Each municipality‑level LULC raster is reprojected from the WGS 84 Geographic Coordinate System (GCS) to the WGS 84 Universal Transverse Mercator (UTM) projected coordinate system. The reprojection to UTM is necessary to:

* Express pixel size in meters,
* Derive pixel area in square meters,
* Support accurate area calculations by LULC category.

The pixel resolution after reprojection is used to determine the area of each pixel and, consequently, the total area per class inside each municipal polygon.

3. Calculating LULC class areas
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

For each municipality and year, the area of each LULC class is calculated by:

* Counting the number of pixels belonging to each land use and land cover category within the municipal boundary, and
* Converting these counts into areas using the pixel area obtained from the UTM‑projected rasters.

The result is expressed in square kilometers (km²). This computation relies on standard geospatial zonal statistics procedures applied to categorical rasters and polygon boundaries.

For further details on the data processing logic and reproducibility, please refer to the MapBiomas LULC section of the `CIDACS GitHub repository <https://github.com/cidacslab/wclimate-data-processing/tree/main/mapbiomas-data-processing>`_.

LULC Processing results
------------------------

The main output of the LULC processing is a tabular dataset in CSV format (columns separated by ``;``), where:

* Each **row** corresponds to a municipality in Brazil and a given year.
* Each **column** represents either:
  * Identification fields (e.g., municipal code, year), or
  * The area (km²) associated with a specific Land Cover and Land Use category.

The Land Cover and Land Use categories and their identifiers follow the **New Id** column defined in the official `MapBiomas LCLU classification <https://brasil.mapbiomas.org/metodo_cobertura_e_uso/>`_. Rows without values in a given category indicate that the corresponding class was not present in that municipality, considering the spatial resolution and mapping scale of the products.

In addition to the tabular outputs, geospatial raster files (GeoTIFF) are maintained for each municipality and year, containing the clipped and reprojected LULC rasters. These rasters are used for visualization, validation and any additional spatial analyses that require pixel‑level information.

================================================
MapBiomas Deforestation and Secondary Vegetation
================================================
Updated: 2025-02-15

Overview of the Deforestation and Secondary Vegetation module
-------------------------------------------------------------

The MapBiomas Deforestation and Secondary Vegetation module provides detailed annual information on deforestation and the regeneration of secondary vegetation across Brazilian biomes. It is derived from the MapBiomas Land Use and Land Cover (LULC) time series and uses the same remote sensing and machine learning framework, adapted to detect forest and non‑forest vegetation suppression and subsequent regrowth.

This module is designed to characterize:

* When and where deforestation occurs,
* The type and intensity of deforestation classes for each year,
* The spatial and temporal patterns of secondary vegetation regrowth after clearing.

The datasets cover regions such as the Amazon, Cerrado, Atlantic Forest, Savanna formations and other Brazilian biomes, enabling the analysis of ecosystem degradation and recovery at multiple spatial scales. Methodological details are documented in the `MapBiomas Deforestation and Secondary Vegetation methodology <https://brasil.mapbiomas.org/metodo-desmatamento/>`_.

Deforestation and Secondary Vegetation data coverage
----------------------------------------------------

The deforestation and secondary vegetation datasets used in this project consist of annual raster maps in GeoTIFF format, covering all continental Brazil with **30 m spatial resolution**. They are derived from the MapBiomas LULC series and follow the official deforestation module legend.

The temporal coverage is:

* **1987 to 2021** – Annual deforestation maps (suppression of forests and natural non‑forest vegetation),
* **1987 to 2021** – Associated information on secondary vegetation, representing regrowth stages after previous clearing.

Each annual GeoTIFF:

* Covers the full extent of continental Brazil,
* Has pixels classified according to deforestation and secondary vegetation classes,
* Uses classification codes consistent with the MapBiomas deforestation legend (e.g., classes in the 1xx, 2xx, …, 8xx ranges that combine deforestation type and land cover/use).

Deforestation and Secondary Vegetation Data Downloading
----------------------------------------------------------

The deforestation and secondary vegetation maps were obtained from the official MapBiomas deforestation module for all available years (1987–2021). The data acquisition process:

* Downloads the annual GeoTIFF files for each year in the series,
* Ensures that the local archive contains one full‑coverage deforestation map per year for Brazil at 30 m resolution,
* Follows the same versioning logic as the LULC products:
  * New versions of the deforestation products (e.g., updated collections) trigger a full refresh of the local archive,
  * Newly released years are incrementally added to the existing series.

The GeoTIFF files are stored in a structured directory by year, facilitating batch processing and reproducibility.

Deforestation and Secondary Vegetation Data Processing
-------------------------------------------------------

The objective of the processing is to transform national‑scale deforestation rasters into municipal‑level statistics, expressing the area of each deforestation and secondary vegetation class (in km²) for all Brazilian municipalities.

.. note::

   The municipality of Fernando de Noronha was excluded from the processing because it does not have Land Use and Land Cover or deforestation information in the MapBiomas dataset.

The processing workflow can be summarized in three main steps:

1. Subdivision of annual mosaics by municipality
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

For each year from 1987 to 2021:

* The national deforestation/secondary vegetation raster (30 m, GeoTIFF) is intersected with the official Brazilian municipal boundaries (5,571 municipalities).
* For each municipality, the portion of the raster within its boundary is identified, and pixel values are extracted for that polygon.

This step associates every deforestation pixel and secondary vegetation pixel with exactly one municipality and one year.

2. Reprojection and pixel area definition
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Deforestation rasters are originally referenced in WGS 84 geographic coordinates (GCS). For accurate area calculations, the data are handled in a way that ensures:

* Correct determination of pixel resolution in meters (derived from the underlying MapBiomas processing, which uses Landsat imagery at 30 m),
* Consistent treatment of area across municipalities and years.

Where necessary, reprojection from WGS 84/GCS to WGS 84/UTM is performed to:

* Express pixel dimensions in meters,
* Allow calculation of pixel area (in km²) to convert pixel counts into area.

The geodetic parameters (e.g., UTM zones, EPSG codes) used for each municipality are obtained from a dedicated geodesic parameter table, ensuring that each municipal area is associated with the appropriate projected coordinate system.

3. Calculation of class areas
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

For each municipality and year, the area of each deforestation and secondary vegetation class is calculated as follows:

* All pixels within the municipal boundary are grouped by deforestation/secondary vegetation class code.
* For each class, the total number of pixels is multiplied by the area of a single pixel (30 m × 30 m, expressed in km²).
* The resulting value corresponds to the territorial extension (in square kilometers) of that deforestation or secondary vegetation class in that municipality and year.

These computations are equivalent to applying zonal statistics on categorical rasters, using municipal polygons as zones and class codes as categories.

The process is optimized to handle multiple years and rasters efficiently (e.g., using parallel processing in high‑performance computing environments), but the final products are independent of the implementation details and strictly describe the municipal‑level areas per deforestation class.

Deforestation and Secondary Vegetation Processing results
----------------------------------------------------------

The main outputs of the deforestation and secondary vegetation processing are:

* **CSV files (tabular data)** – One or more CSV files where:
* * Each **row** corresponds to a municipality and year.
  * Columns include:
  * * Municipality code (e.g., CD_MUN),
    * Pixel area (PIXEL_AREA, in km², i.e. the area of a single raster pixel),
    * A set of columns representing deforestation/secondary vegetation classes (e.g., 1xx, 2xx, …, 8xx), where each column stores the area (km²) of that class in the municipality for that year.

The class codes (1xx, 2xx, …, 8xx) correspond to combinations of deforestation categories and land cover/use, as defined in the official MapBiomas deforestation legend. Only codes below 700 are typically retained, as they represent valid deforestation classes according to the MapBiomas methodology.

For further details on the data processing logic and reproducibility, including code examples and pipeline implementation, please refer to the deforestation MapBiomas section of the `CIDACS GitHub repository <https://github.com/cidacslab/wclimate-data-processing/tree/main/deforestation-mapbiomas-data-processing>`_.

===========
Conclusion
===========

MapBiomas provides a unique, long-term and consistent set of datasets describing land use and land cover, deforestation and secondary vegetation for Brazil, based on remote sensing and machine learning techniques. By processing these national-scale products into municipal-level area summaries, it becomes possible to integrate land use change information with health, environmental and socio-economic datasets in a systematic manner.

The workflows described here ensure:

* Transparent and reproducible use of MapBiomas products.
* Harmonized spatial units (municipalities) for integration with other datasets.
* A flexible structure to update the data when new MapBiomas collections are released.

Researchers and public managers can use these processed datasets to evaluate land use dynamics, monitor environmental change and support evidence-based public policies across Brazilian biomes.

===========
References
===========

.. [1] MapBiomas. MapBiomas Project – Land Use and Land Cover Mapping in Brazil [Internet]. Brazil: MapBiomas; [cited 2025 Feb 15]. Available from: https://brasil.mapbiomas.org/

.. [2] MapBiomas. MapBiomas Brazil – Land Use and Land Cover Mapping Methodology [Internet]. Brazil: MapBiomas; [cited 2025 Feb 15]. Available from: https://brasil.mapbiomas.org/metodo_cobertura_e_uso/

.. [3] MapBiomas. MapBiomas Deforestation and Secondary Vegetation – Methodology [Internet]. Brazil: MapBiomas; [cited 2025 Feb 15]. Available from: https://brasil.mapbiomas.org/metodo-desmatamento/

=============
Contributors
=============

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
