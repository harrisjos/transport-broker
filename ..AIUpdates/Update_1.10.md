# Update 1.10

## Review Docker

Review the docker set up to ensure it matches the current build

## Broken Home Page

Build Error
Failed to compile

"Next.js (14.2.33) is outdated (learn more)
./src/app/auth/login/page.js:8:1
Module not found: Can't resolve 'react-toastify'
   6 | import Link from 'next/link'
   7 | // import { useAuth } from '../../../lib/auth-jwt'
   8 | import { ToastContainer, toast } from 'react-toastify'
     | ^
   9 | import 'react-toastify/dist/ReactToastify.css'
  10 |
  11 | export default function LoginPage() {"

<https://nextjs.org/docs/messages/module-not-found>
This error occurred during the build process and can only be dismissed by fixing the error.
