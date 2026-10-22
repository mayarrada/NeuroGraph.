
(() => {
  "use strict";

  const sample = {
    nodes: [
      { id: "frontal", name: "Frontal Cortex", type: "Cortex" },
      { id: "temporal", name: "Temporal Cortex", type: "Cortex" },
      { id: "hippocampus", name: "Hippocampus", type: "Memory" },
      { id: "parietal", name: "Parietal Cortex", type: "Cortex" },
      { id: "cerebellum", name: "Cerebellum", type: "Motor" },
      { id: "amygdala", name: "Amygdala", type: "Memory" },
      { id: "thalamus", name: "Thalamus", type: "Sensory" },
      { id: "occipital", name: "Occipital Cortex", type: "Sensory" }
    ],
    edges: [
      { from: "frontal", to: "temporal", weight: 8 },
      { from: "frontal", to: "parietal", weight: 7 },
      { from: "frontal", to: "thalamus", weight: 6 },
      { from: "temporal", to: "hippocampus", weight: 9 },
      { from: "temporal", to: "amygdala", weight: 7 },
      { from: "hippocampus", to: "amygdala", weight: 8 },
      { from: "parietal", to: "occipital", weight: 6 },
      { from: "parietal", to: "thalamus", weight: 5 },
      { from: "thalamus", to: "cerebellum", weight: 4 },
      { from: "frontal", to: "cerebellum", weight: 3 },
      { from: "occipital", to: "temporal", weight: 4 }
    ]
  };

  function cloneSample() {
    return JSON.parse(JSON.stringify(sample));
  }

  function makeId(name) {
    const slug = String(name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    return (slug || "region") + "-" +
      Date.now().toString(36) + "-" +
      Math.random().toString(36).slice(2, 7);
  }

  window.NeuroGraphData = { cloneSample, makeId };
})();
