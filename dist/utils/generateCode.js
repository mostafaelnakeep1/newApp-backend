"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCode = void 0;
// utils/generateCode.ts
const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
exports.generateCode = generateCode;
