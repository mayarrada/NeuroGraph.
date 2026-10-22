
#ifndef NEUROGRAPH_BRAIN_GRAPH_HPP
#define NEUROGRAPH_BRAIN_GRAPH_HPP

#include <string>
#include <vector>
#include <unordered_map>
#include <utility>

class BrainGraph {
public:
    struct Node {
        std::string id;
        std::string name;
        std::string category;
    };

    struct Edge {
        std::string source;
        std::string target;
        double weight;
    };

    void addNode(const std::string& id,
                 const std::string& name,
                 const std::string& category);

    bool removeNode(const std::string& id);

    bool addEdge(const std::string& source,
                 const std::string& target,
                 double weight);

    bool removeEdge(const std::string& source,
                    const std::string& target);

    bool containsNode(const std::string& id) const;

    std::vector<std::string> bfs(const std::string& start) const;
    std::vector<std::string> dfs(const std::string& start) const;

    std::vector<std::string> shortestPath(
        const std::string& start,
        const std::string& target,
        double& totalWeight
    ) const;

    std::vector<std::vector<std::string>> connectedComponents() const;

    std::vector<std::string> isolatedNodes() const;

    int degree(const std::string& id) const;

    double density() const;

    void printNodes() const;
    void printEdges() const;
    void printStatistics() const;

    const std::vector<Node>& getNodes() const;
    const std::vector<Edge>& getEdges() const;

private:
    std::vector<Node> nodes;
    std::vector<Edge> edges;

    std::unordered_map<std::string, std::vector<std::string>>
        adjacencyList;

    std::unordered_map<std::string, std::size_t> nodeIndex;

    void rebuildIndex();
    void rebuildAdjacency();
};

#endif
