###########################################
ANA datasets
###########################################

Updated: 2026-06-10

.. contents::
   :local:
   :depth: 3

*******************
ANA gauges stations
*******************

Introduction
============

This documentation technically describes how the registration data of hydrological stations made available by the National Water and Basic Sanitation Agency (ANA) are obtained, processed, and structured. The information is accessed directly through the public API of the ServiceANA system, available in `ServiceANA <https://telemetriaws1.ana.gov.br/ServiceANA.asmx>`_, through the `HidroInventário <https://telemetriaws1.ana.gov.br/ServiceANA.asmx?op=HidroInventario>`_ section. The developed algorithm sends HTTP GET requests, interprets the XML response, standardizes fields, corrects inconsistencies, and organizes the data into structured files, ensuring repeatability and data quality in the processing of both streamflow stations (stage/discharge) and rainfall stations (precipitation).

To download the detailed information for each station, it was first necessary to identify all stations registered in the system, since the individual code of each station is mandatory in the requests. Therefore, before collecting the specific data for the two station types considered, the script performs an initial scan of the complete inventory through automated requests, applying techniques for extraction and programmatic reading of the content returned by the API. This preliminary survey underpins the entire workflow for obtaining the registration data.



List of stations registered by the ANA
======================================

The ANA system contains records of different categories of hydrometeorological stations, including Telemetric Stations — automatic stations with real-time remote data transmission — and Conventional Stations, which rely on manual measurements performed by observers and hydrology technicians. To identify all available stations, the survey was based on the complete listing provided by the `HidroInventário <https://telemetriaws1.ana.gov.br/ServiceANA.asmx?op=HidroInventario>`_ [1]_ [2]_, which includes both conventional and telemetric stations and centralizes the registration information required for data processing.

In addition to providing the complete list of stations, the HidroInventário supplies attributes that allow the calculation of the start date of operation for each unit, an essential piece of information to determine which stations have a minimum operational history and, therefore, have their data organized and prepared for subsequent download attempts. This pre-processing step ensures that only stations with sufficient operational time are considered in the data collection workflow.

.. note::

  Only stations with a start of operation on or before 01/01/2024 were considered, ensuring that each station has at least one potential year of complete data, taking 31/12/2024 as the final reference date.



Syntax and requests
-------------------

Access to the station inventory is performed through HTTP GET requests sent to the **HidroInventario** *endpoint*. Each request accepts parameters that act as optional filters: when a parameter is left blank, the service returns all compatible stations. The script automates the construction of these URLs, handles retries in case of failures, applies pauses to avoid server overload, and can perform both nationwide queries and queries by state (UF). The main accepted parameters are:

- ``codEstDE``: Initial code of the station range (8 digits).
- ``codEstATE``: Final code of the station range (8 digits).
- ``tpEst``: Station type (``1`` = streamflow; ``2`` = rainfall).
- ``nmEst``: Station name.
- ``nmRio``: Name of the monitored river.
- ``codSubBacia``: Sub-basin code.
- ``codBacia``: Basin code.
- ``nmMunicipio``: Municipality name.
- ``nmEstado``: State name.
- ``sgResp``: Acronym of the responsible agency.
- ``sgOper``: Acronym of the operating agency.
- ``telemetrica``: Indicates active telemetry (``1`` = yes; ``0`` = no).

These filters form the basis for reconstructing the national inventory with accuracy and flexibility.

To ensure query stability, the algorithm performs requests by state (UF), using the ``nmEstado`` parameter written in full and with the exact spelling registered by ANA (for example, BAHIA). This information is combined with the desired station type (``tpEst`` = 1 or 2), so that the service returns all stations of that type within the requested state. This strategy avoids freezes and empty responses caused by API inconsistencies and allows the complete inventory to be collected in a safe and systematic manner.



Configuration and auxiliary functions
=====================================

Before data collection, the script defines the official ANA `endpoint <https://telemetriaws1.ana.gov.br/ServiceANA.asmx/HidroInventario>`_, along with a set of auxiliary functions responsible for handling the returned content. These include routines to extract values from XML tags, convert numbers received as text, parse dates in different formats, and correct coordinates that are returned without a decimal point or that present values outside the limits of Brazilian territory. These functions form the foundation of the pipeline, allowing the data to be processed in a stable and automated manner regardless of variations in the response formats provided by the API.

The inventory registration fields for ANA stations (Types 1 and 2) consist of a fixed set of fields representing operational metadata, including location (state, municipality, watershed), operator attributes, types of instruments installed, installation and removal dates, operational status, and other related information. The script maintains a single, consolidated list of all these field names, ensuring that each station is registered using the same structure and that different queries return mutually compatible tables.


.. note::

  The data dictionary for the variables present in the complete ANA registration listing will be made available at a later stage, after confirmation with ANA regarding the description of certain variables for which no documentation could be identified.



.. _candidate-start-end-dates-gauges:

Candidate start and end dates of operation
==========================================

The returned data include multiple columns indicating the start and end times of operation for specific instruments (rain gauges, water level recorders, telemetric sensors, among others). Since these components may be installed at different times, the script identifies, for each station type, which columns should be taken into account. It then computes the earliest available date as the station start date and the latest available date as the end date. This procedure standardizes the station's operational period even when ANA does not provide this information in a consolidated form.

To derive the start and end dates of operation for each station type, the following variables were used:

.. raw:: html

   <table style="width:100%; border-collapse:collapse; font-family:monospace; font-size:0.85em;">
     <thead>
       <tr>
         <th colspan="2"
             style="background:#2c5f8a; color:#fff; text-align:center;
                    padding:8px; border:1px solid #ccc;">
           Streamflow stations (Type 1)
         </th>
         <th style="width:24px; border:none; background:#fff;"></th>
         <th colspan="2"
             style="background:#2c5f8a; color:#fff; text-align:center;
                    padding:8px; border:1px solid #ccc;">
           Rainfall stations (Type 2)
         </th>
       </tr>
       <tr>
         <th style="background:#d6e4f0; text-align:center;
                    padding:6px; border:1px solid #ccc;">Start dates</th>
         <th style="background:#d6e4f0; text-align:center;
                    padding:6px; border:1px solid #ccc;">End dates</th>
         <th style="border:none; background:#fff;"></th>
         <th style="background:#d6e4f0; text-align:center;
                    padding:6px; border:1px solid #ccc;">Start dates</th>
         <th style="background:#d6e4f0; text-align:center;
                    padding:6px; border:1px solid #ccc;">End dates</th>
       </tr>
     </thead>
     <tbody>
       <tr>
         <td style="padding:5px 8px; border:1px solid #ccc;"><code>PeriodoEscalaInicio</code></td>
         <td style="padding:5px 8px; border:1px solid #ccc;"><code>PeriodoEscalaFim</code></td>
         <td style="border:none;"></td>
         <td style="padding:5px 8px; border:1px solid #ccc;"><code>PeriodoPluviometroInicio</code></td>
         <td style="padding:5px 8px; border:1px solid #ccc;"><code>PeriodoPluviometroFim</code></td>
       </tr>
       <tr style="background:#f7f7f7;">
         <td style="padding:5px 8px; border:1px solid #ccc;"><code>PeriodoRegistradorNivelInicio</code></td>
         <td style="padding:5px 8px; border:1px solid #ccc;"><code>PeriodoRegistradorNivelFim</code></td>
         <td style="border:none;"></td>
         <td style="padding:5px 8px; border:1px solid #ccc;"><code>PeriodoRegistradorChuvaInicio</code></td>
         <td style="padding:5px 8px; border:1px solid #ccc;"><code>PeriodoRegistradorChuvaFim</code></td>
       </tr>
       <tr>
         <td style="padding:5px 8px; border:1px solid #ccc;"><code>PeriodoDescLiquidaInicio</code></td>
         <td style="padding:5px 8px; border:1px solid #ccc;"><code>PeriodoDescLiquidaFim</code></td>
         <td style="border:none;"></td>
         <td style="padding:5px 8px; border:1px solid #ccc;"><code>PeriodoTelemetricaInicio</code></td>
         <td style="padding:5px 8px; border:1px solid #ccc;"><code>PeriodoTelemetricaFim</code></td>
       </tr>
       <tr style="background:#f7f7f7;">
         <td style="padding:5px 8px; border:1px solid #ccc;"><code>PeriodoQualAguaInicio</code></td>
         <td style="padding:5px 8px; border:1px solid #ccc;"><code>PeriodoQualAguaFim</code></td>
         <td style="border:none;"></td>
         <td style="padding:5px 8px; border:1px solid #ccc;"><code>PeriodoClimatologicaInicio</code></td>
         <td style="padding:5px 8px; border:1px solid #ccc;"><code>PeriodoClimatologicaFim</code></td>
       </tr>
       <tr>
         <td style="padding:5px 8px; border:1px solid #ccc;"><code>PeriodoTelemetricaInicio</code></td>
         <td style="padding:5px 8px; border:1px solid #ccc;"><code>PeriodoTelemetricaFim</code></td>
         <td style="border:none;"></td>
         <td style="padding:5px 8px; border:1px solid #ccc;"></td>
         <td style="padding:5px 8px; border:1px solid #ccc;"></td>
       </tr>
     </tbody>
   </table>
   <br>




The variables listed above were used to derive two standardised temporal attributes for each station: ``DataInicioOperacao`` and ``DataFimOperacao``. For each station type, the earliest start date across all available instrument period fields was taken as ``DataInicioOperacao``, while the latest end date was taken as ``DataFimOperacao``. The derivation procedure is described in detail in the sections :ref:`candidate-start-end-dates-gauges` and :ref:`start-end-dates-gauges`.


Inventory request and parsing
=============================

The collection of registration data begins by building an HTTP GET request to the ``HidroInventario`` endpoint. The function first validates the requested station type and then constructs the full URL, including all parameters supported by the service. Only the required parameters (such as ``tpEst`` and ``nmEstado``) are populated, while the remaining ones are left blank to avoid unintended filtering. The request also includes a user identifier and automatic retry mechanisms with an increasing backoff interval, ensuring stability even in the presence of temporary failures on the ANA server.

After submitting the request, the function checks the HTTP status code and, if the response is not successful, logs the error, optionally applies a pause, and returns an empty table. When the response is valid, the XML content is parsed, namespaces are removed, and the function searches for an ``<Error>`` node; if a specific error message is present, it is displayed and the processing for that state (UF) is safely interrupted. Next, the function identifies all ``<Table>`` nodes—each representing a station—and converts their fields into a tabular structure using the fixed list of attributes provided by the inventory. Finally, the received records are consolidated into a raw table and a ``tipo_estacao`` column is added to indicate the queried station type, preparing the dataset for the next cleaning and standardization steps.



Data cleaning and type casting
==============================

After extracting the station registration data, the script applies a standardization step to ensure consistency and usability of the dataset. Initially, geographic coordinates are processed: latitude and longitude values received without a decimal point are corrected and then converted to numeric values. In parallel, fields representing operational codes or indicators are cast to integers, ensuring that such information does not remain stored as text.

Next, all columns related to operational periods—those starting with ``Periodo`` and ending with ``Inicio`` or ``Fim`` are converted to date format, while administrative columns such as ``UltimaAtualizacao``, ``DataIns``, and ``DataAlt`` are converted to date-time values. Finally, textual fields undergo a cleaning process that removes trailing and leading whitespace and replaces empty strings with missing values. This structured routine ensures that all data types are coherent and that the resulting table is suitable for subsequent processes, such as date calculations, deduplication, and geographic validation.



.. _start-end-dates-gauges:

Start and end dates of operation
================================

After standardizing the date columns, the script consolidates the operational period of each station through two distinct routines. The function responsible for determining the start of operation identifies, for each station type, the set of potentially relevant columns (for example, start dates of rain gauges, water level recorders, or telemetry systems) and computes the earliest valid date among them, assigning the result to the ``DataInicioOperacao`` column. This procedure ensures that the station start date represents the earliest moment at which any associated instrument began recording data.

Complementarily, the end-of-operation calculation uses the corresponding candidate columns related to instrument decommissioning and selects the latest available date for each station, resulting in the ``DataFimOperacao`` column. This process is performed separately for each station type, respecting its specific set of fields. The outcome is two consolidated columns that describe the historical operational interval of the station, serving as a reference for temporal filtering and for analyses that depend on the duration or continuity of measurements.

This procedure is primarily intended to support the data download process by ensuring that only stations operating within the climatological normal period of interest are considered. However, cases were observed in which stations present a computable value for the ``DataFimOperacao`` variable while the ``Operando`` variable indicates a value of ``1``, characterizing an inconsistency in the registration data. Therefore, only the ``DataInicioOperacao`` column is used as support for filtering stations that began operation within each climatological normal period when performing data downloads.



Station-level deduplication
===========================

The ANA registration inventory may include multiple records for the same station, usually resulting from administrative revisions or updates performed at different points in time. To ensure that only the most up-to-date registration is retained, the script applies an ordering procedure based on administrative dates provided by ANA itself. Records are first grouped by station code and then prioritized according to the presence and recency of ``DataAlt``, ``DataIns``, and ``UltimaAtualizacao``, always favoring records in which these fields are populated and, among them, the most recent ones.

After this ordering step, the algorithm selects only the first record for each station code, ensuring that each station is represented by a single consolidated entry. This process removes duplicates, prevents inconsistencies arising from outdated registration versions, and produces a coherent final dataset suitable for subsequent analyses and for integration with other components of the inventory.




Geographic validation
=====================

Geographic validation ensures that the registered coordinates of the stations are consistent with the actual boundaries of Brazilian territory and with plausible elevation values. The implemented procedure identifies coordinates that fall outside the expected range, corrects straightforward cases, and flags situations in which the station location cannot be determined reliably. In addition, the script creates indicator variables that allow quick identification of stations with potential spatial inconsistencies. The following subsections detail the adopted criteria.

Altitude validation
-------------------

The altitude reported for some stations may present values incompatible with real-world conditions, either due to data entry errors or registration issues. The algorithm applies three main rules:

1. Slightly negative altitudes (between –10 and 0 meters) are adjusted to 0, as they may represent minor measurement inaccuracies.
2. Altitudes lower than –10 meters or higher than 3000 meters—above the highest point in Brazil—are considered invalid and replaced with ``NA``.
3. Valid altitudes remain unchanged.

These rules allow common registration errors to be corrected without discarding potentially useful information.

Latitude and longitude validation
---------------------------------

To verify whether a station is located within the geographic boundaries of Brazil, the script compares its coordinates against the known minimum and maximum ranges: approximately between –33.75° and 5.27° latitude, and between –74.00° and –28.83° longitude. If a coordinate falls outside this range, the station is flagged as having a suspicious location. This assessment generates two additional columns, ``lat_fora`` and ``lon_fora``, which take the value ``1`` when the coordinate is outside the defined limits and ``0`` otherwise. These variables support dataset auditing and enable subsequent analyses of potential spatial inconsistencies.



Main processing pipeline
========================

The function responsible for the main pipeline orchestrates and executes all preceding steps in an integrated manner for one or more station types. Based on the ``tipos`` (``"1"`` and/or ``"2"``) and ``uf`` parameters, it controls how requests are issued: when ``uf`` is ``NULL``, a single nationwide request is performed per station type; when a vector of UFs is provided, one request per state is executed, using the full state name with the exact spelling expected by ANA. In each iteration, the raw data returned by ``HidroInventario`` are accumulated and combined into a single table per station type.

The workflow then sequentially applies the post-processing routines: data cleaning and type casting, calculation of consolidated start and end dates of operation, deduplication by station code, and geographic validation. After that, an optional filter based on ``DataInicioOperacao`` (controlled by ``limite_inicio``) is applied, and summaries of the number of stations per UF are generated, both before and after the temporal filter. When the ``exportar`` parameter is enabled and ``dir_export`` is provided, the filtered data are written to ``.parquet`` files (with gzip compression) and ``.xlsx`` files, with filenames differentiated by station type. Finally, the function returns a list in which each station type contains the fully processed dataset, the filtered version, and the corresponding summaries by UF, ready for use in environmental, hydrological, or epidemiological analyses.



Script flowchart for station registration data retrieval
========================================================

The four diagrams below provide a structured and progressive view of how the script works. The first diagram presents a macro-level overview of the four processing stages. The subsequent three diagrams detail the steps within each stage: data acquisition (orange and blue blocks), data post-processing and validation (green blocks), and the main pipeline execution with export (purple blocks). The same colour coding is used consistently across all diagrams to identify the category of each step.

Overview
--------

The overview diagram illustrates the four sequential stages of the pipeline at a high level, serving as a navigation reference for the detail diagrams that follow.

.. mermaid::

   flowchart TB
     A["Setup & Configuration"]:::configCode --> B["Schema & Registry Mapping"]:::configCode
     B --> C["Request & XML Parsing"]:::reqCode
     C --> D["Post-processing/Validation"]:::validacao
     D --> E["Outputs & Export"]:::exportacao

     classDef configCode fill:#fff3e0,stroke:#ef6c00,color:#000;
     classDef reqCode fill:#e3f2fd,stroke:#1565c0,color:#000;
     classDef validacao fill:#e8f5e9,stroke:#2e7d32,color:#000;
     classDef exportacao fill:#ede7f6,stroke:#5e35b1,color:#000;


Data Acquisition
----------------

This diagram details the orange and blue stages: initial setup and configuration, registry field mapping, and the full HTTP request and XML parsing logic, including all error-handling branches.

.. mermaid::

   flowchart TB
     subgraph S["Setup & Configuration / Schema & Registry Mapping"]
       A1["Load packages + Define API constants"]:::configCode
       A2["Map registry fields + Define operation date columns"]:::configCode
       A1 --> A2
     end

     C0["Validate station type (1 or 2)"]:::reqCode
     C1["Build GET request (tpEst + nmEstado)"]:::reqCode
     C2{"HTTP 200?"}:::reqCode
     C2_no["Log HTTP error → return empty table"]:::reqCode
     C2_yes["Parse XML + drop namespaces"]:::reqCode
     C3{"XML error node?"}:::reqCode
     C3_yes["Log API error → return empty table"]:::reqCode
     C3_no["Locate Table nodes"]:::reqCode
     C4{"Stations found?"}:::reqCode
     C4_no["Warn: no data for state → return empty table"]:::reqCode
     C4_yes["Extract fields → build raw table"]:::reqCode

     A2 --> C0 --> C1 --> C2
     C2 -- "No"  --> C2_no
     C2 -- "Yes" --> C2_yes --> C3
     C3 -- "Yes" --> C3_yes
     C3 -- "No"  --> C3_no --> C4
     C4 -- "No"  --> C4_no
     C4 -- "Yes" --> C4_yes

     classDef configCode fill:#fff3e0,stroke:#ef6c00,color:#000;
     classDef reqCode fill:#e3f2fd,stroke:#1565c0,color:#000;
     classDef validacao fill:#e8f5e9,stroke:#2e7d32,color:#000;
     classDef exportacao fill:#ede7f6,stroke:#5e35b1,color:#000;


Post-processing and Validation
-------------------------------

This diagram details the green stage: all data cleaning, type casting, date computation, deduplication, and geographic validation steps applied to the raw table returned by the request function before any export or filtering occurs.

.. mermaid::

   flowchart TB
      D1["Fix coordinates + Convert numeric types"]:::validacao
      D2["Parse date columns: Periodo*; DataIns; DataAlt"]:::validacao
      D3["Standardize text fields + replace empty strings"]:::validacao
      D4["Compute: DataInicioOperacao; DataFimOperacao"]:::validacao
      D5["Deduplicate: keep most recent record per station"]:::validacao
      D6["Validate altitude + flag lat/lon outside Brazil"]:::validacao
      D1 --> D2 --> D3 --> D4 --> D5 --> D6

     classDef validacao fill:#e8f5e9,stroke:#2e7d32,color:#000;


Main Pipeline — Registration Data Acquisition
----------------------------------------------

This diagram shows the purple stage: the main pipeline orchestration, which loops over station types and states, calls the request and post-processing functions, applies the eligibility date filter, and optionally exports the results to Parquet and Excel files.

.. mermaid::

   flowchart TB
     H0["Select station types + target states"]:::configCode
     H1{"Query mode"}:::reqCode
     H1a["Iterate: type × state"]:::reqCode
     H1b["Single call per type (all states)"]:::reqCode
     H2["Run post-processing & validation"]:::validacao
     H3["Filter by DataInicioOperacao ≤ limite_inicio"]:::exportacao
     H4["Generate summaries by state"]:::exportacao
     H5{"Export results?"}:::exportacao
     X1["Write .parquet (gzip) + .xlsx by station type"]:::exportacao
     X2["Write summary by state (.xlsx)"]:::exportacao
     H6["Return structured results list"]:::exportacao

     H0 --> H1
     H1 -- "Iterate"      --> H1a --> H2
     H1 -- "Single call"  --> H1b --> H2
     H2 --> H3 --> H4 --> H5
     H5 -- "Yes" --> X1 --> X2 --> H6
     H5 -- "No"  --> H6

     classDef configCode fill:#fff3e0,stroke:#ef6c00,color:#000;
     classDef reqCode fill:#e3f2fd,stroke:#1565c0,color:#000;
     classDef validacao fill:#e8f5e9,stroke:#2e7d32,color:#000;
     classDef exportacao fill:#ede7f6,stroke:#5e35b1,color:#000;



Descriptive statistics of registered stations
=============================================

This section presents summary statistics for the two types of hydrometeorological stations registered in the ANA system: streamflow stations (Type 1) and rainfall stations (Type 2). For each type, statistics are presented by responsible agency and by eligibility for each climatological normal period. Stations are eligible for a given normal when their ``DataInicioOperacao`` falls on or before the cutoff date corresponding to that period (see :ref:`start-end-dates-gauges`).


Streamflow gauges stations (Type 1)
-------------------------------------

The ANA system registers a total of **16,078 streamflow stations** with a ``DataInicioOperacao`` on or before 01/01/2024. Table 1a presents the distribution of streamflow stations by responsible agency.

.. list-table:: Table 1a — Streamflow stations (Type 1) by responsible agency
   :header-rows: 1
   :widths: 15 35 30

   * - Ranking
     - Responsible agency
     - Frequency n (%)
   * - 1
     - ANA
     - 3,914 (24.3%)
   * - 2
     - IGAM-MG
     - 887 (5.5%)
   * - 3
     - CETESB-SP
     - 609 (3.8%)
   * - 4
     - INEMA-BA
     - 584 (3.6%)
   * - 5
     - SPÁGUAS-SP
     - 493 (3.1%)
   * - 6
     - DNOS
     - 395 (2.5%)
   * - 7
     - IAT-PR
     - 354 (2.2%)
   * - 8
     - FURNAS
     - 333 (2.1%)
   * - 9
     - FEPAM-RS
     - 248 (1.5%)
   * - 10
     - INEA-RJ
     - 237 (1.5%)
   * -
     - (736 others)
     - 8,024 (49.9%)

*Source: Original research results.*

Of the 16,078 streamflow stations registered with a start of operation on or before 01/01/2024, 24.3% are under the responsibility of ANA (National Water Agency), while 5.5% are managed by IGAM-MG (Minas Gerais State Water Management Institute). CETESB-SP (São Paulo State Environmental Agency) and INEMA-BA (Bahia State Institute for the Environment and Water Resources) account for 3.8% and 3.6% of stations registered in the ANA system, respectively. In addition to the 10 agencies with the highest representation (50.1%), a further 736 agencies (49.9%) also have stations registered in the system.


Table 1b presents the number of streamflow stations eligible for each climatological normal period.

.. list-table:: Table 1b — Streamflow station eligibility by climatological normal
   :header-rows: 1
   :widths: 25 25 25 25

   * - Normal
     - Period
     - Eligible stations
     - Eligibility (%)
   * - 1
     - 1961–1990
     - 6,534
     - 40.6
   * - 2
     - 1991–2020
     - 13,249
     - 82.4
   * - 3
     - 2021–2024
     - 16,078
     - 100.0

*Source: Original research results.*


Of the 16,078 streamflow stations registered with a ``DataInicioOperacao`` on or before 01/01/2024, the proportion of stations eligible for each climatological normal decreases progressively as the period recedes further into the past: all 16,078 stations (100.0%) are eligible for the 2021–2024 normal, while 13,249 (82.4%) meet the eligibility criterion for the 1991–2020 normal, and 6,534 (40.6%) for the 1961–1990 normal (Table 1b). Eligibility is determined by a cutoff applied to ``DataInicioOperacao``, which is discussed in detail in the sections :ref:`start-end-dates-gauges` and :ref:`data-scope-temporal-coverage`.


Rainfall gauges stations (Type 2)
------------------------------------

The ANA system registers a total of **19,985 rainfall stations** with a ``DataInicioOperacao`` on or before 01/01/2024. Table 2a presents the distribution of rainfall stations by responsible agency.

.. list-table:: Table 2a — Rainfall stations (Type 2) by responsible agency
   :header-rows: 1
   :widths: 15 35 30

   * - Ranking
     - Responsible agency
     - Frequency n (%)
   * - 1
     - ANA
     - 4,126 (20.6%)
   * - 2
     - CEMADEN
     - 2,533 (12.7%)
   * - 3
     - SPÁGUAS-SP
     - 1,878 (9.4%)
   * - 4
     - SUDENE
     - 1,348 (6.7%)
   * - 5
     - IAT-PR
     - 827 (4.1%)
   * - 6
     - INMET
     - 827 (4.1%)
   * - 7
     - FUNCEME-CE
     - 791 (4.0%)
   * - 8
     - DNOCS
     - 637 (3.2%)
   * - 9
     - EMPARN-RN
     - 398 (2.0%)
   * - 10
     - DNOS
     - 295 (1.5%)
   * -
     - (706 others)
     - 6,325 (31.6%)

*Source: Original research results.*

Of the 19,985 rainfall stations registered with a start of operation on or before 01/01/2024 [1]_, 20.6% are under the responsibility of ANA, while 12.7% are managed by CEMADEN (National Centre for Monitoring and Early Warning of Natural Disasters). INMET (the National Institute of Meteorology) accounts for 4.1% of stations registered in the ANA system. In addition to the 10 agencies with the highest representation (68.4%), a further 706 agencies (31.6%) also have stations registered in the system.

Table 2b presents the number of rainfall stations eligible for each climatological normal period.

.. list-table:: Table 2b — Rainfall station eligibility by climatological normal
   :header-rows: 1
   :widths: 25 25 25 25

   * - Normal code
     - Period
     - Eligible stations
     - Eligibility (%)
   * - 1
     - 1961–1990
     - 11,627
     - 58.2
   * - 2
     - 1991–2020
     - 19,582
     - 98.0
   * - 3
     - 2021–2024
     - 19,985
     - 100.0

*Source: Original research results.*

Of the 19,985 rainfall stations registered with a ``DataInicioOperacao`` on or before 01/01/2024, 19,985 (100.0%) are eligible for the 2021–2024 normal, 19,582 (98.0%) for the 1991–2020 normal, and 11,627 (58.2%) for the 1961–1990 normal (Table 2b). Eligibility is determined by a cutoff applied to ``DataInicioOperacao``, which is discussed in detail in the sections :ref:`start-end-dates-gauges` and :ref:`data-scope-temporal-coverage`.


Spatial distribution of ANA's gauges stations
=============================================

This section presents interactive maps showing the spatial distribution of the stations registered in the ANA system for each station type. Maps are generated from the georeferenced inventory and rendered using the Folium library. Use the controls embedded in each map to zoom, pan, and inspect individual stations.

Streamflow gauges stations (Type 1)
--------------------------------------

The map below shows the spatial distribution of streamflow stations (Type 1) registered in the ANA system.

.. raw:: html

   <iframe
     src="_static/maps/fluviometric_stations_map.html"
     width="100%"
     height="600px"
     style="border: 1px solid #e0cfc4; border-radius: 6px;"
     allowfullscreen>
   </iframe>


Although there are stations all over Brazil, their greatest concentration is on the east coast, where the largest cities are concentrated.

Rainfall gauges stations (Type 2)
------------------------------------

The map below shows the spatial distribution of rainfall stations (Type 2) registered in the ANA system. The figure that follows the map illustrates the distribution by responsible agency.

.. raw:: html

   <iframe
     src="_static/maps/precipitation_stations_map.html"
     width="100%"
     height="600px"
     style="border: 1px solid #e0cfc4; border-radius: 6px;"
     allowfullscreen>
   </iframe>


Although there are stations all over Brazil, their greatest concentration is on the east coast, where the largest cities are concentrated.



.. _georef-chapter:

***************************************************************
Station Georeferencing: ANA–IBGE 2025 Spatial Integration
***************************************************************

Overview
=========

The station inventory provided by ANA includes geographic coordinates (latitude and longitude) and a field identifying the associated municipality (``nmMunicipio``). However, the municipality codes used in the ANA system are not compatible with the official IBGE coding scheme (``CD_MUN``), which prevents direct table joins between the two systems. Additionally, the ``nmMunicipio`` field presents data quality issues, including incomplete names and spelling inconsistencies, which further limits its use for administrative linkage.

To overcome these constraints, a coordinate-based spatial georeferencing pipeline was developed in Python. Each station is assigned a municipality — and consequently a standardised IBGE municipality code, name, and state identifier — based solely on its geographic coordinates and the official 2025 IBGE municipality boundary shapefile.

.. The full implementation is available in the notebooks ``GeoRef_ANA_IBGE_2025.ipynb`` (processing pipeline) and ``GeoRef_ANA_IBGE_2025_vizualizacao.ipynb`` (visualisation).


.. note::

   The ANA's HidroWeb download portal (https://www.snirh.gov.br/hidroweb/download) provides the **Inventory** file, which contains a database in `.mdb` format. In this database, the **Municipality** table establishes the correspondence between the municipality codes used by ANA and the respective official codes and names from IBGE (Brazilian Institute of Geography and Statistics). This table is used to resolve incompatibilities in station records that have a valid **Municipality Code** only in ANA's systems. The IBGE municipal code obtained through this correspondence is preserved in the georeferenced dataset of the station registry through the ``cod_ibge_ana`` field, allowing traceability, referencing, and auditing.


Data Sources and Spatial Reference System
==========================================

The georeferencing pipeline uses two primary inputs:

- **ANA station inventories** — 19,985 rainfall stations and 16,078 streamflow stations retrieved from the HidroInventário [1]_, each carrying ``Latitude`` and ``Longitude`` fields registered in SIRGAS 2000.
- **IBGE 2025 municipality shapefile** — 5,573 municipal boundary polygons, also in SIRGAS 2000 geographic coordinates (``EPSG:4674``). Key fields used: ``CD_MUN`` (municipality code), ``NM_MUN`` (municipality name), ``SIGLA_UF`` (state abbreviation), ``NM_REGIAO`` (region name).

The full pipeline operates in **EPSG:4674 (SIRGAS 2000 geographic)**. The only exception is the distance calculation step for unmatched stations, which temporarily reprojects the affected subset to **EPSG:5880 (SIRGAS 2000 / Brazil Polyconic)** to obtain distances in metres.


Georeferencing Methodology
============================

The pipeline follows a two-stage spatial association strategy implemented with GeoPandas.

Primary Association — Spatial Containment (``within``)
--------------------------------------------------------

In the first stage, a spatial join with ``predicate='within'`` is performed between the station point geometries and the municipality polygon geometries. Each station is assigned to the municipality whose polygon contains its coordinates. This is the most accurate form of association, as it requires the station to be strictly inside the municipality boundary.

.. code-block:: python

   stations_gdf = gpd.sjoin(stations_gdf, mun_gdf, predicate='within', how='left')

Stations that are not contained within any polygon — typically due to coordinate imprecision, registration errors, or points falling exactly on a boundary — are left unmatched after this step and forwarded to the secondary association stage.

Secondary Association — Proximity (``nearest``)
-------------------------------------------------

In the second stage, unmatched stations are assigned to the geographically nearest municipality using ``gpd.sjoin_nearest()``. Before this operation, both the unmatched stations and the municipality geometries are temporarily reprojected to EPSG:5880 to enable distance measurement in metres. The distance from each station to the nearest municipality boundary is recorded in the ``distancia_municipio_m`` column.

.. code-block:: python

   unmatched_proj = unmatched.to_crs(CRS_METRIC)
   mun_proj       = mun_gdf.to_crs(CRS_METRIC)
   result         = gpd.sjoin_nearest(unmatched_proj, mun_proj, distance_col='distancia_municipio_m')

Both geometries are then reprojected back to EPSG:4674 for consistency with the rest of the dataset.

Output Attributes
-----------------

Inventory Registration Fields
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

The ANA *HidroInventário* endpoint [1]_ returns, for each registered station, a fixed set of registration fields covering operational metadata. These fields describe the station's location (state, municipality, river, and hydrographic basin), its responsible and operating agencies, the types of instruments installed (rain gauges, water level recorders, telemetric sensors, among others), the start and end dates of each measurement component, the current operational status, and a set of administrative control attributes related to record insertion and updating. The pipeline maintains a single, consolidated list of all field names, ensuring that every station — regardless of type or state — is stored using the same tabular structure, and that queries targeting different states or types return mutually compatible datasets.

Despite the relevance of this metadata for quality control, temporal filtering, and downstream analyses, ANA does not publish an official, comprehensive data dictionary for the fields returned by the *HidroInventário* endpoint [1]_. At the time of this writing, no machine-readable or structured documentation covering the full set of inventory fields was identified in any publicly available ANA resource, including the HidroWeb portal, the ServiceANA documentation page, or the documentation of the new HidroWeb API currently under development. This absence of formal documentation introduces uncertainty in the interpretation of certain fields — particularly those related to instrument-specific operational flags, administrative sub-categories, and status codes whose values are not self-explanatory.

As a practical consequence, the description of a subset of fields was inferred from indirect sources: the behaviour of the returned values during processing, cross-referencing with the ``Estacao`` table available in the *Inventário* archive distributed via the HidroWeb download portal [2]_, and partial references found in third-party technical literature and official reports. Fields for which a reliable description could be established are documented accordingly. Fields for which no description could be confirmed from any institutional source remain flagged as undocumented pending formal clarification from ANA.

.. note::

   A formal enquiry with ANA regarding the description of undocumented inventory fields is in progress. Once confirmed, the field-level documentation will be updated accordingly.

The complete list of registration fields will be available in this documentation as soon as it is obtained from official ANA sources, containing descriptions for the subset of fields that could be confirmed by institutional sources. Fields without confirmed descriptions are duly marked.

New variables
^^^^^^^^^^^^^

After both stages, each station record is enriched with the following columns:

.. list-table:: Table 3 — Georeferencing output columns
   :header-rows: 1
   :widths: 10 10 10

   * - Column
     - Type
     - Description
   * - ``uf_ana``
     - string
     - State abbreviation from ANA.
   * - ``cod_mun_ibge``
     - string
     - IBGE municipality code (``CD_MUN`` from shapefile).
   * - ``nome_mun_ibge``
     - string
     - Official municipality name (``NM_MUN`` from shapefile).
   * - ``uf_ibge``
     - string
     - State abbreviation from shapefile (``SIGLA_UF``).
   * - ``metodo_associacao``
     - string
     - ``"within"`` for containment; ``"nearest"`` for proximity.
   * - ``distancia_municipio_m``
     - float
     - Distance in metres to nearest boundary (``nearest`` only; ``NaN`` for ``within``).
   * - ``uf_divergente``
     - boolean
     - Value is ``True`` if the state inferred spatially (``SIGLA_UF``) differs from the state recorded in ``nmEstado`` (ANA).
   * - ``cod_ibge_ana``
     - string
     - IBGE municipality code as provided in the ANA ``Municipio`` table (see note below); retained for reference and audit purposes only.


.. note::

   However, the official identification of the municipality adopted in all subsequent analyses is that obtained through spatial merging based on the station's coordinates (fields ``cod_mun_ibge`` and ``nome_mun_ibge``). This approach was adopted because it more accurately represents the actual location of the station in relation to the most recent municipal boundaries of the IBGE (2025).

..
    Municipality Name Validation
    ==============================

    The ``nmMunicipio`` field in the ANA inventory presents two systematic issues that prevent its direct use for administrative linkage:

    1. **Incomplete names** — municipality names are occasionally truncated, with the last characters missing.
    2. **Spelling inconsistencies** — names may contain diacritical variants, abbreviations, or typographical errors not present in the IBGE reference.

    While the spatial join already provides a reliable and authoritative municipality assignment via coordinates, a complementary fuzzy string matching approach can be used to audit and validate the ``nmMunicipio`` entries against the IBGE reference list. Libraries such as ``rapidfuzz`` (implementing the Levenshtein distance and token-sort ratio algorithms) are recommended for this purpose:

    .. code-block:: python

      from rapidfuzz import process, fuzz

      def match_municipio(nome_ana, choices, threshold=85):
          result = process.extractOne(nome_ana, choices,
                                      scorer=fuzz.token_sort_ratio)
          if result and result[1] >= threshold:
              return result[0]
          return None

    This approach can be applied as a post-processing audit step to flag stations where ``nmMunicipio`` diverges significantly from the IBGE-assigned ``nome_mun_ibge``, surfacing records that may require manual review.

    .. note::

      The fuzzy matching approach is intended exclusively as a data quality audit tool. The authoritative municipality assignment for all downstream analyses is the one produced by the coordinate-based spatial join (``cod_mun_ibge``, ``nome_mun_ibge``), regardless of the content of ``nmMunicipio``.


Georeferencing Results
=======================

The table below will present a summary of the georeferencing results for each station type, once the full pipeline has been executed and reviewed.

.. list-table:: Table 4 — Georeferencing result summary by station type
   :header-rows: 1
   :widths: 30 20 20 20

   * - Station type
     - Total stations
     - ``within`` (%)
     - ``nearest`` (%)
   * - Streamflow station (Type 1)
     - 16,078
     - 16,037  (99.7%)
     - 41  (0.3%)
   * - Rain gauge station (Type 2)
     - 19,985
     - 19,904  (99.6%)
     - 81  (0.4%)

The georeferencing pipeline successfully assigned all 36,063 stations to a Brazilian municipality. The ``within`` predicate resolved the vast majority of associations: 99.7% of streamflow stations (16,037 of 16,078) and 99.6% of rain gauge stations (19,904 of 19,985) were spatially contained within a single municipality polygon. The remaining stations — 41 streamflow (0.3%) and 81 rain gauge (0.4%) — were assigned via the ``nearest`` predicate, indicating that their registered coordinates fall outside all municipal boundaries, most likely due to positional imprecision in the ANA inventory.

Georeferencing Pipeline Diagram
=================================

The diagram below summarises the full georeferencing workflow.

.. mermaid::

   flowchart TB
     A["Load ANA station inventories (19,985 rainfall + 16,078 streamflow)"]:::configCode
     B["Load IBGE 2025 municipality shapefile (5,573 features, EPSG:4674)"]:::configCode
     D["Build station GeoDataFrame (Latitude / Longitude → geometry, EPSG:4674)"]:::validacao

     E["Stage 1: spatial join within sjoin(predicate='within')"]:::reqCode
     F{"All stations matched?"}:::reqCode
     G["Stage 2: proximity join sjoin_nearest() in EPSG:5880"]:::reqCode

     H["Merge within + nearest results"]:::validacao
     I["Add metodo_associacao / distancia_municipio_m / uf_divergente"]:::validacao

     K["Export georeferenced inventory (.parquet + .xlsx)"]:::exportacao

     A --> D
     B --> E
     D --> E
     E --> F
     F -- "Yes" --> H
     F -- "No (unmatched)" --> G --> H
     H --> I --> K

     classDef configCode fill:#fff3e0,stroke:#ef6c00,color:#000;
     classDef reqCode fill:#e3f2fd,stroke:#1565c0,color:#000;
     classDef validacao fill:#e8f5e9,stroke:#2e7d32,color:#000;
     classDef exportacao fill:#ede7f6,stroke:#5e35b1,color:#000;


Nearest-matched Stations Map
==============================

Stations that could not be assigned to a municipality via spatial containment (``within``) were matched by proximity to the nearest municipality boundary (``nearest``). These stations typically lie outside all municipality polygons due to coordinate imprecision or positions near state boundaries. The map below shows their spatial distribution.

.. raw:: html

   <iframe
     src="_static/maps/nearest_gauge_map.html"
     width="100%"
     height="600px"
     style="border: 1px solid #e0cfc4; border-radius: 6px;"
     allowfullscreen>
   </iframe>


.. rubric:: References

.. [1] Agência Nacional de Águas e Saneamento Básico [ANA]. 2025. *HidroSerieHistorica* — ServiceANA: web service for historical hydrometeorological series. ANA, Brasília, DF, Brazil. Available at: <https://telemetriaws1.ana.gov.br/ServiceANA.asmx>.

.. [2] Agência Nacional de Águas e Saneamento Básico [ANA]. 2025. *WebServices*: Consulta às Estações Telemétricas. ANA, Brasília, DF, Brazil. Available at: <https://telemetriaws1.ana.gov.br/EstacoesTelemetricas.aspx>.


.. rubric:: Contributors

.. list-table::
   :header-rows: 1
   :widths: 28 44 28
   :width: 60%

   * - Contributor
     - Institution
     - Location
   * - Marcos Eustorgio Filho
     - | Center for Data and Knowledge Integration for Health (CIDACS),
       | Instituto Gonçalo Moniz, Fundação Oswaldo Cruz
     - Salvador, Brazil
   * - Danielson Neves
     - | Center for Data and Knowledge Integration for Health (CIDACS),
       | Instituto Gonçalo Moniz, Fundação Oswaldo Cruz
     - Salvador, Brazil

..
    .. raw:: html

      <table style="width:100%; border-collapse:collapse;
                    font-family:sans-serif; font-size:0.9em;">
        <thead>
          <tr>
            <th style="background:#7a170f; color:#fff; padding:8px 12px;
                        border:1px solid #5a100b; text-align:left;">
              Contributor
            </th>
            <th style="background:#7a170f; color:#fff; padding:8px 12px;
                        border:1px solid #5a100b; text-align:left;">
              Institution
            </th>
            <th style="background:#7a170f; color:#fff; padding:8px 12px;
                        border:1px solid #5a100b; text-align:left;">
              Location
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:8px 12px; border:1px solid #ddd;
                        vertical-align:top;">
              Marcos Eustorgio Filho
            </td>
            <td style="padding:8px 12px; border:1px solid #ddd;
                        vertical-align:top;">
              Center for Data and Knowledge Integration for Health (CIDACS),
              Instituto Gonçalo Moniz, Fundação Oswaldo Cruz
            </td>
            <td style="padding:8px 12px; border:1px solid #ddd;
                        vertical-align:top;">
              Salvador, Brazil
            </td>
          </tr>
          <tr style="background:#fdf3f3;">
            <td style="padding:8px 12px; border:1px solid #ddd;
                        vertical-align:top;">
              Danielson Neves
            </td>
            <td style="padding:8px 12px; border:1px solid #ddd;
                        vertical-align:top;">
              Center for Data and Knowledge Integration for Health (CIDACS),
              Instituto Gonçalo Moniz, Fundação Oswaldo Cruz
            </td>
            <td style="padding:8px 12px; border:1px solid #ddd;
                        vertical-align:top;">
              Salvador, Brazil
            </td>
          </tr>
        </tbody>
      </table>
      <br>