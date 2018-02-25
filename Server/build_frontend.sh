#!/bin/bash

cd ../GameLogic
./build

cd ../Frontend
npm run build

cd ../Server
rm build_frontend -r
cp ../Frontend/build ./build_frontend -r
