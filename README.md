# Tools for tar.gz files

- Display mapping of gzip data offset to inflated data offset.
- Display tar entry in the inflated data offset.

It stops at the first error in the tar parsing.

This way, you can have the data offset in the gzip file of around the first tar error.

It can be used to find data corruption in big tar.gz file.

Or as a base for simple custom tool you want to write around tar.gz file.

gzip being a streaming compression algorithm (as compressed to block), there is a high probablility that a file is ok if the parsing of the inner tar stream is ok.

# Usage

`npx targz-tools file.tar.gz`

This dumps offsets in file as it uncovers them.

Take the offset of last found tar entry in the file. Get the corresponding offset in the gzip file in the following or preceding gzip: line, and go look manually for the corruption.
It could be a segment filled with zeroes.

# Fix a file by overwriting part of it.

This happened when downloading a large dataset file, using curl http resume.

## Get partial file with curl

`curl -r ${begin}-${end} ${url} -o partial.bin`

## Replace bad partial data in corrupted file

`dd conv=notrunc if=partial.bin of=corrupt_file.tar.gz obs=1 seek=16683952580`

# Remarks

`tar -tvf your_file.tar.gz -R` could be used to find error corruption, but in the inflated tar stream.

difffiles.js can be used to find offset where two big files differ.

Looking for areas in the tar.gz filled with 0 could be a good way to find corruption.

# timing
Size of block read has a big influence on how fast the program runs.
Reading by 64kB blocks ran in 10mins where reading by 1kB blocks ran in 25mins.

But running with smaller blocks would make the error detection more precise.
