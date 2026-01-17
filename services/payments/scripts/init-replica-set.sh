#!/bin/bash
# Initialize MongoDB Replica Set for ACID transactions support
# Supports both single-node (development) and multi-node (production) configurations
# //TODO: evaluate multi-node setup and try to use mongo-payments-1:27017 instead of localhost
mongosh --quiet --eval '
try {
  const status = rs.status();
} catch (err) {
  const hasNode2 = false; // Set to true if mongo-payments-2 exists
  const hasNode3 = false; // Set to true if mongo-payments-3 exists

  // Build members array based on available nodes
  // For single-node setup, use localhost
  // For multi-node setup, use Docker service names
  const members = hasNode2 || hasNode3
    ? [{ _id: 0, host: "mongo-payments:27017", priority: 2 }]
    : [{ _id: 0, host: "localhost:27017", priority: 2 }];

  // Uncomment these lines when you enable mongo-payments-2 and mongo-payments-3
  // if (hasNode2) members.push({ _id: 1, host: "mongo-payments-2:27017", priority: 1 });
  // if (hasNode3) members.push({ _id: 2, host: "mongo-payments-3:27017", priority: 1 });

  const result = rs.initiate({
    _id: "rs0",
    members: members
  });

  if (result.ok === 1) {
    print(`Replica set rs0 initialized with ${members.length} node(s)!`);
  } else {
    print("Failed to initialize replica set:", result);
  }
}
'

echo "MongoDB initialization complete"
