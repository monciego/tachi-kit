import { router, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';

import AvatarController from '@/actions/App/Http/Controllers/Settings/AvatarController';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useInitials } from '@/hooks/use-initials';

export default function AvatarUpload() {
    const { auth, errors } = usePage().props;
    const getInitials = useInitials();
    const fileInput = useRef<HTMLInputElement>(null);
    const [processing, setProcessing] = useState(false);

    const visitOptions = {
        preserveScroll: true,
        onStart: () => setProcessing(true),
        onFinish: () => setProcessing(false),
    };

    const upload = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = '';

        if (!file) {
            return;
        }

        router.post(
            AvatarController.update.url(),
            { avatar: file },
            { ...visitOptions, forceFormData: true },
        );
    };

    const remove = () => {
        router.delete(AvatarController.destroy.url(), visitOptions);
    };

    return (
        <div className="flex items-center gap-4">
            <Avatar className="size-16">
                <AvatarImage
                    className="object-cover"
                    src={auth.user.avatar ?? undefined}
                    alt={auth.user.name}
                />
                <AvatarFallback className="text-lg">
                    {getInitials(auth.user.name)}
                </AvatarFallback>
            </Avatar>

            <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={processing}
                        onClick={() => fileInput.current?.click()}
                    >
                        {auth.user.avatar ? 'Change photo' : 'Upload photo'}
                    </Button>
                    {auth.user.avatar && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={processing}
                            onClick={remove}
                        >
                            Remove
                        </Button>
                    )}
                </div>
                <p className="text-muted-foreground text-xs">
                    JPG, PNG or WebP, up to 2 MB.
                </p>
                <InputError message={errors.avatar} />
            </div>

            <input
                ref={fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={upload}
            />
        </div>
    );
}
