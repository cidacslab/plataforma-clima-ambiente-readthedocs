# Configuration file for the Sphinx documentation builder.

# -- Project information

project = 'CIDACS Clima - Data descriptor'
copyright = '2025, Marcos Eustorgio Filho'
author = 'Marcos'

release = '0.1'
version = '0.1.0'

import sys
import os
import shlex

# -- General configuration

extensions = [
    'sphinx.ext.duration',
    'sphinx.ext.doctest',
    'sphinx.ext.autodoc',
    'sphinx.ext.autosummary',
    'sphinx.ext.intersphinx',
]

intersphinx_mapping = {
    'python': ('https://docs.python.org/3/', None),
    'sphinx': ('https://www.sphinx-doc.org/en/master/', None),
}
intersphinx_disabled_domains = ['std']

templates_path = ['_templates']

# Setando caminho para arquivos estaticos
html_static_path = ['_static', 'images']


# -- Options for HTML output

html_theme = 'sphinx_rtd_theme'

html_logo = 'cidacs_clima_logo.png'

htmlhelp_basename = 'TableswithSphinxdoc'


# -- Options for EPUB output
epub_show_urls = 'footnote'
