"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const api = axios_1.default.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    withCredentials: true,
});

api.interceptors.response.use((response) => response, (error) => {

    if (error.response?.status === 401) {
        if (typeof window !== 'undefined') {

        }
    }
    return Promise.reject(error);
});
exports.default = api;
