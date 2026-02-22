####################
SRTM dataset
####################
Updated: 2026-02-21

.. contents::
   :local:
   :depth: 1

================================================
Introduction: What is SRTM?
================================================

The Shuttle Radar Topography Mission (SRTM) was a joint initiative of NASA and the National Geospatial-Intelligence Agency (NGA), conducted during an 11-day Space Shuttle mission in February 2000. Its primary objective was to acquire a near-global digital elevation model (DEM) of the Earth's land surface, using an interferometric synthetic aperture radar (InSAR) system.

SRTM produced one of the most complete and consistent global topographic datasets ever assembled, covering approximately 80% of the Earth's land surface between 60°N and 56°S latitude. The resulting elevation data are widely used in:

* Hydrological and drainage basin analysis,
* Terrain modeling and slope mapping,
* Natural disaster risk assessment (floods, landslides),
* Environmental and ecological studies,
* Urban planning and infrastructure development,
* Integration with remote sensing and land use datasets.

The SRTM data are freely available through NASA's Land Processes Distributed Active Archive Center (LP DAAC), which is part of the NASA Earthdata system.

================================================
How to access SRTM data
================================================

SRTM data can be accessed through different channels:

* The `NASA Earthdata Search portal <https://search.earthdata.nasa.gov/>`_ provides a graphical interface for searching, previewing and downloading SRTM tiles by geographic area and product version.
* The `LP DAAC Data Pool <https://lpdaac.usgs.gov/products/srtmgl1v003/>`_ provides direct access to SRTM files organized by geographic tile.
* The NASA Earthdata API allows programmatic and reproducible access to SRTM products using spatial and temporal filters.

Access requires a free NASA Earthdata Login account, available at `https://urs.earthdata.nasa.gov <https://urs.earthdata.nasa.gov>`_.

In this documentation, we focus on the **SRTMGL1 Version 3** product (SRTMGL1 v003), which provides global elevation data at 1 arc-second (~30 m) spatial resolution for the Brazilian territory.

================================================
SRTM product: summary
================================================

The SRTMGL1 Version 3 product used in this project has the following main characteristics:

.. list-table::
   :header-rows: 1
   :widths: 40 60
   :align: center

   * - Field
     - Value
   * - Product name
     - NASA Shuttle Radar Topography Mission Global 1 arc second (SRTMGL1)
   * - Product version
     - Version 3 (V003)
   * - Spatial resolution
     - 1 arc-second (~30 meters)
   * - Vertical datum
     - EGM96 geoid
   * - Horizontal datum
     - WGS 84
   * - Geographic coverage (this project)
     - Continental Brazil (approx. 74°W to 34°W, 34°S to 5°N)
   * - Acquisition period
     - February 11–22, 2000 (Space Shuttle mission STS-99)
   * - Native file format
     - HGT (height), distributed as ZIP archives
   * - Tile structure
     - 1° × 1° geographic tiles, one file per tile

The elevation values in the SRTMGL1 product represent terrain height above the EGM96 geoid, expressed in meters, stored as 16-bit signed integers.

.. note::

   SRTM Version 3 (also referred to as SRTM Plus) includes void-filled elevation data for areas where the original SRTM acquisition had data gaps, using auxiliary sources such as ASTER GDEM and PRISM data. This makes it more suitable for large-scale continuous analyses compared to earlier SRTM versions.

================================================
SRTM Data Downloading
================================================

The SRTM tiles covering continental Brazil were obtained from the NASA Earthdata system through the LP DAAC (Land Processes Distributed Active Archive Center). The data acquisition process:

* Searches for all SRTMGL1 v003 tiles that intersect the bounding box of continental Brazil (approximately 74°W to 34°W longitude, 34°S to 5°N latitude).
* Downloads all matching tiles in their native compressed format (ZIP archives), each containing one 1° × 1° elevation tile.

The resulting set of downloaded tiles provides complete coverage of the Brazilian territory at 1 arc-second (~30 m) spatial resolution.

================================================
SRTM Data Processing
================================================

The SRTM data processing workflow transforms the downloaded compressed elevation tiles into analysis-ready GeoTIFF raster files. The main processing steps are:

1. Extraction of elevation tiles
---------------------------------

Each downloaded ZIP archive is extracted to obtain the corresponding HGT (height) file. The HGT format is a binary raster format used by the SRTM products, where each file covers exactly 1° × 1° of geographic area and stores elevation values as 16-bit signed integers.

2. Conversion to GeoTIFF format
---------------------------------

Each HGT file is converted to GeoTIFF format, which is the standard raster format used in the processing pipeline for its broad compatibility with geospatial tools and libraries. During this conversion:

* The elevation values (16-bit signed integers, in meters) are preserved without modification.
* The original geographic coordinate system (WGS 84, geographic coordinates) is retained.
* The original spatial resolution (1 arc-second, approximately 30 m) is maintained.
* The geotransform (origin, pixel size) and projection metadata are transferred directly from the source HGT file to the output GeoTIFF.

The resulting GeoTIFF files are organized in a structured directory by tile, maintaining a one-to-one correspondence with the original HGT files and allowing direct spatial indexing by geographic coordinates.

3. Parallel processing
------------------------

To reduce processing time given the large number of tiles covering Brazil (approximately 900 tiles), the download, extraction and conversion steps are executed in parallel, with multiple tiles processed simultaneously. This parallelization does not affect the content or quality of the output files.

For further details on the data processing logic and reproducibility, please refer to the SRTM section of the `CIDACS GitHub repository <https://github.com/cidacslab/wclimate-data-processing/tree/main/srtm-data-processing>`_.

================================================
Processing results
================================================

The main output of the SRTM processing is a set of GeoTIFF raster files where:

* Each **file** corresponds to one 1° × 1° geographic tile covering part of the Brazilian territory.
* Pixel values represent **terrain elevation in meters** above the EGM96 geoid, stored as 16-bit signed integers.
* The spatial reference system is **WGS 84 geographic coordinates** (EPSG:4326).
* The spatial resolution is **1 arc-second (~30 m)**.

Together, these tiles provide a seamless, wall-to-wall elevation coverage of continental Brazil derived from the February 2000 SRTM acquisition. They can be mosaicked into a single national DEM or used tile-by-tile for local analyses.

These elevation data can be used to derive secondary topographic variables such as:

* Slope and aspect,
* Terrain ruggedness index,
* Hydrological catchment boundaries and flow accumulation,
* Topographic wetness index.

And can be integrated with other datasets (e.g., LULC, deforestation, climate) to support environmental, epidemiological and land management analyses at different spatial scales.

================================================
Conclusion
================================================

The SRTMGL1 Version 3 dataset provides a globally consistent, high-resolution and freely available source of elevation data for Brazil. By downloading, extracting and converting all tiles covering the Brazilian territory into analysis-ready GeoTIFF files, this processed dataset enables the integration of topographic information with health, environmental and socio-economic indicators at multiple spatial scales.

The workflow described here ensures:

* Transparent and reproducible access to NASA SRTM products.
* Standardized output format (GeoTIFF) for compatibility with geospatial tools.
* Complete spatial coverage of continental Brazil.

Researchers and public managers can use this dataset to characterize terrain conditions, support hydrological analyses and integrate topographic variables into epidemiological and environmental studies across Brazil.

.. rubric:: References

.. [1] NASA JPL. NASA Shuttle Radar Topography Mission Global 1 arc second (SRTMGL1), Version 3 [Internet]. NASA EOSDIS Land Processes DAAC; [cited 2025 Feb 15]. doi:10.5067/MEaSUREs/SRTM/SRTMGL1.003. Available from: https://lpdaac.usgs.gov/products/srtmgl1v003/

.. [2] NASA Earthdata. NASA Earthdata Search [Internet]. NASA; [cited 2025 Feb 15]. Available from: https://search.earthdata.nasa.gov/

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