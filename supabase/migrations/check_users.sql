-- 查询所有用户信息，特别关注管理员用户
SELECT id, phone, name, role, created_at, updated_at 
FROM users 
ORDER BY created_at DESC;

-- 查询管理员用户
SELECT id, phone, name, role, created_at, updated_at 
FROM users 
WHERE role = 'admin';

-- 查询所有角色的用户数量
SELECT role, COUNT(*) as count 
FROM users 
GROUP BY role 
ORDER BY role;