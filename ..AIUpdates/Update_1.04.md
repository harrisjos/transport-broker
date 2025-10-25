# Update 1.04

## Password security

Hash & Salt the password storage in the DB
Update the authentication handler to handle this.
Pass back a JWT for authentication (8 hour expiry)

## Dashboard

Carrier Dashboard should only be able to view their accepted jobs.
Shipper Dashboard should only be able to view their created jobs.

## Post Jobs Page

Build Error
Failed to compile

Next.js (14.2.33) is outdated (learn more)
./src/app/dashboard/page.js:4:1
Module not found: Can't resolve '../lib/auth-jwt'
  2 |
  3 | import { useState, useEffect } from 'react'
> 4 | import { useAuth } from '../lib/auth-jwt'
    | ^
  5 | import { useRouter } from 'next/navigation'
  6 |
  7 | export default function DashboardPage() {

[Next.js module-not-found docs](https://nextjs.org/docs/messages/module-not-found)
This error occurred during the build process and can only be dismissed by fixing the error.
