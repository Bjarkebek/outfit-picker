This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.





## Dependencies in this project

# Next.js + React + TypeScript
'npm i next react react-dom typescript'

# Supabase (backend/database/auth)
'npm i @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/ssr'

# TailwindCSS (styling)
'npm i tailwindcss postcss autoprefixer tailwind-merge class-variance-authority clsx lucide-react'

# Radix UI Components
'npm i @radix-ui/react-label @radix-ui/react-select'

# Vitest + jsdom + Testing Library
'npm i -D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom jest-axe'

# Playwright (chromium)
'npm i -D @playwright/test'
'npx playwright install chromium'

# Linting & Formattering
'npm i -D eslint eslint-config-next @typescript-eslint/parser @typescript-eslint/eslint-plugin prettier'



## TESTS

# for e2e run env 1
'$env:E2E="1"; npm run dev'

# manual testing/looking with playwright
'npx playwright codegen http://localhost:3000/'

# all vitests
'npm run test-all'
# unit test (vitest)
'npm run test-unit'
# integration test (vitest)
'npm run test-int'
# components test (vitest)
'npm run test-comp'
# e2e tests (playwright)
'npm run test-e2e'