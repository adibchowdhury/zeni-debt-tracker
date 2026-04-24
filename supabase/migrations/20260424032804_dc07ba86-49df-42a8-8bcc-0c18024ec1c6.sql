-- Add debt type and due day columns to debts table
ALTER TABLE public.debts
  ADD COLUMN IF NOT EXISTS debt_type text NOT NULL DEFAULT 'Other',
  ADD COLUMN IF NOT EXISTS due_day integer;

-- Validate due_day is between 1-31 when set
ALTER TABLE public.debts
  ADD CONSTRAINT debts_due_day_range CHECK (due_day IS NULL OR (due_day >= 1 AND due_day <= 31));

-- Validate debt_type is one of the allowed values
ALTER TABLE public.debts
  ADD CONSTRAINT debts_type_allowed CHECK (debt_type IN ('Credit Card','Personal Loan','Auto Loan','Student Loan','Mortgage','Medical Debt','Collections','Other'));