export interface Assignment {
    assignment_id?: number | null,
    intern_id: number,
    description: string,
    deadline?: number | null,
    grade?: number | null,
    weight: number,
    complete: boolean,
}