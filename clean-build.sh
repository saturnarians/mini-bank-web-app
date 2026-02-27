#!/bin/bash

echo "Stopping Node processes..."
taskkill -F -IM node.exe 2>/dev/null

echo "Removing .next folder..."
rm -rf .next

echo "Cleaning npm cache..."
npm cache clean --force

echo "Building project..."
npm run build