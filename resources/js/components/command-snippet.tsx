import { Check, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useClipboard } from '@/hooks/use-clipboard';
import { cn } from '@/lib/utils';

type CommandSnippetProps = {
    command: string;
    className?: string;
};

/**
 * A shell command in a code box with a copy-to-clipboard button.
 */
export function CommandSnippet({ command, className }: CommandSnippetProps) {
    const [, copy] = useClipboard();
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!copied) {
            return;
        }

        const timeout = setTimeout(() => setCopied(false), 2000);

        return () => clearTimeout(timeout);
    }, [copied]);

    const handleCopy = async () => {
        setCopied(await copy(command));
    };

    return (
        <div
            className={cn(
                'bg-muted/50 flex items-center gap-2 rounded-lg border py-1.5 pr-1.5 pl-4 text-left font-mono text-sm',
                className,
            )}
        >
            <code className="min-w-0 flex-1 overflow-x-auto py-1.5 whitespace-nowrap">
                <span className="text-muted-foreground select-none">$ </span>
                {command}
            </code>
            <button
                type="button"
                onClick={handleCopy}
                aria-label={copied ? 'Copied' : `Copy "${command}"`}
                className="text-muted-foreground hover:bg-background hover:text-foreground flex size-8 shrink-0 items-center justify-center rounded-md transition-colors"
            >
                {copied ? (
                    <Check className="size-4" aria-hidden />
                ) : (
                    <Copy className="size-4" aria-hidden />
                )}
            </button>
            <span className="sr-only" aria-live="polite">
                {copied ? 'Copied to clipboard' : ''}
            </span>
        </div>
    );
}
