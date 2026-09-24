<?php

namespace App\Concerns;

use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use RuntimeException;

trait GeneratesUserCode
{
    /**
     * Boot the trait and generate a user code when creating a model.
     */
    public static function bootGeneratesUserCode(): void
    {
        static::creating(function (self $model): void {
            $column = static::userCodeColumn();

            if (empty($model->{$column})) {
                $model->{$column} = static::generateUserCode();
            }
        });
    }

    /**
     * Generate the next unused user code (e.g., USR-0001, USR-0002).
     *
     * @param  string  $prefix  Prefix prepended to the numeric portion.
     * @param  int  $length  Number of digits in the numeric portion.
     *
     * @throws InvalidArgumentException When the length is less than one.
     * @throws RuntimeException When the sequence for the prefix is exhausted.
     */
    public static function generateUserCode(string $prefix = 'USR-', int $length = 4): string
    {
        if ($length < 1) {
            throw new InvalidArgumentException('The user code length must be at least one digit.');
        }

        return DB::transaction(function () use ($prefix, $length): string {
            // Codes are zero-padded to a fixed width, so the highest code of
            // that exact width is also the highest number.
            $latestCode = static::query()
                ->withTrashed()
                ->where(static::userCodeColumn(), 'like', $prefix.str_repeat('_', $length))
                ->lockForUpdate()
                ->max(static::userCodeColumn());

            $number = $latestCode === null ? 1 : (int) substr($latestCode, strlen($prefix)) + 1;

            if ($number > (10 ** $length) - 1) {
                throw new RuntimeException(
                    "Cannot generate another user code for the \"{$prefix}\" prefix: the {$length}-digit sequence is exhausted.",
                );
            }

            return $prefix.str_pad((string) $number, $length, '0', STR_PAD_LEFT);
        });
    }

    /**
     * Find an active user by their user code.
     */
    public static function findByCode(string $code): ?static
    {
        return static::query()
            ->where(static::userCodeColumn(), $code)
            ->first();
    }

    /**
     * The column that stores the generated user code.
     */
    protected static function userCodeColumn(): string
    {
        return 'user_code';
    }
}
