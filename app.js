"use strict";

/* =========================================================
   NEUROGRAPH — Interactive Brain Graph Simulator
   Educational demonstration; synthetic data only.
========================================================= */

const STORAGE_KEY = "neurograph_premium_v1";

const SAMPLE_DATA = {
  nodes: [
    { id: "n1", name: "Prefrontal Cortex", category: "Frontal", description: "An illustrative region associated with planning and executive functions.", x: 250, y: 135 },
    { id: "n2", name: "Motor Cortex", category: "Frontal", description: "An illustrative region associated with voluntary movement.", x: 320, y: 205 },
    { id: "n3", name: "Somatosensory Cortex", category: "Parietal", description: "An illustrative region associated with processing bodily sensations.", x: 440, y: 145 },
    { id: "n4", name: "Visual Cortex", category: "Occipital", description: "An illustrative region associated with visual processing.", x: 555, y: 200 },
    { id: "n5", name: "Auditory Cortex", category: "Temporal", description: "An illustrative region associated with processing sound.", x: 470, y: 290 },
    { id: "n6", name: "Hippocampus", category: "Limbic", description: "An illustrative region associated with learning and memory.", x: 350, y: 310 },
    { id: "n7", name: "Amygdala", category: "Limbic", description: "An illustrative region associated with emotional processing.", x: 280, y: 300 },
    { id: "n8", name: "Cerebellum", category: "Cerebellar", description: "An illustrative region associated with coordination and motor learning.", x: 565, y: 345 }
  ],
  edges: [
    { source: "n1", target: "n2", weight: 1.2 },
    { source: "n1", target: "n3", weight: 2.0 },
    { source: "n1", target: "n6", weight: 1.4 },
    { source: "n2", target: "n3", weight: 1.1 },
    { source: "n2", target: "n7", weight: 1.6 },
    { source: "n3", target: "n4", weight: 1.8 },
    { source: "n3", target: "n5", weight: 1.3 },
    { source: "n4", target: "n5", weight: 1.0 },
    { source: "n5", target: "n6", weight: 1.7 },
    { source: "n6", target: "n7", weight: 1.1 },
    { source: "n5", target: "n8", weight: 2.1 }
  ]
};

const $ = (id) => document.getElementById(id);

const state = {
  nodes: [],
  edges: [],
  selectedNode: null,
  activePage: "overview",
  activity: [],
  lastAlgorithm: null,
  darkMode: true
};

function uid(prefix = "n") {
  return prefix + "_" + Date.now().toString(36) +
    Math.random().toString(36).slice(2, 7);
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function number(value, decimals = 1) {
  return Number(value || 0).toFixed(decimals);
}

function nodeById(id) {
  return state.nodes.find(node => node.id === id);
}

function nodeName(id) {
  return nodeById(id)?.name || "Unknown region";
}

function degree(id) {
  return state.edges.filter(edge =>
    edge.source === id || edge.target === id
  ).length;
}

function neighbors(id) {
  const result = [];
  state.edges.forEach(edge => {
    if (edge.source === id) result.push(edge.target);
    if (edge.target === id) result.push(edge.source);
  });
  return [...new Set(result)];
}

function normalizedEdge(source, target) {
  return [source, target].sort().join("|");
}

function edgeExists(source, target) {
  return state.edges.some(edge =>
    normalizedEdge(edge.source, edge.target) ===
    normalizedEdge(source, target)
  );
}

function graphStats() {
  const count = state.nodes.length;
  const edgeCount = state.edges.length;
  const possible = count > 1 ? count * (count - 1) / 2 : 0;
  const density = possible ? edgeCount / possible : 0;
  const degrees = state.nodes.map(node => degree(node.id));
  const totalDegree = degrees.reduce((sum, item) => sum + item, 0);

  return {
    nodes: count,
    edges: edgeCount,
    density,
    averageDegree: count ? totalDegree / count : 0,
    components: connectedComponents().length,
    isolated: state.nodes.filter(node => degree(node.id) === 0),
    totalWeight: state.edges.reduce((sum, edge) => sum + edge.weight, 0),
    maxDegree: Math.max(0, ...degrees)
  };
}

function connectedComponents() {
  const visited = new Set();
  const groups = [];

  for (const node of state.nodes) {
    if (visited.has(node.id)) continue;

    const group = [];
    const queue = [node.id];
    visited.add(node.id);

    while (queue.length) {
      const current = queue.shift();
      group.push(current);

      for (const next of neighbors(current)) {
        if (!visited.has(next)) {
          visited.add(next);
          queue.push(next);
        }
      }
    }

    groups.push(group);
  }

  return groups;
}

/* ------------------- Persistence ------------------- */

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      nodes: state.nodes,
      edges: state.edges,
      activity: state.activity.slice(0, 40),
      savedAt: new Date().toISOString()
    }));
  } catch (error) {
    console.error("Unable to save workspace:", error);
    toast("Could not save data in browser storage.", true);
  }
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (raw) {
      const data = JSON.parse(raw);

      if (validateDataset(data, false)) {
        state.nodes = data.nodes;
        state.edges = data.edges;
        state.activity = Array.isArray(data.activity)
          ? data.activity.slice(0, 40)
          : [];
        return;
      }
    }
  } catch (error) {
    console.warn("Saved workspace could not be loaded:", error);
  }

  state.nodes = structuredClone(SAMPLE_DATA.nodes);
  state.edges = structuredClone(SAMPLE_DATA.edges);
  state.activity = [];
}

function validateDataset(data, showErrors = true) {
  const fail = message => {
    if (showErrors) toast(message, true);
    return false;
  };

  if (!data || !Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
    return fail("Invalid file: nodes and edges arrays are required.");
  }

  if (data.nodes.length > 500 || data.edges.length > 5000) {
    return fail("Dataset exceeds the demo import limit.");
  }

  const ids = new Set();

  for (const node of data.nodes) {
    if (!node || typeof node.id !== "string" ||
        typeof node.name !== "string" || !node.name.trim()) {
      return fail("Invalid node record.");
    }

    if (ids.has(node.id)) return fail("Duplicate node ID found.");
    ids.add(node.id);
  }

  const seenEdges = new Set();

  for (const edge of data.edges) {
    if (!edge || !ids.has(edge.source) || !ids.has(edge.target)) {
      return fail("A connection refers to a missing node.");
    }

    if (edge.source === edge.target) {
      return fail("Self-connections are not supported in this demo.");
    }

    if (!Number.isFinite(Number(edge.weight)) ||
        Number(edge.weight) <= 0) {
      return fail("Connection weights must be positive numbers.");
    }

    const key = normalizedEdge(edge.source, edge.target);
    if (seenEdges.has(key)) {
      return fail("Duplicate connection found.");
    }

    seenEdges.add(key);
  }

  return true;
}

/* ------------------- Notifications & Activity ------------------- */

function toast(message, error = false) {
  const region = $("toastRegion");
  if (!region) return;

  const element = document.createElement("div");
  element.className = "toast" + (error ? " error" : "");
  element.textContent = message;
  region.appendChild(element);

  setTimeout(() => element.remove(), 3500);
}

function logActivity(title, detail = "") {
  state.activity.unshift({
    id: uid("event"),
    title,
    detail,
    time: new Date().toISOString()
  });

  state.activity = state.activity.slice(0, 40);
  save();
  renderActivity();
}

function relativeTime(timestamp) {
  const seconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000)
  );

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return Math.floor(seconds / 60) + " min ago";
  if (seconds < 86400) return Math.floor(seconds / 3600) + " hr ago";

  return Math.floor(seconds / 86400) + " days ago";
}

function renderActivity() {
  const container = $("activityList");
  if (!container) return;

  if (!state.activity.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-symbol">⌁</div>
        <h4>No recent events</h4>
        <p>Network changes and algorithm runs will appear here.</p>
      </div>`;
    return;
  }

  container.innerHTML = state.activity.slice(0, 7).map(event => `
    <div class="activity-row">
      <div class="activity-icon">⌁</div>
      <div class="activity-copy">
        <strong>${escapeHTML(event.title)}</strong>
        <small>${escapeHTML(event.detail)}</small>
      </div>
      <span class="activity-time">${escapeHTML(relativeTime(event.time))}</span>
    </div>
  `).join("");
}

/* ------------------- Navigation ------------------- */

const PAGE_NAMES = {
  overview: "Overview",
  brain: "Brain Network",
  nodes: "Nodes & Connections",
  algorithms: "Algorithms Lab",
  analytics: "Network Analytics",
  data: "Data & Export"
};

function showPage(page) {
  if (!PAGE_NAMES[page]) return;

  state.activePage = page;

  document.querySelectorAll(".page").forEach(element => {
    element.classList.toggle("active", element.id === "page-" + page);
  });

  document.querySelectorAll("[data-page]").forEach(button => {
    if (button.classList.contains("nav-item")) {
      button.classList.toggle("active", button.dataset.page === page);
    }
  });

  if ($("breadcrumb")) $("breadcrumb").textContent = PAGE_NAMES[page];

  $("sidebar")?.classList.remove("open");

  if (page === "brain") {
    renderBrain();
    renderInspector();
  }

  if (page === "nodes") renderTables();
  if (page === "analytics") renderAnalytics();
  if (page === "data") renderDataPage();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ------------------- SVG Brain Visualization ------------------- */

const BRAIN_NODES = [
  { x: 150, y: 145 }, { x: 220, y: 85 }, { x: 300, y: 68 },
  { x: 375, y: 90 }, { x: 450, y: 70 }, { x: 525, y: 100 },
  { x: 590, y: 155 }, { x: 635, y: 215 }, { x: 595, y: 275 },
  { x: 525, y: 325 }, { x: 450, y: 350 }, { x: 375, y: 320 },
  { x: 300, y: 350 }, { x: 225, y: 310 }, { x: 170, y: 250 },
  { x: 300, y: 180 }, { x: 380, y: 190 }, { x: 455, y: 225 }
];

function brainOutline() {
  return `
    <defs>
      <linearGradient id="brainFill" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#9573ff" stop-opacity=".13"/>
        <stop offset="100%" stop-color="#50d9ed" stop-opacity=".035"/>
      </linearGradient>
      <linearGradient id="edgeGlow" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#a78bfa"/>
        <stop offset="100%" stop-color="#62d9ef"/>
      </linearGradient>
      <filter id="nodeGlow" x="-200%" y="-200%" width="400%" height="400%">
        <feGaussianBlur stdDeviation="4" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <path d="M390 85
      C355 45 295 40 250 57
      C206 40 158 66 145 103
      C103 118 91 158 110 193
      C84 224 101 269 134 286
      C138 326 184 347 221 330
      C251 365 302 368 340 342
      C364 328 377 307 390 287 Z"
      fill="url(#brainFill)" stroke="#9277e6" stroke-opacity=".7" stroke-width="1.8"/>
    <path d="M390 85
      C426 45 484 40 529 57
      C573 40 621 66 634 103
      C676 118 688 158 669 193
      C695 224 678 269 645 286
      C641 326 595 347 558 330
      C528 365 477 368 439 342
      C415 328 402 307 390 287 Z"
      fill="url(#brainFill)" stroke="#9277e6" stroke-opacity=".7" stroke-width="1.8"/>
    <path d="M390 85 C377 130 404 161 390 205 C377 244 404 270 390 287"
      fill="none" stroke="#62d9ef" stroke-opacity=".65" stroke-width="2"
      stroke-dasharray="4 5"/>
    <g fill="none" stroke="#8f7bd6" stroke-opacity=".35" stroke-width="1.5">
      <path d="M160 118 Q215 130 190 180 T210 258"/>
      <path d="M235 68 Q270 110 250 155 T290 215"/>
      <path d="M300 58 Q330 105 305 140 T340 200"/>
      <path d="M165 200 Q225 210 240 270"/>
      <path d="M220 310 Q260 285 280 330"/>
      <path d="M620 118 Q565 130 590 180 T570 258"/>
      <path d="M545 68 Q510 110 530 155 T490 215"/>
      <path d="M480 58 Q450 105 475 140 T440 200"/>
      <path d="M615 200 Q555 210 540 270"/>
      <path d="M560 310 Q520 285 500 330"/>
    </g>`;
}

function createBrainSVG(containerId, mini = false) {
  const container = $(containerId);
  if (!container) return;

  const width = 780;
  const height = 405;

  const positions = new Map();

  state.nodes.forEach((node, index) => {
    const fallback = BRAIN_NODES[index % BRAIN_NODES.length];

    let x = Number.isFinite(Number(node.x)) ? Number(node.x) : fallback.x;
    let y = Number.isFinite(Number(node.y)) ? Number(node.y) : fallback.y;

    // Keep node positions within the brain drawing.
    x = Math.max(115, Math.min(665, x));
    y = Math.max(50, Math.min(370, y));

    positions.set(node.id, { x, y });
  });

  const edgesMarkup = state.edges.map(edge => {
    const a = positions.get(edge.source);
    const b = positions.get(edge.target);
    if (!a || !b) return "";

    const selected = state.selectedNode &&
      (edge.source === state.selectedNode || edge.target === state.selectedNode);

    const color = selected ? "#62d9ef" : "#8873d2";
    const opacity = state.selectedNode ? (selected ? 0.95 : 0.13) : 0.52;
    const stroke = Math.max(1, Math.min(3, Number(edge.weight) || 1));

    return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"
      stroke="${color}" stroke-width="${stroke}" stroke-opacity="${opacity}"
      stroke-linecap="round"/>`;
  }).join("");

  const nodesMarkup = state.nodes.map(node => {
    const p = positions.get(node.id);
    const selected = state.selectedNode === node.id;
    const connected = state.selectedNode &&
      neighbors(state.selectedNode).includes(node.id);
    const degreeValue = degree(node.id);

    const query = mini ? "" : ($("brainSearch")?.value || "").trim().toLowerCase();
    const matchesSearch = !query || node.name.toLowerCase().includes(query);
    const filter = mini ? "all" : ($("brainFilter")?.value || "all");
    const matchesFilter =
      filter === "all" ||
      (filter === "connected" && degreeValue > 0) ||
      (filter === "isolated" && degreeValue === 0);

    const visible = matchesSearch && matchesFilter;
    const color = selected ? "#c6a8ff" :
      connected ? "#62d9ef" : "#a18af5";
    const opacity = visible ? 1 : 0.12;
    const radius = selected ? 8 : (mini ? 4 : 6);

    return `
      <g class="brain-node" data-node-id="${escapeHTML(node.id)}"
         role="button" tabindex="${mini ? -1 : 0}"
         aria-label="${escapeHTML(node.name)}"
         style="cursor:${mini ? "default" : "pointer"};opacity:${opacity}">
        ${!mini && selected ? `<circle cx="${p.x}" cy="${p.y}" r="18" fill="#a78bfa" fill-opacity=".12"/>` : ""}
        <circle cx="${p.x}" cy="${p.y}" r="${radius + 5}"
          fill="${color}" fill-opacity="${selected ? .12 : .05}"/>
        <circle cx="${p.x}" cy="${p.y}" r="${radius}"
          fill="${color}" stroke="#e5dcff" stroke-opacity=".8" stroke-width="1"
          ${selected ? 'filter="url(#nodeGlow)"' : ""}/>
        ${!mini && visible ? `
          <text x="${p.x}" y="${p.y + 19}" text-anchor="middle"
            fill="#d8d2f1" font-size="10"
            stroke="#101020" stroke-width="3" paint-order="stroke">
            ${escapeHTML(node.name.length > 19 ? node.name.slice(0, 17) + "…" : node.name)}
          </text>` : ""}
      </g>`;
  }).join("");

  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img"
         aria-label="Schematic brain-shaped graph showing brain regions and their connections">
      ${brainOutline()}
      <g class="brain-edges">${edgesMarkup}</g>
      <g class="brain-nodes">${nodesMarkup}</g>
    </svg>`;

  if (!mini) {
    container.querySelectorAll(".brain-node").forEach(element => {
      const select = () => selectNode(element.dataset.nodeId);
      element.addEventListener("click", select);
      element.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          select();
        }
      });
    });
  }
}

function renderBrain() {
  createBrainSVG("brainCanvas", false);
}

function renderMiniBrain() {
  createBrainSVG("miniBrain", true);
}

/* ------------------- Node Inspector ------------------- */

function selectNode(id) {
  if (!nodeById(id)) return;

  state.selectedNode = id;
  renderBrain();
  renderInspector();
}

function renderInspector() {
  const container = $("nodeInspector");
  if (!container) return;

  const node = nodeById(state.selectedNode);

  if (!node) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-symbol">◎</div>
        <h4>Select a region</h4>
        <p>Click any node on the brain map to see its properties and neighbors.</p>
      </div>`;
    return;
  }

  const linked = neighbors(node.id);
  const edges = state.edges.filter(edge =>
    edge.source === node.id || edge.target === node.id
  );

  container.innerHTML = `
    <div class="node-hero">
      <div class="node-orb">◎</div>
      <h4>${escapeHTML(node.name)}</h4>
      <p>${escapeHTML(node.category || "Other")} region</p>
    </div>

    <div class="detail-grid">
      <div class="detail-box"><small>Node degree</small><strong>${degree(node.id)}</strong></div>
      <div class="detail-box"><small>Connections</small><strong>${linked.length}</strong></div>
      <div class="detail-box"><small>Node ID</small><strong style="font-size:11px">${escapeHTML(node.id.slice(0, 10))}</strong></div>
      <div class="detail-box"><small>Mean edge weight</small><strong>${number(edges.length ? edges.reduce((s,e) => s + Number(e.weight), 0) / edges.length : 0)}</strong></div>
    </div>

    <div class="inspector-section">
      <h4>ABOUT THIS REGION</h4>
      <p class="muted">${escapeHTML(node.description || "No description provided.")}</p>
    </div>

    <div class="inspector-section">
      <h4>CONNECTED REGIONS (${linked.length})</h4>
      ${linked.length
        ? linked.map(id => `<button class="neighbor-chip" data-neighbor="${escapeHTML(id)}">${escapeHTML(nodeName(id))}</button>`).join("")
        : '<p class="muted">No connections yet.</p>'}
    </div>

    <div class="inspector-section">
      <button class="secondary-button full-width" id="inspectInTable">Manage this region</button>
    </div>`;

  container.querySelectorAll("[data-neighbor]").forEach(button => {
    button.addEventListener("click", () => selectNode(button.dataset.neighbor));
  });

  $("inspectInTable")?.addEventListener("click", () => {
    showPage("nodes");
    $("nodeSearch").value = node.name;
    renderTables();
  });
}

/* ------------------- Overview ------------------- */

function renderOverview() {
  const stats = graphStats();

  if ($("statNodes")) $("statNodes").textContent = stats.nodes;
  if ($("statEdges")) $("statEdges").textContent = stats.edges;
  if ($("statDensity")) $("statDensity").textContent = number(stats.density * 100, 1) + "%";
  if ($("statComponents")) $("statComponents").textContent = stats.components;
  if ($("densityBar")) $("densityBar").style.width = (stats.density * 100) + "%";

  renderMiniBrain();

  const top = [...state.nodes]
    .sort((a, b) => degree(b.id) - degree(a.id) || a.name.localeCompare(b.name))
    .slice(0, 5);

  const max = Math.max(1, ...top.map(node => degree(node.id)));

  if ($("topNodes")) {
    $("topNodes").innerHTML = top.length ? top.map(node => `
      <div class="rank-row">
        <span class="rank-name">${escapeHTML(node.name)}</span>
        <div class="rank-track"><div class="rank-fill" style="width:${degree(node.id) / max * 100}%"></div></div>
        <span class="rank-number">${degree(node.id)}</span>
      </div>
    `).join("") : '<p class="muted">No regions available.</p>';
  }

  renderActivity();
}

/* ------------------- Select Menus ------------------- */

function populateSelects() {
  const options = state.nodes.map(node =>
    `<option value="${escapeHTML(node.id)}">${escapeHTML(node.name)}</option>`
  ).join("");

  ["edgeFrom", "edgeTo", "algorithmStart", "algorithmTarget"].forEach(id => {
    const select = $(id);
    if (!select) return;

    const previous = select.value;
    select.innerHTML = options;

    if (state.nodes.some(node => node.id === previous)) {
      select.value = previous;
    }
  });

  if ($("edgeTo") && $("edgeTo").options.length > 1) {
    if ($("edgeTo").value === $("edgeFrom")?.value) {
      $("edgeTo").selectedIndex = 1;
    }
  }

  updateAlgorithmFields();
}

function updateAlgorithmFields() {
  const type = $("algorithmType")?.value;
  const field = $("targetField");
  if (field) field.style.display = type === "dijkstra" ? "grid" : "none";
}

/* ------------------- Node & Edge Tables ------------------- */

function renderTables() {
  populateSelects();

  const query = ($("nodeSearch")?.value || "").trim().toLowerCase();
  const filtered = state.nodes.filter(node =>
    node.name.toLowerCase().includes(query) ||
    String(node.category || "").toLowerCase().includes(query)
  );

  if ($("nodeTable")) {
    $("nodeTable").innerHTML = filtered.length ? filtered.map(node => `
      <tr>
        <td><div class="region-cell"><i class="region-dot"></i><strong>${escapeHTML(node.name)}</strong></div></td>
        <td><span class="category-tag">${escapeHTML(node.category || "Other")}</span></td>
        <td>${degree(node.id)}</td>
        <td>${neighbors(node.id).length}</td>
        <td>
          <button class="table-action" data-edit-node="${escapeHTML(node.id)}">Edit</button>
          <button class="table-action danger" data-delete-node="${escapeHTML(node.id)}">Delete</button>
        </td>
      </tr>`).join("") : '<tr><td colspan="5">No matching regions.</td></tr>';
  }

  if ($("edgeTable")) {
    $("edgeTable").innerHTML = state.edges.length ? state.edges.map((edge, index) => `
      <tr>
        <td>${escapeHTML(nodeName(edge.source))}</td>
        <td>${escapeHTML(nodeName(edge.target))}</td>
        <td>${number(edge.weight)}</td>
        <td><button class="table-action danger" data-delete-edge="${index}">Remove</button></td>
      </tr>`).join("") : '<tr><td colspan="4">No connections available.</td></tr>';
  }

  if ($("edgeCountLabel")) {
    $("edgeCountLabel").textContent = state.edges.length + " connections";
  }

  $("nodeTable")?.querySelectorAll("[data-delete-node]").forEach(button => {
    button.addEventListener("click", () => deleteNode(button.dataset.deleteNode));
  });

  $("nodeTable")?.querySelectorAll("[data-edit-node]").forEach(button => {
    button.addEventListener("click", () => editNode(button.dataset.editNode));
  });

  $("edgeTable")?.querySelectorAll("[data-delete-edge]").forEach(button => {
    button.addEventListener("click", () => deleteEdge(Number(button.dataset.deleteEdge)));
  });
}

function editNode(id) {
  const node = nodeById(id);
  if (!node) return;

  const name = prompt("Region name:", node.name);
  if (name === null) return;

  if (!name.trim()) {
    toast("Region name cannot be empty.", true);
    return;
  }

  const description = prompt("Description:", node.description || "");
  if (description === null) return;

  const category = prompt("Category:", node.category || "Other");
  if (category === null) return;

  const duplicate = state.nodes.some(item =>
    item.id !== id && item.name.trim().toLowerCase() === name.trim().toLowerCase()
  );

  if (duplicate) {
    toast("A region with this name already exists.", true);
    return;
  }

  node.name = name.trim();
  node.description = description.trim();
  node.category = category.trim() || "Other";

  save();
  refreshAll();
  logActivity("Region updated", node.name);
  toast("Region updated successfully.");
}

function deleteNode(id) {
  const node = nodeById(id);
  if (!node) return;

  if (!confirm(`Delete "${node.name}" and all its connections?`)) return;

  state.nodes = state.nodes.filter(item => item.id !== id);
  state.edges = state.edges.filter(edge =>
    edge.source !== id && edge.target !== id
  );

  if (state.selectedNode === id) state.selectedNode = null;

  save();
  refreshAll();
  logActivity("Region deleted", node.name);
  toast("Region and associated connections deleted.");
}

function deleteEdge(index) {
  const edge = state.edges[index];
  if (!edge) return;

  if (!confirm(`Remove connection ${nodeName(edge.source)} ↔ ${nodeName(edge.target)}?`)) {
    return;
  }

  state.edges.splice(index, 1);
  save();
  refreshAll();
  logActivity("Connection removed", nodeName(edge.source) + " ↔ " + nodeName(edge.target));
  toast("Connection removed.");
}

/* ------------------- Add Node / Edge ------------------- */

function addNode(event) {
  event.preventDefault();

  const name = $("nodeName").value.trim();
  const category = $("nodeCategory").value;
  const description = $("nodeDescription").value.trim();

  if (!name) return toast("Enter a region name.", true);

  if (state.nodes.some(node => node.name.toLowerCase() === name.toLowerCase())) {
    return toast("That region already exists.", true);
  }

  const index = state.nodes.length;
  const position = BRAIN_NODES[index % BRAIN_NODES.length];

  const node = {
    id: uid(),
    name,
    category,
    description,
    x: position.x + ((index % 3) - 1) * 9,
    y: position.y + ((index % 2) ? 12 : -12)
  };

  state.nodes.push(node);
  state.selectedNode = node.id;

  $("nodeForm").reset();

  save();
  refreshAll();
  logActivity("Region added", name);
  toast("New region added.");
}

function addEdge(event) {
  event.preventDefault();

  const source = $("edgeFrom").value;
  const target = $("edgeTo").value;
  const weight = Number($("edgeWeight").value);

  if (!source || !target) return toast("Add at least two regions first.", true);
  if (source === target) return toast("Choose two different regions.", true);
  if (!Number.isFinite(weight) || weight <= 0) return toast("Enter a positive weight.", true);

  if (edgeExists(source, target)) {
    return toast("These regions are already connected.", true);
  }

  state.edges.push({ source, target, weight });
  save();
  refreshAll();
  logActivity("Connection created", nodeName(source) + " ↔ " + nodeName(target));
  toast("Connection created.");
}

/* ------------------- Graph Algorithms ------------------- */

function bfs(start) {
  const visited = new Set([start]);
  const queue = [start];
  const order = [];

  while (queue.length) {
    const current = queue.shift();
    order.push(current);

    for (const next of neighbors(current)) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  }

  return order;
}

function dfs(start) {
  const visited = new Set();
  const stack = [start];
  const order = [];

  while (stack.length) {
    const current = stack.pop();
    if (visited.has(current)) continue;

    visited.add(current);
    order.push(current);

    const adjacent = neighbors(current).reverse();
    for (const next of adjacent) {
      if (!visited.has(next)) stack.push(next);
    }
  }

  return order;
}

function dijkstra(start, target) {
  const distances = new Map();
  const previous = new Map();
  const unvisited = new Set(state.nodes.map(node => node.id));

  state.nodes.forEach(node => distances.set(node.id, Infinity));
  distances.set(start, 0);

  while (unvisited.size) {
    let current = null;
    let bestDistance = Infinity;

    for (const id of unvisited) {
      if (distances.get(id) < bestDistance) {
        current = id;
        bestDistance = distances.get(id);
      }
    }

    if (current === null) break;
    if (current === target) break;

    unvisited.delete(current);

    for (const edge of state.edges) {
      let next = null;
      if (edge.source === current) next = edge.target;
      else if (edge.target === current) next = edge.source;
      if (next === null || !unvisited.has(next)) continue;

      const candidate = bestDistance + Number(edge.weight);
      if (candidate < distances.get(next)) {
        distances.set(next, candidate);
        previous.set(next, current);
      }
    }
  }

  const distance = distances.get(target);
  if (!Number.isFinite(distance)) {
    return { path: [], distance: Infinity };
  }

  const path = [];
  let current = target;

  while (current !== undefined) {
    path.unshift(current);
    if (current === start) break;
    current = previous.get(current);
  }

  if (path[0] !== start) return { path: [], distance: Infinity };

  return { path, distance };
}

function runAlgorithm(event) {
  event.preventDefault();

  const type = $("algorithmType").value;
  const start = $("algorithmStart").value;
  const target = $("algorithmTarget").value;

  if (!start || !nodeById(start)) {
    return toast("Choose a valid starting region.", true);
  }

  if (type === "dijkstra") {
    if (!target || !nodeById(target)) {
      return toast("Choose a valid target region.", true);
    }

    if (start === target) {
      return toast("Start and target must be different.", true);
    }
  }

  let path = [];
  let distance = null;
  let title = "";
  let detail = "";

  if (type === "bfs") {
    path = bfs(start);
    title = "Breadth-First Search";
    detail = `Visited ${path.length} region(s) in the start region's connected component.`;
  } else if (type === "dfs") {
    path = dfs(start);
    title = "Depth-First Search";
    detail = `Visited ${path.length} region(s) in depth-first order.`;
  } else {
    const result = dijkstra(start, target);
    path = result.path;
    distance = result.distance;
    title = "Dijkstra's Shortest Path";

    if (!path.length) {
      detail = "No path exists between the selected regions.";
    } else {
      detail = `Minimum total weight: ${number(distance, 2)}`;
    }
  }

  state.lastAlgorithm = { type, path, distance };
  state.selectedNode = start;

  const resultContainer = $("algorithmResult");

  if (!path.length) {
    resultContainer.innerHTML = `
      <div class="result-heading"><strong>${escapeHTML(title)}</strong><span class="status-chip">NO PATH</span></div>
      <p class="muted">${escapeHTML(detail)}</p>`;
  } else {
    resultContainer.innerHTML = `
      <div class="result-heading">
        <strong>${escapeHTML(title)}</strong>
        <span class="status-chip"><span class="status-dot"></span> COMPLETED</span>
      </div>
      <div class="result-path">
        ${path.map((id, index) => `
          ${index ? '<span class="path-arrow">→</span>' : ""}
          <span class="path-node">${escapeHTML(nodeName(id))}</span>
        `).join("")}
      </div>
      <div class="result-meta">${escapeHTML(detail)}</div>
      <div class="result-meta">Path / traversal order: ${path.length} region(s).</div>
      <button class="secondary-button" id="showPathOnBrain" style="margin-top:12px">View on brain map ↗</button>`;

    $("showPathOnBrain")?.addEventListener("click", () => showPage("brain"));
  }

  renderBrain();
  renderInspector();
  logActivity("Algorithm executed", title + " · " + path.length + " visited region(s)");
  toast(title + " completed.");
}

/* ------------------- Analytics ------------------- */

function renderAnalytics() {
  const stats = graphStats();

  if ($("avgDegree")) $("avgDegree").textContent = number(stats.averageDegree, 2);
  if ($("isolatedCount")) $("isolatedCount").textContent = stats.isolated.length;
  if ($("componentCount")) $("componentCount").textContent = stats.components;
  if ($("totalWeight")) $("totalWeight").textContent = number(stats.totalWeight, 2);

  const ranked = [...state.nodes]
    .sort((a, b) => degree(b.id) - degree(a.id) || a.name.localeCompare(b.name));

  const max = Math.max(1, ...ranked.map(node => degree(node.id)));

  if ($("degreeChart")) {
    $("degreeChart").innerHTML = ranked.length ? ranked.map(node => `
      <div class="bar-row">
        <span class="rank-name">${escapeHTML(node.name)}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${degree(node.id) / max * 100}%"></div></div>
        <span class="bar-value">${degree(node.id)}</span>
      </div>
    `).join("") : '<p class="muted">No data to display.</p>';
  }

  const properties = [
    ["Vertices (V)", stats.nodes],
    ["Edges (E)", stats.edges],
    ["Graph type", "Undirected weighted graph"],
    ["Density", number(stats.density * 100, 2) + "%"],
    ["Average degree", number(stats.averageDegree, 2)],
    ["Connected components", stats.components],
    ["Isolated vertices", stats.isolated.length],
    ["Total edge weight", number(stats.totalWeight, 2)],
    ["Maximum degree", stats.maxDegree]
  ];

  if ($("graphProperties")) {
    $("graphProperties").innerHTML = properties.map(([key, value]) => `
      <div class="property-row"><span>${escapeHTML(key)}</span><strong>${escapeHTML(value)}</strong></div>
    `).join("");
  }

  const top = ranked.slice(0, 8);

  if ($("analyticsRank")) {
    $("analyticsRank").innerHTML = top.length ? top.map(node => `
      <div class="rank-row">
        <span class="rank-name">${escapeHTML(node.name)}</span>
        <div class="rank-track"><div class="rank-fill" style="width:${degree(node.id) / max * 100}%"></div></div>
        <span class="rank-number">${degree(node.id)}</span>
      </div>
    `).join("") : '<p class="muted">No regions available.</p>';
  }
}

/* ------------------- Data Import / Export ------------------- */

function exportJSON() {
  const payload = {
    application: "NeuroGraph",
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    dataType: "synthetic educational graph data",
    nodes: state.nodes,
    edges: state.edges
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "neurograph-" + new Date().toISOString().slice(0, 10) + ".json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);

  logActivity("Workspace exported", `${state.nodes.length} regions and ${state.edges.length} connections`);
  toast("JSON export created.");
}

function importJSONFile(file) {
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    toast("File is too large. Maximum size is 2 MB.", true);
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);

      if (!validateDataset(data)) return;

      if (!confirm("Importing will replace your current network. Continue?")) return;

      state.nodes = data.nodes.map(node => ({
        ...node,
        category: node.category || "Other",
        description: node.description || ""
      }));

      state.edges = data.edges.map(edge => ({
        ...edge,
        weight: Number(edge.weight)
      }));

      state.selectedNode = null;
      save();
      refreshAll();
      logActivity("Workspace imported", `${state.nodes.length} regions and ${state.edges.length} connections`);
      toast("Dataset imported successfully.");
    } catch (error) {
      toast("Could not read this JSON file.", true);
    }
  };

  reader.onerror = () => toast("Could not read the selected file.", true);
  reader.readAsText(file);
}

function renderDataPage() {
  const summary = [
    ["Application", "NeuroGraph"],
    ["Storage", "Browser local storage"],
    ["Regions", state.nodes.length],
    ["Connections", state.edges.length],
    ["Components", graphStats().components],
    ["Last page refresh", new Date().toLocaleString()]
  ];

  if ($("datasetSummary")) {
    $("datasetSummary").innerHTML = summary.map(([key, value]) => `
      <div class="property-row"><span>${escapeHTML(key)}</span><strong>${escapeHTML(value)}</strong></div>
    `).join("");
  }

  if ($("jsonPreview")) {
    $("jsonPreview").textContent = JSON.stringify({
      application: "NeuroGraph",
      schemaVersion: 1,
      nodes: state.nodes,
      edges: state.edges
    }, null, 2);
  }
}

async function copyJSON() {
  const text = JSON.stringify({
    application: "NeuroGraph",
    schemaVersion: 1,
    nodes: state.nodes,
    edges: state.edges
  }, null, 2);

  try {
    await navigator.clipboard.writeText(text);
    toast("JSON copied to clipboard.");
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    document.body.appendChild(area);
    area.select();

    try {
      const copied = document.execCommand("copy");
      toast(copied ? "JSON copied." : "Copy was blocked. Use Export JSON instead.", !copied);
    } catch {
      toast("Copy was blocked. Use Export JSON instead.", true);
    }

    area.remove();
  }
}

/* ------------------- Reset & Refresh ------------------- */

function refreshAll() {
  renderOverview();
  renderBrain();
  renderInspector();
  renderTables();
  renderAnalytics();
  renderDataPage();
}

function restoreSample() {
  if (!confirm("Restore the original sample network? Your current graph will be replaced.")) return;

  state.nodes = structuredClone(SAMPLE_DATA.nodes);
  state.edges = structuredClone(SAMPLE_DATA.edges);
  state.selectedNode = null;

  save();
  refreshAll();
  logActivity("Sample network restored", "Original illustrative dataset loaded");
  toast("Sample network restored.");
}

function resetWorkspace() {
  if (!confirm("Reset the workspace to the original sample network?")) return;
  restoreSample();
}

/* ------------------- Event Binding ------------------- */

function bindEvents() {
  document.querySelectorAll("[data-page]").forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      showPage(button.dataset.page);
    });
  });

  $("menuToggle")?.addEventListener("click", () => {
    $("sidebar")?.classList.toggle("open");
  });

  $("nodeForm")?.addEventListener("submit", addNode);
  $("edgeForm")?.addEventListener("submit", addEdge);
  $("algorithmForm")?.addEventListener("submit", runAlgorithm);

  $("edgeWeight")?.addEventListener("input", event => {
    if ($("weightValue")) $("weightValue").textContent = Number(event.target.value).toFixed(1);
  });

  $("algorithmType")?.addEventListener("change", updateAlgorithmFields);
  $("nodeSearch")?.addEventListener("input", renderTables);

  $("brainSearch")?.addEventListener("input", renderBrain);
  $("brainFilter")?.addEventListener("change", renderBrain);

  $("resetView")?.addEventListener("click", () => {
    state.selectedNode = null;
    if ($("brainSearch")) $("brainSearch").value = "";
    if ($("brainFilter")) $("brainFilter").value = "all";
    renderBrain();
    renderInspector();
    toast("Brain map view reset.");
  });

  $("focusAll")?.addEventListener("click", () => {
    if ($("brainSearch")) $("brainSearch").value = "";
    if ($("brainFilter")) $("brainFilter").value = "all";
    state.selectedNode = null;
    renderBrain();
    renderInspector();
    toast("All regions are visible.");
  });

  $("exportData")?.addEventListener("click", exportJSON);
  $("exportQuick")?.addEventListener("click", exportJSON);

  $("importFile")?.addEventListener("change", event => {
    importJSONFile(event.target.files[0]);
    event.target.value = "";
  });

  $("hiddenImport")?.addEventListener("change", event => {
    importJSONFile(event.target.files[0]);
    event.target.value = "";
  });

  $("restoreSample")?.addEventListener("click", restoreSample);
  $("resetData")?.addEventListener("click", resetWorkspace);
  $("refreshAnalytics")?.addEventListener("click", () => {
    renderAnalytics();
    toast("Analytics refreshed.");
  });
  $("copyJson")?.addEventListener("click", copyJSON);

  $("clearActivity")?.addEventListener("click", () => {
    if (!confirm("Clear all activity log entries?")) return;
    state.activity = [];
    save();
    renderActivity();
    toast("Activity log cleared.");
  });

  $("themeToggle")?.addEventListener("click", () => {
    state.darkMode = !state.darkMode;
    document.body.classList.toggle("light", !state.darkMode);
    localStorage.setItem("neurograph_theme", state.darkMode ? "dark" : "light");
    toast(state.darkMode ? "Dark appearance enabled." : "Light appearance enabled.");
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      $("sidebar")?.classList.remove("open");
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      showPage("brain");
      $("brainSearch")?.focus();
    }
  });
}

/* ------------------- App Startup ------------------- */

function init() {
  load();

  try {
    state.darkMode = localStorage.getItem("neurograph_theme") !== "light";
  } catch {
    state.darkMode = true;
  }

  document.body.classList.toggle("light", !state.darkMode);

  bindEvents();
  populateSelects();
  refreshAll();
  showPage("overview");

  console.info("NeuroGraph initialized.", graphStats());
}

document.addEventListener("DOMContentLoaded", init);