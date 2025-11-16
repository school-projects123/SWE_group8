import pandas as pd
from pathlib import Path

INPUT_DIRECTORY = Path("input_files")
OUTPUT_DIRECTORY = Path("output")
OUTPUT_DIRECTORY.mkdir(exist_ok=True)

OUTPUT_FILE = OUTPUT_DIRECTORY / "Master_Spreadsheet.xlsx"

def detect_gradebook(df: pd.DataFrame):
    columns = list(df.columns)
    required_columns = {"First Name", "Last Name", "Username", "Student ID"}
    has_all_columns = required_columns.issubset(set(columns))
    has_course_grade = any("Course Grade Point to Date" in col for col in columns)
    return has_all_columns and has_course_grade

def detect_analytics(df: pd.DataFrame):
    columns = set(df.columns)
    return {"Username", "Grades", "Hours in Course"}.issubset(columns)

def find_column(columns, keyword):
    matches = [col for col in columns if keyword in col]
    if not matches:
        raise KeyError(f"No column containing keyword, {keyword} was found in {columns}")
    if len(matches) > 1:
        print(f"Multiple columns found for keyword {keyword}...using {matches[0]!r}.")
    return matches[0]

def main():
    if not INPUT_DIRECTORY.exists():
        print(f"Input directory {INPUT_DIRECTORY} does not exist.")
        return
    
    gradebook_path = None
    analytics_path = None

    for csv_path in INPUT_DIRECTORY.glob("*.csv"):
        print(f"Checking {csv_path.name} ...")

        try:
            df_head = pd.read_csv(csv_path, nrows=0)
        except Exception as e:
            print(f"Skipping {csv_path.name}: couldn't read {e}")
            continue

        if gradebook_path is None and detect_gradebook(df_head):
            gradebook_path = csv_path
            print(f"Identified GRADEBOOK file: {csv_path.name}")
        elif analytics_path is None and detect_analytics(df_head):
            analytics_path = csv_path
            print(f"Identified ANALYTICS file: {csv_path.name}")
        else:
            print(f"NO GRADEBOOK/ANALYTICS FOUND")
    
    if gradebook_path is None:
        print("No gradebook file in input_files.")
        return
    if analytics_path is None:
        print("No analytics file in input_files.")
        return
    
    print("\nUsing:")
    print(f"  GRADEBOOK: {gradebook_path.name}")
    print(f"  ANALYTICS: {analytics_path.name}\n")

    gradebook_df = pd.read_csv(gradebook_path)
    analytics_df = pd.read_csv(analytics_path)

    gradebook_columns = list(gradebook_columns)
    analytics_columns = list(analytics_columns)

    GRADEBOOK_FNAME_COLUMN = "First Name"
    GRADEBOOK_LNAME_COLUMN = "Last Name"
    GRADEBOOK_USERNAME_COLUMN = "Username"
    GRADEBOOK_STUDENT_ID_COLUMN = "Student ID"

    GRADEBOOK_COURSE_GRADE_100_COLUMN = find_column(gradebook_columns, "Course Grade Point to Date (%)")
    GRADEBOOK_EXAM_RAW_COLUMN = find_column(gradebook_columns, "MCQ Exam [Total Pts: 5 Score")
    GRADEBOOK_ESSAY_RAW_COLUMN = find_column(gradebook_columns, "Pretend Essay Assignment")

    ANALYTICS_USERNAME_COLUMN = "Username"
    ANALYTICS_GRADES_COLUMN = "Grades"
    ANALYTICS_HOURS_COLUMN = "Hours in Course"

    