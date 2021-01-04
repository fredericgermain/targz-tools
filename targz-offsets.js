var fs = require('fs')
var zlib = require('zlib')
var tar = require('tar-stream');

var extract = tar.extract()

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
    extract.write(chunk, (err) => {
    });
  })
  .on('end', function () {
    console.log ('end gzip');
  });

let inputTarOffset = 0;
let lastTarOffset = 0;
let tarErrorHappened;
extract.on('entry', function(header, stream, next) {
  // header is the tar header
  // stream is the content body (might be an empty stream)
  // call next when you are done with this entry
  const tarEntrySize = 512*parseInt((512+header.size+511)/512);
  console.log(`tar_entry:${inputTarOffset}:${inputTarOffset+tarEntrySize}:${tarEntrySize}:${header.name}`);
//  console.log(header);
  inputTarOffset += tarEntrySize; 
  stream.on('end', function() {
    next() // ready for next entry
  })
 
  stream.resume() // just auto drain the stream
})
 
extract.on('finish', function() {
  // all entries read
  console.log('tar finish');
})

extract.on('error', (err) => {
  if (tarErrorHappened) { return; }
  console.log('error happened', err);
  tarErrorHappened = err;
});

