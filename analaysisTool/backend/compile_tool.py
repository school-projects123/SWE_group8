import pandas as pd
from pathlib import Path

INPUT_DIRECTORY = Path("input_files")
OUTPUT_DIRECTORY = Path("output")
OUTPUT_DIRECTORY.mkdir(exist_ok=True)

OUTPUT_FILE = OUTPUT_DIRECTORY / "Master_Spreadsheet.xlsx"