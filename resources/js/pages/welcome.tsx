import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    FlaskConical,
    KeyRound,
    LayoutDashboard,
    ShieldCheck,
    Users,
    Workflow,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import AppLogoIcon from '@/components/app-logo-icon';
import { CommandSnippet } from '@/components/command-snippet';
import { Button } from '@/components/ui/button';
import { DOCS_URL, INSTALLATION_DOCS_URL } from '@/constants/links';
import { dashboard, login, register } from '@/routes';

type Feature = {
    icon: LucideIcon;
    title: string;
    description: string;
};

const FEATURES: Feature[] = [
    {
        icon: KeyRound,
        title: 'Authentication',
        description:
            'Login, registration, email verification, password resets, two-factor authentication and passkeys, powered by Fortify.',
    },
    {
        icon: ShieldCheck,
        title: 'Roles & permissions',
        description:
            'Spatie permissions with superadmin, admin and user roles, policy guardrails, and permission types generated for the frontend.',
    },
    {
        icon: Users,
        title: 'User management',
        description:
            'Server-driven data tables with search, filters, sorting, bulk actions, account status and avatars.',
    },
    {
        icon: LayoutDashboard,
        title: 'Dashboard',
        description:
            'Stat cards, a sign-ups chart and a recent users table, loaded with deferred props and skeleton states.',
    },
    {
        icon: Workflow,
        title: 'Typed end to end',
        description:
            'Wayfinder route helpers, strict TypeScript, and PHPStan at level 7, so refactors stay safe.',
    },
    {
        icon: FlaskConical,
        title: 'Tested & linted',
        description:
            'A Pest test suite plus Pint, oxlint and formatting checks, wired into GitHub Actions from day one.',
    },
];

const INSTALL_COMMAND = 'laravel new my-app --using=monciego/tachi-kit';

const GETTING_STARTED: { title: string; command: string }[] = [
    { title: 'Create your app', command: INSTALL_COMMAND },
    { title: 'Install the frontend', command: 'cd my-app && npm install' },
    { title: 'Start the dev server', command: 'composer dev' },
];

const STACK = [
    'Laravel 13',
    'React 19',
    'Inertia 3',
    'Tailwind CSS 4',
    'shadcn/ui',
    'Pest',
];

export default function Welcome() {
    const { auth, canRegister, name } = usePage().props;

    return (
        <>
            <Head title="Cut through boilerplate" />
            <div className="bg-background text-foreground flex min-h-screen flex-col">
                <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
                    <Link
                        href="/"
                        className="flex items-center gap-2 font-semibold tracking-tight"
                    >
                        <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
                            <AppLogoIcon className="text-[13px]" />
                        </span>
                        {name}
                    </Link>
                    <nav className="flex items-center gap-2">
                        <Button asChild variant="ghost" size="sm">
                            <a href={DOCS_URL}>Docs</a>
                        </Button>
                        {auth.user ? (
                            <Button asChild size="sm">
                                <Link href={dashboard()}>Dashboard</Link>
                            </Button>
                        ) : (
                            <>
                                <Button asChild variant="ghost" size="sm">
                                    <Link href={login()}>Log in</Link>
                                </Button>
                                {canRegister && (
                                    <Button asChild size="sm">
                                        <Link href={register()}>Sign up</Link>
                                    </Button>
                                )}
                            </>
                        )}
                    </nav>
                </header>

                <main className="flex-1">
                    <section className="relative overflow-hidden">
                        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 pt-16 pb-20 text-center sm:px-6 sm:pt-24 sm:pb-28">
                            <p className="text-muted-foreground bg-background rounded-full border px-3 py-1 text-xs font-medium">
                                Laravel + React + Inertia starter kit
                            </p>
                            <h1 className="max-w-3xl text-5xl font-semibold tracking-tighter text-balance sm:text-7xl">
                                Cut through boilerplate.
                            </h1>
                            <p className="text-muted-foreground max-w-2xl text-lg text-balance">
                                Tachi Kit is an opinionated Laravel + React +
                                Inertia starter kit with authentication,
                                role-based permissions, user management and
                                more. Skip the boring stuff and focus on what
                                makes your app unique.
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-3">
                                {auth.user ? (
                                    <Button asChild size="lg">
                                        <Link href={dashboard()}>
                                            Go to dashboard
                                            <ArrowRight />
                                        </Link>
                                    </Button>
                                ) : (
                                    <>
                                        <Button asChild size="lg">
                                            <Link
                                                href={
                                                    canRegister
                                                        ? register()
                                                        : login()
                                                }
                                            >
                                                {canRegister
                                                    ? 'Get started'
                                                    : 'Log in'}
                                                <ArrowRight />
                                            </Link>
                                        </Button>
                                        {canRegister && (
                                            <Button
                                                asChild
                                                size="lg"
                                                variant="outline"
                                            >
                                                <Link href={login()}>
                                                    Log in
                                                </Link>
                                            </Button>
                                        )}
                                    </>
                                )}
                            </div>
                            <CommandSnippet
                                command={INSTALL_COMMAND}
                                className="w-full max-w-lg"
                            />
                        </div>
                    </section>

                    <section className="border-t">
                        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
                            <div className="mb-10 flex max-w-2xl flex-col gap-2">
                                <h2 className="text-3xl font-semibold tracking-tight">
                                    Everything you'd build first, already built.
                                </h2>
                                <p className="text-muted-foreground">
                                    The parts every app needs, done once and
                                    done properly, so day one starts with your
                                    features.
                                </p>
                            </div>
                            <ul className="bg-border grid gap-px overflow-hidden rounded-xl border sm:grid-cols-2 lg:grid-cols-3">
                                {FEATURES.map(
                                    ({ icon: Icon, title, description }) => (
                                        <li
                                            key={title}
                                            className="bg-background flex flex-col gap-3 p-6"
                                        >
                                            <Icon
                                                className="text-foreground size-5"
                                                aria-hidden
                                            />
                                            <h3 className="font-medium">
                                                {title}
                                            </h3>
                                            <p className="text-muted-foreground text-sm">
                                                {description}
                                            </p>
                                        </li>
                                    ),
                                )}
                            </ul>
                        </div>
                    </section>

                    <section className="border-t">
                        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
                            <div className="flex flex-col gap-3">
                                <h2 className="text-3xl font-semibold tracking-tight">
                                    Up and running in three commands.
                                </h2>
                                <p className="text-muted-foreground">
                                    SQLite, migrations, roles and permissions
                                    are set up during install. Add demo accounts
                                    any time with{' '}
                                    <code className="font-mono text-sm">
                                        php artisan db:seed
                                    </code>
                                    .
                                </p>
                                <a
                                    href={INSTALLATION_DOCS_URL}
                                    className="mt-2 inline-flex items-center gap-1 text-sm font-semibold hover:underline"
                                >
                                    Installation guide
                                    <ArrowRight className="size-4" />
                                </a>
                            </div>
                            <ol className="flex flex-col gap-4">
                                {GETTING_STARTED.map(
                                    ({ title, command }, index) => (
                                        <li
                                            key={command}
                                            className="flex flex-col gap-1.5"
                                        >
                                            <span className="text-muted-foreground text-xs font-medium">
                                                {index + 1}. {title}
                                            </span>
                                            <CommandSnippet command={command} />
                                        </li>
                                    ),
                                )}
                            </ol>
                        </div>
                    </section>

                    <section className="border-t">
                        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-12 sm:px-6">
                            <p className="text-muted-foreground text-sm">
                                Built on the official Laravel React starter kit,
                                with
                            </p>
                            <ul className="flex flex-wrap items-center justify-center gap-2">
                                {STACK.map((item) => (
                                    <li
                                        key={item}
                                        className="rounded-md border px-3 py-1 text-sm font-medium"
                                    >
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>
                </main>

                <footer className="border-t">
                    <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm sm:flex-row sm:px-6">
                        <p>{name}. Cut through boilerplate.</p>
                        <p>Released under the MIT license.</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
