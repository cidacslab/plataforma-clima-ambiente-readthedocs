/**
 * custom.js
 * Habilita pan + zoom nos diagramas Mermaid gerados pelo Sphinx.
 *
 * ESTRATÉGIA: o SVG permanece dentro do div.mermaid original.
 * O wrapper externo serve apenas para hospedar os controles de zoom.
 * Isso preserva o botão de expansão nativo do tema RTD, que depende
 * de encontrar o SVG dentro do div.mermaid.
 *
 * Dependência: svg-pan-zoom (CDN, sem instalação).
 *
 * Integração (conf.py):
 *   html_static_path = ['_static']
 *   html_css_files   = ['css/custom.css']
 *   html_js_files    = ['js/custom.js']
 */

(function () {
  "use strict";

  var CDN_URL =
    "https://cdn.jsdelivr.net/npm/svg-pan-zoom@3.6.1/dist/svg-pan-zoom.min.js";

  /* ------------------------------------------------------------------ */
  /* 1. Carrega svg-pan-zoom via CDN                                     */
  /* ------------------------------------------------------------------ */
  function loadScript(src, callback) {
    var s   = document.createElement("script");
    s.src   = src;
    s.async = true;
    s.onload  = callback;
    s.onerror = function () {
      console.warn("[mermaid-zoom] Falha ao carregar svg-pan-zoom:", src);
    };
    document.head.appendChild(s);
  }

  /* ------------------------------------------------------------------ */
  /* 2. Calcula altura adequada a partir do viewBox do SVG              */
  /* ------------------------------------------------------------------ */
  function calcHeight(svg, mermaidDiv) {
    var vb = svg.getAttribute("viewBox");
    if (vb) {
      var parts = vb.split(/[\s,]+/);
      if (parts.length === 4) {
        var vbW = parseFloat(parts[2]);
        var vbH = parseFloat(parts[3]);
        if (vbW > 0 && vbH > 0) {
          /* Proporcional à largura real do container, limitado a 85vh */
          var containerW = mermaidDiv.offsetWidth || 800;
          var natural    = (vbH / vbW) * containerW;
          return Math.min(natural, window.innerHeight * 0.85);
        }
      }
    }
    /* Fallback: usa a altura natural do SVG ou 520px */
    return Math.min(
      svg.getBoundingClientRect().height || 520,
      window.innerHeight * 0.85
    );
  }

  /* ------------------------------------------------------------------ */
  /* 3. Aplica zoom a um único div.mermaid que já contém um SVG         */
  /* ------------------------------------------------------------------ */
  function applyZoom(mermaidDiv) {
    if (mermaidDiv.dataset.zoomReady === "1") return;

    var svg = mermaidDiv.querySelector("svg");
    if (!svg) return;

    mermaidDiv.dataset.zoomReady = "1";

    /* ---- 3a. Garante viewBox ---- */
    if (!svg.getAttribute("viewBox")) {
      var r = svg.getBoundingClientRect();
      var w = r.width  || svg.scrollWidth  || 800;
      var h = r.height || svg.scrollHeight || 520;
      svg.setAttribute("viewBox", "0 0 " + w + " " + h);
    }

    /* ---- 3b. Dimensiona div.mermaid como área de zoom ---- */
    /*
     * O SVG permanece aqui dentro — não é movido.
     * Apenas aplicamos estilos e svg-pan-zoom sobre ele.
     */
    var areaH = calcHeight(svg, mermaidDiv);
    mermaidDiv.classList.add("mermaid-zoom-area");
    mermaidDiv.style.height = Math.round(areaH) + "px";

    svg.removeAttribute("width");
    svg.removeAttribute("height");
    svg.style.width   = "100%";
    svg.style.height  = "100%";
    svg.style.display = "block";

    /* ---- 3c. Cria wrapper externo e controles ---- */
    var wrapper = document.createElement("div");
    wrapper.className = "mermaid-zoom-wrapper";

    var uid = "mz-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6);

    var controls = document.createElement("div");
    controls.className = "mermaid-zoom-controls";
    controls.innerHTML =
      '<span class="zoom-label">Zoom</span>'                                         +
      '<button class="btn-zoom-in"    title="Ampliar (+)">+</button>'                +
      '<span   class="zoom-level" id="' + uid + '">100%</span>'                     +
      '<button class="btn-zoom-out"   title="Reduzir (&#8722;)">&#8722;</button>'   +
      '<button class="btn-zoom-reset" title="Restaurar">&#8635;</button>';

    /*
     * Envolve o div.mermaid original com o wrapper.
     * O SVG continua dentro de div.mermaid — o RTD expand button
     * ainda o encontrará no lugar esperado.
     */
    mermaidDiv.parentNode.insertBefore(wrapper, mermaidDiv);
    wrapper.appendChild(mermaidDiv);   /* move o div.mermaid (com SVG) */
    wrapper.appendChild(controls);

    /* ---- 3d. Inicializa svg-pan-zoom sobre o SVG in-place ---- */
    var panZoom;
    try {
      panZoom = svgPanZoom(svg, {
        zoomEnabled:          true,
        panEnabled:           true,
        controlIconsEnabled:  false,
        fit:                  true,
        center:               true,
        minZoom:              0.1,
        maxZoom:              20,
        zoomScaleSensitivity: 0.25,
        onZoom: function (scale) {
          var lbl = document.getElementById(uid);
          if (lbl) lbl.textContent = Math.round(scale * 100) + "%";
        }
      });
    } catch (e) {
      console.warn("[mermaid-zoom] svg-pan-zoom falhou:", e);
      return;
    }

    /* Mostra zoom inicial */
    var lbl = document.getElementById(uid);
    if (lbl) lbl.textContent = Math.round(panZoom.getZoom() * 100) + "%";

    /* ---- 3e. Botões ---- */
    controls.querySelector(".btn-zoom-in").addEventListener("click", function () {
      panZoom.zoomIn();
    });
    controls.querySelector(".btn-zoom-out").addEventListener("click", function () {
      panZoom.zoomOut();
    });
    controls.querySelector(".btn-zoom-reset").addEventListener("click", function () {
      panZoom.resetZoom();
      panZoom.center();
    });

    /* ---- 3f. Redimensionamento da janela ---- */
    window.addEventListener("resize", function () {
      /* Recalcula altura proporcional */
      var newH = calcHeight(svg, mermaidDiv);
      mermaidDiv.style.height = Math.round(newH) + "px";
      panZoom.resize();
      panZoom.fit();
      panZoom.center();
    });
  }

  /* ------------------------------------------------------------------ */
  /* 4. Tenta aplicar a todos os div.mermaid presentes                  */
  /* ------------------------------------------------------------------ */
  function applyToAll() {
    document.querySelectorAll("div.mermaid").forEach(applyZoom);
  }

  /* ------------------------------------------------------------------ */
  /* 5. MutationObserver — reage no exato momento em que o Mermaid      */
  /*    insere o SVG, sem depender de timeouts fixos                    */
  /* ------------------------------------------------------------------ */
  function startObserver() {
    var observer = new MutationObserver(function (mutations) {
      var dirty = false;
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeName === "svg") {
            /* SVG inserido diretamente num div.mermaid */
            var p = node.parentElement;
            if (p && p.classList.contains("mermaid")) {
              applyZoom(p);
              dirty = true;
            }
          } else if (node.nodeType === 1 && node.querySelectorAll) {
            /* Container adicionado — procura SVGs filhos */
            node.querySelectorAll("div.mermaid svg").forEach(function (s) {
              var m = s.closest ? s.closest("div.mermaid") : s.parentElement;
              if (m) { applyZoom(m); dirty = true; }
            });
          }
        });
      });
    });

    var root = document.querySelector(".wy-nav-content-wrap") ||
               document.querySelector(".wy-nav-content")     ||
               document.body;

    observer.observe(root, { childList: true, subtree: true });

    /* Tenta imediatamente (diagramas já prontos) */
    applyToAll();

    /* Fallbacks escalonados como segurança extra */
    [600, 1800, 4000, 7000].forEach(function (ms) {
      setTimeout(applyToAll, ms);
    });
  }

  /* ------------------------------------------------------------------ */
  /* 6. Ponto de entrada                                                 */
  /* ------------------------------------------------------------------ */
  function init() {
    loadScript(CDN_URL, startObserver);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
