import {
  bytesToFloat,
  convertSecondsToHHMM,
  createDataViewFromSignedBytes,
  getUnsignedBytesFromDataView,
  process2BytesToBin,
} from "./utils.js";

const SERVICE_UUID = "0000ff00-0000-1000-8000-00805f9b34fb";
const CHAR_WRITE_UUID = "0000ff02-0000-1000-8000-00805f9b34fb";
const CHAR_READ_UUID = "0000ff01-0000-1000-8000-00805f9b34fb";

const batteryInfoCode = createDataViewFromSignedBytes([
  0xdd, 0xa5, 0x3, 0x0, 0xff, 0xfd, 0x77,
]);
const cellInfoCode = createDataViewFromSignedBytes([
  0xdd, 0xa5, 0x4, 0x0, 0xff, 0xfc, 0x77,
]);

export const createConnection = () => {
  let onData;

  let device;
  const scanAndConnect = async () => {
    if (device) return;
    device = await navigator.bluetooth
      .requestDevice({
        filters: [{ services: [SERVICE_UUID] }],
      })
      .catch((err) => alert(err));
    if (!device) return;
    console.log(`Connecting to ${device.name}...`);
    const server = await device.gatt.connect();
    console.log("Getting Service..");
    const service = await server.getPrimaryService(SERVICE_UUID);
    console.log("Getting Characteristic..");

    const charRead = await service.getCharacteristic(CHAR_READ_UUID);
    const charWrite = await service.getCharacteristic(CHAR_WRITE_UUID);

    console.log("Starting notifications..");
    await charRead.startNotifications();

    let expectedLength = 0;
    let receivedData = [];
    let code = "battery-info";
    let formattedBatteryInfo;
    let formattedCellInfo;

    charRead.addEventListener("characteristicvaluechanged", (event) => {
      let data = getUnsignedBytesFromDataView(event.target.value);

      if (receivedData.length === 0) {
        expectedLength = data[3];
        if (data[0] !== 0xdd) {
          console.log("Invalid response");
          return;
        }
      }
      receivedData = [...receivedData, ...data];

      if (receivedData.length === expectedLength + 7) {
        if (code === "battery-info") {
          code = "cell-info";
          formattedBatteryInfo = formatBatteryInfo(receivedData);
          charWrite.writeValueWithoutResponse(cellInfoCode);
        } else {
          code = "battery-info";
          formattedCellInfo = formatCellInfo(receivedData);
          formattedBatteryInfo.name = device.name;
          onData({
            batteryInfo: formattedBatteryInfo,
            cellVolts: formattedCellInfo,
          });
          setTimeout(async () => {
            await charWrite.writeValueWithoutResponse(batteryInfoCode);
          }, 1000);
        }
        expectedLength = 0;
        receivedData = [];
      }
    });

    setTimeout(async () => {
      await charWrite.writeValueWithoutResponse(batteryInfoCode);
    }, 1000);
  };

  /**
   *
   * @param {(cb: {
   * batteryInfo: {
   * name: string,
   * totalVolts: number,
   * current: number,
   * remainingCapacityAh: number,
   * nominalCapacityAh: number,
   * totalCycles: number,
   * remainingPercentSoc: number,
   * balanceStatus: boolean[],
   * mosfetCharge: boolean,
   * mosfetDischarge: boolean,
   * bmsNumberOfCells: number,
   * temperatures: string[],
   * charging: boolean,
   * discharging: boolean,
   * secondsRemaining: number
   * HHMMRemaining: string
   * },
   * cellVolts: number[],
   * }) => void} cb
   */
  const onDataRegisterer = (cb) => {
    onData = cb;
  };

  return {
    onData: onDataRegisterer,
    scanAndConnect,
  };
};

function getBalanceStatus(byte1, byte2, numCells) {
  const balanceBits = process2BytesToBin(byte1, byte2)
    .split("")
    .slice(0, numCells)
    .reverse();
  return balanceBits.map((bit) => {
    return Boolean(parseInt(bit));
  });
}

function formatBatteryInfo(data) {
  const totalVolts = (data[4] * 256 + data[5]) / 100;

  // const current = (data[6] * 256 + data[7]) / 100;
  const current = Number(bytesToFloat(data[6], data[7], 0.01, true));

  const remainingCapacityAh = (data[8] * 256 + data[9]) / 100;

  const nominalCapacityAh = (data[10] * 256 + data[11]) / 100;

  const totalCycles = data[12] * 256 + data[13];

  const remainingPercentSoc = data[23];

  const bmsNumberOfCells = data[25];

  const mosfetCharge = (data[24] & 0x01) === 1 ? true : false;
  const mosfetDischarge = (data[24] & 0x02) === 2 ? true : false;

  const balanceStatus = getBalanceStatus(data[16], data[17], bmsNumberOfCells);

  const numberOfTemperatureSensors = data[26];
  const temperatures = [];
  for (let i = 0; i < numberOfTemperatureSensors; i++) {
    const temperature = (data[27 + i * 2] * 256 + data[28 + i * 2] - 2731) / 10;
    temperatures.push(temperature);
  }

  const charging = current > 0;
  const discharging = current < 0;

  let secondsRemaining;

  if (charging) {
    secondsRemaining =
      ((nominalCapacityAh - remainingCapacityAh) / Math.abs(current)) * 3600;
  } else if (discharging) {
    secondsRemaining = (remainingCapacityAh / Math.abs(current)) * 3600;
  }
  const HHMMRemaining = convertSecondsToHHMM(secondsRemaining);

  return {
    charging,
    discharging,
    secondsRemaining,
    HHMMRemaining,
    totalVolts,
    remainingCapacityAh,
    current,
    remainingPercentSoc,
    nominalCapacityAh,
    totalCycles,
    bmsNumberOfCells,
    mosfetCharge,
    mosfetDischarge,
    balanceStatus,
    temperatures,
  };
}
function formatCellInfo(data) {
  const cellVolts = [];
  const bmsNumberOfCells = data[3] / 2;
  for (let i = 0; i < bmsNumberOfCells; i++) {
    const millivolts = data[4 + 2 * i] * 256 + data[5 + 2 * i];
    const volts = millivolts / 1000;
    cellVolts.push(volts);
  }
  return cellVolts;
}
