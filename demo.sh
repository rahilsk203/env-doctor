#!/bin/bash

# This is a demonstration script for env-doctor

echo "=== env-doctor Demo ==="
echo ""

echo "1. Running environment scan..."
npx env-doctor scan

echo ""
echo "2. Viewing the report..."
npx env-doctor report

echo ""
echo "3. Running fix (interactive)..."
npx env-doctor fix

echo ""
echo "=== Demo Complete ==="