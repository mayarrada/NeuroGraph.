
#include "brain_graph.hpp"

#include <algorithm>
#include <cmath>
#include <iostream>
#include <limits>
#include <queue>
#include <stack>
#include <unordered_set>

void BrainGraph::rebuildIndex() {
    nodeIndex.clear();

    for (std::size_t i = 0; i < nodes.size(); ++i) {
        nodeIndex[nodes[i].id] = i;
    }
}

void BrainGraph::rebuildAdjacency() {
    adjacencyList.clear();

    for (const auto& node : nodes) {
        adjacencyList[node.id] = {};
    }

    for (const auto& edge : edges) {
        adjacencyList[edge.source].push_back(edge.target);
        adjacencyList[edge.target].push_back(edge.source);
    }

    for (auto& entry : adjacencyList) {
        std::sort(entry.second.begin(), entry.second.end());
    }
}

bool BrainGraph::containsNode(const std::string& id) const {
    return nodeIndex.find(id) != nodeIndex.end();
}

void BrainGraph::addNode(
    const std::string& id,
    const std::string& name,
    const std::string& category
) {
    if (id.empty() || name.empty()) {
        std::cout << "Error: ID and name cannot be empty.\n";
        return;
    }

    if (containsNode(id)) {
        std::cout << "Error: Node ID already exists.\n";
        return;
    }

    nodes.push_back({id, name, category});
    rebuildIndex();
    rebuildAdjacency();

    std::cout << "Node added: " << name << '\n';
}

bool BrainGraph::removeNode(const std::string& id) {
    if (!containsNode(id)) {
        return false;
    }

    nodes.erase(
        std::remove_if(
            nodes.begin(),
            nodes.end(),
            [&](const Node& node) {
                return node.id == id;
            }
        ),
        nodes.end()
    );

    edges.erase(
        std::remove_if(
            edges.begin(),
            edges.end(),
            [&](const Edge& edge) {
                return edge.source == id || edge.target == id;
            }
        ),
        edges.end()
    );

    rebuildIndex();
    rebuildAdjacency();
    return true;
}

bool BrainGraph::addEdge(
    const std::string& source,
    const std::string& target,
    double weight
) {
    if (!containsNode(source) || !containsNode(target)) {
        std::cout << "Error: Both nodes must exist.\n";
        return false;
    }

    if (source == target) {
        std::cout << "Error: Self-connections are not supported.\n";
        return false;
    }

    if (!std::isfinite(weight) || weight <= 0.0) {
        std::cout << "Error: Weight must be a positive finite number.\n";
        return false;
    }

    for (const auto& edge : edges) {
        const bool same =
            (edge.source == source && edge.target == target) ||
            (edge.source == target && edge.target == source);

        if (same) {
            std::cout << "Error: Connection already exists.\n";
            return false;
        }
    }

    edges.push_back({source, target, weight});
    rebuildAdjacency();
    return true;
}

bool BrainGraph::removeEdge(
    const std::string& source,
    const std::string& target
) {
    const auto oldSize = edges.size();

    edges.erase(
        std::remove_if(
            edges.begin(),
            edges.end(),
            [&](const Edge& edge) {
                return
                    (edge.source == source && edge.target == target) ||
                    (edge.source == target && edge.target == source);
            }
        ),
        edges.end()
    );

    if (edges.size() == oldSize) {
        return false;
    }

    rebuildAdjacency();
    return true;
}

std::vector<std::string> BrainGraph::bfs(
    const std::string& start
) const {
    std::vector<std::string> order;

    if (!containsNode(start)) {
        return order;
    }

    std::queue<std::string> pending;
    std::unordered_set<std::string> visited;

    pending.push(start);
    visited.insert(start);

    while (!pending.empty()) {
        const std::string current = pending.front();
        pending.pop();

        order.push_back(current);

        const auto it = adjacencyList.find(current);
        if (it == adjacencyList.end()) {
            continue;
        }

        for (const auto& next : it->second) {
            if (visited.insert(next).second) {
                pending.push(next);
            }
        }
    }

    return order;
}

std::vector<std::string> BrainGraph::dfs(
    const std::string& start
) const {
    std::vector<std::string> order;

    if (!containsNode(start)) {
        return order;
    }

    std::stack<std::string> pending;
    std::unordered_set<std::string> visited;

    pending.push(start);

    while (!pending.empty()) {
        const std::string current = pending.top();
        pending.pop();

        if (!visited.insert(current).second) {
            continue;
        }

        order.push_back(current);

        const auto it = adjacencyList.find(current);
        if (it == adjacencyList.end()) {
            continue;
        }

        // Reverse insertion preserves ascending traversal order.
        for (auto rit = it->second.rbegin();
             rit != it->second.rend(); ++rit) {
            if (visited.find(*rit) == visited.end()) {
                pending.push(*rit);
            }
        }
    }

    return order;
}

std::vector<std::string> BrainGraph::shortestPath(
    const std::string& start,
    const std::string& target,
    double& totalWeight
) const {
    totalWeight = std::numeric_limits<double>::infinity();

    if (!containsNode(start) || !containsNode(target)) {
        return {};
    }

    using Item = std::pair<double, std::string>;

    std::priority_queue<
        Item,
        std::vector<Item>,
        std::greater<Item>
    > pending;

    std::unordered_map<std::string, double> distance;
    std::unordered_map<std::string, std::string> previous;

    for (const auto& node : nodes) {
        distance[node.id] = std::numeric_limits<double>::infinity();
    }

    distance[start] = 0.0;
    pending.push({0.0, start});

    while (!pending.empty()) {
        const auto [currentDistance, current] = pending.top();
        pending.pop();

        if (currentDistance > distance[current]) {
            continue;
        }

        if (current == target) {
            break;
        }

        for (const auto& edge : edges) {
            std::string next;

            if (edge.source == current) {
                next = edge.target;
            } else if (edge.target == current) {
                next = edge.source;
            } else {
                continue;
            }

            const double candidate = currentDistance + edge.weight;

            if (candidate < distance[next]) {
                distance[next] = candidate;
                previous[next] = current;
                pending.push({candidate, next});
            }
        }
    }

    if (!std::isfinite(distance[target])) {
        return {};
    }

    totalWeight = distance[target];

    std::vector<std::string> path;
    std::string current = target;

    while (true) {
        path.push_back(current);

        if (current == start) {
            break;
        }

        const auto it = previous.find(current);

        if (it == previous.end()) {
            totalWeight = std::numeric_limits<double>::infinity();
            return {};
        }

        current = it->second;
    }

    std::reverse(path.begin(), path.end());
    return path;
}

std::vector<std::vector<std::string>>
BrainGraph::connectedComponents() const {
    std::vector<std::vector<std::string>> groups;
    std::unordered_set<std::string> visited;

    for (const auto& node : nodes) {
        if (visited.find(node.id) != visited.end()) {
            continue;
        }

        std::vector<std::string> group;
        std::queue<std::string> pending;

        pending.push(node.id);
        visited.insert(node.id);

        while (!pending.empty()) {
            const std::string current = pending.front();
            pending.pop();

            group.push_back(current);

            const auto it = adjacencyList.find(current);
            if (it == adjacencyList.end()) {
                continue;
            }

            for (const auto& next : it->second) {
                if (visited.insert(next).second) {
                    pending.push(next);
                }
            }
        }

        groups.push_back(group);
    }

    return groups;
}

std::vector<std::string> BrainGraph::isolatedNodes() const {
    std::vector<std::string> result;

    for (const auto& node : nodes) {
        const auto it = adjacencyList.find(node.id);

        if (it == adjacencyList.end() || it->second.empty()) {
            result.push_back(node.id);
        }
    }

    return result;
}

int BrainGraph::degree(const std::string& id) const {
    if (!containsNode(id)) {
        return -1;
    }

    const auto it = adjacencyList.find(id);

    if (it == adjacencyList.end()) {
        return 0;
    }

    return static_cast<int>(it->second.size());
}

double BrainGraph::density() const {
    const double n = static_cast<double>(nodes.size());

    if (n < 2.0) {
        return 0.0;
    }

    const double possible = n * (n - 1.0) / 2.0;

    return static_cast<double>(edges.size()) / possible;
}

void BrainGraph::printNodes() const {
    std::cout << "\n--- Brain Regions ---\n";

    if (nodes.empty()) {
        std::cout << "No nodes.\n";
        return;
    }

    for (const auto& node : nodes) {
        std::cout << node.id << " | "
                  << node.name << " | "
                  << node.category << " | degree="
                  << degree(node.id) << '\n';
    }
}

void BrainGraph::printEdges() const {
    std::cout << "\n--- Connections ---\n";

    if (edges.empty()) {
        std::cout << "No connections.\n";
        return;
    }

    for (const auto& edge : edges) {
        std::cout << edge.source << " <-> "
                  << edge.target << " | weight="
                  << edge.weight << '\n';
    }
}

void BrainGraph::printStatistics() const {
    std::cout << "\n--- Graph Statistics ---\n";
    std::cout << "Vertices: " << nodes.size() << '\n';
    std::cout << "Edges: " << edges.size() << '\n';
    std::cout << "Density: " << density() << '\n';
    std::cout << "Connected components: "
              << connectedComponents().size() << '\n';
    std::cout << "Isolated vertices: "
              << isolatedNodes().size() << '\n';
}

const std::vector<BrainGraph::Node>& BrainGraph::getNodes() const {
    return nodes;
}

const std::vector<BrainGraph::Edge>& BrainGraph::getEdges() const {
    return edges;
}
