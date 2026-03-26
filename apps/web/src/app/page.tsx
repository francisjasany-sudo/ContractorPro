import Link from 'next/link';
import { APP_NAME } from '@contractorpro/shared';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold text-primary">{APP_NAME}</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        All-in-one app for contractors: estimates, proposals, project management, invoicing.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/dashboard"
          className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Go to Dashboard
        </Link>
        <Link
          href="/login"
          className="rounded-md border px-6 py-3 text-sm font-medium hover:bg-accent"
        >
          Sign In
        </Link>
      </div>
    </main>
  );
}
