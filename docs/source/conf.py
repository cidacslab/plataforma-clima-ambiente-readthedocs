# Configuration file for the Sphinx documentation builder.

# -- Project information

project = 'CIDACS Clima - Data descriptor'
copyright = '2025, Centro de Integração de Dados e Conhecimentos para Saúde (CIDACS) / Fiocruz'
author = 'CIDACS / Fiocruz'

release = '0.1'
version = '0.1.1'

import sys
import os
import shlex

# -- General configuration
#'sphinxmermaid'
extensions = [
    'sphinx.ext.duration',
    'sphinx.ext.doctest',
    'sphinx.ext.autodoc',
    'sphinx.ext.autosummary',
    'sphinx.ext.intersphinx',
    'sphinxcontrib.mermaid'
]

intersphinx_mapping = {
    'python': ('https://docs.python.org/3/', None),
    'sphinx': ('https://www.sphinx-doc.org/en/master/', None),
}
intersphinx_disabled_domains = ['std']

templates_path = ['_templates']

# Setando caminho para arquivos estaticos
html_static_path = ['_static']

# -- Options for diagrams output

#mermaid_output_format = "svg"
mermaid_params = ["-p", "puppeteer-config.json"]

# Use list form (mais compativel)
#mermaid_cmd = ["npx", "--no-install", "mmdc"]

mermaid_init_js = """
mermaid.initialize({
  startOnLoad: true,
  theme: "default",
  flowchart: {
    useMaxWidth: true,
    nodeSpacing: 70,
    rankSpacing: 80
  },
  themeVariables: {
    fontSize: "20px"
  }
});
"""


# -- Options for HTML output

html_theme = 'sphinx_rtd_theme'

html_css_files = ['css/custom.css']

html_logo = '_static/images/cidacs_clima_logo.png'

htmlhelp_basename = 'TableswithSphinxdoc'


# -- Options for EPUB output
epub_show_urls = 'footnote'
