const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const { CosmosClient } = require("@azure/cosmos");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const connectionString = process.env.COSMOS_DB_STRING;
const client = new CosmosClient(connectionString);

const databaseId = "ToDoList";
const containerId = "Items";

// Health check function to verify database and container availability
async function healthCheck() {
  try {
    const databaseResponse = await client.database(databaseId).read();
    console.log(`Database "${databaseResponse.database.id}" is accessible.`);

    const containerList = await client
      .database(databaseId)
      .containers.readAll()
      .fetchAll();

    const containerExists = containerList.resources.some(
      (container) => container.id === containerId
    );

    if (containerExists) {
      console.log(`Container "${containerId}" is accessible.`);
    } else {
      console.log(`Container "${containerId}" does not exist in the database.`);
    }
  } catch (error) {
    console.error("Error in health check:", error.message);
  }
}

// Route to get the latest data
app.get("/latest-data", async (req, res) => {
  try {
    const container = client.database(databaseId).container(containerId);
    const query = {
      query: "SELECT TOP 1 * FROM c ORDER BY c._ts DESC",
    };

    const { resources: items } = await container.items.query(query).fetchAll();

    if (!items.length) {
      return res.status(404).json({ message: "No data found" });
    }

    const decodedBody = JSON.parse(
      Buffer.from(items[0].Body, "base64").toString("utf8")
    );

    res.status(200).json(decodedBody);
  } catch (error) {
    console.error("Error fetching data:", error.message);
    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({ message: "Database connection failed" });
    }
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// New API to fetch data between two epoch timestamps
app.get("/data-between", async (req, res) => {
  const { startEpoch, endEpoch } = req.query;
  console.log(startEpoch, endEpoch);

  if (!startEpoch || !endEpoch) {
    return res
      .status(400)
      .json({ message: "Both startEpoch and endEpoch are required" });
  }

  const startTimestamp = startEpoch / 1000;
  const endTimestamp = endEpoch / 1000;

  if (isNaN(startTimestamp) || isNaN(endTimestamp)) {
    return res
      .status(400)
      .json({ message: "startEpoch and endEpoch must be valid numbers" });
  }

  try {
    const container = client.database(databaseId).container(containerId);
    const query = {
      query: "SELECT * FROM c WHERE c._ts BETWEEN @startEpoch AND @endEpoch",
      parameters: [
        { name: "@startEpoch", value: startTimestamp },
        { name: "@endEpoch", value: endTimestamp },
      ],
    };

    const { resources: items } = await container.items.query(query).fetchAll();

    if (!items.length) {
      return res
        .status(404)
        .json({ message: "No data found within the given time range" });
    }

    const transformedData = [
      { name: "Temperature (°C)", data: [] },
      { name: "Pressure (m2)", data: [] },
      { name: "Humidity (%rh)", data: [] },
    ];

    items.forEach((item) => {
      const decodedBody = JSON.parse(
        Buffer.from(item.Body, "base64").toString("utf8")
      );
      const timestamp = new Date(decodedBody.timestamp).getTime();

      if (decodedBody.temperature && timestamp) {
        transformedData[0].data.push([timestamp, decodedBody.temperature]);
      }
      if (decodedBody.pressure && timestamp) {
        transformedData[1].data.push([timestamp, decodedBody.pressure]);
      }
      if (decodedBody.humidity && timestamp) {
        transformedData[2].data.push([timestamp, decodedBody.humidity]);
      }
    });

    res.status(200).json(transformedData);
  } catch (error) {
    console.error("Error fetching data:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  await healthCheck();
});
