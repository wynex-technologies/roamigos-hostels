ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS discount_coupon_code text;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS discount_coupon_percent int check (discount_coupon_percent > 0 and discount_coupon_percent <= 100);
