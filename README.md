
# NeuroGraph — Brain Network Simulator

NeuroGraph is an educational project for exploring graph theory,
data structures, and graph algorithms through a brain-inspired network.

## Web interface

The web application is self-contained in `index.html`.

1. Open the NeuroGraph folder in VS Code.
2. Open `index.html`.
3. Run it with Live Server, or open it directly in a browser.
4. Navigate using the sidebar.

Features:
- Separate dashboard pages
- Schematic brain-shaped graph visualization
- Add, edit, and delete vertices
- Add and remove weighted edges
- BFS and DFS traversal
- Dijkstra shortest path
- Connected components and isolated vertices
- Graph analytics
- JSON import and export
- Browser localStorage persistence

## C++ console application

Requirements: a C++17 compiler.

Compile from the project root:

```bash
g++ -std=c++17 -Wall -Wextra -pedantic \
  cpp/main.cpp cpp/brain_graph.cpp -o neurograph
```

On Linux/macOS:

```bash
./neurograph
```

On Windows PowerShell:

```powershell
.\neurograph.exe
```

## Data structures

- Graph
- Adjacency list
- Queue
- Stack
- Hash maps and hash sets
- Priority queue (min-heap)
- Vectors

## Important limitation

The web interface and C++ console application are separate programs.
The browser currently does not communicate with the C++ executable.

All example brain-region names, connections, and weights are synthetic
educational data. This software is not a medical device and must not be
used to diagnose or predict disease.
