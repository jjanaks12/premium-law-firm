import {Link} from '@/src/i18n/routing';

export default function LoginPage() {
  return (
    <div className="w-full max-w-md p-8 bg-card rounded-xl border border-border shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold font-serif text-foreground">Welcome Back</h1>
        <p className="text-sm text-muted-foreground mt-2">Sign in to your account</p>
      </div>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Email</label>
          <input type="email" className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring" placeholder="you@example.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Password</label>
          <input type="password" className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring" placeholder="••••••••" />
        </div>
        <button type="button" className="w-full btn-gold mt-6">
          Sign In
        </button>
      </form>
      <div className="mt-6 text-center text-sm">
        <Link href="/" className="text-primary hover:underline">← Back to home</Link>
      </div>
    </div>
  );
}
