# ECAN — Module Scaffolding

A CLI tool to generate a full backend module in one command.

## Usage

```bash
node scaffolding/create-module.js <moduleName>
```

### Example

```bash
node scaffolding/create-module.js payments
```

Generates the following files:

```
src/modules/payments/
├── controllers/
│   └── payments.controller.ts
├── services/
│   └── payments.service.ts
├── repositories/
│   └── payments.repository.ts
├── routes/
│   └── payments.route.ts
├── types/
│   └── index.ts
└── validators/
    └── payments.validator.ts
```

## After Scaffolding — Checklist

1. **Types** — Fill in `types/index.ts` with your `ICreateXxx` / `IUpdateXxx` interfaces
2. **Validators** — Add Zod fields to `validators/<name>.validator.ts`
3. **Repository** — Replace `prisma.<name>` with the correct Prisma model name in `repositories/<name>.repository.ts`
4. **Route registration** — Add to `src/routes/index.ts`:
   ```ts
   import xxxRoute from "../modules/xxx/routes/xxx.route.js";
   // ...
   { path: "/xxx", route: xxxRoute },
   ```
5. **Permissions** — Add the resource name + allowed actions to `src/config/permissions.config.ts`

## Conventions

All generated code follows the established ECAN patterns:

| Layer | Pattern |
|---|---|
| Controller | `static async method(req, res)` — thin, delegates to service |
| Service | Business logic, throws `http-errors` |
| Repository | Prisma queries only, soft-delete via `deletedAt` |
| Route | `authMiddleware()` + `authorize(resource, action)` guards |
| Types | `ICreateXxx` / `IUpdateXxx extends Partial<ICreateXxx>` |
| Validators | Zod ODT named `createXxxODT` / `updateXxxODT` |
