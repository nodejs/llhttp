#!/usr/bin/env -S node --import tsx
import { rmSync } from "fs";
import { resolve } from "path";

/*
Some operating systems do not have the ability to perform
rm -rf ... (example: Windows) if this is not the case, use the 
rm command.
*/

rmSync(resolve(__dirname, '../lib'), {'force':true, 'recursive':true});
rmSync(resolve(__dirname, '../test/tmp'), {'force':true, 'recursive':true});
