const TAG = "ScanRecordUtil";
// The following data type values are assigned by Bluetooth SIG.
// For more details refer to Bluetooth 4.1 specification, Volume 3, Part C, Section 18.
const DATA_TYPE_FLAGS = 0x01;
const DATA_TYPE_SERVICE_UUIDS_16_BIT_PARTIAL = 0x02;
const DATA_TYPE_SERVICE_UUIDS_16_BIT_COMPLETE = 0x03;
const DATA_TYPE_SERVICE_UUIDS_32_BIT_PARTIAL = 0x04;
const DATA_TYPE_SERVICE_UUIDS_32_BIT_COMPLETE = 0x05;
const DATA_TYPE_SERVICE_UUIDS_128_BIT_PARTIAL = 0x06;
const DATA_TYPE_SERVICE_UUIDS_128_BIT_COMPLETE = 0x07;
const DATA_TYPE_LOCAL_NAME_SHORT = 0x08;
const DATA_TYPE_LOCAL_NAME_COMPLETE = 0x09;
const DATA_TYPE_TX_POWER_LEVEL = 0x0A;
const DATA_TYPE_SERVICE_DATA = 0x16;
const DATA_TYPE_MANUFACTURER_SPECIFIC_DATA = 0xFF;


export function uint8ArrayToString(fileData) {
    if (fileData == null || typeof fileData == 'undefined') {
        return '';
    }
    let dataString = "";
    for (var i = 0; i < fileData.length; i++) {
        dataString += String.fromCharCode(fileData[i]);
    }
    return dataString;

}
/**
 * @param {*} uuidBytes bytes[]
 */
function parseUuidFrom(uuidBytes) {
    return uint8ArrayToString(uuidBytes);

}
//截取
function extractBytes(scanRecord, start, length) {
    return scanRecord.slice(start, start + length);
}

/**
 * byte[] scanRecord, int currentPos, int dataLength,
    int uuidLength, List<ParcelUuid> serviceUuids
 * @param {*} scanRecord 
 * @param {*} currentPos 
 * @param {*} dataLength 
 * @param {*} uuidLength 
 * @param {*} serviceUuids 
 */
function parseServiceUuid(scanRecord, currentPos, dataLength,
    uuidLength, serviceUuids) {
    while (dataLength > 0) {
        let uuidBytes = extractBytes(scanRecord, currentPos,
            uuidLength);
        serviceUuids.push(parseUuidFrom(uuidBytes));
        dataLength -= uuidLength;
        currentPos += uuidLength;
    }
    return currentPos;
}
//解析数据
export function parseFromBytes(scanRecord) {
    if (scanRecord == null) {
        return null;
    }

    let currentPos = 0;
    let advertiseFlag = -1;
    let serviceUuids = [];
    let localName = null;
    let txPowerLevel = Number.MIN_VALUE;

    let manufacturerData = new Map();// SparseArray<byte[]>();
    let serviceData = new Map();//ArrayMap<ParcelUuid, byte[]>

    while (currentPos < scanRecord.length) {
        // length is unsigned int.
        let length = scanRecord[currentPos++] & 0xFF;
        if (length == 0) {
            break;
        }
        // Note the length includes the length of the field type itself.
        let dataLength = length - 1;
        // fieldType is unsigned int.
        let fieldType = scanRecord[currentPos++] & 0xFF;
        switch (fieldType) {
            case DATA_TYPE_FLAGS:
                advertiseFlag = scanRecord[currentPos] & 0xFF;
                break;
            case DATA_TYPE_SERVICE_UUIDS_16_BIT_PARTIAL:
            case DATA_TYPE_SERVICE_UUIDS_16_BIT_COMPLETE:
                parseServiceUuid(scanRecord, currentPos,
                    dataLength, 16, serviceUuids);
                break;
            case DATA_TYPE_SERVICE_UUIDS_32_BIT_PARTIAL:
            case DATA_TYPE_SERVICE_UUIDS_32_BIT_COMPLETE:
                parseServiceUuid(scanRecord, currentPos, dataLength,
                    32, serviceUuids);
                break;
            case DATA_TYPE_SERVICE_UUIDS_128_BIT_PARTIAL:
            case DATA_TYPE_SERVICE_UUIDS_128_BIT_COMPLETE:
                parseServiceUuid(scanRecord, currentPos, dataLength,
                    128, serviceUuids);
                break;
            case DATA_TYPE_LOCAL_NAME_SHORT:
            case DATA_TYPE_LOCAL_NAME_COMPLETE:
                localName = uint8ArrayToString(extractBytes(scanRecord, currentPos, dataLength));
                break;
            case DATA_TYPE_TX_POWER_LEVEL:
                txPowerLevel = scanRecord[currentPos];
                break;
            case DATA_TYPE_SERVICE_DATA:
                // The first two bytes of the service data are service data UUID in little
                // endian. The rest bytes are service data.

                // let serviceUuidLength = 16;
                // let serviceDataUuidBytes = extractBytes(scanRecord, currentPos,
                //     serviceUuidLength);
                // let serviceDataUuid = parseUuidFrom(
                //     serviceDataUuidBytes);
                // let serviceDataArray = extractBytes(scanRecord,
                //     currentPos + serviceUuidLength, dataLength - serviceUuidLength);
                // serviceData.put(serviceDataUuid, serviceDataArray);

                break;
            case DATA_TYPE_MANUFACTURER_SPECIFIC_DATA:
                // The first two bytes of the manufacturer specific data are
                // manufacturer ids in little endian.
                let manufacturerId = ((scanRecord[currentPos + 1] & 0xFF) << 8) +
                    (scanRecord[currentPos] & 0xFF);
                let manufacturerDataBytes = extractBytes(scanRecord, currentPos + 2,
                    dataLength - 2);
                manufacturerData.set(manufacturerId, manufacturerDataBytes);
                break;
            default:
                // Just ignore, we don't handle such data type.
                break;
        }
        currentPos += dataLength;
    }

    if (serviceUuids.length == 0) {
        serviceUuids = null;
    }
    return {
        mServiceUuids: serviceUuids,// Flags of the advertising data.
        mManufacturerSpecificData: manufacturerData,//List<ParcelUuid>
        mServiceData: serviceData,//SparseArray<byte[]>
        mDeviceName: localName,//Map<ParcelUuid, byte[]>
        mAdvertiseFlags: advertiseFlag,//int Transmission power level(in dB).
        mTxPowerLevel: txPowerLevel,//String Local name of the Bluetooth LE device.
        mBytes: scanRecord//byte[]  Raw bytes of scan record.
    }
}

