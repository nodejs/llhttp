#!/usr/bin/env -S node --import tsx

import { rmSync } from "fs";
/* 
Some operating systems do not have the ability to perform
rm -rf ... (example: Windows) 
*/

rmSync('lib', {'force':true, 'recursive':true})
rmSync('test/tmp', {'force':true, 'recursive':true})


