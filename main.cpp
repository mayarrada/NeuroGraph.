
#include "brain_graph.hpp"

#include <iostream>
#include <limits>
#include <string>
#include <vector>

void printPath(const std::vector<std::string>& path) {
    if (path.empty()) {
        std::cout << "No path found.\n";
        return;
    }

    for (std::size_t i = 0; i < path.size(); ++i) {
        if (i > 0) {
            std::cout << " -> ";
        }

        std::cout << path[i];
    }

    std::cout << '\n';
}

int main() {
    BrainGraph graph;

    // Illustrative sample data; not medical measurements.
    graph.addNode("n1", "Prefrontal Cortex", "Frontal");
    graph.addNode("n2", "Motor Cortex", "Frontal");
    graph.addNode("n3", "Somatosensory Cortex", "Parietal");
    graph.addNode("n4", "Visual Cortex", "Occipital");
    graph.addNode("n5", "Auditory Cortex", "Temporal");
    graph.addNode("n6", "Hippocampus", "Limbic");
    graph.addNode("n7", "Amygdala", "Limbic");
    graph.addNode("n8", "Cerebellum", "Cerebellar");

    graph.addEdge("n1", "n2", 1.2);
    graph.addEdge("n1", "n3", 2.0);
    graph.addEdge("n1", "n6", 1.4);
    graph.addEdge("n2", "n3", 1.1);
    graph.addEdge("n2", "n7", 1.6);
    graph.addEdge("n3", "n4", 1.8);
    graph.addEdge("n3", "n5", 1.3);
    graph.addEdge("n4", "n5", 1.0);
    graph.addEdge("n5", "n6", 1.7);
    graph.addEdge("n6", "n7", 1.1);
    graph.addEdge("n5", "n8", 2.1);

    int choice = -1;

    while (choice != 0) {
        std::cout << "\n================================\n";
        std::cout << "       NEUROGRAPH C++ LAB\n";
        std::cout << "================================\n";
        std::cout << "1. Display all brain regions\n";
        std::cout << "2. Display all connections\n";
        std::cout << "3. Add a brain region\n";
        std::cout << "4. Remove a brain region\n";
        std::cout << "5. Add a connection\n";
        std::cout << "6. Remove a connection\n";
        std::cout << "7. Run BFS\n";
        std::cout << "8. Run DFS\n";
        std::cout << "9. Dijkstra shortest path\n";
        std::cout << "10. Graph statistics\n";
        std::cout << "11. Connected components\n";
        std::cout << "12. Isolated regions\n";
        std::cout << "0. Exit\n";
        std::cout << "Choose: ";

        if (!(std::cin >> choice)) {
            std::cin.clear();
            std::cin.ignore(
                std::numeric_limits<std::streamsize>::max(),
                '\n'
            );

            std::cout << "Please enter a valid number.\n";
            continue;
        }

        std::string id;
        std::string name;
        std::string category;
        std::string source;
        std::string target;
        double weight = 0.0;

        switch (choice) {
        case 1:
            graph.printNodes();
            break;

        case 2:
            graph.printEdges();
            break;

        case 3:
            std::cout << "New node ID (no spaces): ";
            std::cin >> id;

            std::cout << "Region name: ";
            std::getline(std::cin >> std::ws, name);

            std::cout << "Category: ";
            std::getline(std::cin >> std::ws, category);

            graph.addNode(id, name, category);
            break;

        case 4:
            std::cout << "Node ID to remove: ";
            std::cin >> id;

            if (graph.removeNode(id)) {
                std::cout << "Node and its connections removed.\n";
            } else {
                std::cout << "Node not found.\n";
            }
            break;

        case 5:
            std::cout << "Source node ID: ";
            std::cin >> source;

            std::cout << "Target node ID: ";
            std::cin >> target;

            std::cout << "Positive weight: ";
            if (!(std::cin >> weight)) {
                std::cin.clear();
                std::cin.ignore(
                    std::numeric_limits<std::streamsize>::max(),
                    '\n'
                );
                std::cout << "Invalid weight.\n";
                break;
            }

            if (graph.addEdge(source, target, weight)) {
                std::cout << "Connection added.\n";
            }
            break;

        case 6:
            std::cout << "First node ID: ";
            std::cin >> source;

            std::cout << "Second node ID: ";
            std::cin >> target;

            if (graph.removeEdge(source, target)) {
                std::cout << "Connection removed.\n";
            } else {
                std::cout << "Connection not found.\n";
            }
            break;

        case 7:
            std::cout << "Starting node ID: ";
            std::cin >> id;

            std::cout << "BFS order: ";
            printPath(graph.bfs(id));
            break;

        case 8:
            std::cout << "Starting node ID: ";
            std::cin >> id;

            std::cout << "DFS order: ";
            printPath(graph.dfs(id));
            break;

        case 9: {
            std::cout << "Starting node ID: ";
            std::cin >> source;

            std::cout << "Target node ID: ";
            std::cin >> target;

            double totalWeight = 0.0;
            const auto path =
                graph.shortestPath(source, target, totalWeight);

            if (path.empty()) {
                std::cout << "No path exists between these nodes.\n";
            } else {
                std::cout << "Shortest path: ";
                printPath(path);

                std::cout << "Total weight: "
                          << totalWeight << '\n';
            }
            break;
        }

        case 10:
            graph.printStatistics();
            break;

        case 11: {
            const auto groups = graph.connectedComponents();

            std::cout << "\nConnected components: "
                      << groups.size() << '\n';

            for (std::size_t i = 0; i < groups.size(); ++i) {
                std::cout << "Component " << i + 1 << ": ";
                printPath(groups[i]);
            }
            break;
        }

        case 12: {
            const auto isolated = graph.isolatedNodes();

            std::cout << "\nIsolated regions: "
                      << isolated.size() << '\n';

            for (const auto& nodeId : isolated) {
                std::cout << "- " << nodeId << '\n';
            }
            break;
        }

        case 0:
            std::cout << "NeuroGraph closed. Goodbye!\n";
            break;

        default:
            std::cout << "Unknown option. Try again.\n";
        }
    }

    return 0;
}
