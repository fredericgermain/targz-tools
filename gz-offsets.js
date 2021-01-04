var fs = require('fs')
var zlib = require('zlib')

// const highWaterMark = 1024; // 25min
const highWaterMark = 64 * 1024; // 10mins

// with 1024 bytes per chunk, it seems we have on average a gunziped chunk
var input = fs.createReadStream(process.argv[2], { highWaterMark })
var gunzip = zlib.createGunzip()
var n = 0

let inputGzipOffset = 0;
let lastInflatedOffset = 0;
let inflatedOffset = 0;
input
  .on('data', function (chunk) {
// file seen read by 65536 bytes
    input.pause();
    gunzip.write(chunk, function (err) {
      if (err) {
        console.error(`error on gzip write ${err}`);
        process.exit(2);
      }
      n += 1
      console.log (`gzip:${inputGzipOffset}:${inputGzipOffset+chunk.length}:${chunk.length} inflated:${lastInflatedOffset}:${inflatedOffset}:${inflatedOffset-lastInflatedOffset}`);
      if (tarErrorHappened) {
        console.error(`error on tar ${tarErrorHappened}`);
        process.exit(3);
      }
      inputGzipOffset += chunk.length;
      lastInflatedOffset = inflatedOffset;
      input.resume();
    });
  })
  .on('end', function () {
    console.log ('end input');
    gunzip.end()
  });

gunzip
  .on('data', function (chunk) {
// seen 16384-bytes chunks
    inflatedOffset += chunk.length;
  })
  .on('end', function () {
    console.log ('end gzip');
  });
