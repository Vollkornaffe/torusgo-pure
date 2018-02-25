#!/bin/bash

cd ../GameLogic
./build

cd ../Frontend
npm run build

cd ../Server
cp ../Frontend/build ./build_frontend -r
