

export const ChaincodeName = 'document'
export const simpleIdCredential = {
    apiKey: '-Lo1KyfxJrlENloh0qYf', //found in your SimpleID account page
    devId: 'duonganhthu43', //found in your SimpleID account page
    authProviders: ['blockstack'], //array of auth providers that matches your modules selected
    storageProviders: ['blockstack', 'ipfs'], //array of storage providers that match the modules you selected
    appOrigin: "https://yourapp.com", //even if using SimpleID on a server or as a desktop/mobile app, you'll need to pass an origin for reference
    scopes: ['publish_data', 'store_write', 'email'] //array of permission you are requesting from the user
  }
export const OrgCredential = {
  "ClientID": "4546c2dc3c7c861f82162c06b1967518270ff31883338f3b895c20d124daf27b",
  "ClientSecrect": "kWUJoAvmsmKV",
  "name": "ckan caliper1",
  "identity": {
      "type": "X509",
      "mspId": "org1MSP",
      "certificate": "-----BEGIN CERTIFICATE-----\nMIIENjCCA9ygAwIBAgIUTfLm8IawZgnevPUMDA+UyyqeguMwCgYIKoZIzj0EAwIw\ncTELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNh\nbiBGcmFuY2lzY28xGDAWBgNVBAoTD29yZzEuaHVybGV5LmxhYjEbMBkGA1UEAxMS\nY2Eub3JnMS5odXJsZXkubGFiMB4XDTE5MTEwNjE4MTQwMFoXDTIwMTEwNTE4MTkw\nMFowVTE1MDMGA1UECxMsY2xpZW50LHVzZXIscGVlcix2YWxpZGF0b3IsYXVkaXRv\ncixjYSxtZW1iZXIxHDAaBgNVBAMME2NrYW5fY2FsaXBlcjFfYWRtaW4wWTATBgcq\nhkjOPQIBBggqhkjOPQMBBwNCAATlmYbcY6Zq2FF+JJVy39uogdvU1ZE+slPYh4u6\nSpgfbZHIKiwmtYkZmFN9BrAinUnGVNHH5DPE166CEtEbiiF2o4ICbDCCAmgwDgYD\nVR0PAQH/BAQDAgeAMAwGA1UdEwEB/wQCMAAwHQYDVR0OBBYEFPlxNFROuctoHa0S\nW01WjhMUNjuMMCsGA1UdIwQkMCKAIBObkSlAueA5eAHbBlOUvZAs2MbY9nyi3CKU\nwduX5paZMIIB+gYIKgMEBQYHCAEEggHseyJhdHRycyI6eyJhZG1pbiI6InRydWUi\nLCJjYXRlZ29yeSI6ImNhbGlwZXIiLCJkZXNjcmlwdGlvbiI6ImNrYW4gY2FsaXBl\ncjEiLCJkb21haW4iOiJodHRwOi8vY2FsaXBlcjo1MDAwIiwiZW1haWwiOiJja2Fu\nY2FsaXBlckBnbWFpbC5jb20iLCJoZi5BZmZpbGlhdGlvbiI6IiIsImhmLkVucm9s\nbG1lbnRJRCI6ImNrYW5fY2FsaXBlcjFfYWRtaW4iLCJoZi5SZWdpc3RyYXIuQXR0\ncmlidXRlcyI6IioiLCJoZi5SZWdpc3RyYXIuRGVsZWdhdGVSb2xlcyI6ImNsaWVu\ndCx1c2VyLHZhbGlkYXRvcixhdWRpdG9yIiwiaGYuUmVnaXN0cmFyLlJvbGVzIjoi\nY2xpZW50LHVzZXIscGVlcix2YWxpZGF0b3IsYXVkaXRvcixjYSIsImhmLlJldm9r\nZXIiOiJ0cnVlIiwiaGYuVHlwZSI6ImNsaWVudCx1c2VyLHBlZXIsdmFsaWRhdG9y\nLGF1ZGl0b3IsY2EsbWVtYmVyIiwibmFtZSI6ImNrYW4gY2FsaXBlcjEiLCJwb3J0\nYWwiOiJja2FuIGNhbGlwZXIxIiwicm9sZSI6ImFkbWluIn19MAoGCCqGSM49BAMC\nA0gAMEUCIQCKHGi3cVNVr1ZV4Ivr9rK9wr8AzGGbck45xijQtAfWsQIgRx6AVLsv\nkZT4dFjQJRsrBFAiQ//YaZpznJrIQCN85g4=\n-----END CERTIFICATE-----\n",
      "privateKey": "-----BEGIN PRIVATE KEY-----\r\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQggLtbiROYGWjAvJ+B\r\ngZk82ix8iMJTRCP12dlrCmRQskmhRANCAATlmYbcY6Zq2FF+JJVy39uogdvU1ZE+\r\nslPYh4u6SpgfbZHIKiwmtYkZmFN9BrAinUnGVNHH5DPE166CEtEbiiF2\r\n-----END PRIVATE KEY-----\r\n"
  },
  "fingerprint": "13:0D:6D:95:9B:46:C5:62:FF:8F:BA:20:03:B9:58:DF:B6:94:E6:84"
}