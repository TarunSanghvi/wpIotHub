import { Box, Grid, Paper, Typography, Button, TextField } from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import tempIcon from "../assets/temp.svg";
import pressureIcon from "../assets/pressure.svg";
import humidityIcon from "../assets/humidity.svg";
import DataCard from "./DataCard";
import ApexCharts from "react-apexcharts";

// Chart options
const options = {
  chart: {
    type: "line",
    height: "100%",
    zoom: {
      enabled: true,
    },
    toolbar: {
      show: true,
      tools: {
        download: false,
      },
    },
  },
  markers: {
    size: 3,
    colors: ["#fff"],
    fillOpacity: 1,
    strokeColors: ["#ff0000", "#00e396", "#008ffb"],
  },
  colors: ["#ff0000", "#00e396", "#008ffb"],
  dataLabels: {
    enabled: false,
  },
  stroke: {
    width: 1.5,
    curve: "straight",
  },
  xaxis: {
    type: "category",
    tickAmount: 5,
    labels: {
      formatter: function (value) {
        var date = new Date(value);
        var options = {
          hour12: false,
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
        };
        return date.toLocaleTimeString(undefined, options);
      },
    },
  },
  title: {
    text: "Live Data Chart",
    align: "center",
  },
  tooltip: {
    shared: true,
    intersect: false,
  },
  noData: {
    text: "No data available",
    align: "center",
    verticalAlign: "middle",
  },
};

const ResponsiveGrid = ({ setTime }) => {
  // State for date selection
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [historicalData, setHistoricalData] = useState([]);

  // Set minimum date to 15th Nov 2024, remove seconds and milliseconds
  const minDate = new Date("2024-11-15T00:00:00").toISOString().slice(0, 16);

  // Function to handle fetching historical data (mock)
  const fetchHistoricalData = async () => {
    console.log(chartData);
    const response = await fetch(
      `http://localhost:3002/data-between?startEpoch=${new Date(
        startDate + ":00"
      ).getTime()}&endEpoch=${new Date(endDate + ":00").getTime()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      window.alert("Data is not available")
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    setHistoricalData(data);
  };

  const [chartData, setChartData] = useState([
    { name: "Temperature (°C)", data: [] },
    { name: "Pressure (m2)", data: [] },
    { name: "Humidity (%rh)", data: [] },
  ]);

  const [latestData, setLatestData] = useState({
    temperature: 0,
    humidity: 0,
    pressure: 0,
  });

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:3002/latest-data/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setLatestData({
        temperature: data.temperature,
        humidity: data.humidity,
        pressure: data.pressure,
      });
      // Parse response into chartData format
      const timestamp = new Date(data.timestamp).getTime();
      setTime(timestamp.toString());
      const newTemperature = [timestamp, data.temperature];
      const newPressure = [timestamp, data.pressure];
      const newHumidity = [timestamp, data.humidity];

      // Update chart data with queue logic (only latest 20 entries)
      setChartData((prevData) => [
        {
          name: "Temperature (°C)",
          data: [...prevData[0].data, newTemperature].slice(-20),
        },
        {
          name: "Pressure (m2)",
          data: [...prevData[1].data, newPressure].slice(-20),
        },
        {
          name: "Humidity (%rh)",
          data: [...prevData[2].data, newHumidity].slice(-20),
        },
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to fetch data. Please try again later.");
    }
  }, [setTime]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchData();
    }, 25000); // Call fetchData every 25 seconds

    // Initial fetch
    fetchData();

    // Cleanup the interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchData]); // Add fetchData as a dependency if defined outside

  return (
    <Box sx={{ flexGrow: 1, width: "95vw", p: 2 }}>
      <Grid container spacing={2} columnSpacing={2}>
        {/* Live Data */}
        <Grid item xs={12} sm={6} md={6}>
          <Paper
            elevation={3}
            sx={{
              p: 1,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" fontWeight={"bold"} gutterBottom>
              Live Data
            </Typography>
            <Grid container spacing={2} columnSpacing={2}>
              <DataCard
                icon={humidityIcon}
                title="Humidity"
                value={latestData?.humidity + "%rh"}
              />
              <DataCard
                icon={pressureIcon}
                title="Pressure"
                value={latestData?.pressure + "m2"}
              />
              <DataCard
                icon={tempIcon}
                title="Temp"
                value={latestData?.temperature + "°C"}
              />
            </Grid>
            <Grid
              container
              spacing={2}
              columnSpacing={2}
              style={{ height: "60vh", weight: "100%", paddingTop: "8px" }}
            >
              <Grid item xs={12} sm={12} md={12}>
                <ApexCharts
                  options={options}
                  series={chartData}
                  type="line"
                  height="100%"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Historical Data */}
        <Grid item xs={12} sm={6} md={6}>
          <Paper
            elevation={3}
            sx={{
              p: 1,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" fontWeight={"bold"} gutterBottom>
              Historical Data
            </Typography>
            <Box sx={{ width: "100%", marginBottom: 2 }}>
              <Grid
                container
                spacing={2}
                justifyContent="space-evenly"
                alignItems="center"
                sx={{ lineHeight: "88px" }}
              >
                {/* Start Date */}
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  alignItems="center"
                  display="flex"
                >
                  <TextField
                    label="Start Date & Time"
                    type="datetime-local"
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    inputProps={{
                      min: minDate,
                    }}
                  />
                </Grid>
                {/* End Date */}
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  alignItems="center"
                  display="flex"
                >
                  <TextField
                    label="End Date & Time"
                    type="datetime-local"
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    inputProps={{
                      min: minDate,
                    }}
                  />
                </Grid>
                <Grid
                  item
                  xs={3}
                  sm={3}
                  md={3}
                  lg={2}
                  alignItems="center"
                  display="flex"
                >
                  <Button
                    variant="contained"
                    onClick={fetchHistoricalData}
                    disabled={
                      !startDate ||
                      !endDate ||
                      new Date(startDate) >= new Date(endDate)
                    }
                  >
                    Get Data
                  </Button>
                </Grid>
              </Grid>
            </Box>

            <Grid
              container
              spacing={2}
              columnSpacing={2}
              style={{ height: "60vh", weight: "100%", paddingTop: "8px" }}
            >
              <Grid item xs={12} sm={12} md={12}>
                <ApexCharts
                  options={{
                    ...options,
                    title: {
                      text: "Historical Data",
                    },
                    xaxis: {
                      ...options.xaxis,
                      tickAmount:3,
                      labels: {
                        formatter: function (value) {
                          var date = new Date(value); // Convert the `value` (timestamp) to a Date object

                          // Extract date parts
                          var day = date.getUTCDate(); // Get the day (1-31)
                          var month = date.toLocaleString("default", {
                            month: "short",
                          }); // Get the month abbreviation (e.g., 'Nov')
                          var hour = String(date.getUTCHours()).padStart(
                            2,
                            "0"
                          ); // Get the hour (24-hour format) and pad with 0 if single digit
                          var minute = String(date.getUTCMinutes()).padStart(
                            2,
                            "0"
                          ); // Get the minutes and pad with 0
                          var second = String(date.getUTCSeconds()).padStart(
                            2,
                            "0"
                          ); // Get the seconds and pad with 0

                          // Return the formatted string
                          return `${day} ${month} ${hour}:${minute}:${second}`;
                        },
                      },
                    },
                  }}
                  series={historicalData}
                  type="line"
                  height="100%"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

ResponsiveGrid.propTypes = {
  setTime: PropTypes.func,
};
export default ResponsiveGrid;
