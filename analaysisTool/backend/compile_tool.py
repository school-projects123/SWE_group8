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

