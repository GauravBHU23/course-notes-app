-- Sample data for local development only. Run via `supabase db reset`.
insert into public.exam_categories (slug, name, description, display_order) values
  ('ssc', 'SSC', 'Staff Selection Commission exams: CGL, CHSL, MTS and more', 1),
  ('railway', 'Railway', 'RRB NTPC, Group D, ALP and other railway recruitment exams', 2),
  ('bank', 'Bank', 'IBPS, SBI PO/Clerk and other banking exams', 3),
  ('ugc-net', 'UGC NET', 'University Grants Commission National Eligibility Test', 4),
  ('bpsc', 'BPSC', 'Bihar Public Service Commission exams', 5),
  ('tre', 'TRE', 'Bihar Teacher Recruitment Examination', 6);

insert into public.bundles (category_id, slug, title, description, price_inr, validity_days)
select id, 'ssc-cgl-complete', 'SSC CGL Complete Notes', 'Full syllabus notes and practice sets for SSC CGL', 299, 180
from public.exam_categories where slug = 'ssc';

insert into public.bundles (category_id, slug, title, description, price_inr, validity_days)
select id, 'railway-ntpc-notes', 'Railway NTPC Notes', 'Complete NTPC preparation notes', 199, 180
from public.exam_categories where slug = 'railway';

insert into public.bundles (category_id, slug, title, description, price_inr, validity_days)
select id, 'bank-po-complete', 'Bank PO Complete Package', 'IBPS/SBI PO full preparation package', 499, 365
from public.exam_categories where slug = 'bank';
