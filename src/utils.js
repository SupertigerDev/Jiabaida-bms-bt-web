export function toS16(byte1, byte2) {
  const view = new DataView(new ArrayBuffer(2));
  view.setUint8(0, byte1);
  view.setUint8(1, byte2);
  return view.getInt16(0, false);
}

export function toU16(byte1, byte2) {
  const view = new DataView(new ArrayBuffer(2));
  view.setUint8(0, byte1);
  view.setUint8(1, byte2);
  return view.getUint16(0, true);
}

export function bytesToFloat(byte1, byte2, multiplier, signed) {
  multiplier = multiplier === undefined || multiplier === null ? 1 : multiplier;
  if (signed) {
    return parseFloat(toS16(byte1, byte2) * multiplier).toFixed(2);
  }
  return parseFloat(toU16(byte1, byte2) * multiplier).toFixed(2);
}

export function process2BytesToBin(byte1, byte2) {
  const test = toU16(byte1, byte2).toString(2).padStart(16, "0");

  return test;
}

export function getUnsignedBytesFromDataView(dataView) {
  // Create a new array to store the unsigned bytes
  const unsignedBytes = [];

  // Iterate through the entire length of the DataView's buffer
  for (let i = 0; i < dataView.byteLength; i++) {
    // Get the unsigned 8-bit integer at the current index
    const byte = dataView.getUint8(i);
    // Push it into our array
    unsignedBytes.push(byte);
  }

  return unsignedBytes;
}

export function createDataViewFromSignedBytes(signedByteValues) {
  const data = new ArrayBuffer(signedByteValues.length);
  const view = new DataView(data);

  signedByteValues.forEach((value, index) => {
    // This part ensures the value is treated as a signed 8-bit integer
    const byteValue = (value << 24) >> 24;
    view.setInt8(index, byteValue);
  });

  return view;
}

export function convertSecondsToHHMM(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  // You can customize the format here
  return `${hours}h ${minutes}m`;
}

export function createWattHourTracker() {
  // Private state variables, hidden from the outside
  let totalWattHours = 0;
  let lastUpdateTime = performance.now();

  /**
   * Updates the total watt-hours based on the current wattage and the
   * time elapsed since the last update.
   *
   * @param {number} currentWatts - The current power consumption in watts.
   */
  function update(currentWatts) {
    // Get the current time in milliseconds
    const currentTime = performance.now();

    // Calculate the time elapsed since the last update in milliseconds
    const timeElapsedMs = currentTime - lastUpdateTime;

    // Convert the elapsed time to hours
    // (1000 ms/s * 60 s/min * 60 min/hr)
    const timeElapsedHours = timeElapsedMs / 3600000;

    // Calculate the watt-hours used in this interval
    const intervalWattHours = currentWatts * timeElapsedHours;

    // Add the new watt-hours to the total
    totalWattHours += intervalWattHours;

    // Update the timestamp for the next calculation
    lastUpdateTime = currentTime;
  }

  /**
   * Retrieves the total accumulated watt-hours.
   *
   * @returns {number} The total watt-hours.
   */
  function getWattHours() {
    return totalWattHours;
  }

  // Return the public methods
  return {
    update,
    getWattHours,
  };
}
