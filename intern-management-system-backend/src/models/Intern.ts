export interface Intern {
  intern_id?: number;
  application_id?: number;
  application_status?: "accepted" | "rejected" | "waiting";
  application_date?: number;
  first_name: string;
  last_name: string;
  id_no: string;
  phone_number: string;
  email: string;
  uni: string | null;
  major: string | null;
  grade: number | null;
  gpa: number | null;
  team_id: number;
  birthday?: number
  internship_starting_date: number;
  internship_ending_date: number;
  cv_url: string | null;
  photo_url: string | null;
  overall_success: number | null;
}


