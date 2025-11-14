# Outfit Picker

Outfit Picker er en webapp til at gemme, organisere og kombinere tøj. Brugeren kan oprette items, gruppere smykker i bundles og generere outfits på tværs af kategorier som top, bottom, shoes og jewelry. Projektet er bygget i Next.js med Supabase som backend og Tailwind CSS til styling. Der er lagt vægt på enkel struktur, testbarhed og en opsætning, der er let at drifte og køre både lokalt og i Docker.

## Funktioner

• Opret, rediger og slet tøjitems  
• Bundles til smykker  
• Generering af outfits ud fra eksisterende items  
• Login og brugerhåndtering gennem Supabase  
• Komponentbaseret UI med Tailwind CSS  
• Testopsætning med Vitest og Playwright

## Teknologier

• Next.js, React og TypeScript  
• Supabase (auth, database og storage)  
• Tailwind CSS og Radix UI  
• Vitest og Testing Library  
• Playwright til e2e-tests  
• ESLint og Prettier  
• Docker til containerisering

## Kom i gang

### Klon projektet

```
git clone https://github.com/Bjarkebek/outfit-picker
cd outfit-picker
```

### Installér afhængigheder

```
npm install
```

### Environment variables

Opret en fil med navnet .env.local i roden af projektet. Den skal indeholde projektets Supabase-nøgler.

Eksempel:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Start udviklingsserver

```
npm run dev
```

Appen åbnes på http://localhost:3000

## Kørsel via Docker

Projektet kan køres som container, enten lokalt eller på server.

### Pull image fra Docker Hub

```
docker pull bjarkebek/outfitpicker:master
```

### Start containeren

```
docker run --name outfitpicker -p 3000:3000 --env-file .env.local bjarkebek/outfitpicker:master
```

Appen findes herefter på http://localhost:3000

### Starte og stoppe eksisterende container

```
docker start outfitpicker
docker stop outfitpicker
```

## Tests

Projektet bruger Vitest til unit-, integration- og komponenttests samt Playwright til e2e-tests.

### E2E-tests

Start udviklingsserveren med E2E-flag:

```
$env:E2E="1"; npm run dev
```

### Testkommandoer

```
npm run test-all
npm run test-unit
npm run test-int
npm run test-comp
npm run test-e2e
```

### Playwright codegen

```
npx playwright codegen http://localhost:3000/
```

## Afhængigheder

• Next.js, React og TypeScript  
• Supabase SDK og auth helpers  
• Tailwind CSS, PostCSS og Autoprefixer  
• Tailwind Merge, clsx, class-variance-authority og lucide-react  
• Radix UI  
• Vitest, jsdom, Testing Library og jest-axe  
• Playwright  
• ESLint, Prettier og TypeScript ESLint plugins

## For rekrutter

Outfit Picker viser praktisk erfaring med Next.js, Supabase og TypeScript samt et gennemført test-setup med Vitest og Playwright. Appen kan både køre lokalt og via Docker og er struktureret, så den nemt kan udvides eller deployes.
