"use strict";

var Transport = require("azure-iot-device-mqtt").Mqtt;
var Client = require("azure-iot-device").ModuleClient;
var Message = require("azure-iot-device").Message;

// Initial values
let temperature = 20; // Starting temperature in °C
let humidity = 50; // Starting humidity in %
let pressure = 1010; // Starting pressure in hPa
let isRising = true; // Temperature direction: rising or falling

// Step values for gradual changes
const temperatureStep = 0.5; // Change in temperature per interval
const humidityStep = 0.2; // Change in humidity per interval
const pressureStep = 0.1; // Change in pressure per interval

Client.fromEnvironment(Transport, function (err, client) {
  if (err) {
    throw err;
  } else {
    client.on("error", function (err) {
      throw err;
    });

    // Connect to the Edge instance
    client.open(function (err) {
      if (err) {
        throw err;
      } else {
        console.log("IoT Hub module client initialized");

        // Periodically send mock data
        setInterval(() => {
          const data = generateMockData();
          const outputMsg = new Message(JSON.stringify(data));
          console.log("Sending message:", data);
          client.sendOutputEvent(
            "output1",
            outputMsg,
            printResultFor("Sending message")
          );
        }, 25000); // Send data every 25 seconds
      }
    });
  }
});

// Mock Data Generator
function generateMockData() {
  // Update temperature, humidity, and pressure based on direction
  if (isRising) {
    temperature += temperatureStep;
    humidity -= humidityStep; // Decrease humidity
    pressure += pressureStep; // Increase pressure
  } else {
    temperature -= temperatureStep;
    humidity += humidityStep; // Increase humidity
    pressure -= pressureStep; // Decrease pressure
  }

  // Reverse direction if temperature reaches limits
  if (temperature >= 40) {
    isRising = false; // Start falling
  } else if (temperature <= 20) {
    isRising = true; // Start rising
  }

  return {
    id: "sensor1",
    temperature: parseFloat(temperature.toFixed(2)), // 2 decimal precision
    humidity: parseFloat(humidity.toFixed(2)),
    pressure: parseFloat(pressure.toFixed(2)),
    timestamp: new Date().toISOString(),
  };
}

// Helper function to print results
function printResultFor(op) {
  return function printResult(err, res) {
    if (err) {
      console.log(op + " error: " + err.toString());
    }
    if (res) {
      console.log(op + " status: " + res.constructor.name);
    }
  };
}
