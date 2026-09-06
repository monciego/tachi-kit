import { AlertTriangle, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

interface DeleteDialogProps {
    item: {
        id: number | string;
        name: string;
    };
    onDelete: () => void;
    type?: string;
    title?: string;
    description?: string | React.ReactNode;
    warningMessage?: string;
    canDelete?: boolean;
    triggerButton?: React.ReactNode;
    /** Controlled open state (e.g. opened from a dropdown menu); skips the DialogTrigger. */
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function DeleteDialog({
    item,
    onDelete,
    type = 'item',
    title,
    description,
    warningMessage,
    canDelete = true,
    triggerButton,
    open,
    onOpenChange,
}: DeleteDialogProps) {
    const isControlled = open !== undefined && onOpenChange !== undefined;

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const dialogOpen = isControlled ? open : isDialogOpen;
    const setDialogOpen = isControlled ? onOpenChange : setIsDialogOpen;

    useEffect(() => {
        if (!dialogOpen) {
            setIsDeleting(false);
        }
    }, [dialogOpen]);

    const handleDelete = () => {
        setIsDeleting(true);
        onDelete();
    };

    const defaultDescription = (
        <>
            Are you sure you want to delete{' '}
            <span className="font-semibold">{item.name}</span>?
            <br />
            This action cannot be undone.
        </>
    );

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            {!isControlled && (
                <DialogTrigger asChild>
                    {triggerButton || (
                        <Button
                            variant="destructive"
                            size="sm"
                            title={
                                !canDelete ? warningMessage : `Delete ${type}`
                            }
                        >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete {type}</span>
                        </Button>
                    )}
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-108">
                <DialogHeader>
                    <DialogTitle>{title || `Delete ${type}`}</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    {description || defaultDescription}
                </DialogDescription>

                {/* Warning Message */}
                {warningMessage && !canDelete && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{warningMessage} </AlertDescription>
                    </Alert>
                )}

                <DialogFooter className="gap-2 space-x-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={() => setDialogOpen(false)}
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={!canDelete || isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
