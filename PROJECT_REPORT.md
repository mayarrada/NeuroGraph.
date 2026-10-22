
# NeuroGraph — Project Report

## Introduction

NeuroGraph is an educational brain-network simulator developed to
demonstrate Data Structures and Algorithms through a graph model.

The project represents regions as vertices and connections as weighted
edges. Users can inspect the network, add regions, modify connections,
and explore traversal and shortest-path algorithms.

## Problem Statement

Graph algorithms can be difficult to understand through console output
alone. NeuroGraph provides a visual interface and a console-based C++
version to make graph operations easier to explore.

## Objectives

1. Implement an adjacency-list graph.
2. Demonstrate BFS and DFS.
3. Find minimum-cost paths with Dijkstra.
4. Calculate graph statistics.
5. Support editing and exporting the sample network.
6. Demonstrate common data structures.
7. Compare a web implementation with a C++ implementation.

## Technologies

- HTML
- CSS
- JavaScript
- C++17
- SVG
- Browser localStorage

## Main Data Structures

The project includes a graph, queue, stack, min heap, linked list,
and binary search tree implementations.

## Algorithms

- BFS: breadth-first graph traversal.
- DFS: depth-first graph traversal.
- Dijkstra: minimum-weight path.
- Connected components: identifies separate connected groups.
- Merge Sort: sorting demonstration.
- Binary Search: lookup in sorted data.

## Testing Plan

1. Load the initial sample graph.
2. Confirm that region and connection counts are displayed.
3. Add a region and verify that it appears in the list and graph.
4. Add a connection between two different regions.
5. Try BFS and DFS from a selected starting region.
6. Run Dijkstra between two connected regions.
7. Remove a region and verify its connections are also removed.
8. Export the network as JSON.
9. Reset the sample network.
10. Compile and run the C++ console version.

## Limitations

The sample network and edge weights are synthetic. The application
does not process medical scans, analyze real neural recordings, or
provide clinical diagnoses.

## Conclusion

NeuroGraph demonstrates how graph representations and algorithms
can be implemented in both JavaScript and C++ and presented through
a visual educational interface.
