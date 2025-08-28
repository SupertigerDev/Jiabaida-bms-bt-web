import { createConnection } from "./createConnection.js";
import { createWattHourTracker } from "./utils.js";

const conn = createConnection();
const whTracker = createWattHourTracker();
const rootEl = document.getElementById("root");

scan.addEventListener("click", () => {
  conn.scanAndConnect();
});

const createTemperaturePane = () => {
  const element = document.createElement("div");
  element.classList.add("pane", "battery-status-pane");

  element.innerHTML = `
    <h3>Temperature Sensors</h3>
      <div class="cards"></div>
    </div>
  `;

  rootEl.appendChild(element);

  const updateInfo = ({ temperatures }) => {
    const cardsContainer = element.querySelector(".cards");
    temperatures.forEach((temp, i) => {
      const existingCard = element.querySelector(`.temp-${i}`)?.parentElement;
      const card = existingCard || document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
        <div class="card-title">Sensor ${i + 1}</div>
        <div class="card-value temp-${i}">${temp.toFixed(1)} C</div>
      `;
      if (!existingCard) {
        cardsContainer.appendChild(card);
      }
    });
  };

  return {
    updateInfo,
  };
};
const createCellPane = () => {
  const element = document.createElement("div");
  element.classList.add("pane", "battery-status-pane");

  element.innerHTML = `
    <h3>Cell Status</h3>
      <div class="cards"></div>
    </div>
  `;

  rootEl.appendChild(element);

  const updateInfo = ({ cellVolts }) => {
    const cardsContainer = element.querySelector(".cards");
    cellVolts.forEach((volts, i) => {
      const existingCard = element.querySelector(`.cell-${i}`)?.parentElement;
      const card = existingCard || document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
        <div class="card-title">Cell ${i + 1}</div>
        <div class="card-value cell-${i}">${volts.toFixed(3)} V</div>
      `;
      if (!existingCard) {
        cardsContainer.appendChild(card);
      }
    });
  };

  return {
    updateInfo,
  };
};

const createBatteryStatusPane = () => {
  const element = document.createElement("div");
  element.classList.add("pane", "battery-status-pane");

  element.innerHTML = `
    <h3>Battery Status</h3>
    <div class="battery-info-container">
      <div class="battery-info">
        <div class="battery-icon">
          <div class="battery-level"></div>
        </div>
        <div class="battery-details">
          <div class="battery-level-percentage"></div>
          <div class="battery-state"></div>
        </div>
      </div>

      <div class="last-updated-container">
        <div class="last-updated-title">Last Updated</div>
        <div class="last-updated-time"></div>
      </div>
    </div>


    <div class="cards">
      <div class="card">
        <div class="card-title">Capacity</div>
        <div class="card-value capacity">0 Ah</div>
      </div>
      <div class="card">
        <div class="card-title">Voltage</div>
        <div class="card-value voltage">0 V</div>
      </div>
      <div class="card">
        <div class="card-title">Current</div>
        <div class="card-value current">0 A</div>
      </div>
      <div class="card">
        <div class="card-title">Power</div>
        <div class="card-value power">0 W</div>
      </div>
      <div class="card">
        <div class="card-title">Watt-hours</div>
        <div class="card-value wh">0 Wh</div>
      </div>
      <div class="card">
        <div class="card-title">Cycle Count</div>
        <div class="card-value cycle-count">0</div>
      </div>


    </div>

  
  
  `;

  rootEl.appendChild(element);

  const updateInfo = ({
    percent,
    charging,
    hhmmRemaining,
    current,
    capacity,
    voltage,
    power,
    wh,
    cycleCount,
  }) => {
    const batteryLevel = element.querySelector(".battery-info .battery-level");
    batteryLevel.style.width = `${percent}%`;

    const batteryLevelPercentage = element.querySelector(
      ".battery-info .battery-level-percentage"
    );
    batteryLevelPercentage.textContent = `${percent}%`;

    const batteryState = element.querySelector(".battery-info .battery-state");
    if (current !== 0) {
      batteryState.textContent = `${
        charging ? "Charged in" : "Discharging in"
      } ${hhmmRemaining}`;
    } else {
      batteryState.textContent = "Idle";
    }

    const lastUpdatedTime = element.querySelector(
      ".last-updated-container .last-updated-time"
    );
    lastUpdatedTime.textContent = new Intl.DateTimeFormat("en-GB", {
      dateStyle: "short",
      timeStyle: "medium",
    })
      .format(new Date())
      .split(",")[1];

    const capacityEl = element.querySelector(".card-value.capacity");
    capacityEl.textContent = `${capacity.toFixed(2)} Ah`;

    const voltageEl = element.querySelector(".card-value.voltage");
    voltageEl.textContent = `${voltage.toFixed(2)} V`;

    const currentEl = element.querySelector(".card-value.current");
    currentEl.textContent = `${current.toFixed(2)} A`;

    const powerEl = element.querySelector(".card-value.power");
    powerEl.textContent = `${power.toFixed(2)} W`;

    const whEl = element.querySelector(".card-value.wh");
    whEl.textContent = `${wh.toFixed(2)} Wh`;

    const cycleCountEl = element.querySelector(".card-value.cycle-count");
    cycleCountEl.textContent = cycleCount;
  };

  return {
    updateInfo,
  };
};

const batteryStatusPane = createBatteryStatusPane();
const cellPane = createCellPane();
const temperaturePane = createTemperaturePane();

conn.onData((info) => {
  const { batteryInfo, cellVolts } = info;

  whTracker.update(-(batteryInfo.current * batteryInfo.totalVolts));

  batteryStatusPane.updateInfo({
    percent: batteryInfo.remainingPercentSoc,
    charging: batteryInfo.charging,
    current: batteryInfo.current,
    hhmmRemaining: batteryInfo.HHMMRemaining,
    capacity: batteryInfo.remainingCapacityAh,
    voltage: batteryInfo.totalVolts,
    power: batteryInfo.current * batteryInfo.totalVolts,
    wh: whTracker.getWattHours(),
    cycleCount: batteryInfo.totalCycles,
  });
  cellPane.updateInfo({
    cellVolts: cellVolts,
  });
  temperaturePane.updateInfo({
    temperatures: batteryInfo.temperatures,
  });
});
