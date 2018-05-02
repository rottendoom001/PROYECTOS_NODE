'use strict';

const fs = require('fs');
const google = require('googleapis');
let serviceAccountJson = '/Users/alancruz/Desktop/CRTS/GCSmartHouseAM.json';
const API_VERSION = 'v1';
const DISCOVERY_API = 'https://cloudiot.googleapis.com/$discovery/rest';

let deviceId ='macAlan';
let projectId = 'smarthouseam-200817';
let cloudRegion = 'us-central1';
let registryId = 'SmartHouseAM';

const PROJECT_ID = 'smarthouseam-200817'
let mqttClientId = 'projects/' + PROJECT_ID + '/locations/' + cloudRegion + '/registries/' + registryId + '/devices/' + deviceId;
let mqttTopic = '/devices/macAlan/events';

function getClient (serviceAccountJson, cb) {
  const serviceAccount = JSON.parse();
  const jwtAccess = new google.auth.JWT();
  jwtAccess.fromJSON(serviceAccount);
  // Note that if you require additional scopes, they should be specified as a
  // string, separated by spaces.
  jwtAccess.scopes = 'https://www.googleapis.com/auth/cloud-platform';
  // Set the default authentication to the above JWT access.
  google.options({ auth: jwtAccess });

  const discoveryUrl = `${DISCOVERY_API}?version=${API_VERSION}`;

  google.discoverAPI(discoveryUrl, {}, (err, client) => {
    if (err) {
      console.log('Error during API discovery', err);
      return undefined;
    }
    cb(client);
  });
}

function setDeviceConfig (
  client,
  deviceId,
  registryId,
  projectId,
  cloudRegion,
  data,
  version
) {

  const parentName = `projects/${projectId}/locations/${cloudRegion}`;
  const registryName = `${parentName}/registries/${registryId}`;

  const binaryData = Buffer.from(data).toString('base64');
  const request = {
    name: `${registryName}/devices/${deviceId}`,
    versionToUpdate: version,
    binaryData: binaryData
  };

  client.projects.locations.registries.devices.modifyCloudToDeviceConfig(request,
    (err, data) => {
      if (err) {
        console.log('Could not update config:', deviceId);
        console.log('Message: ', err);
      } else {
        console.log('Success :', data);
      }
    });
}


getClient(function(client) {
  if (client !==  undefined){
    setDeviceConfig(
      client,
      deviceId,
      registryId,
      projectId,
      cloudRegion,
      'lalala nuevo',
      version, function (){
        console.log("OK");
      });
  } else {
    console.log("CLIENTE undefined");
  }

});
