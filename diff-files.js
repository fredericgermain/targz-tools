var fs = require('fs');
const fsPromises = fs.promises;

async function main() {
  const a = process.argv[2];
  const b = process.argv[3];
  const [af, bf] = await Promise.all([fsPromises.open(a), fsPromises.open(b)]);
  // console.log(af, bf);
  const block = 40960;
  let match = true;
  let nloop = 0;
  const [ab, bb] = [ new Uint8Array(block), new Uint8Array(block) ];
  const it = Array.from(Array(block).keys())
  while (true) {
    const [ad, bd] = await Promise.all([af.read(ab, 0, block), bf.read(bb, 0, block)]);
//     console.log(ad, bd);
    if (ad.bytesRead !== bd.bytesRead) {
      console.log(`mismatch byte read ${nloop * block} ${ad.bytesRead}`);
    } else {
      if (ad.bytesRead === 0) {
        console.log(`endoffile at ${nloop * block + ad.bytesRead}`);
        break;
      }
      const idx = it.findIndex((i) => (ad.buffer[i] !== bd.buffer[i]));
//      console.log(idx);
      if (idx !== -1 && match) {
        console.log(`mismatch at ${nloop * block + idx}`);
        match = false;
      } else if (idx === -1 && !match) {
        console.log(`re-match at ${nloop * block}`);
        match = true;
      }
    }
    if (ad.bytesRead !== block) {
      console.log(`endoffile at ${nloop * block + ad.bytesRead}`);
      break;
    }
    nloop += 1;
  }
}

main();

