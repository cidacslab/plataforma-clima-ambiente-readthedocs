###########################################
ANA datasets
###########################################

Updated: 2025-12-30

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

The ANA system contains records of different categories of hydrometeorological stations, including Telemetric Stations — automatic stations with real-time remote data transmission — and Conventional Stations, which rely on manual measurements performed by observers and hydrology technicians. To identify all available stations, the survey was based on the complete listing provided by the `HidroInventário <https://telemetriaws1.ana.gov.br/ServiceANA.asmx?op=HidroInventario>`_, which includes both conventional and telemetric stations and centralizes the registration information required for data processing.

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





Inventory registration fields
=============================

The inventory provides, for each station, a fixed set of registration fields representing operational metadata, including location (state, municipality, hydrographic basin), operator attributes, types of installed instruments, installation and removal dates, operational status, and other related information. The script maintains a single, consolidated list of all these field names, ensuring that each station is recorded using the same structure and that different queries return mutually compatible tables.

The complete list of registration fields available for both types of ANA stations is provided in a ``.csv`` file containing the data descriptions supplied by ANA.

.. note::

  The data dictionary for the variables present in the complete ANA registration listing will be made available at a later stage, after confirmation with ANA regarding the description of certain variables for which no documentation could be identified.



Candidate start and end dates of operation
==========================================

The returned data include multiple columns indicating the start and end times of operation for specific instruments (rain gauges, water level recorders, telemetric sensors, among others). Since these components may be installed at different times, the script identifies, for each station type, which columns should be taken into account. It then computes the earliest available date as the station start date and the latest available date as the end date. This procedure standardizes the station's operational period even when ANA does not provide this information in a consolidated form.

To derive the start and end dates of operation for each station type, the following variables were used:

- Streamflow stations (Type 1):

  - Start dates:

    - ``PeriodoEscalaInicio``
    - ``PeriodoRegistradorNivelInicio``
    - ``PeriodoDescLiquidaInicio``
    - ``PeriodoQualAguaInicio``
    - ``PeriodoTelemetricaInicio``

  - End dates:

    - ``PeriodoEscalaFim``
    - ``PeriodoRegistradorNivelFim``
    - ``PeriodoDescLiquidaFim``
    - ``PeriodoQualAguaFim``
    - ``PeriodoTelemetricaFim``

- Rainfall stations (Type 2):

  - Start dates:

    - ``PeriodoPluviometroInicio``
    - ``PeriodoRegistradorChuvaInicio``
    - ``PeriodoTelemetricaInicio``
    - ``PeriodoClimatologicaInicio``

  - End dates:

    - ``PeriodoPluviometroFim``
    - ``PeriodoRegistradorChuvaFim``
    - ``PeriodoTelemetricaFim``
    - ``PeriodoClimatologicaFim``

Inventory request and parsing
=============================

The collection of registration data begins by building an HTTP GET request to the ``HidroInventario`` endpoint. The function first validates the requested station type and then constructs the full URL, including all parameters supported by the service. Only the required parameters (such as ``tpEst`` and ``nmEstado``) are populated, while the remaining ones are left blank to avoid unintended filtering. The request also includes a user identifier and automatic retry mechanisms with an increasing backoff interval, ensuring stability even in the presence of temporary failures on the ANA server.

After submitting the request, the function checks the HTTP status code and, if the response is not successful, logs the error, optionally applies a pause, and returns an empty table. When the response is valid, the XML content is parsed, namespaces are removed, and the function searches for an ``<Error>`` node; if a specific error message is present, it is displayed and the processing for that state (UF) is safely interrupted. Next, the function identifies all ``<Table>`` nodes—each representing a station—and converts their fields into a tabular structure using the fixed list of attributes provided by the inventory. Finally, the received records are consolidated into a raw table and a ``tipo_estacao`` column is added to indicate the queried station type, preparing the dataset for the next cleaning and standardization steps.



Data cleaning and type casting
==============================

After extracting the station registration data, the script applies a standardization step to ensure consistency and usability of the dataset. Initially, geographic coordinates are processed: latitude and longitude values received without a decimal point are corrected and then converted to numeric values. In parallel, fields representing operational codes or indicators are cast to integers, ensuring that such information does not remain stored as text.

Next, all columns related to operational periods—those starting with ``Periodo`` and ending with ``Inicio`` or ``Fim`` are converted to date format, while administrative columns such as ``UltimaAtualizacao``, ``DataIns``, and ``DataAlt`` are converted to date-time values. Finally, textual fields undergo a cleaning process that removes trailing and leading whitespace and replaces empty strings with missing values. This structured routine ensures that all data types are coherent and that the resulting table is suitable for subsequent processes, such as date calculations, deduplication, and geographic validation.




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

The four diagrams presented below provide a structured and progressive view of how the script works. Each diagram details a specific part of the process, allowing the reader to understand, separately, the configuration steps, data requests, processing routines, and execution of the main pipeline. In the final diagram, these parts are integrated into an overview, making it easier to understand how all components work together.

The colors used in the diagrams represent groups of steps with similar roles within the pipeline: initial configuration, request and parsing operations, data validation and processing routines, and export actions. As a result, the same color appears across different diagrams whenever it refers to the same group of tasks, helping the reader quickly identify the category of each step and follow the full workflow for retrieving and processing ANA registration data.



Overview
--------

.. mermaid::

   flowchart TB
     A["Setup & Configuration"]:::configCode --> B["Schema & Registry Mapping"]:::configCode
     B --> C["Request & XML Parsing"]:::reqCode
     C --> D["Post-processing/Validation"]:::validacao
     D --> E["Outputs & Export"]:::exportacao

     %% Color palette
     classDef configCode fill:#fff3e0,stroke:#ef6c00;
     classDef reqCode fill:#e3f2fd,stroke:#1565c0;
     classDef validacao fill:#e8f5e9,stroke:#2e7d32;
     classDef exportacao fill:#ede7f6,stroke:#5e35b1;



Setup / Schema
--------------

.. mermaid::

   flowchart TB
     subgraph S1["Setup & Configuration"]
       A1["Load packages"]:::configCode
       A2["Define API constants"]:::configCode
       A3["Define helper/utility functions"]:::configCode
       A1 --> A2 --> A3
     end

     subgraph S2["Schema & Registry Mapping"]
       B1["Define file naming by station type"]:::configCode
       B2["Map registry (inventory) fields"]:::configCode
       B3["Define columns used for operation dates"]:::configCode
       B1 --> B2 --> B3
     end

     A3 --> B1

     %% Color palette
     classDef configCode fill:#fff3e0,stroke:#ef6c00;
     classDef reqCode fill:#e3f2fd,stroke:#1565c0;
     classDef validacao fill:#e8f5e9,stroke:#2e7d32;
     classDef exportacao fill:#ede7f6,stroke:#5e35b1;


Request / Parsing
-----------------

.. mermaid::

   flowchart TB
     C0["Validate station type (1 or 2)"]:::reqCode
     C1["Build GET request (params)"]:::reqCode
     C2{"HTTP 200?"}:::reqCode
     C2_no["Log HTTP error + return empty table"]:::reqCode
     C2_yes["Parse XML + drop namespaces"]:::reqCode

     C3{"XML error node?"}:::reqCode
     C3_yes["Log API error + return empty table"]:::reqCode
     C3_no["Locate <Table> nodes"]:::reqCode

     C4{"Any <Table> nodes?"}:::reqCode
     C4_no["Warn: no data for region/state + return empty table"]:::reqCode
     C4_yes["Extract stations + build raw table"]:::reqCode

     C0 --> C1 --> C2
     C2 -- "No" --> C2_no
     C2 -- "Yes" --> C2_yes --> C3
     C3 -- "Yes" --> C3_yes
     C3 -- "No" --> C3_no --> C4
     C4 -- "No" --> C4_no
     C4 -- "Yes" --> C4_yes

     %% Color palette
     classDef configCode fill:#fff3e0,stroke:#ef6c00;
     classDef reqCode fill:#e3f2fd,stroke:#1565c0;
     classDef validacao fill:#e8f5e9,stroke:#2e7d32;
     classDef exportacao fill:#ede7f6,stroke:#5e35b1;




Post-processing
---------------

.. mermaid::

   flowchart TB
     subgraph P1["Cleaning & Typing"]
       D1["Fix coordinates"]:::validacao
       D2["Convert numbers & dates"]:::validacao
       D3["Standardize text & codes"]:::validacao
       D1 --> D2 --> D3
     end

     subgraph P2["Operation Dates"]
       E1["Select period columns (by type)"]:::validacao
       E2["Compute OperationStartDate"]:::validacao
       E3["Compute OperationEndDate"]:::validacao
       E1 --> E2 --> E3
     end

     subgraph P3["Deduplication"]
       F1["Sort by administrative dates"]:::validacao
       F2["Keep most recent record per station code"]:::validacao
       F1 --> F2
     end

     subgraph P4["Geographic Validation"]
       G1["Clamp/flag altitude out of range"]:::validacao
       G2["Flag lat/lon outside Brazil"]:::validacao
       G1 --> G2
     end

     %% Pipeline connections
     D3 --> E1
     E3 --> F1
     F2 --> G1

     %% Color palette
     classDef configCode fill:#fff3e0,stroke:#ef6c00;
     classDef reqCode fill:#e3f2fd,stroke:#1565c0;
     classDef validacao fill:#e8f5e9,stroke:#2e7d32;
     classDef exportacao fill:#ede7f6,stroke:#5e35b1;



Outputs / Main Pipeline decision
---------------------------

.. mermaid::

   flowchart TB
     H0["Select station types + target states"]:::configCode
     H1{"Query mode"}:::reqCode
     H1a["Iterate: (type × state)"]:::reqCode
     H1b["Single call per type (all states)"]:::reqCode

     H2["Run post-processing & validation"]:::validacao
     H3["Filter by OperationStartDate"]:::exportacao
     H4["Generate summaries by state"]:::exportacao

     H5{"Export filtered stations?"}:::exportacao
     X1["Stations: .parquet + .xlsx"]:::exportacao
     X2["Summary by state: .xlsx"]:::exportacao
     H6["Return/store final results"]:::exportacao

     %% Pipeline logic
     H0 --> H1
     H1 -- "Iterate" --> H1a --> H2
     H1 -- "Single call" --> H1b --> H2
     H2 --> H3 --> H4 --> H5
     H5 -- "Yes" --> X1 --> X2 --> H6
     H5 -- "No" --> H6

     %% Color palette
     classDef configCode fill:#fff3e0,stroke:#ef6c00;
     classDef reqCode fill:#e3f2fd,stroke:#1565c0;
     classDef validacao fill:#e8f5e9,stroke:#2e7d32;
     classDef exportacao fill:#ede7f6,stroke:#5e35b1;



Descriptive information about listed gauges stations
====================================================

Streamflow gauges stations
--------------------------

This table presents descriptive information on the single list of streamflow gauges stations (type 1) registered in the ANA system. The following table provides values relating to the frequency of rain gauges according to the government agencies responsible.

**[Update pending]**


Rainfall gauges stations
------------------------

This table presents descriptive information on the single list of rain gauges stations (type 2) registered in the ANA system. The following table provides values relating to the frequency of rain gauges according to the government agencies responsible.

+--------------------+-----------------+
| Responsible agency | Frequency  (%)  |
+--------------------+-----------------+
| 1. ANA             | 4126 (20.6%)    |
+--------------------+-----------------+
| 2. CEMADEN         | 2533 (12.7%)    |
+--------------------+-----------------+
| 3. SPÁGUAS-SP      | 1878 (9.4%)     |
+--------------------+-----------------+
| 4. SUDENE          | 1348 (6.7%)     |
+--------------------+-----------------+
| 5. IAT-PR          | 827  (4.1%)     |
+--------------------+-----------------+
| 6. INMET           | 878  (4.1%)     |
+--------------------+-----------------+
| 7. FUNCEME-CE      | 791  (4.0%)     |
+--------------------+-----------------+
| 8. DNOCS           | 637  (3.2%)     |
+--------------------+-----------------+
| 9. EMPARN-RN       | 398  (2.0%)     |
+--------------------+-----------------+
| 10. DNOS           | 295  (1.5%)     |
+--------------------+-----------------+
| (706 others)       | 6325 (31.7%)    |
+--------------------+-----------------+


Of the 19985 stations registered com data de início de operação igual ou inferior a 01/01/2024, 20.6% estão sobre responsibility of the ANA, while 12.7% are under the responsibility of CEMADEN (Disaster Monitoring Centre). INMET (the National Meteorological Institute) has 4.1% of the stations registered in the ANA system. In addition to the 10 government agencies with the highest frequency of registered stations (68.3%), there are another 706 (31.7%) agencies with stations registered in the ANA system.


Spatial distribution of ANA's gauges stations
=============================================

Streamflow gauges stations
--------------------------

**[Update pending]**


Rainfall gauges stations
------------------------

**[Update pending]**

The following figure shows the spatial distribution of the rainfall gauges stations registered in the ANA system according to the agency responsible.


.. image:: _static/images/ana_img/grafico_estacoes_responsaveis.png
  :width: 600
  :alt: ANA gauges stations


Although there are stations all over Brazil, their greatest concentration is on the east coast, where the largest cities are concentrated.


**************************************
Download data from ANA gauges stations
**************************************

**[Update pending]**

Alternative data manual download
================================

Daily precipitation data for stations registered with the ANA can also be obtained through a manual download process via the open access `HidroWeb <https://www.snirh.gov.br/hidroweb/serieshistoricas>`_ system. From HidroWeb it is possible to access station information by code, name, type, operator, federative unit or associated river basin. However, the download is done individually per station, and a file (.zip) containing the precipitation data in the requested format (.txt, .csv or .mdb) is downloaded.


The HidroWeb system also informs about the possibility of API access. However, users who wish to access HidroWeb data and information in an automated way, using API, must send an email with a request for the data, which will be submitted for evaluation.

- Download precipitation data: https://www.snirh.gov.br/hidroweb/serieshistoricas
- Request API access: https://www.snirh.gov.br/hidroweb/acesso-api



Data Quality Index (DQI)
========================

**[Update pending]**

Limitations of ANA gauges dataset
=================================

**[Update pending]**



.. rubric:: References

(1) Agência Nacional de Águas e Saneamento Básico. (2025). ServiceANA: The following operations are supported. For a formal definition, please review the Service Description. Acessado em 01/12/2025, em: <https://telemetriaws1.ana.gov.br/ServiceANA.asmx> .

(2) Agência Nacional de Águas e Saneamento Básico. (2025). WebServices: Consulta as Estações Telemétricas. Acessado em 01/12/2025, em: <https://telemetriaws1.ana.gov.br/EstacoesTelemetricas.aspx> .


**Contributors**

+-------------------+----------------------------------------------------------------------+
| Marcos Eustorgio Filho | Center for Data and Knowledge Integration for Health (CIDACS),  |
|                        | Instituto Gonçalo Moniz, Fundação Oswaldo Cruz, Salvador, Brazil|
+-------------------+----------------------------------------------------------------------+
| Danielson Neves        | Center for Data and Knowledge Integration for Health (CIDACS),  |
|                        | Instituto Gonçalo Moniz, Fundação Oswaldo Cruz, Salvador, Brazil|
+-------------------+----------------------------------------------------------------------+




