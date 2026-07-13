export interface Assignment {
    assignment_id?: number | null,
    description: string,
    deadline?: Date | null,
    grade?: number | null,
    weight: number,
    complete: boolean,
}