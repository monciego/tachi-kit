<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Collection;

/**
 * Reads the query string sent by the server-driven DataTable component
 * (per_page, sort, direction, search, page and comma-separated filters).
 * Invalid values fall back to defaults instead of failing validation, so a
 * hand-edited URL never breaks a list page.
 */
class DataTableRequest extends FormRequest
{
    /**
     * Page sizes offered by the DataTable pagination control.
     *
     * @var list<int>
     */
    public const PER_PAGE_OPTIONS = [10, 20, 50, 100];

    /**
     * Authorization is handled by the controller's policy checks.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [];
    }

    /**
     * The requested page size, or the smallest option when it is not allowed.
     */
    public function perPage(): int
    {
        $perPage = (int) $this->query('per_page', (string) self::PER_PAGE_OPTIONS[0]);

        return in_array($perPage, self::PER_PAGE_OPTIONS, true) ? $perPage : self::PER_PAGE_OPTIONS[0];
    }

    /**
     * The requested sort column when it is sortable, otherwise the default.
     *
     * @param  list<string>  $sortable
     */
    public function sortColumn(array $sortable, string $default): string
    {
        $sort = $this->query('sort');

        return is_string($sort) && in_array($sort, $sortable, true) ? $sort : $default;
    }

    /**
     * The requested sort direction, newest/highest first by default.
     *
     * @return 'asc'|'desc'
     */
    public function sortDirection(): string
    {
        return $this->query('direction') === 'asc' ? 'asc' : 'desc';
    }

    /**
     * The trimmed search term, or an empty string.
     */
    public function search(): string
    {
        return trim((string) $this->query('search', ''));
    }

    /**
     * The unique values of a comma-separated faceted filter (e.g. ?role=admin,user).
     *
     * @return Collection<int, non-empty-string>
     */
    public function filter(string $key): Collection
    {
        return collect(explode(',', (string) $this->query($key, '')))
            ->map(fn (string $value): string => trim($value))
            ->filter(fn (string $value): bool => $value !== '')
            ->unique()
            ->values();
    }

    /**
     * Whether the requested page is past the last page, e.g. after deleting
     * the only rows on it. Controllers redirect back without the page param.
     *
     * @param  LengthAwarePaginator<int, mixed>  $paginator
     */
    public function isPastLastPage(LengthAwarePaginator $paginator): bool
    {
        return $paginator->total() > 0 && (int) $this->query('page', '1') > $paginator->lastPage();
    }
}
