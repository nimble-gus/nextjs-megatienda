#!/bin/bash
echo "Installing dependencies..."
npm install

echo "Generating Prisma client..."
npx prisma generate

echo "Pushing database schema..."
npx prisma db push

echo "Building Next.js application..."
npm run build
