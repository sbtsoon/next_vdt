import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 🔥 가장 중요!
  trailingSlash: true, // GitHub Pages 경로 깨짐 방지
}

module.exports = nextConfig
