-- Clean up duplicate customers keeping only the first occurrence
WITH RankedCustomers AS (
  SELECT 
    id,
    name,
    phone_number,
    ROW_NUMBER() OVER (
      PARTITION BY name, phone_number 
      ORDER BY created_at ASC
    ) as rn
  FROM customers
)
DELETE FROM customers 
WHERE id IN (
  SELECT id 
  FROM RankedCustomers 
  WHERE rn > 1
);

-- Also clean up customers with same name (regardless of phone)
WITH RankedCustomersByName AS (
  SELECT 
    id,
    name,
    ROW_NUMBER() OVER (
      PARTITION BY name 
      ORDER BY created_at ASC
    ) as rn
  FROM customers
)
DELETE FROM customers 
WHERE id IN (
  SELECT id 
  FROM RankedCustomersByName 
  WHERE rn > 1
);