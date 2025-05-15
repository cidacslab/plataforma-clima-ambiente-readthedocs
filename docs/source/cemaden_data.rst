================
CEMADEN datasets
================
Updated: 2025-02-15

Introduction: What is CEMADEN?
------------------------------

CEMADEN (National Center for Monitoring and Alerts of Natural Disasters) is an institution linked to the Ministry of Science, Technology and Innovation (MCTI) that works in the monitoring of risks and the issuance of alerts of natural disasters in Brazil. Its main mission is to preserve lives and reduce socioeconomic damage by anticipating extreme events, such as landslides, floods, flash floods, and droughts.

CEMADEN collects environmental data from various sources and sensors spread throughout the national territory, through the Observational Network, which comprises meteorological, hydrological, rainfall, geotechnical stations, among others.


How to access the data: PED Platform
------------------------------------

The observational data collected by CEMADEN are available to the public through the Data Delivery Platform (PED). In it, anyone can make data requests, respecting some rules:

*	Limit of requests:

  *	External users: up to 12 requests per minute.
  *	Institutional partners: up to 180 requests per minute.

*	Scheduled requests (histories) are available for download for 30 days .
*	Accounts that have been inactive for more than one year are automatically removed.
*	It is mandatory to cite the source of the data when using them: DADOS DA REDE OBSERVACIONAL DO CEMADEN/MCTIC.


Data structure
--------------

The data made available in the PED follow a clear organization, both in format and classification:

*	Each station file can contain data in two formats:

  *	Daily (e.g., accumulated rainfall per day);
  *	Non-daily (e.g. hourly, real-time data).

*	The categories of data are organized as follows:

  *	Category → (Daily / Non-daily)

*	Station Type:

  *	"C" → Acqua
  *	"U" → Agrometeorological
  *	"G" → Geotechnical
  *	"H" → Hydrological
  *	"A" → Rainfall
  *	"B" → Rainfall B
  *	"T" → Test


Types of sensors
^^^^^^^^^^^^^^^^

Each type of station monitored by CEMADEN presents data according to some sensors. These sensors monitor different environmental variables. Among them, we have:

.. _tabela-sensores:

.. table:: Tipos de sensores para estações do CEMADEN
   :widths: auto
   :align: center

+---------------------------------------------+------+
| Description                                 | Code |
+---------------------------------------------+------+
| Rain                                        | 10   |
| Level                                       | 20   |
| Air temperature                             | 60   |
| Relative humidity                           | 90   |
| Wind speed                                  | 180  |
| Wind direction                              | 190  |
| Solar radiation                             | 210  |
| Precipitation Intensity                     | 240  |
| Minimum Level                               | 260  |
| Maximum Level                               | 270  |
| Balance Radiation                           | 280  |
| Soil Temperature Level 1                    | 290  |
| Soil Temperature Level 2                    | 300  |
| Soil Temperature Level 3                    | 310  |
| Soil Temperature Level 4                    | 320  |
| Soil Moisture Level 1                       | 330  |
| Soil Moisture Level 2                       | 340  |
| Soil Moisture Level 3                       | 350  |
| Soil Moisture Level 4                       | 360  |
| Maximum daily air temperature               | 370  |
| Maximum daily relative humidity             | 390  |
| Minimum daily relative humidity             | 400  |
| Maximum daily wind speed                    | 410  |
| Wind direction at maximum daily speed       | 420  |
| Daily prevailing wind direction             | 430  |
| Soil Temperature Level 1 Maximum Daily      | 440  |
| Soil Temperature Level 1 Daily Minimum      | 450  |
| Soil Temperature Level 2 Maximum Daily      | 460  |
| Soil Temperature Level 2 Daily Minimum      | 470  |
| Soil Temperature Level 3 Maximum Daily      | 480  |
| Soil Temperature Level 3 Daily Minimum      | 490  |
| Soil Temperature Level 4 Maximum Daily      | 500  |
| Soil Temperature Level 4 Daily Minimum      | 510  |
| Soil Moisture Level 1 Maximum Daily         | 520  |
| Soil Moisture Level 1 Daily Minimum         | 530  |
| Soil Moisture Level 2 Maximum Daily         | 540  |
| Soil Moisture Level 2 Minimum Daily         | 550  |
| Soil Moisture Level 3 Maximum Daily         | 560  |
| Soil Moisture Level 3 Minimum Daily         | 570  |
| Soil Moisture Level 4 Maximum Daily         | 580  |
| Soil Moisture Level 4 Minimum Daily         | 590  |
| Daily Accumulated Precipitation             | 600  |
| Soil Moisture Level 5                       | 610  |
| Soil Moisture Level 6                       | 620  |
| Soil Moisture Level 5 Maximum Daily         | 630  |
| Soil Moisture Level 5 Minimum Daily         | 640  |
| Soil Moisture Level 6 Maximum Daily         | 650  |
| Soil Moisture Level 6 Minimum Daily         | 660  |
+---------------------------------------------+------+


Important: Not all station types have data for the Daily or Non-Daily categories and neither do the same sensors. Each type can provide different data, depending on its specific sensors.

Titulo nível 2
^^^^^^^^^^^^^^

Titulo nível 2
^^^^^^^^^^^^^^

Titulo nível 2
^^^^^^^^^^^^^^

Titulo nível 3
~~~~~~~~~~~~~~

Titulo nível 4
++++++++++++++


Titulo nível 5
..............


