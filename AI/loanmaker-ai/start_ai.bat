@echo off
cd /d C:\Users\pechi\OneDrive\Desktop\Loan_Maker_Project\AI\loanmaker-ai
call venv\Scripts\activate
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
pause
