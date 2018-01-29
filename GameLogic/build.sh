#!/bin/bash

cd purs
pulp build

cd ..
cp -rpu purs/output/* js/lib #recursive, preserve, update

cd js
npm run build