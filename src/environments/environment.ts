// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  //urlBackLocal: 'https://localhost:7260/',
  urlBackLocal: 'https://localhost:44373/',
  //urlBackLocal: 'https://localhost:53941/',
  //urlBackLocal: 'https://10.128.47.70/CoberturasAPI/',
  apiKey: 'UdqntgWRujWthZwPYfFu',
  apiPrefix: 'api', 
  userPlatts:'eguel@alfa.com.mx',
  passPlatts:'eGuel#1804',
  bloombergCredentials: {
    //client_id: 'b96fe7d7e53268595ad1f0eadc03e56c', //developer
    //client_secret: '349aab04e60d0912aedc0f68a555fb3d93a64eee2eaf736a1d0bb4b8433de5d4' //developer
    client_id: 'cfe709b933d32e465286b20a8469784f', // production
    client_secret:'406d76415704eb4609a6fdd4d07f9743b44330d89bebe210696bdceb0a04a115', //production
  }
};


/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
