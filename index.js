var noble = require('noble');
var peripheralIdOrAddress = '10324c7682484bc7acbd4d87a40f5950';
var chara = null;

noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning();
  } else {
    noble.stopScanning();
  }
});

noble.on('discover', function(peripheral) {
  if (peripheral.id === peripheralIdOrAddress || peripheral.address === peripheralIdOrAddress) {
    noble.stopScanning();

    console.log('peripheral with ID ' + peripheral.id + ' found');
    peripheral.on('disconnect', function() {
      process.exit(0);
    });

    peripheral.connect(function(err) {
    //
    // Once the peripheral has been connected, then discover the
    // services and characteristics of interest.
    //
    peripheral.discoverAllServicesAndCharacteristics(function(err, services,charac) {
      services.forEach(function(service) {
        //
        // This must be the service we were looking for.
        //
        console.log('found service:', service.uuid);

        if(service.uuid == 'ffd5')
        {

          service.discoverCharacteristics([], function(err, characteristics) {

            characteristics.forEach(function(characteristic) {
              console.log('found characteristic:', characteristic.uuid);

              if ('ffd9' == characteristic.uuid) {
                chara = characteristic;
                  console.log("chara found.");
              }
            });

            if (chara) {

              dynamicRainbow(200);
            }
            else {
              console.log('missing characteristics');
            }
          })
        }
      })
    })
  })
}
});


var r = 0;
var g = 0;
var b = 0;

function dynamicRainbow( delay ){

      var showColor;
      var cwi = 0; // colour wheel index (current position on colour wheel)
      var foo = setInterval(function(){
          if (++cwi > 255) {
              cwi = 0;
          }
              showColor = colorWheel(  cwi & 255 );
              //console.log("sending message...");
              var msg = new Buffer([0x56, r, g, b, 0x00, 0xF0, 0xAA]);
              chara.write(msg);

      }, 1000/delay);
  }

  // Input a value 0 to 255 to get a color value.
  // The colors are a transition r - g - b - back to r.
  function colorWheel( WheelPos ){

      WheelPos = 255 - WheelPos;

      if ( WheelPos < 85 ) {
          r = 255 - WheelPos * 3;
          g = 0;
          b = WheelPos * 3;
      } else if (WheelPos < 170) {
          WheelPos -= 85;
          r = 0;
          g = WheelPos * 3;
          b = 255 - WheelPos * 3;
      } else {
          WheelPos -= 170;
          r = WheelPos * 3;
          g = 255 - WheelPos * 3;
          b = 0;
      }
      // returns a string with the rgb value to be used as the parameter
      return "rgb(" + r +"," + g + "," + b + ")";
  }
