import { APP_NAME } from '@contractorpro/shared';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold text-primary">{APP_NAME}</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        All-in-one app for contractors: estimates, proposals, project management, invoicing.
      </p>
    </main>
  );
}
